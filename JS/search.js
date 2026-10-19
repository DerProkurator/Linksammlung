// ========================================================================
// LINKSAMMLUNG - SEARCH.JS v3.3
// ========================================================================
// Such-System: STRG+K, globale Suche über alle Tabs, Tab-Badge
// Abhängig von: config.js, tabs.js
// ========================================================================

/**
 * Suchfunktionalität initialisieren
 */
function initializeSearch() {
    const searchInput      = document.getElementById('searchInput');
    const searchModalInput = document.getElementById('searchModalInput');
    const searchOverlay    = document.getElementById('searchOverlay');

    searchInput.addEventListener('input',   handleSearchInput);
    searchInput.addEventListener('focus',   openSearchModal);
    searchInput.addEventListener('keydown', handleSearchKeydown);

    searchModalInput.addEventListener('input',   handleModalSearchInput);
    searchModalInput.addEventListener('keydown', handleModalSearchKeydown);

    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) closeSearchModal();
    });

    _updateSearchScopeBtn();

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        if (e.key === 'Escape' && isSearchOpen) {
            closeSearchModal();
        }
    });
}

/**
 * Such-Input Handler (inline Suchleiste)
 */
function handleSearchInput(e) {
    const query = e.target.value;
    if (query.trim()) {
        openSearchModal();
        document.getElementById('searchModalInput').value = query;
        performSearch(query);
    }
}

/**
 * Such-Keydown Handler
 */
function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        openSearchModal();
    }
}

/**
 * Modal-Such-Input Handler
 */
function handleModalSearchInput(e) {
    const query = e.target.value;
    document.getElementById('searchInput').value = query;
    performSearch(query);
}

/**
 * Modal-Such-Keydown Handler (Navigation mit Pfeiltasten)
 */
function handleModalSearchKeydown(e) {
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            navigateSearchResults(1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            navigateSearchResults(-1);
            break;
        case 'Enter':
            e.preventDefault();
            openSelectedSearchResult();
            break;
        case 'Escape':
            e.preventDefault();
            closeSearchModal();
            break;
    }
}

/**
 * Such-Modal öffnen
 */
function openSearchModal() {
    const searchOverlay    = document.getElementById('searchOverlay');
    const searchModalInput = document.getElementById('searchModalInput');

    searchOverlay.classList.add('active');
    isSearchOpen = true;

    setTimeout(() => {
        searchModalInput.focus();
        const query = document.getElementById('searchInput').value;
        if (query.trim()) {
            performSearch(query);
        } else {
            showAllLinks();
        }
    }, 100);
}

/**
 * Such-Modal schließen
 */
function closeSearchModal() {
    const searchOverlay = document.getElementById('searchOverlay');
    searchOverlay.classList.remove('active');
    isSearchOpen = false;
    selectedSearchIndex = -1;

    document.getElementById('searchInput').value = '';
    document.getElementById('searchModalInput').value = '';
    currentSearchQuery = '';
}

/**
 * Globale Suche über ALLE Tabs durchführen
 */
function performSearch(query) {
    currentSearchQuery  = query.toLowerCase();
    searchResults       = [];
    selectedSearchIndex = -1;

    if (!query.trim()) {
        showAllLinks();
        return;
    }

    // Hilfsfunktion: einen Tab durchsuchen
    const searchInTab = (categories, order, tabInfo) => {
        order.forEach(categoryKey => {
            const category = categories[categoryKey];
            if (!category) return;

            category.links.forEach((link, linkIndex) => {
                const titleMatch       = link.title.toLowerCase().includes(currentSearchQuery);
                const descriptionMatch = (link.description || '').toLowerCase().includes(currentSearchQuery);
                const urlMatch         = link.url.toLowerCase().includes(currentSearchQuery);

                if (titleMatch || descriptionMatch || urlMatch) {
                    searchResults.push({
                        ...link,
                        categoryKey,
                        categoryTitle: category.title,
                        categoryIcon:  category.icon,
                        linkIndex,
                        tabId:    tabInfo.id,
                        tabLabel: tabInfo.label,
                        tabIcon:  tabInfo.icon,
                        relevanceScore: calculateRelevanceScore(link, currentSearchQuery)
                    });
                }
            });
        });
    };

    // Tabs durchsuchen — je nach Scope-Einstellung
    const scope = localStorage.getItem('searchScope') || 'all';
    const tabsToSearch = (scope === 'current' && activeTabId !== 'favorites')
        ? tabsList.filter(t => t.id === activeTabId)
        : tabsList;

    tabsToSearch.forEach(tab => {
        const tabCfg = getTabConfigById(tab.id);
        if (!tabCfg) return;
        const order = tabCfg.categoryOrder || Object.keys(tabCfg.categories || {});
        searchInTab(tabCfg.categories || {}, order, tab);
    });

    // Nach Relevanz sortieren, dann Tab-Reihenfolge
    searchResults.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
        // Gleicher Score: aktiver Tab zuerst
        if (a.tabId === activeTabId && b.tabId !== activeTabId) return -1;
        if (b.tabId === activeTabId && a.tabId !== activeTabId) return 1;
        return 0;
    });

    renderSearchResults();
}

