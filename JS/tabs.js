// ========================================================================
// LINKSAMMLUNG - TABS.JS v3.4
// ========================================================================
// Tab-System: Storage, Tab-UI, Switching, Favoriten-Tab
// Abhängig von: config.js
// ========================================================================

// Tab-Kontext-Menü State
let tabContextMenuTabId = null;

// -----------------------------------------------------------------------
// TABS-LISTE LADEN / SPEICHERN
// -----------------------------------------------------------------------

/**
 * Tab-Liste aus localStorage laden und in globale tabsList/activeTabId schreiben
 */
function loadTabsList() {
    try {
        const saved = localStorage.getItem('linkTabs');
        if (saved) {
            const data = JSON.parse(saved);
            tabsList = Array.isArray(data.tabs) && data.tabs.length > 0
                ? data.tabs
                : buildDefaultTabsFromConfigs();
            activeTabId = data.activeTab || (tabsList[0] && tabsList[0].id) || 'allgemein';
        } else {
            tabsList = buildDefaultTabsFromConfigs();
            activeTabId = (tabsList[0] && tabsList[0].id) || 'allgemein';
            saveTabsList();
        }
    } catch (e) {
        console.error('Fehler beim Laden der Tab-Liste:', e);
        tabsList = buildDefaultTabsFromConfigs();
        activeTabId = (tabsList[0] && tabsList[0].id) || 'allgemein';
    }
}

/**
 * Tab-Liste in localStorage speichern
 */
function saveTabsList() {
    localStorage.setItem('linkTabs', JSON.stringify({
        tabs: tabsList.map(t => ({ id: t.id, label: t.label, icon: t.icon, hidden: t.hidden || false })),
        activeTab: activeTabId
    }));
}

// -----------------------------------------------------------------------
// TAB WECHSELN
// -----------------------------------------------------------------------

/**
 * Zu einem anderen Tab wechseln
 */
function switchTab(tabId) {
    if (tabId === activeTabId) return;

    // Aktuellen Tab still speichern bevor gewechselt wird,
    // damit renderFavoritesTab() stets aktuelle Daten aus localStorage liest
    if (activeTabId && activeTabId !== 'favorites') {
        saveConfig(true);
    }

    activeTabId = tabId;

    // Echte Tab-Config laden (nicht Favoriten – die sind dynamisch)
    if (tabId !== 'favorites') {
        loadTabConfigById(tabId);
    }

    saveTabsList();
    renderTabBar();
    updateMenuButtonVisibility();

    if (tabId === 'favorites') {
        renderFavoritesTab();
    } else {
        renderCategories();
    }

    updateFavoritesCount();
}

/**
 * Menü-Button im Favoriten-Tab ausblenden (kein Import/Export auf dynamischem Tab sinnvoll)
 */
function updateMenuButtonVisibility() {
    const btn = document.getElementById('mainMenuButton');
    if (!btn) return;
    btn.style.display = (activeTabId === 'favorites') ? 'none' : '';
}

// -----------------------------------------------------------------------
// TAB-LEISTE RENDERN
// -----------------------------------------------------------------------

/**
 * Tab-Leiste im DOM neu aufbauen
 */
