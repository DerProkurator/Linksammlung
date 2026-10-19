// ========================================================================
// LINKSAMMLUNG - LINKS.JS v3.3
// ========================================================================
// Link-Management: bearbeiten, löschen, Modal-System
// Abhängig von: config.js, categories.js
// ========================================================================

/**
 * Link bearbeiten (öffnet Modal mit vorausgefüllten Feldern)
 */
function editLink() {
    if (!currentContextLink) return;

    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];

    isEditMode       = true;
    currentEditingLink = { categoryKey, linkIndex };

    document.getElementById('linkCategory').value    = categoryKey;
    document.getElementById('linkTitle').value       = link.title;
    document.getElementById('linkUrl').value         = link.url;
    document.getElementById('linkDescription').value = link.description;
    document.getElementById('linkIcon').value        = link.icon;
    document.getElementById('linkFavorite').checked  = link.favorite || false;

    document.querySelector('#linkModal h2').textContent          = 'Link bearbeiten';
    document.querySelector('#linkModal .btn-primary').textContent = 'Speichern';

    document.getElementById('linkCategoryGroup').style.display = 'none';
    document.getElementById('linkCategory').removeAttribute('required');

    hideContextMenu();
    populateCategorySelect();
    document.getElementById('linkModal').style.display = 'block';

    setTimeout(() => updateFavoritesCheckboxUI(), 50);
}

/**
 * Link löschen
 */
function deleteLink() {
    if (!currentContextLink) return;

    const { categoryKey, linkIndex } = currentContextLink;
    const link     = linkCategories[categoryKey].links[linkIndex];
    const category = linkCategories[categoryKey];

    if (confirm(`Möchten Sie den Link "${link.title}" wirklich löschen?`)) {
        linkCategories[categoryKey].links.splice(linkIndex, 1);

        if (category.links.length === 0) {
            showEmptyCategoryModal({
                action:           'delete',
                linkTitle:        link.title,
                sourceTitle:      category.title,
                sourceCategoryKey: categoryKey
            });
        } else {
            sortCategoriesEmptyLast();
            showMessage('Link erfolgreich gelöscht', 'success');
            saveConfig(true);
            renderCategories();
            updateFavoritesCount();
            updatePinnedBar();
        }
    }

    hideContextMenu();
}

// -----------------------------------------------------------------------
// LINK IN ANDEREN TAB VERSCHIEBEN
// -----------------------------------------------------------------------

let _moveLinkSource = null; // gesicherte Referenz, da hideContextMenu() currentContextLink nullt

/**
 * Move-Link-Modal öffnen
 */
function openMoveLinkModal() {
    if (!currentContextLink) return;
    _moveLinkSource = { ...currentContextLink }; // sichern bevor hideContextMenu() nullt
    hideContextMenu();

    const { categoryKey, linkIndex } = _moveLinkSource;
    const link = linkCategories[categoryKey].links[linkIndex];

    document.getElementById('moveLinkInfo').textContent = `„${link.title}"`;

    // Ziel-Tabs: alle außer aktivem Tab und Favoriten
    const tabSel = document.getElementById('moveLinkTargetTab');
    tabSel.innerHTML = tabsList
        .filter(t => t.id !== activeTabId && t.id !== 'favorites')
        .map(t => `<option value="${t.id}">${esc(t.icon)} ${esc(t.label)}</option>`)
        .join('');

    if (!tabSel.options.length) {
        showMessage('Keine anderen Tabs vorhanden', 'warning');
        return;
    }

    updateMoveLinkCategories();
    document.getElementById('moveLinkModal').style.display = 'block';
}

/**
 * Kategorie-Dropdown für gewählten Ziel-Tab befüllen
 */
function updateMoveLinkCategories() {
    const tabId  = document.getElementById('moveLinkTargetTab').value;
    const cfg    = getTabConfigById(tabId);
    const catSel = document.getElementById('moveLinkTargetCat');

    catSel.innerHTML = '';
    if (cfg && cfg.categories) {
        const order = cfg.categoryOrder || Object.keys(cfg.categories);
        order.filter(k => cfg.categories[k]).forEach(k => {
            const opt = document.createElement('option');
            opt.value       = k;
            opt.textContent = `${cfg.categories[k].icon} ${cfg.categories[k].title}`;
            catSel.appendChild(opt);
        });
    }

    // Option: neue Kategorie anlegen
    const newOpt = document.createElement('option');
    newOpt.value       = '__new__';
    newOpt.textContent = '+ Neue Kategorie anlegen';
    catSel.appendChild(newOpt);

    toggleMoveLinkNewCat();
}

