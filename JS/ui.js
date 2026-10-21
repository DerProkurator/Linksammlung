// ========================================================================
// LINKSAMMLUNG - UI.JS v3.5
// ========================================================================
// Rendering, Modals, Status-Nachrichten, Menü, Kontext-Menüs
// Abhängig von: config.js, drag-drop.js
// ========================================================================

// -----------------------------------------------------------------------
// KATEGORIEN RENDERN
// -----------------------------------------------------------------------

/**
 * Kategorien des aktiven Tabs rendern
 */
function renderCategories() {
    // Favoriten-Tab hat eigene Render-Funktion
    if (activeTabId === 'favorites') {
        renderFavoritesTab();
        return;
    }

    cleanupEventListeners();

    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';

    cleanupAllTemporaryElements();

    const bentoGrid = document.createElement('div');
    bentoGrid.className = 'bento-grid';

    categoryOrder.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        if (category && category.links.length > 0) {
            bentoGrid.appendChild(createCategoryElement(categoryKey, category));
        }
    });

    container.appendChild(bentoGrid);

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove',  handleTouchMove,  { passive: false });
    container.addEventListener('touchend',   handleTouchEnd,   { passive: false });
}

/**
 * Kategorie-Element erstellen
 */
function createCategoryElement(categoryKey, category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';

    if (category.collapsed) {
        categoryDiv.classList.add('collapsed');
    } else if (category.links.length >= 10) {
        categoryDiv.classList.add('tile-lg');
    } else if (category.links.length >= 4) {
        categoryDiv.classList.add('tile-md');
    }

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';

    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'category-title';
    categoryTitle.innerHTML = `<span class="category-icon">${esc(category.icon)}</span> ${esc(category.title)}`;

    categoryTitle.addEventListener('click',       () => toggleCategoryCollapsed(categoryKey));
    categoryTitle.addEventListener('contextmenu', (e) => showCategoryContextMenu(e, categoryKey));

    const addBtn = document.createElement('button');
    addBtn.className = 'category-add-btn';
    addBtn.title     = 'Link hinzufügen';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModalForCategory(categoryKey);
    });

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.title     = 'Kategorie verschieben';

    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(addBtn);
    categoryHeader.appendChild(dragHandle);

    const linkGrid = document.createElement('div');
    linkGrid.className = 'link-grid';

    if (!category.collapsed) {
        category.links.forEach((link, linkIndex) => {
            const linkElement = document.createElement('div');
            linkElement.className = 'link-item draggable' + (link.favorite ? ' favorite' : '');
            linkElement.dataset.description = link.description || '';

            linkElement.innerHTML = `
                <div class="link-header">
                    <span class="link-icon">${esc(link.icon)}</span>
                    <div class="link-title">${esc(link.title)}</div>
                </div>
                <div class="link-description">${esc(link.description)}</div>
                <div class="link-drag-handle" title="Link verschieben">⋮⋮</div>
            `;

            linkElement.addEventListener('contextmenu', (e) => showContextMenu(e, categoryKey, linkIndex));
            linkElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('link-drag-handle')) {
                    // isSafeUrl() blockiert javascript: und data: URLs aus der Config (XSS-Schutz)
                    if (isSafeUrl(link.url)) window.open(link.url, '_blank', 'noopener,noreferrer');
                }
            });

            const lDragHandle = linkElement.querySelector('.link-drag-handle');
            lDragHandle.addEventListener('click', (e) => e.stopPropagation());

            linkGrid.appendChild(linkElement);

            makeLinkDraggable(linkElement, categoryKey, linkIndex);
            makeLinkDroppable(linkElement, categoryKey, linkIndex);
        });
    }

    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(linkGrid);

    makeCategoryDraggable(categoryDiv, categoryKey);
    makeCategoryDroppable(categoryDiv, categoryKey);

    return categoryDiv;
}

/**
 * Event-Listener für Links aufräumen
 */
function cleanupEventListeners() {
    document.querySelectorAll('.link-drag-handle').forEach(handle => {
        handle.removeEventListener('dragstart', handleLinkDragStart);
        handle.removeEventListener('dragend',   handleLinkDragEnd);
    });
}

// -----------------------------------------------------------------------
// KONTEXT-MENÜS
// -----------------------------------------------------------------------

/**
 * Link-Kontextmenü anzeigen
 */