function renderTabBar() {
    const tabBar = document.getElementById('tabBar');
    if (!tabBar) return;

    tabBar.innerHTML = '';

    // ⭐ Favoriten-Tab (immer erster)
    const favBtn = document.createElement('button');
    favBtn.className = 'tab-btn tab-btn-favorites' + (activeTabId === 'favorites' ? ' active' : '');
    favBtn.dataset.tab = 'favorites';
    favBtn.title = 'Alle Favoriten';
    const favIcon = document.createElement('span');
    favIcon.className = 'tab-btn-icon';
    favIcon.textContent = '⭐';
    const favLabel = document.createElement('span');
    favLabel.className = 'tab-btn-label';
    favLabel.textContent = 'Alle Favoriten';
    favBtn.appendChild(favIcon);
    favBtn.appendChild(favLabel);
    favBtn.addEventListener('click', () => switchTab('favorites'));
    tabBar.appendChild(favBtn);

    // Reguläre Tabs (nur sichtbare)
    const hiddenTabs = tabsList.filter(t => t.hidden);
    tabsList.forEach(tab => {
        if (tab.hidden) return;

        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (tab.id === activeTabId ? ' active' : '');
        btn.dataset.tab = tab.id;
        btn.title = tab.label;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'tab-btn-icon';
        iconSpan.textContent = tab.icon;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'tab-btn-label';
        labelSpan.textContent = tab.label;

        btn.appendChild(iconSpan);
        btn.appendChild(labelSpan);

        btn.addEventListener('click', () => switchTab(tab.id));
        btn.addEventListener('contextmenu', (e) => showTabContextMenu(e, tab.id));

        tabBar.appendChild(btn);
    });

    // Indikator für ausgeblendete Tabs
    if (hiddenTabs.length > 0) {
        const hiddenBtn = document.createElement('button');
        hiddenBtn.className = 'tab-hidden-indicator';
        hiddenBtn.title = hiddenTabs.map(t => t.label).join(', ');
        hiddenBtn.textContent = `👁️ ${hiddenTabs.length}`;
        hiddenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            _showHiddenTabsMenu(hiddenBtn, hiddenTabs);
        });
        tabBar.appendChild(hiddenBtn);
    }

    // + Neuen Tab hinzufügen
    const addBtn = document.createElement('button');
    addBtn.className = 'tab-add-btn';
    addBtn.textContent = '+';
    addBtn.title = 'Neuen Tab hinzufügen';
    addBtn.addEventListener('click', openAddTabModal);
    tabBar.appendChild(addBtn);
}

// -----------------------------------------------------------------------
// TAB KONTEXT-MENÜ (Rechtsklick)
// -----------------------------------------------------------------------

/**
 * Tab-Kontext-Menü anzeigen
 */
function showTabContextMenu(event, tabId) {
    event.preventDefault();
    event.stopPropagation();

    tabContextMenuTabId = tabId;

    const menu = document.getElementById('tabContextMenu');
    if (!menu) return;

    // Löschen nur erlauben wenn nicht der einzige Tab
    const deleteItem = document.getElementById('tabContextDelete');
    if (deleteItem) {
        deleteItem.style.display = (tabsList.length > 1) ? 'flex' : 'none';
    }

    // Ausblenden/Einblenden Label setzen
    const tab = tabsList.find(t => t.id === tabId);
    const hideLabel = document.getElementById('tabContextHideLabel');
    if (hideLabel && tab) {
        hideLabel.textContent = tab.hidden ? 'Tab einblenden' : 'Tab ausblenden';
    }

    let x = event.clientX;
    let y = event.clientY;

    if (x + 180 > window.innerWidth) x = window.innerWidth - 185;
    if (y + 80 > window.innerHeight)  y = window.innerHeight - 85;

    menu.style.left = x + 'px';
    menu.style.top  = y + 'px';
    menu.style.display = 'block';

    return false;
}

/**
 * Tab-Kontext-Menü verstecken
 */
function hideTabContextMenu() {
    const menu = document.getElementById('tabContextMenu');
    if (menu) menu.style.display = 'none';
    tabContextMenuTabId = null;
}

/**
 * Tab umbenennen (aus Kontext-Menü)
 */
function renameTabFromContext() {
    const tabId = tabContextMenuTabId;
    hideTabContextMenu();
    if (!tabId) return;
    openRenameTabModal(tabId);
}

/**
 * Popup-Menü mit ausgeblendeten Tabs anzeigen
 */
function _showHiddenTabsMenu(anchor, hiddenTabs) {
    let menu = document.getElementById('hiddenTabsPopup');
    if (menu) { menu.remove(); return; }

    menu = document.createElement('div');
    menu.id = 'hiddenTabsPopup';
    menu.className = 'hidden-tabs-popup';

    hiddenTabs.forEach(tab => {
        const item = document.createElement('div');
        item.className = 'hidden-tabs-popup-item';
        item.textContent = `${tab.icon} ${tab.label}`;
        item.title = 'Einblenden';
        item.addEventListener('click', () => {
            tab.hidden = false;
            saveTabsList();
            renderTabBar();
            menu.remove();
        });
        menu.appendChild(item);
    });

    const rect = anchor.getBoundingClientRect();
    menu.style.top  = (rect.bottom + 6) + 'px';
    menu.style.left = rect.left + 'px';
    document.body.appendChild(menu);

    const close = (e) => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 0);
}

/**
 * Tab ausblenden / einblenden (aus Kontext-Menü)
 */
