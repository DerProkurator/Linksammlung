// ========================================================================
// LINKSAMMLUNG - PINNED.JS v3.7
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
        cfg.categoryOrder.forEach(key => {
            const cat = cfg.categories[key];
            if (!cat) return;
            cat.links.forEach((link, linkIndex) => {
                if (link.pinned) {
                    pinned.push({
                        ...link,
                        tabId:       tab.id,
                        tabLabel:    tab.label,
                        tabIcon:     tab.icon,
                        categoryKey: key,
                        linkIndex
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
        chip.setAttribute('role', 'link');
        chip.tabIndex = 0;
        chip.title = `${p.title}\n${p.tabIcon} ${p.tabLabel}`;
        chip.innerHTML = `
            <span class="pinned-chip-icon">${esc(p.icon)}</span>
            <span class="pinned-chip-label">${esc(p.title)}</span>
            <span class="pinned-chip-unpin" title="Losgelöst (unpin)" role="button" tabindex="0" aria-label="Pin lösen">✕</span>
        `;

        chip.addEventListener('click', (e) => {
            if (e.target.closest('.pinned-chip-unpin')) return;
            if (isSafeUrl(p.url)) window.open(p.url, '_blank', 'noopener,noreferrer');
        });

        chip.querySelector('.pinned-chip-unpin').addEventListener('click', (e) => {
            e.stopPropagation();
            unpinLink(p.tabId, p.categoryKey, p.linkIndex, p.url);
        });

        scroll.appendChild(chip);
    });

    bar.innerHTML = '';
    bar.appendChild(scroll);
}

/**
 * Pin eines Links lösen – adressiert über tabId + categoryKey + linkIndex.
 * Die URL ist nicht eindeutig (gleiche URL kann mehrfach vorkommen) und dient
 * nur als Kontrolle, dass der Index noch auf denselben Link zeigt.
 */
function unpinLink(tabId, categoryKey, linkIndex, url) {
    const isActive = tabId === activeTabId;
    const cfg  = isActive ? { categories: linkCategories } : getTabConfigById(tabId);
    const cat  = cfg && Object.hasOwn(cfg.categories, categoryKey) ? cfg.categories[categoryKey] : null;
    const link = cat && cat.links[linkIndex];

    if (!link || link.url !== url || !link.pinned) {
        refreshViews();
        showMessage('Der Link wurde zwischenzeitlich geändert – Pin-Leiste wurde aktualisiert.', 'warning');
        return;
    }

    link.pinned = false;
    const saved = isActive ? saveConfig(true) : writeTabConfig(tabId, cfg);
    if (!saved) return;

    refreshViews();
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

    hideContextMenu();
    if (!saveConfig(true)) return;
    refreshViews();
    showMessage(`${icon} „${link.title}" ${action}`, 'success');
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