/**
 * Relevanz-Score berechnen
 */
function calculateRelevanceScore(link, query) {
    let score = 0;
    const titleLower = link.title.toLowerCase();
    const descLower  = (link.description || '').toLowerCase();

    if (titleLower === query)             score += 100;
    else if (titleLower.startsWith(query)) score += 50;
    else if (titleLower.includes(query))   score += 25;

    if (descLower.includes(query)) score += 10;
    if (link.url.toLowerCase().includes(query)) score += 5;

    // Favoriten leicht bevorzugen
    if (link.favorite) score += 3;

    return score;
}

/**
 * Suche-Scope zwischen "alle Tabs" und "aktiver Tab" wechseln
 */
function toggleSearchScope() {
    const current = localStorage.getItem('searchScope') || 'all';
    const next    = current === 'all' ? 'current' : 'all';
    localStorage.setItem('searchScope', next);
    _updateSearchScopeBtn();
    if (currentSearchQuery) performSearch(currentSearchQuery);
}

/**
 * Scope-Button-Anzeige aktualisieren
 */
function _updateSearchScopeBtn() {
    const btn = document.getElementById('searchScopeBtn');
    if (!btn) return;
    const scope = localStorage.getItem('searchScope') || 'all';
    btn.title     = scope === 'all' ? 'Alle Tabs durchsuchen (klicken: nur aktiver Tab)' : 'Nur aktiver Tab (klicken: alle Tabs)';
    btn.textContent = scope === 'all' ? '🌐' : '📄';
    btn.classList.toggle('active', scope === 'current');
}

/**
 * Alle Links des aktiven Tabs anzeigen (kein Suchbegriff)
 */
function showAllLinks() {
    searchResults = [];

    if (activeTabId === 'favorites') {
        // Im Favoriten-Tab: alle Favoriten aller Tabs
        tabsList.forEach(tab => {
            const tabCfg = getTabConfigById(tab.id);
            if (!tabCfg) return;
            const order = tabCfg.categoryOrder || Object.keys(tabCfg.categories || {});
            order.forEach(key => {
                const cat = (tabCfg.categories || {})[key];
                if (!cat || cat.collapsed) return;
                cat.links.forEach((link, idx) => {
                    if (link.favorite) {
                        searchResults.push({
                            ...link,
                            categoryKey:   key,
                            categoryTitle: cat.title,
                            categoryIcon:  cat.icon,
                            linkIndex:     idx,
                            tabId:    tab.id,
                            tabLabel: tab.label,
                            tabIcon:  tab.icon,
                            relevanceScore: 0
                        });
                    }
                });
            });
        });
    } else {
        categoryOrder.forEach(categoryKey => {
            const category = linkCategories[categoryKey];
            if (!category || category.collapsed) return;

            const tab = tabsList.find(t => t.id === activeTabId) || { id: activeTabId, label: activeTabId, icon: '📋' };

            category.links.forEach((link, linkIndex) => {
                searchResults.push({
                    ...link,
                    categoryKey,
                    categoryTitle: category.title,
                    categoryIcon:  category.icon,
                    linkIndex,
                    tabId:    tab.id,
                    tabLabel: tab.label,
                    tabIcon:  tab.icon,
                    relevanceScore: 0
                });
            });
        });
    }

    renderSearchResults();
}