function toggleTabVisibilityFromContext() {
    const tabId = tabContextMenuTabId;
    hideTabContextMenu();
    if (!tabId) return;
    const tab = tabsList.find(t => t.id === tabId);
    if (!tab) return;
    tab.hidden = !tab.hidden;

    // DYNAMIC_CONFIGS synchronisieren, damit Export den aktuellen Wert hat
    const dynCfgs = window.DYNAMIC_CONFIGS || {};
    const dynKey  = findDynamicConfigLabel(tabId);
    if (dynKey) dynCfgs[dynKey].hidden = tab.hidden;

    // Falls der ausgeblendete Tab aktiv war → zum ersten sichtbaren wechseln
    if (tab.hidden && activeTabId === tabId) {
        const visible = tabsList.find(t => !t.hidden);
        if (visible) switchTab(visible.id);
    }
    saveTabsList();
    renderTabBar();
}

/**
 * Tab löschen (aus Kontext-Menü)
 */
function deleteTabFromContext() {
    const tabId = tabContextMenuTabId;
    hideTabContextMenu();
    if (!tabId) return;

    const tab = tabsList.find(t => t.id === tabId);
    if (!tab) return;

    if (tabsList.length <= 1) {
        showMessage('Der letzte Tab kann nicht gelöscht werden.', 'error');
        return;
    }

    if (!confirm(`Tab "${tab.icon} ${tab.label}" und alle enthaltenen Links wirklich löschen?`)) return;

    // Config aus localStorage entfernen
    localStorage.removeItem('linkConfig_' + tabId);

    // Tab aus Liste entfernen
    tabsList = tabsList.filter(t => t.id !== tabId);

    // Falls aktiver Tab gelöscht → zum ersten Tab wechseln
    if (activeTabId === tabId) {
        activeTabId = tabsList[0].id;
        loadTabConfigById(activeTabId);
    }

    saveTabsList();
    renderTabBar();
    renderCategories();
    updateFavoritesCount();

    showMessage(`Tab "${tab.label}" gelöscht`, 'success');

    setTimeout(() => {
        showMessage({
            title:   '💡 Hinweis: Config/tabs.js anpassen',
            content: `Den Eintrag für "${tab.label}" aus Config/tabs.js entfernen, damit der Tab nach einem Reset nicht wiedererscheint.`
        }, 'warning');
    }, 3500);
}

// -----------------------------------------------------------------------
// TABS ZUSAMMENFÜHREN
// -----------------------------------------------------------------------

/**
 * Merge-Modal öffnen (aus Tab-Kontext-Menü)
 */
function openMergeTabModal() {
    const tabId = tabContextMenuTabId;
    hideTabContextMenu();
    if (!tabId) return;

    const tab = tabsList.find(t => t.id === tabId);
    if (!tab) return;

    document.getElementById('mergeTabSourceName').textContent = `${tab.icon} ${tab.label}`;
    document.getElementById('mergeTabModal').dataset.sourceTabId = tabId;

    const targetSel = document.getElementById('mergeTabTarget');
    targetSel.innerHTML = tabsList
        .filter(t => t.id !== tabId && t.id !== 'favorites')
        .map(t => `<option value="${t.id}">${esc(t.icon)} ${esc(t.label)}</option>`)
        .join('');

    if (!targetSel.options.length) {
        showMessage('Keine weiteren Tabs vorhanden', 'warning');
        return;
    }

    document.getElementById('mergeTabModal').style.display = 'block';
}

/**
 * Merge bestätigen: Quell-Tab in Ziel-Tab einarbeiten, Quell-Tab löschen
 */
