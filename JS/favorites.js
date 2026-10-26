// ========================================================================
// LINKSAMMLUNG - FAVORITES.JS v3.6
// ========================================================================
// Favoriten-Sidebar-System (aktiver Tab)
// Abhängig von: config.js
// ========================================================================

/**
 * Favoriten-Seitenleiste ein-/ausblenden
 */
function toggleFavorites() {
    const favoritesOverlay = document.getElementById('favoritesOverlay');
    const favoritesSidebar = document.getElementById('favoritesSidebar');
    const favoritesToggle  = document.getElementById('favoritesToggle');

    favoritesOpen = !favoritesOpen;

    if (favoritesOpen) {
        favoritesOverlay.classList.add('active');
        favoritesSidebar.classList.add('active');
        favoritesToggle.classList.add('active');
        updateFavoritesList();

        document.body.style.overflow = 'hidden';
        favoritesOverlay.addEventListener('click', handleOverlayClick);
    } else {
        favoritesOverlay.classList.remove('active');
        favoritesSidebar.classList.remove('active');
        favoritesToggle.classList.remove('active');

        document.body.style.overflow = '';
        favoritesOverlay.removeEventListener('click', handleOverlayClick);
    }
}

/**
 * Overlay-Click Handler
 */
function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
        toggleFavorites();
    }
}

/**
 * Favoriten-Liste (Sidebar) aktualisieren — zeigt Favoriten des aktiven Tabs
 */
function updateFavoritesList() {
    const favoritesContent = document.querySelector('#favoritesSidebar .favorites-sidebar-content');
    const favoritesCount   = document.getElementById('favoritesCount');

    if (!favoritesContent || !favoritesCount) {
        console.error('Favoriten-Container nicht gefunden');
        return;
    }

    // Favoriten des aktiven Tabs sammeln
    const favorites = [];
    if (activeTabId !== 'favorites') {
        categoryOrder.forEach(categoryKey => {
            const category = linkCategories[categoryKey];
            if (!category) return;

            category.links.forEach((link, linkIndex) => {
                if (link.favorite) {
                    favorites.push({
                        ...link,
                        categoryKey,
                        categoryTitle: category.title,
                        categoryIcon:  category.icon,
                        linkIndex
                    });
                }
            });
        });
    } else {
        // Im Favoriten-Tab: alle Tabs aggregieren
        tabsList.forEach(tab => {
            const tabCfg = getTabConfigById(tab.id);
            if (!tabCfg) return;
            const order = tabCfg.categoryOrder || Object.keys(tabCfg.categories || {});
            order.forEach(key => {
                const cat = (tabCfg.categories || {})[key];
                if (!cat) return;
                cat.links.forEach((link, idx) => {
                    if (link.favorite) {
                        favorites.push({
                            ...link,
                            categoryKey:   key,
                            categoryTitle: cat.title,
                            categoryIcon:  cat.icon,
                            linkIndex:     idx
                        });
                    }
                });
            });
        });
    }

    favoritesCount.textContent = favorites.length;
    favoritesContent.innerHTML = '';

    if (favorites.length === 0) {
        favoritesContent.innerHTML = `
            <div class="favorites-empty">
                <div class="favorites-empty-icon">⭐</div>
                <div class="favorites-empty-text">Keine Favoriten gesetzt</div>
                <div class="favorites-empty-hint">Rechtsklick auf einen Link → "Als Favorit setzen"</div>
            </div>
        `;
        return;
    }

    favorites.sort((a, b) => a.title.localeCompare(b.title));

    favorites.forEach(favorite => {
        const el = document.createElement('div');
        el.className = 'favorite-item';
        el.innerHTML = `
            <div class="favorite-item-icon">${esc(favorite.icon)}</div>
            <div class="favorite-item-content">
                <div class="favorite-item-title">${esc(favorite.title)}</div>
                <div class="favorite-item-category">
                    <span>${esc(favorite.categoryIcon)}</span>
                    <span>${esc(favorite.categoryTitle)}</span>
                </div>
                <div class="favorite-item-url">${esc(favorite.url)}</div>
            </div>
            <div class="favorite-item-remove">✕</div>
        `;

        const removeBtn = el.querySelector('.favorite-item-remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(favorite.categoryKey, favorite.linkIndex);
        });

        el.addEventListener('click', () => {
            if (isSafeUrl(favorite.url)) window.open(favorite.url, '_blank', 'noopener,noreferrer');
        });
        favoritesContent.appendChild(el);
    });
}