function showContextMenu(event, categoryKey, linkIndex) {
    event.preventDefault();
    event.stopPropagation();

    const contextMenu    = document.getElementById('contextMenu');
    currentContextLink   = { categoryKey, linkIndex };

    updateContextMenuFavoriteOption();
    updateContextMenuPinnedOption();

    let x = event.clientX;
    let y = event.clientY;

    // Menü am Bildschirmrand abfangen, damit es nicht über den Viewport hinausragt
    if (x + 200 > window.innerWidth)  x = window.innerWidth  - 200;
    if (y + 100 > window.innerHeight) y = window.innerHeight - 100;

    contextMenu.style.left    = x + 'px';
    contextMenu.style.top     = y + 'px';
    contextMenu.style.display = 'block';

    return false;
}

/**
 * Kategorie-Kontextmenü anzeigen
 */
function showCategoryContextMenu(event, categoryKey) {
    event.preventDefault();
    event.stopPropagation();

    const categoryContextMenu  = document.getElementById('categoryContextMenu');
    currentContextCategory     = categoryKey;

    let x = event.clientX;
    let y = event.clientY;

    // Menü am Bildschirmrand abfangen, damit es nicht über den Viewport hinausragt
    if (x + 200 > window.innerWidth)  x = window.innerWidth  - 200;
    if (y + 100 > window.innerHeight) y = window.innerHeight - 100;

    categoryContextMenu.style.left    = x + 'px';
    categoryContextMenu.style.top     = y + 'px';
    categoryContextMenu.style.display = 'block';

    return false;
}

/**
 * Alle Kontext-Menüs verstecken
 */
function hideContextMenu() {
    const contextMenu         = document.getElementById('contextMenu');
    const categoryContextMenu = document.getElementById('categoryContextMenu');
    contextMenu.style.display         = 'none';
    categoryContextMenu.style.display = 'none';
    currentContextLink     = null;
    currentContextCategory = null;
}

// -----------------------------------------------------------------------
// MODAL: LEERE KATEGORIE
// -----------------------------------------------------------------------

/**
 * Leere Kategorie Modal anzeigen
 */
function showEmptyCategoryModal(data) {
    pendingEmptyCategoryData = data;

    const modal      = document.getElementById('emptyCategoryModal');
    const messageDiv = document.getElementById('emptyCategoryMessage');

    let message = '';
    if (data.action === 'move') {
        message = `
            <div class="empty-category-section success">
                <div class="empty-category-section-title">✅ Link erfolgreich verschoben</div>
                <div class="empty-category-section-content">Der Link "<strong>${esc(data.linkTitle)}</strong>" wurde von "<strong>${esc(data.sourceTitle)}</strong>" zu "<strong>${esc(data.targetTitle)}</strong>" verschoben.</div>
            </div>
            <div class="empty-category-section warning">
                <div class="empty-category-section-title">⚠️ Leere Kategorie</div>
                <div class="empty-category-section-content">Die Kategorie "<strong>${esc(data.sourceTitle)}</strong>" ist jetzt leer.</div>
                <div class="empty-category-section-note">Möchten Sie die leere Kategorie löschen oder behalten?</div>
            </div>
        `;
    } else if (data.action === 'delete') {
        message = `
            <div class="empty-category-section success">
                <div class="empty-category-section-title">✅ Link erfolgreich gelöscht</div>
                <div class="empty-category-section-content">Der Link "<strong>${esc(data.linkTitle)}</strong>" wurde gelöscht.</div>
            </div>
            <div class="empty-category-section warning">
                <div class="empty-category-section-title">⚠️ Leere Kategorie</div>
                <div class="empty-category-section-content">Die Kategorie "<strong>${esc(data.sourceTitle)}</strong>" ist jetzt leer.</div>
                <div class="empty-category-section-note">Möchten Sie die leere Kategorie löschen oder behalten?</div>
            </div>
        `;
    }

    messageDiv.innerHTML  = message;
    modal.style.display   = 'block';
}

/**
 * Leere Kategorie Modal schließen
 */
function closeEmptyCategoryModal() {
    document.getElementById('emptyCategoryModal').style.display = 'none';
    pendingEmptyCategoryData = null;
}

/**
 * Leere Kategorie-Entscheidung verarbeiten
 */