function confirmMergeTab() {
    const modal       = document.getElementById('mergeTabModal');
    const sourceTabId = modal.dataset.sourceTabId;
    const targetTabId = document.getElementById('mergeTabTarget').value;

    if (!sourceTabId || !targetTabId) return;

    const sourceCfg = getTabConfigById(sourceTabId);
    const targetCfg = getTabConfigById(targetTabId);

    if (!sourceCfg || !targetCfg) {
        showMessage('Fehler beim Laden der Tab-Konfigurationen', 'error');
        return;
    }

    // Kategorien aus Quell-Tab in Ziel-Tab übernehmen
    const srcOrder = sourceCfg.categoryOrder || Object.keys(sourceCfg.categories || {});
    srcOrder.forEach(srcKey => {
        const srcCat = sourceCfg.categories[srcKey];
        if (!srcCat) return;

        // Gleichnamige Kategorie im Ziel suchen → Links zusammenführen
        const existingKey = Object.entries(targetCfg.categories || {})
            .find(([, cat]) => cat.title === srcCat.title)?.[0];

        if (existingKey) {
            targetCfg.categories[existingKey].links.push(...srcCat.links.map(l => ({...l})));
        } else {
            // Eindeutigen Key sicherstellen
            let key = srcKey, i = 1;
            while (targetCfg.categories[key]) { key = srcKey + '_' + i; i++; }
            targetCfg.categories[key] = { ...srcCat, links: srcCat.links.map(l => ({...l})) };
            if (!targetCfg.categoryOrder) targetCfg.categoryOrder = [];
            targetCfg.categoryOrder.push(key);
        }
    });

    localStorage.setItem('linkConfig_' + targetTabId, JSON.stringify(targetCfg));
    localStorage.removeItem('linkConfig_' + sourceTabId);

    tabsList = tabsList.filter(t => t.id !== sourceTabId);
    if (activeTabId === sourceTabId) activeTabId = targetTabId;

    saveTabsList();
    renderTabBar();
    loadTabConfigById(activeTabId);
    renderCategories();
    updateFavoritesCount();

    closeMergeTabModal();

    const targetTab = tabsList.find(t => t.id === targetTabId);
    showMessage(`Tabs zusammengeführt in „${targetTab?.label}"`, 'success');
}

function closeMergeTabModal() {
    document.getElementById('mergeTabModal').style.display = 'none';
}

// -----------------------------------------------------------------------
// TAB HINZUFÜGEN
// -----------------------------------------------------------------------

/**
 * Modal zum Hinzufügen eines neuen Tabs öffnen
 */
function openAddTabModal() {
    const modal = document.getElementById('addTabModal');
    if (!modal) return;

    document.getElementById('newTabLabel').value = '';
    document.getElementById('newTabIcon').value = '';
    modal.style.display = 'block';
    setTimeout(() => document.getElementById('newTabLabel').focus(), 100);
}

/**
 * Add-Tab-Modal schließen
 */