/**
 * Suchergebnisse rendern (mit Tab-Badge)
 */
function renderSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    const statsContainer   = document.getElementById('searchStats');

    if (searchResults.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-no-results">
                <div class="search-no-results-icon">🔍</div>
                <div class="search-no-results-text">Keine Links gefunden</div>
                <div class="search-no-results-hint">Versuchen Sie andere Suchbegriffe</div>
            </div>
        `;
        statsContainer.textContent = 'Keine Ergebnisse';
        return;
    }

    resultsContainer.innerHTML = '';

    searchResults.forEach((result, index) => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result-item';
        resultElement.setAttribute('data-index', index);

        const highlightedTitle       = highlightSearchTerm(result.title, currentSearchQuery);
        const highlightedDescription = highlightSearchTerm(result.description || '', currentSearchQuery);

        // Tab-Badge nur anzeigen wenn Tab verschieden vom aktiven (oder immer für Übersicht)
        const tabBadgeHtml = `<div class="search-result-tab-badge" title="Tab: ${esc(result.tabLabel)}">${esc(result.tabIcon)} ${esc(result.tabLabel)}</div>`;
        const favStarHtml  = result.favorite ? '<span class="search-result-fav-star">⭐</span>' : '';

        resultElement.innerHTML = `
            <div class="search-result-header">
                <span class="search-result-icon">${esc(result.icon)}</span>
                <div class="search-result-title">${highlightedTitle}${favStarHtml}</div>
                <div class="search-result-category">${esc(result.categoryIcon)} ${esc(result.categoryTitle)}</div>
                ${tabBadgeHtml}
            </div>
            <div class="search-result-description">${highlightedDescription}</div>
            <div class="search-result-url">${esc(result.url)}</div>
        `;

        resultElement.addEventListener('click', () => {
            openLink(result.url);
            closeSearchModal();
        });

        resultElement.addEventListener('mouseenter', () => {
            selectedSearchIndex = index;
            updateSearchSelection();
        });

        resultsContainer.appendChild(resultElement);
    });

    const resultText = searchResults.length === 1 ? 'Ergebnis' : 'Ergebnisse';
    statsContainer.textContent = `${searchResults.length} ${resultText}`;

    updateSearchSelection();
}

/**
 * Suchbegriff hervorheben — Text wird zuerst escaped, dann der Treffer in <span> eingebettet
 */
function highlightSearchTerm(text, query) {
    if (!text) return '';
    if (!query || !query.trim()) return esc(text);
    const escapedText  = esc(text);
    const escapedQuery = escapeRegExp(esc(query));
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * RegExp-Sonderzeichen escapen
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * In Suchergebnissen navigieren
 */
function navigateSearchResults(direction) {
    if (searchResults.length === 0) return;

    selectedSearchIndex += direction;

    if (selectedSearchIndex < 0) {
        selectedSearchIndex = searchResults.length - 1;
    } else if (selectedSearchIndex >= searchResults.length) {
        selectedSearchIndex = 0;
    }

    updateSearchSelection();
    scrollToSelectedResult();
}

/**
 * Such-Auswahl aktualisieren
 */
function updateSearchSelection() {
    document.querySelectorAll('.search-result-item').forEach((element, index) => {
        if (index === selectedSearchIndex) {
            element.classList.add('selected');
        } else {
            element.classList.remove('selected');
        }
    });
}

/**
 * Zu ausgewähltem Ergebnis scrollen
 */
function scrollToSelectedResult() {
    const selectedElement = document.querySelector('.search-result-item.selected');
    if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Ausgewähltes Suchergebnis öffnen
 */
function openSelectedSearchResult() {
    if (selectedSearchIndex >= 0 && selectedSearchIndex < searchResults.length) {
        openLink(searchResults[selectedSearchIndex].url);
        closeSearchModal();
    }
}

/**
 * Link in neuem Tab öffnen — nur http/https erlaubt
 */
function openLink(url) {
    if (isSafeUrl(url)) window.open(url, '_blank');
}