/**
 * Neue-Kategorie-Namensfeld ein-/ausblenden
 */
function toggleMoveLinkNewCat() {
    const val   = document.getElementById('moveLinkTargetCat').value;
    const group = document.getElementById('moveLinkNewCatGroup');
    group.style.display = val === '__new__' ? 'block' : 'none';
}

/**
 * Link verschieben bestätigen
 */
function confirmMoveLink() {
    if (!_moveLinkSource) return;

    const { categoryKey, linkIndex } = _moveLinkSource;
    const targetTabId  = document.getElementById('moveLinkTargetTab').value;
    const targetCatVal = document.getElementById('moveLinkTargetCat').value;

    if (!targetTabId) return;

    const targetCfg = getTabConfigById(targetTabId);
    if (!targetCfg) { showMessage('Ziel-Tab nicht gefunden', 'error'); return; }

    let targetCatKey = targetCatVal;

    if (targetCatVal === '__new__') {
        const newName = document.getElementById('moveLinkNewCatName').value.trim();
        if (!newName) { showMessage('Bitte Kategorie-Namen eingeben', 'warning'); return; }
        // Eindeutigen Key generieren
        const base = newName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'neu';
        let key = base, i = 1;
        while (targetCfg.categories[key]) { key = base + '_' + i; i++; }
        targetCfg.categories[key] = { title: newName, icon: '📁', collapsed: false, links: [] };
        if (!targetCfg.categoryOrder) targetCfg.categoryOrder = [];
        targetCfg.categoryOrder.push(key);
        targetCatKey = key;
    }

    if (!targetCfg.categories[targetCatKey]) {
        showMessage('Ziel-Kategorie nicht gefunden', 'error'); return;
    }

    // Link kopieren → Ziel einfügen
    const link = { ...linkCategories[categoryKey].links[linkIndex] };
    targetCfg.categories[targetCatKey].links.push(link);
    localStorage.setItem('linkConfig_' + targetTabId, JSON.stringify(targetCfg));

    // Link aus Quelle entfernen
    linkCategories[categoryKey].links.splice(linkIndex, 1);
    saveConfig(true);
    renderCategories();
    updateFavoritesCount();

    closeMoveLinkModal();
    const targetTab = tabsList.find(t => t.id === targetTabId);
    showMessage(`„${link.title}" nach „${targetTab?.label}" verschoben`, 'success');
}

function closeMoveLinkModal() {
    document.getElementById('moveLinkModal').style.display = 'none';
    document.getElementById('moveLinkNewCatName').value = '';
    _moveLinkSource = null;
}

/**
 * Link-Modal öffnen (neuer Link)
 */
/**
 * Link-Modal öffnen mit vorausgewählter Kategorie (aus Kachel-+ Button)
 */
function openModalForCategory(categoryKey) {
    openModal();
    requestAnimationFrame(() => {
        const select = document.getElementById('linkCategory');
        if (select) select.value = categoryKey;
    });
}

function openModal() {
    closeMenu();

    if (!isEditMode) {
        document.querySelector('#linkModal h2').textContent          = 'Neuen Link hinzufügen';
        document.querySelector('#linkModal .btn-primary').textContent = 'Hinzufügen';
        document.getElementById('linkForm').reset();
        currentEditingLink = null;

        document.getElementById('linkCategoryGroup').style.display = 'block';
        document.getElementById('linkCategory').setAttribute('required', 'required');

        document.getElementById('linkFavorite').checked = false;
        updateFavoritesCheckboxUI();
    }

    populateCategorySelect();
    document.getElementById('linkModal').style.display = 'block';

    setTimeout(() => updateFavoritesCheckboxUI(), 50);
}

/**
 * Link-Modal schließen
 */
function closeModal() {
    document.getElementById('linkModal').style.display = 'none';
    document.getElementById('linkForm').reset();

    document.getElementById('linkCategoryGroup').style.display = 'block';
    document.getElementById('linkCategory').setAttribute('required', 'required');

    isEditMode         = false;
    currentEditingLink = null;
    document.querySelector('#linkModal h2').textContent          = 'Neuen Link hinzufügen';
    document.querySelector('#linkModal .btn-primary').textContent = 'Hinzufügen';

    document.getElementById('linkFavorite').checked = false;
    updateFavoritesCheckboxUI();
}