function closeAddTabModal() {
    const modal = document.getElementById('addTabModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Neuen Tab bestätigen und anlegen
 */
function confirmAddTab() {
    const label = document.getElementById('newTabLabel').value.trim();
    const icon  = document.getElementById('newTabIcon').value.trim() || '📋';

    if (!label) {
        alert('Bitte einen Tab-Namen eingeben!');
        return;
    }

    // Eindeutige ID erzeugen
    const tabId = uniqueKey(label, k => k === 'favorites' || tabsList.some(t => t.id === k));

    const newTab = { id: tabId, label, icon };
    tabsList.push(newTab);

    // Leere Config anlegen
    const emptyConfig = { categories: {}, categoryOrder: [] };
    localStorage.setItem('linkConfig_' + tabId, JSON.stringify(emptyConfig));

    saveTabsList();
    closeAddTabModal();

    // Zum neuen Tab wechseln
    switchTab(tabId);

    showMessage(`Tab "${icon} ${label}" erstellt`, 'success');

    setTimeout(() => {
        showMessage({
            title:   '💡 Hinweis: Tab dauerhaft speichern',
            content: `Damit "${label}" nach einem Reset erhalten bleibt: Menü → "Default-Config exportieren" → Datei in Config/ ablegen + Dateinamen in Config/tabs.js eintragen.`
        }, 'warning');
    }, 3500);
}

// -----------------------------------------------------------------------
// TAB UMBENENNEN
// -----------------------------------------------------------------------

/**
 * Modal zum Umbenennen eines Tabs öffnen
 */
function openRenameTabModal(tabId) {
    const tab = tabsList.find(t => t.id === tabId);
    if (!tab) return;

    const modal = document.getElementById('renameTabModal');
    if (!modal) return;

    document.getElementById('renameTabId').value = tabId;
    document.getElementById('renameTabLabel').value = tab.label;
    document.getElementById('renameTabIcon').value = tab.icon;
    modal.style.display = 'block';
    setTimeout(() => document.getElementById('renameTabLabel').focus(), 100);
}

/**
 * Rename-Tab-Modal schließen
 */
function closeRenameTabModal() {
    const modal = document.getElementById('renameTabModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Tab-Umbenennung bestätigen
 */
function confirmRenameTab() {
    const tabId = document.getElementById('renameTabId').value;
    const label = document.getElementById('renameTabLabel').value.trim();
    const icon  = document.getElementById('renameTabIcon').value.trim() || '📋';

    if (!label) {
        alert('Bitte einen Tab-Namen eingeben!');
        return;
    }

    const tab = tabsList.find(t => t.id === tabId);
    if (!tab) return;

    tab.label = label;
    tab.icon  = icon;

    saveTabsList();
    renderTabBar();
    closeRenameTabModal();

    showMessage(`Tab umbenannt zu "${icon} ${label}"`, 'success');

    setTimeout(() => {
        showMessage({
            title:   '💡 Hinweis: Default-Config aktualisieren',
            content: `Falls eine Default_config-Datei für diesen Tab existiert: neu exportieren (Menü → "Default-Config exportieren") und die alte Datei in Config/ ersetzen.`
        }, 'warning');
    }, 3500);
}

// -----------------------------------------------------------------------
// FAVORITEN-TAB RENDERN
// -----------------------------------------------------------------------

/**
 * Favoriten-Tab: aggregiert alle Favoriten aus allen Tabs, gruppiert nach Tab
 */
function renderFavoritesTab() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'fav-tab-wrapper';

    let totalFavorites = 0;

    tabsList.forEach(tab => {
        const tabCfg = getTabConfigById(tab.id);
        if (!tabCfg) return;

        const tabFavorites = [];
        const order = tabCfg.categoryOrder || Object.keys(tabCfg.categories || {});

        order.forEach(categoryKey => {
            const category = (tabCfg.categories || {})[categoryKey];
            if (!category) return;

            category.links.forEach((link, linkIndex) => {
                if (link.favorite) {
                    tabFavorites.push({
                        ...link,
                        categoryKey,
                        categoryTitle: category.title,
                        categoryIcon:  category.icon,
                        tabId:    tab.id,
                        tabLabel: tab.label,
                        tabIcon:  tab.icon,
                        linkIndex
                    });
                }
            });
        });

        if (tabFavorites.length === 0) return;
        totalFavorites += tabFavorites.length;

        const section = document.createElement('div');
        section.className = 'fav-tab-section';

        const header = document.createElement('div');
        header.className = 'fav-tab-section-header';
        header.innerHTML = `
            <span class="fav-tab-section-icon">${esc(tab.icon)}</span>
            <span class="fav-tab-section-label">${esc(tab.label)}</span>
            <span class="fav-tab-section-count">${tabFavorites.length}</span>
        `;

        const grid = document.createElement('div');
        grid.className = 'fav-tab-grid';

        tabFavorites.forEach(fav => {
            const linkEl = document.createElement('div');
            linkEl.className = 'link-item favorites-tab-item favorite';
            linkEl.dataset.description = fav.description || '';

            linkEl.innerHTML = `
                <div class="link-header">
                    <span class="link-icon">${esc(fav.icon)}</span>
                    <div class="link-title">${esc(fav.title)}</div>
                </div>
                <div class="link-description">${esc(fav.description)}</div>
                <div class="favorites-tab-source">${esc(fav.categoryIcon)} ${esc(fav.categoryTitle)}</div>
            `;

            linkEl.addEventListener('click', () => { if (isSafeUrl(fav.url)) window.open(fav.url, '_blank'); });
            linkEl.title = `${fav.title}\n↗ Klicken zum Öffnen\n✏️ Bearbeiten im Tab "${fav.tabLabel}"`;

            grid.appendChild(linkEl);
        });

        section.appendChild(header);
        section.appendChild(grid);
        wrapper.appendChild(section);
    });

    if (totalFavorites === 0) {
        const empty = document.createElement('div');
        empty.className = 'favorites-tab-empty';
        empty.innerHTML = `
            <div class="favorites-tab-empty-icon">⭐</div>
            <div class="favorites-tab-empty-title">Noch keine Favoriten</div>
            <div class="favorites-tab-empty-hint">Rechtsklick auf einen Link → "Als Favorit setzen"</div>
        `;
        wrapper.appendChild(empty);
    }

    container.appendChild(wrapper);
}