/**
 * Favoriten-Anzahl (Badge am Toggle-Button) aktualisieren
 */
function updateFavoritesCount() {
    const favoritesCount = document.getElementById('favoritesCount');
    if (!favoritesCount) return;

    let count = 0;

    if (activeTabId !== 'favorites') {
        categoryOrder.forEach(key => {
            const cat = linkCategories[key];
            if (cat && cat.links) cat.links.forEach(l => { if (l.favorite) count++; });
        });
    } else {
        // Alle Tabs zählen
        tabsList.forEach(tab => {
            const cfg = getTabConfigById(tab.id);
            if (!cfg) return;
            Object.values(cfg.categories || {}).forEach(cat => {
                cat.links.forEach(l => { if (l.favorite) count++; });
            });
        });
    }

    favoritesCount.textContent = count;

    if (favoritesOpen) updateFavoritesList();
}

/**
 * Favorit aus Sidebar entfernen
 */
function removeFavorite(categoryKey, linkIndex) {
    if (linkCategories[categoryKey] && linkCategories[categoryKey].links[linkIndex]) {
        const link = linkCategories[categoryKey].links[linkIndex];
        link.favorite = false;

        saveConfig(true);
        updateFavoritesCount();
        renderCategories();

        showMessage(`"${link.title}" aus Favoriten entfernt`, 'success');
    }
}

/**
 * Link-Favoriten-Status umschalten (aus Kontext-Menü)
 */
function toggleLinkFavorite() {
    if (!currentContextLink) return;

    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];

    link.favorite = !link.favorite;

    const action = link.favorite ? 'zu Favoriten hinzugefügt' : 'aus Favoriten entfernt';
    const icon   = link.favorite ? '⭐' : '☆';

    saveConfig(true);
    updateFavoritesCount();
    renderCategories();

    showMessage(`${icon} "${link.title}" ${action}`, 'success');
    hideContextMenu();
}

/**
 * Kontext-Menü Favoriten-Option aktualisieren
 */
function updateContextMenuFavoriteOption() {
    if (!currentContextLink) return;

    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];

    const favoriteIcon = document.getElementById('favoriteToggleIcon');
    const favoriteText = document.getElementById('favoriteToggleText');

    if (favoriteIcon && favoriteText) {
        if (link.favorite) {
            favoriteIcon.textContent = '☆';
            favoriteText.textContent = 'Aus Favoriten entfernen';
        } else {
            favoriteIcon.textContent = '⭐';
            favoriteText.textContent = 'Als Favorit setzen';
        }
    }
}

/**
 * Favoriten-Checkbox UI aktualisieren
 */
function updateFavoritesCheckboxUI() {
    const checkbox = document.getElementById('linkFavorite');
    const group    = document.getElementById('favoritesGroup');

    if (checkbox && group) {
        if (checkbox.checked) {
            group.classList.add('checked');
        } else {
            group.classList.remove('checked');
        }
    }
}

/**
 * Favoriten-Checkbox UI einrichten
 */
function setupFavoritesCheckbox() {
    const checkbox = document.getElementById('linkFavorite');
    const group    = document.getElementById('favoritesGroup');

    if (checkbox && group) {
        updateFavoritesCheckboxUI();

        checkbox.addEventListener('change', function() {
            updateFavoritesCheckboxUI();
        });

        group.addEventListener('click', function(e) {
            if (e.target !== checkbox && !e.target.closest('label[for="linkFavorite"]')) {
                checkbox.checked = !checkbox.checked;
                updateFavoritesCheckboxUI();
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }
}
