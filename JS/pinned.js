// ========================================================================
// LINKSAMMLUNG - PINNED.JS v3.5
// ========================================================================
// Angepinnte Links: Tab-übergreifende Leiste unter der Suchleiste.
// Die Leiste wird nur angezeigt wenn mindestens ein Link angepinnt ist.
// Abhängig von: config.js
// ========================================================================

/**
 * Angepinnte Links aus allen Tabs sammeln und die Pinned-Bar aktualisieren.
 */
function updatePinnedBar() {
    const bar = document.getElementById('pinnedBar');
    if (!bar) return;

    const pinned = [];

    tabsList.forEach(tab => {
        if (tab.id === 'favorites') return;
        const cfg = getTabConfigById(tab.id);
        if (!cfg) return;
        const order = cfg.categoryOrder || Object.keys(cfg.categories || {});
        order.forEach(key => {
            const cat = (cfg.categories || {})[key];
            if (!cat) return;
            cat.links.forEach(link => {
                if (link.pinned) {
                    pinned.push({
                        ...link,
                        tabId:       tab.id,
                        tabLabel:    tab.label,
                        tabIcon:     tab.icon,
                        categoryKey: key
                    });
                }
            });
        });
    });

    if (pinned.length === 0) {
        bar.innerHTML = '';
        bar.classList.remove('has-pins');
        return;
    }

    bar.classList.add('has-pins');

    const scroll = document.createElement('div');
    scroll.className = 'top-bar-pinned-scroll';

    const label = document.createElement('span');
    label.className = 'pinned-bar-label';
    label.textContent = '📌';
    label.title = 'Angepinnte Links';
    scroll.appendChild(label);

    pinned.forEach(p => {
        const chip = document.createElement('div');
        chip.className = 'pinned-chip';
        chip.title = `${p.title}\n${p.tabIcon} ${p.tabLabel}`;
        chip.innerHTML = `
            <span class="pinned-chip-icon">${esc(p.icon)}</span>
            <span class="pinned-chip-label">${esc(p.title)}</span>
            <span class="pinned-chip-unpin" title="Losgelöst (unpin)">✕</span>
        `;

        chip.addEventListener('click', (e) => {
            if (e.target.closest('.pinned-chip-unpin')) return;
            if (isSafeUrl(p.url)) window.open(p.url, '_blank');
        });

        chip.querySelector('.pinned-chip-unpin').addEventListener('click', (e) => {
            e.stopPropagation();
            unpinLink(p.tabId, p.categoryKey, p.url);
        });

        scroll.appendChild(chip);
    });

    bar.innerHTML = '';
    bar.appendChild(scroll);
}

/**
 * Link anhand von tabId + categoryKey + url aus dem Pin lösen
 * (url als stabiler Identifier, da linkIndex sich durch Sortierung ändern kann)
 */
function unpinLink(tabId, categoryKey, url) {
    const cfg = getTabConfigById(tabId);
    if (!cfg) return;
    const cat = (cfg.categories || {})[categoryKey];
    if (!cat) return;

    const link = cat.links.find(l => l.url === url);
    if (!link) return;

    link.pinned = false;
    localStorage.setItem('linkConfig_' + tabId, JSON.stringify(cfg));

    // Aktiver Tab: In-Memory-State ebenfalls aktualisieren
    if (tabId === activeTabId && linkCategories[categoryKey]) {
        const activeLink = linkCategories[categoryKey].links.find(l => l.url === url);
        if (activeLink) {
            activeLink.pinned = false;
            renderCategories();
        }
    }

    updatePinnedBar();
    showMessage(`📍 „${link.title}" losgelöst`, 'success');
}

/**
 * Pin-Status eines Links umschalten (aus Kontextmenü)
 */
function toggleLinkPinned() {
    if (!currentContextLink) return;

    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];

    link.pinned = !link.pinned;

    const action = link.pinned ? 'angepinnt' : 'losgelöst';
    const icon   = link.pinned ? '📌' : '📍';

    saveConfig(true);
    updatePinnedBar();
    renderCategories();
    showMessage(`${icon} „${link.title}" ${action}`, 'success');
    hideContextMenu();
}

/**
 * Kontextmenü-Eintrag (Pin / Unpin) auf aktuellen Link-Status setzen
 */
function updateContextMenuPinnedOption() {
    if (!currentContextLink) return;

    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];

    const icon = document.getElementById('pinnedToggleIcon');
    const text = document.getElementById('pinnedToggleText');

    if (icon && text) {
        if (link.pinned) {
            icon.textContent = '📍';
            text.textContent = 'Losgelöst (unpin)';
        } else {
            icon.textContent = '📌';
            text.textContent = 'Anpinnen';
        }
    }
}