function handleEmptyCategoryDecision(shouldDelete) {
    if (!pendingEmptyCategoryData) return;

    const data = pendingEmptyCategoryData;

    if (shouldDelete) {
        delete linkCategories[data.sourceCategoryKey];
        categoryOrder = categoryOrder.filter(k => k !== data.sourceCategoryKey);

        const msg = data.action === 'move'
            ? `Link verschoben und leere Kategorie "${data.sourceTitle}" gelöscht`
            : `Link gelöscht und leere Kategorie "${data.sourceTitle}" entfernt`;
        showMessage(msg, 'success');
    } else {
        sortCategoriesEmptyLast();

        const msg = data.action === 'move'
            ? `Link verschoben - leere Kategorie "${data.sourceTitle}" beibehalten`
            : `Link gelöscht - leere Kategorie "${data.sourceTitle}" beibehalten`;
        showMessage(msg, 'success');

        setTimeout(() => {
            showMessage({
                title:   '💡 Hinweis zu leeren Kategorien',
                content: `Die Kategorie "${data.sourceTitle}" ist leer und kann bei Drag & Drop zu visuellen Problemen führen. Sie können jederzeit neue Links hinzufügen oder die Kategorie über Rechtsklick löschen.`
            }, 'warning');
        }, 1000);
    }

    saveConfig(true);
    renderCategories();
    closeEmptyCategoryModal();
}

// -----------------------------------------------------------------------
// MENÜ-SYSTEM
// -----------------------------------------------------------------------

/**
 * Hauptmenü ein-/ausblenden
 */
function toggleMenu() {
    const submenu     = document.getElementById('menuSubmenu');
    const menuButton  = document.getElementById('mainMenuButton');

    if (submenu.classList.contains('active')) {
        submenu.classList.remove('active');
        menuButton.classList.remove('active');
    } else {
        submenu.classList.add('active');
        menuButton.classList.add('active');
    }
}

/**
 * Menü schließen
 */
function closeMenu() {
    const submenu    = document.getElementById('menuSubmenu');
    const menuButton = document.getElementById('mainMenuButton');
    submenu.classList.remove('active');
    menuButton.classList.remove('active');
}

// -----------------------------------------------------------------------
// STATUS-NACHRICHTEN (TOASTS)
// -----------------------------------------------------------------------

/**
 * Status-Nachricht / Toast anzeigen
 */
function showMessage(message, type) {
    const messageEl = document.getElementById('statusMessage');
    messageEl.className = `status-message status-${type}`;

    if (typeof message === 'object') {
        messageEl.classList.add('important');
        messageEl.innerHTML = `
            <div class="status-title">${esc(message.title)}</div>
            <div class="status-content">${esc(message.content)}</div>
        `;
    } else {
        messageEl.textContent = message;
    }

    setTimeout(() => messageEl.classList.add('show'), 100);

    const duration = messageEl.classList.contains('important') ? 15000 : 3000;
    setTimeout(() => messageEl.classList.remove('show'), duration);
}

// -----------------------------------------------------------------------
// BESCHREIBUNGS-MODUS (sichtbar / nur Hover-Tooltip)
// -----------------------------------------------------------------------

/**
 * Beschreibungs-Modus beim Start aus localStorage laden und anwenden
 */
function loadDescriptionMode() {
    const mode = localStorage.getItem('linkDescriptionMode') || 'visible';
    applyDescriptionMode(mode);
}

/**
 * Body-Klasse und Toggle-Button-Zustand für den gewählten Modus setzen
 */
function applyDescriptionMode(mode) {
    if (mode === 'tooltip') {
        document.body.classList.add('desc-tooltip');
    } else {
        document.body.classList.remove('desc-tooltip');
    }
    updateDescriptionToggleBtn(mode);
}

/**
 * Zwischen sichtbar und Hover-Tooltip umschalten
 */
function toggleDescriptionMode() {
    const current = localStorage.getItem('linkDescriptionMode') || 'visible';
    const next    = current === 'visible' ? 'tooltip' : 'visible';
    localStorage.setItem('linkDescriptionMode', next);
    applyDescriptionMode(next);
}

/**
 * Toggle-Button-Beschriftung und Zustand aktualisieren
 */
function updateDescriptionToggleBtn(mode) {
    const btn  = document.getElementById('descriptionToggleBtn');
    const icon = document.getElementById('descToggleIcon');
    const text = document.getElementById('descToggleText');
    if (!btn || !icon || !text) return;

    if (mode === 'tooltip') {
        icon.textContent = '👁';
        text.textContent = 'Nur bei Hover';
        btn.classList.remove('desc-visible');
    } else {
        icon.textContent = '📝';
        text.textContent = 'Beschreibungen';
        btn.classList.add('desc-visible');
    }
}
