// ========================================================================
// LINKSAMMLUNG - LINK-OVERVIEW.JS v3.7
// ========================================================================
// Link-Übersicht: alle Links aller Tabs als sortierbare Tabelle
// (alphabetisch, A–Z-Sprungleiste, Filter, Bearbeiten/Löschen,
// "Hinspringen", Erkennung ähnlicher Links und Mehrfachauswahl)
// Abhängig von: config.js, tabs.js, links.js, ui.js, favorites.js, pinned.js
// ========================================================================

let overviewEditTarget = null;   // { tabId, categoryKey, linkIndex, url } während Bearbeitung aus der Übersicht

let _ovRows      = [];           // alle Links (Rohdaten, mit Kontext)
let _ovSimilar   = null;         // Ähnlichkeits-Index (lazy, nach jeder Änderung neu)
let _ovSortCol   = 'title';
let _ovSortDir   = 1;            // 1 = aufsteigend, -1 = absteigend
let _ovMode      = 'list';       // 'list' | 'similar'
let _ovFocusRow  = null;         // Zeilen-Index für "Ähnlich zu …"-Filter
let _ovKeyHandler = null;
let _ovSelected  = new Set();    // uids der ausgewählten Links
let _ovVisible   = [];           // Zeilen-Indizes in Anzeige-Reihenfolge (für Shift-Klick)
let _ovLastClick = null;         // zuletzt angeklickte Zeile (Bereichsauswahl)

const _ovCollator = new Intl.Collator('de', { sensitivity: 'base', numeric: true });

// -----------------------------------------------------------------------
// DATEN SAMMELN / SCHREIBEN
// -----------------------------------------------------------------------

/**
 * Config eines Tabs für die Übersicht – immer eine Kopie (beim aktiven Tab der Live-Stand)
 */
function _ovGetTabData(tabId) {
    if (tabId === activeTabId) return getActiveConfigSnapshot();
    return getTabConfigById(tabId);
}

/**
 * Alle Links aller Tabs (inkl. ausgeblendeter) einlesen
 */
function _ovCollectRows() {
    const rows = [];
    const seen = new Map();   // für stabile uid: n-tes Vorkommen derselben URL in einer Kategorie
    tabsList.forEach(tab => {
        if (tab.id === 'favorites') return;
        const cfg = _ovGetTabData(tab.id);
        if (!cfg) return;

        const keys = [...cfg.categoryOrder, ...Object.keys(cfg.categories).filter(k => !cfg.categoryOrder.includes(k))];
        keys.forEach(catKey => {
            const cat = cfg.categories[catKey];
            if (!cat || !Array.isArray(cat.links)) return;
            cat.links.forEach((link, linkIndex) => {
                const url = typeof link.url === 'string' ? link.url : '';
                const base = tab.id + '\u0000' + catKey + '\u0000' + url;
                const nth = (seen.get(base) || 0) + 1;
                seen.set(base, nth);
                rows.push({
                    uid:           base + '\u0000' + nth,
                    tabId:         tab.id,
                    tabLabel:      tab.label,
                    tabIcon:       tab.icon || '📋',
                    tabHidden:     !!tab.hidden,
                    categoryKey:   catKey,
                    categoryTitle: cat.title || catKey,
                    categoryIcon:  cat.icon || '📁',
                    linkIndex,
                    title:         link.title || url,
                    url,
                    description:   link.description || '',
                    icon:          link.icon || '🔗',
                    favorite:      !!link.favorite,
                    pinned:        !!link.pinned
                });
            });
        });
    });
    return rows;
}

/**
 * Mehrere Tabs als Einheit ändern und speichern.
 * mutator(cfgs) bekommt eine Map tabId → Kopie { categories, categoryOrder } und darf
 * diese verändern; gibt er false zurück, wird nichts gespeichert. Gespeichert wird in
 * einem Schritt – schlägt ein Teil fehl, bleiben alle Tabs beim alten Stand.
 * @returns {boolean} true wenn gespeichert wurde
 */
function _ovMutateTabs(tabIds, mutator) {
    const cfgs = new Map();
    for (const tabId of new Set(tabIds)) {
        const cfg = _ovGetTabData(tabId);
        if (!cfg) return false;
        cfgs.set(tabId, cfg);
    }

    if (mutator(cfgs) === false) return false;

    cfgs.forEach(cfg => {
        cfg.categoryOrder = cfg.categoryOrder.filter(k => Object.hasOwn(cfg.categories, k));
    });
    return writeTabConfigs(cfgs);
}

function _ovMutateTab(tabId, mutator) {
    return _ovMutateTabs([tabId], cfgs => mutator(cfgs.get(tabId)));
}

/**
 * Nach Änderungen: Hauptansicht + Übersicht aktualisieren
 */
function _ovAfterChange() {
    renderCategories();
    updateFavoritesCount();
    updatePinnedBar();
    _ovReload();
}

/**
 * Prüft, ob die Zeile noch auf denselben Link zeigt (Schutz gegen veraltete Indizes)
 */
function _ovResolveLink(cfg, row) {
    const cat = Object.hasOwn(cfg.categories, row.categoryKey) ? cfg.categories[row.categoryKey] : null;
    const link = cat && cat.links[row.linkIndex];
    return (link && (link.url || '') === row.url) ? link : null;
}

// -----------------------------------------------------------------------
// ÄHNLICHKEIT
// -----------------------------------------------------------------------

/**
 * URL "lose" normalisieren: Protokoll, www., Query, Hash, Slash am Ende entfernen
 */
function _ovLooseUrl(url) {
    return url.trim().toLowerCase()
        .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
        .replace(/^www\./, '')
        .replace(/[?#].*$/, '')
        .replace(/\/+$/, '');
}

/**
 * Domain (ohne www.) einer URL
 */
function _ovDomain(url) {
    const loose = _ovLooseUrl(url);
    return loose.split('/')[0].replace(/:\d+$/, '');
}

/**
 * Titel für den Vergleich normalisieren
 */
function _ovNormTitle(title) {
    return title.toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

const _OV_STOPWORDS = new Set(['der', 'die', 'das', 'und', 'oder', 'the', 'and', 'for', 'von', 'mit', 'fuer', 'www', 'http', 'https', 'com', 'de']);

function _ovTokens(normTitle) {
    return new Set(normTitle.split(' ').filter(t => t.length >= 3 && !_OV_STOPWORDS.has(t)));
}

/**
 * Levenshtein-Distanz (mit Abbruch, sobald max überschritten)
 */
function _ovLevenshtein(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const cur = [i];
        let rowMin = i;
        for (let j = 1; j <= b.length; j++) {
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            if (cur[j] < rowMin) rowMin = cur[j];
        }
        if (rowMin > max) return max + 1;
        prev = cur;
    }
    return prev[b.length];
}

/**
 * Sind zwei Titel ähnlich? (gleiche Wörter oder Tippfehler-Toleranz)
 */
function _ovTitlesSimilar(a, b) {
    if (!a.norm || !b.norm) return false;
    if (a.norm === b.norm) return true;

    // Wort-Überschneidung (Jaccard; "web" passt auch zu "webmail")
    if (a.tokens.size && b.tokens.size) {
        let shared = 0;
        a.tokens.forEach(t => {
            for (const u of b.tokens) {
                if (t === u || t.startsWith(u) || u.startsWith(t)) { shared++; break; }
            }
        });
        const union = a.tokens.size + b.tokens.size - shared;
        if (shared > 0 && shared / union >= 0.5) return true;
    }

    // Tippfehler: ≤ 20 % abweichende Zeichen (ab 5 Zeichen)
    const len = Math.max(a.norm.length, b.norm.length);
    if (len < 5) return false;
    const max = Math.floor(len * 0.2);
    return _ovLevenshtein(a.norm, b.norm, max) <= max;
}

/**
 * Ähnlichkeits-Index aufbauen:
 *  url[i]    → Indizes mit fast gleicher Adresse
 *  title[i]  → Indizes mit ähnlichem Namen
 *  domain[i] → Indizes mit gleicher Domain
 */
function _ovBuildSimilarity() {
    const n = _ovRows.length;
    const loose  = _ovRows.map(r => _ovLooseUrl(r.url));
    const domain = _ovRows.map(r => _ovDomain(r.url));
    const titles = _ovRows.map(r => {
        const norm = _ovNormTitle(r.title);
        return { norm, tokens: _ovTokens(norm) };
    });

    const idx = { url: [], title: [], domain: [] };
    for (let i = 0; i < n; i++) { idx.url[i] = []; idx.title[i] = []; idx.domain[i] = []; }

    const byLoose = new Map();
    const byDomain = new Map();
    for (let i = 0; i < n; i++) {
        if (loose[i]) {
            if (!byLoose.has(loose[i])) byLoose.set(loose[i], []);
            byLoose.get(loose[i]).push(i);
        }
        if (domain[i]) {
            if (!byDomain.has(domain[i])) byDomain.set(domain[i], []);
            byDomain.get(domain[i]).push(i);
        }
    }
    byLoose.forEach(list => list.forEach(i => { idx.url[i] = list.filter(j => j !== i); }));
    byDomain.forEach(list => list.forEach(i => {
        // gleiche Domain, aber nicht schon über "fast gleiche Adresse" erfasst
        idx.domain[i] = list.filter(j => j !== i && loose[j] !== loose[i]);
    }));

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (loose[i] && loose[i] === loose[j]) continue;
            if (_ovTitlesSimilar(titles[i], titles[j])) {
                idx.title[i].push(j);
                idx.title[j].push(i);
            }
        }
    }

    // Gruppen für die "Ähnliche"-Ansicht
    const groups = { url: [], title: [], domain: [] };
    byLoose.forEach(list => { if (list.length > 1) groups.url.push(list); });

    const seen = new Set();
    for (let i = 0; i < n; i++) {
        if (seen.has(i) || idx.title[i].length === 0) continue;
        // Zusammenhängende Komponente sammeln
        const comp = [];
        const stack = [i];
        seen.add(i);
        while (stack.length) {
            const k = stack.pop();
            comp.push(k);
            idx.title[k].forEach(m => { if (!seen.has(m)) { seen.add(m); stack.push(m); } });
        }
        groups.title.push(comp);
    }

    byDomain.forEach(list => {
        const distinct = new Set(list.map(i => loose[i]));
        if (distinct.size > 1) groups.domain.push(list);
    });

    return { idx, groups, domain };
}

function _ovGetSimilarity() {
    if (!_ovSimilar) _ovSimilar = _ovBuildSimilarity();
    return _ovSimilar;
}

// -----------------------------------------------------------------------
// MODAL ÖFFNEN / SCHLIESSEN
// -----------------------------------------------------------------------

/**
 * Link-Übersicht öffnen (Hauptmenü → Verwaltung)
 */
function openLinkOverview() {
    closeMenu();
    closeLinkOverview();

    _ovMode = 'list';
    _ovFocusRow = null;
    _ovSelected = new Set();
    _ovLastClick = null;

    const tabOptions = tabsList
        .filter(t => t.id !== 'favorites')
        .map(t => `<option value="${esc(t.id)}">${esc(t.icon || '📋')} ${esc(t.label)}${t.hidden ? ' (ausgeblendet)' : ''}</option>`)
        .join('');

    const html = `
        <div class="modal ov-modal" id="linkOverviewModal" style="display:block;">
            <div class="modal-content ov-content">
                <div class="ov-header">
                    <h2><span class="modal-emoji">📋</span> Alle Links</h2>
                    <button type="button" class="ov-close" onclick="closeLinkOverview()" title="Schließen (ESC)">✕</button>
                </div>
                <div class="ov-toolbar">
                    <input type="text" id="ovFilter" class="ov-filter" placeholder="Filtern nach Name, URL, Beschreibung, Tab, Kategorie…" autocomplete="off">
                    <select id="ovTabFilter" class="ov-select">
                        <option value="">Alle Tabs</option>
                        ${tabOptions}
                    </select>
                    <select id="ovCatFilter" class="ov-select">
                        <option value="">Alle Kategorien</option>
                    </select>
                    <button type="button" id="ovSimilarBtn" class="ov-toggle-btn" onclick="toggleOverviewSimilarMode()" title="Ähnliche Links gruppiert anzeigen">🧩 Ähnliche anzeigen</button>
                </div>
                <div class="ov-subbar">
                    <div class="ov-stats" id="ovStats"></div>
                    <div class="ov-focus" id="ovFocus"></div>
                </div>
                <div class="ov-bulk" id="ovBulk"></div>
                <div class="ov-body">
                    <div class="ov-table-wrap" id="ovTableWrap"></div>
                    <div class="ov-az" id="ovAz"></div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', html);

    const modal = document.getElementById('linkOverviewModal');
    modal.addEventListener('click', e => { if (e.target === modal) closeLinkOverview(); });

    document.getElementById('ovFilter').addEventListener('input', _ovRender);
    document.getElementById('ovTabFilter').addEventListener('change', () => {
        _ovFillCategoryFilter();
        _ovRender();
    });
    document.getElementById('ovCatFilter').addEventListener('change', _ovRender);
    document.getElementById('ovTableWrap').addEventListener('click', _ovHandleTableClick);
    document.getElementById('ovBulk').addEventListener('click', _ovHandleBulkClick);
    document.getElementById('ovAz').addEventListener('click', _ovHandleAzClick);

    // ESC: nur die Übersicht schließen, wenn kein Link-Modal darüber liegt.
    // Capture-Phase, damit der Zustand vor dem globalen ESC-Handler geprüft wird.
    _ovKeyHandler = (e) => {
        if (e.key !== 'Escape') return;
        if (document.getElementById('linkModal').style.display === 'block') return;
        const movePanel = document.getElementById('ovMovePanel');
        if (movePanel) { movePanel.remove(); e.stopPropagation(); return; }
        closeLinkOverview();
    };
    document.addEventListener('keydown', _ovKeyHandler, true);

    _ovReload();
    document.getElementById('ovFilter').focus();
}

/**
 * Link-Übersicht schließen
 */
function closeLinkOverview() {
    const modal = document.getElementById('linkOverviewModal');
    if (modal) modal.remove();
    if (_ovKeyHandler) {
        document.removeEventListener('keydown', _ovKeyHandler, true);
        _ovKeyHandler = null;
    }
}

/**
 * Daten neu einlesen und neu zeichnen (z. B. nach Bearbeiten/Löschen)
 */
function _ovReload() {
    if (!document.getElementById('linkOverviewModal')) return;
    _ovRows    = _ovCollectRows();
    _ovSimilar = null;
    _ovFocusRow = null;
    _ovLastClick = null;
    const uids = new Set(_ovRows.map(r => r.uid));
    _ovSelected = new Set([..._ovSelected].filter(u => uids.has(u)));
    _ovFillCategoryFilter();
    _ovRender();
}

/**
 * Kategorie-Dropdown passend zum gewählten Tab befüllen (Auswahl möglichst behalten)
 */
function _ovFillCategoryFilter() {
    const select = document.getElementById('ovCatFilter');
    const tabId  = document.getElementById('ovTabFilter').value;
    const prev   = select.value;

    const titles = new Map();
    _ovRows.forEach(r => {
        if (tabId && r.tabId !== tabId) return;
        if (!titles.has(r.categoryTitle)) titles.set(r.categoryTitle, r.categoryIcon);
    });
    const sorted = [...titles.keys()].sort(_ovCollator.compare);

    select.innerHTML = '<option value="">Alle Kategorien</option>' +
        sorted.map(t => `<option value="${esc(t)}">${esc(titles.get(t))} ${esc(t)}</option>`).join('');
    select.value = titles.has(prev) ? prev : '';
}

// -----------------------------------------------------------------------
// FILTERN / SORTIEREN
// -----------------------------------------------------------------------

/**
 * Indizes der Zeilen, die den aktuellen Filtern entsprechen
 */
function _ovFilteredIndices() {
    const q     = document.getElementById('ovFilter').value.trim().toLowerCase();
    const tabId = document.getElementById('ovTabFilter').value;
    const cat   = document.getElementById('ovCatFilter').value;

    let allowed = null;
    if (_ovFocusRow !== null) {
        const { idx } = _ovGetSimilarity();
        allowed = new Set([_ovFocusRow, ...idx.url[_ovFocusRow], ...idx.title[_ovFocusRow], ...idx.domain[_ovFocusRow]]);
    }

    const result = [];
    _ovRows.forEach((r, i) => {
        if (allowed && !allowed.has(i)) return;
        if (tabId && r.tabId !== tabId) return;
        if (cat && r.categoryTitle !== cat) return;
        if (q) {
            const hay = `${r.title}\n${r.url}\n${r.description}\n${r.tabLabel}\n${r.categoryTitle}`.toLowerCase();
            if (!hay.includes(q)) return;
        }
        result.push(i);
    });
    return result;
}

function _ovSortValue(r, col) {
    switch (col) {
        case 'url':      return _ovLooseUrl(r.url);
        case 'tab':      return r.tabLabel;
        case 'category': return r.categoryTitle;
        default:         return r.title;
    }
}

function _ovSort(indices) {
    return indices.sort((a, b) => {
        const ra = _ovRows[a], rb = _ovRows[b];
        let c = _ovCollator.compare(_ovSortValue(ra, _ovSortCol), _ovSortValue(rb, _ovSortCol));
        if (c === 0 && _ovSortCol !== 'title') c = _ovCollator.compare(ra.title, rb.title);
        return c * _ovSortDir;
    });
}

/**
 * Anfangsbuchstabe für die A–Z-Leiste (Umlaute → Grundbuchstabe, Ziffern/Sonstiges → #)
 */
function _ovLetter(title) {
    const ch = (title || '').trim().charAt(0).toUpperCase()
        .replace('Ä', 'A').replace('Ö', 'O').replace('Ü', 'U');
    return /[A-Z]/.test(ch) ? ch : '#';
}

/**
 * Spaltenkopf geklickt: Sortierung setzen / umkehren
 */
function sortLinkOverview(col) {
    if (_ovSortCol === col) {
        _ovSortDir = -_ovSortDir;
    } else {
        _ovSortCol = col;
        _ovSortDir = 1;
    }
    _ovRender();
}

/**
 * Zwischen Listen- und Ähnlichkeits-Ansicht wechseln
 */
function toggleOverviewSimilarMode() {
    _ovMode = _ovMode === 'similar' ? 'list' : 'similar';
    _ovFocusRow = null;
    _ovRender();
}

/**
 * "Ähnlich zu …"-Filter aufheben
 */
function clearOverviewFocus() {
    _ovFocusRow = null;
    _ovRender();
}

// -----------------------------------------------------------------------
// RENDERING
// -----------------------------------------------------------------------

/**
 * URL kompakt darstellen (ohne Protokoll/www., gekürzt)
 */
function _ovShortUrl(url) {
    const s = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
    return s.length > 48 ? s.slice(0, 46) + '…' : s;
}

/**
 * Ähnlichkeits-Badge einer Zeile (nur Listenansicht)
 */
function _ovSimilarBadge(i) {
    const { idx } = _ovGetSimilarity();
    const u = idx.url[i].length, t = idx.title[i].length, d = idx.domain[i].length;
    if (!u && !t && !d) return '';

    const parts = [];
    if (u) parts.push(`${u}× fast gleiche Adresse`);
    if (t) parts.push(`${t}× ähnlicher Name`);
    if (d) parts.push(`${d}× gleiche Domain`);
    const strong = u || t;

    return `<button type="button" class="ov-sim-badge${strong ? ' strong' : ''}" data-ov-action="similar" data-row="${i}"
                title="${esc(parts.join(' · '))} – klicken zum Anzeigen">🧩</button>`;
}

/**
 * Eine Tabellenzeile
 */
function _ovRowHtml(i, showBadge) {
    const r = _ovRows[i];
    const safe = isSafeUrl(r.url);
    const hiddenTag = r.tabHidden ? ' <span class="ov-hidden-tag" title="Tab ist ausgeblendet">ausgeblendet</span>' : '';
    const pinTag = r.pinned ? ' <span class="ov-pin" title="Angepinnt">📌</span>' : '';

    return `
        <tr data-row="${i}"${_ovSelected.has(r.uid) ? ' class="ov-selected"' : ''}>
            <td class="ov-col-sel"><input type="checkbox" class="ov-sel" data-row="${i}"${_ovSelected.has(r.uid) ? ' checked' : ''} title="Auswählen (Shift = Bereich)"></td>
            <td class="ov-col-icon">${esc(r.icon)}</td>
            <td class="ov-col-title">
                <div class="ov-title-cell">
                    <span class="ov-title-text">${esc(r.title)}</span>${pinTag}
                    ${showBadge ? _ovSimilarBadge(i) : ''}
                </div>
            </td>
            <td class="ov-col-url">
                ${safe
                    ? `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" title="${esc(r.url)}">${esc(_ovShortUrl(r.url))}</a>`
                    : `<span class="ov-unsafe" title="${esc(r.url)}">${esc(_ovShortUrl(r.url))}</span>`}
            </td>
            <td class="ov-col-desc"><div class="ov-desc" title="${esc(r.description)}">${esc(r.description)}</div></td>
            <td class="ov-col-tab">${esc(r.tabIcon)} ${esc(r.tabLabel)}${hiddenTag}</td>
            <td class="ov-col-cat">${esc(r.categoryIcon)} ${esc(r.categoryTitle)}</td>
            <td class="ov-col-fav">
                <button type="button" class="ov-fav${r.favorite ? ' active' : ''}" data-ov-action="fav" data-row="${i}"
                        title="${r.favorite ? 'Favorit entfernen' : 'Als Favorit setzen'}">${r.favorite ? '⭐' : '☆'}</button>
            </td>
            <td class="ov-col-actions">
                <button type="button" class="ov-act" data-ov-action="open" data-row="${i}" title="Öffnen"${safe ? '' : ' disabled'}>🔗</button>
                <button type="button" class="ov-act" data-ov-action="jump" data-row="${i}" title="Im Tab anzeigen">📍</button>
                <button type="button" class="ov-act" data-ov-action="edit" data-row="${i}" title="Bearbeiten">✏️</button>
                <button type="button" class="ov-act danger" data-ov-action="delete" data-row="${i}" title="Löschen">🗑️</button>
            </td>
        </tr>`;
}

function _ovHeadHtml(sortable) {
    const th = (col, label, cls) => {
        if (!sortable || !col) return `<th class="${cls}">${label}</th>`;
        const arrow = _ovSortCol === col ? (_ovSortDir === 1 ? ' ▲' : ' ▼') : '';
        return `<th class="${cls} ov-sortable${_ovSortCol === col ? ' sorted' : ''}" onclick="sortLinkOverview('${col}')">${label}${arrow}</th>`;
    };
    const selAll = sortable
        ? `<input type="checkbox" class="ov-sel-all" title="Alle angezeigten auswählen"${_ovAllVisibleSelected() ? ' checked' : ''}>`
        : '';
    return `
        <thead><tr>
            <th class="ov-col-sel">${selAll}</th>
            ${th(null, '', 'ov-col-icon')}
            ${th('title', 'Name', 'ov-col-title')}
            ${th('url', 'URL', 'ov-col-url')}
            ${th(null, 'Beschreibung', 'ov-col-desc')}
            ${th('tab', 'Tab', 'ov-col-tab')}
            ${th('category', 'Kategorie', 'ov-col-cat')}
            ${th(null, '★', 'ov-col-fav')}
            ${th(null, 'Aktionen', 'ov-col-actions')}
        </tr></thead>`;
}

const _OV_COLS = 9;

/**
 * Tabelle, Statistik und A–Z-Leiste zeichnen
 */
function _ovRender() {
    const wrap = document.getElementById('ovTableWrap');
    if (!wrap) return;

    const filtered = _ovFilteredIndices();
    const az = document.getElementById('ovAz');
    const btn = document.getElementById('ovSimilarBtn');
    btn.classList.toggle('active', _ovMode === 'similar');
    btn.textContent = _ovMode === 'similar' ? '📋 Alphabetische Liste' : '🧩 Ähnliche anzeigen';

    // Statistik
    const tabCount = new Set(_ovRows.map(r => r.tabId)).size;
    const catCount = new Set(_ovRows.map(r => r.tabId + '\u0000' + r.categoryKey)).size;
    const total = _ovRows.length;
    document.getElementById('ovStats').textContent =
        (filtered.length !== total ? `${filtered.length} von ` : '') +
        `${total} Link${total !== 1 ? 's' : ''} · ${tabCount} Tab${tabCount !== 1 ? 's' : ''} · ${catCount} Kategorie${catCount !== 1 ? 'n' : ''}`;

    // "Ähnlich zu …"-Chip
    const focus = document.getElementById('ovFocus');
    focus.innerHTML = _ovFocusRow !== null
        ? `<span class="ov-focus-chip">🧩 Ähnlich zu „${esc(_ovRows[_ovFocusRow].title)}“
               <button type="button" onclick="clearOverviewFocus()" title="Filter aufheben">✕</button></span>`
        : '';

    if (total === 0) {
        wrap.innerHTML = '<div class="ov-empty">Noch keine Links vorhanden.</div>';
        az.innerHTML = '';
        _ovRenderBulk();
        return;
    }

    if (_ovMode === 'similar') {
        _ovVisible = [];
        wrap.innerHTML = _ovSimilarHtml(new Set(filtered));
        _ovRenderBulk();
        az.innerHTML = '';
        az.style.display = 'none';
        return;
    }

    const sorted = _ovSort(filtered);
    _ovVisible = sorted;
    const byLetter = _ovSortCol === 'title';
    const letters = new Set();
    let body = '';
    let lastLetter = null;

    sorted.forEach(i => {
        if (byLetter) {
            const l = _ovLetter(_ovRows[i].title);
            if (l !== lastLetter) {
                letters.add(l);
                body += `<tr class="ov-letter-row" id="ovLetter_${l === '#' ? 'num' : l}"><td colspan="${_OV_COLS}">${l}</td></tr>`;
                lastLetter = l;
            }
        }
        body += _ovRowHtml(i, true);
    });

    wrap.innerHTML = sorted.length
        ? `<table class="ov-table">${_ovHeadHtml(true)}<tbody>${body}</tbody></table>`
        : '<div class="ov-empty">Keine Links passen zum Filter.</div>';

    _ovRenderBulk();

    // A–Z-Leiste (nur bei Sortierung nach Name)
    if (byLetter && sorted.length) {
        az.style.display = '';
        az.innerHTML = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(l =>
            `<button type="button" data-letter="${l}" ${letters.has(l) ? '' : 'disabled'}>${l}</button>`
        ).join('');
    } else {
        az.style.display = 'none';
        az.innerHTML = '';
    }
}

/**
 * Ähnlichkeits-Ansicht: Gruppen je Stufe
 */
function _ovSimilarHtml(allowed) {
    const { groups, domain } = _ovGetSimilarity();

    const sections = [
        { key: 'url',    title: '🔗 Fast gleiche Adresse', hint: 'Gleich bis auf http/https, www., Parameter oder abschließenden Schrägstrich.' },
        { key: 'title',  title: '🔤 Ähnlicher Name',       hint: 'Gemeinsame Wörter oder nur wenige abweichende Zeichen.' },
        { key: 'domain', title: '🌐 Gleiche Domain',       hint: 'Verschiedene Seiten derselben Website – oft gewollt, nur als Hinweis.' }
    ];

    let html = '';
    let any = false;

    sections.forEach(sec => {
        const list = groups[sec.key]
            .map(g => g.filter(i => allowed.has(i)))
            .filter(g => g.length > 1)
            .map(g => g.sort((a, b) => _ovCollator.compare(_ovRows[a].title, _ovRows[b].title)))
            .sort((a, b) => _ovCollator.compare(_ovRows[a[0]].title, _ovRows[b[0]].title));

        if (!list.length) return;
        any = true;

        let body = '';
        list.forEach(g => {
            const label = sec.key === 'domain'
                ? domain[g[0]]
                : sec.key === 'url' ? _ovShortUrl(_ovRows[g[0]].url) : _ovRows[g[0]].title;
            body += `<tr class="ov-group-row"><td colspan="${_OV_COLS}">${esc(label)} <span class="ov-group-count">${g.length} Links</span></td></tr>`;
            g.forEach(i => { body += _ovRowHtml(i, false); _ovVisible.push(i); });
        });

        html += `
            <div class="ov-sim-section">
                <div class="ov-sim-title">${sec.title} <span class="ov-group-count">${list.length} Gruppe${list.length !== 1 ? 'n' : ''}</span></div>
                <div class="ov-sim-hint">${sec.hint}</div>
                <table class="ov-table">${_ovHeadHtml(false)}<tbody>${body}</tbody></table>
            </div>`;
    });

    return any ? html : '<div class="ov-empty">✅ Keine ähnlichen Links gefunden.</div>';
}

// -----------------------------------------------------------------------
// AKTIONEN
// -----------------------------------------------------------------------

function _ovHandleAzClick(e) {
    const b = e.target.closest('button[data-letter]');
    if (!b || b.disabled) return;
    const l = b.dataset.letter;
    const target = document.getElementById('ovLetter_' + (l === '#' ? 'num' : l));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function _ovHandleTableClick(e) {
    if (e.target.classList.contains('ov-sel-all')) {
        _ovToggleAllVisible(e.target.checked);
        return;
    }
    if (e.target.classList.contains('ov-sel')) {
        _ovToggleSelect(parseInt(e.target.dataset.row, 10), e.target.checked, e.shiftKey);
        return;
    }

    const btn = e.target.closest('[data-ov-action]');
    if (!btn || btn.disabled) return;
    const i = parseInt(btn.dataset.row, 10);
    const row = _ovRows[i];
    if (!row) return;

    switch (btn.dataset.ovAction) {
        case 'open':
            if (isSafeUrl(row.url)) window.open(row.url, '_blank', 'noopener,noreferrer');
            break;
        case 'jump':    _ovJumpTo(row); break;
        case 'edit':    _ovEdit(row); break;
        case 'delete':  _ovDelete(row); break;
        case 'fav':     _ovToggleFavorite(row); break;
        case 'similar':
            _ovFocusRow = i;
            _ovRender();
            document.getElementById('ovTableWrap').scrollTop = 0;
            break;
    }
}

/**
 * Favorit umschalten
 */
function _ovToggleFavorite(row) {
    let found = false;
    const saved = _ovMutateTab(row.tabId, cfg => {
        const link = _ovResolveLink(cfg, row);
        if (!link) return false;
        link.favorite = !link.favorite;
        found = true;
    });
    if (!found) return _ovStale();
    if (saved) _ovAfterChange();
}

/**
 * Link löschen (leere Kategorie optional mitlöschen)
 */
function _ovDelete(row) {
    if (!confirm(`Möchten Sie den Link "${row.title}" wirklich löschen?\n\nTab: ${row.tabLabel} · Kategorie: ${row.categoryTitle}`)) return;

    let found = false;
    const saved = _ovMutateTab(row.tabId, cfg => {
        const link = _ovResolveLink(cfg, row);
        if (!link) return false;
        const cat = cfg.categories[row.categoryKey];
        cat.links.splice(row.linkIndex, 1);
        found = true;

        if (cat.links.length === 0 &&
            confirm(`Die Kategorie "${cat.title}" ist jetzt leer.\n\nSoll die leere Kategorie ebenfalls gelöscht werden?`)) {
            delete cfg.categories[row.categoryKey];
        }
    });

    if (!found) return _ovStale();
    if (!saved) return;
    showMessage(`Link "${row.title}" gelöscht`, 'success');
    _ovAfterChange();
}

/**
 * Link bearbeiten – nutzt das vorhandene Link-Modal
 */
function _ovEdit(row) {
    const cfg = _ovGetTabData(row.tabId);
    const link = cfg && _ovResolveLink(cfg, row);
    if (!link) return _ovStale();

    isEditMode         = true;
    currentEditingLink = null;
    overviewEditTarget = { tabId: row.tabId, categoryKey: row.categoryKey, linkIndex: row.linkIndex, url: row.url };

    document.getElementById('linkTitle').value       = link.title || '';
    document.getElementById('linkUrl').value         = link.url || '';
    document.getElementById('linkDescription').value = link.description || '';
    document.getElementById('linkIcon').value        = link.icon || '';
    document.getElementById('linkFavorite').checked  = !!link.favorite;

    document.querySelector('#linkModal h2').textContent          = 'Link bearbeiten';
    document.querySelector('#linkModal .btn-primary').textContent = 'Speichern';
    document.getElementById('linkCategoryGroup').style.display = 'none';
    document.getElementById('linkCategory').removeAttribute('required');

    document.getElementById('linkModal').style.display = 'block';
    setTimeout(() => updateFavoritesCheckboxUI(), 50);
}

/**
 * Wird vom Link-Formular aufgerufen, wenn aus der Übersicht bearbeitet wird.
 */
function saveOverviewLinkEdit(values) {
    const target = overviewEditTarget;
    if (!target) return;

    let found = false;
    const saved = _ovMutateTab(target.tabId, cfg => {
        const link = _ovResolveLink(cfg, target);
        if (!link) return false;
        Object.assign(link, values);   // pinned und sonstige Felder bleiben erhalten
        found = true;
    });

    if (!found) { closeModal(); return _ovStale(); }
    if (!saved) return;   // Dialog bleibt offen, Eingaben gehen nicht verloren
    closeModal();
    showMessage('Link erfolgreich bearbeitet', 'success');
    _ovAfterChange();
}

/**
 * Zum Link springen: Tab wechseln, Kategorie aufklappen, Link hervorheben
 */
function _ovJumpTo(row) {
    closeLinkOverview();
    switchTab(row.tabId);

    const cat = Object.hasOwn(linkCategories, row.categoryKey) ? linkCategories[row.categoryKey] : null;
    if (cat && cat.collapsed) {
        cat.collapsed = false;
        if (saveConfig(true)) renderCategories();
    }

    requestAnimationFrame(() => {
        const el = document.querySelector(
            `.link-item[data-cat-key="${CSS.escape(row.categoryKey)}"][data-link-index="${row.linkIndex}"]`
        );
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ov-jump-highlight');
        setTimeout(() => el.classList.remove('ov-jump-highlight'), 2500);
    });
}

/**
 * Daten haben sich zwischenzeitlich geändert → neu laden
 */
function _ovStale() {
    showMessage('Der Link wurde zwischenzeitlich geändert – Übersicht wurde neu geladen.', 'warning');
    _ovReload();
}

// -----------------------------------------------------------------------
// MEHRFACHAUSWAHL
// -----------------------------------------------------------------------

function _ovAllVisibleSelected() {
    const vis = _ovFilteredIndices();
    return vis.length > 0 && vis.every(i => _ovSelected.has(_ovRows[i].uid));
}

/**
 * Einzelne Zeile (de)selektieren; mit Shift den Bereich seit dem letzten Klick
 */
function _ovToggleSelect(i, checked, shift) {
    let range = [i];
    if (shift && _ovLastClick !== null) {
        const a = _ovVisible.indexOf(_ovLastClick);
        const b = _ovVisible.indexOf(i);
        if (a !== -1 && b !== -1) range = _ovVisible.slice(Math.min(a, b), Math.max(a, b) + 1);
    }
    range.forEach(k => {
        if (checked) _ovSelected.add(_ovRows[k].uid);
        else         _ovSelected.delete(_ovRows[k].uid);
    });
    _ovLastClick = i;
    _ovSyncSelectionUi();
}

/**
 * Alle aktuell angezeigten (gefilterten) Zeilen (de)selektieren
 */
function _ovToggleAllVisible(checked) {
    _ovFilteredIndices().forEach(i => {
        if (checked) _ovSelected.add(_ovRows[i].uid);
        else         _ovSelected.delete(_ovRows[i].uid);
    });
    _ovSyncSelectionUi();
}

/**
 * Checkboxen/Zeilen-Markierung aktualisieren ohne komplettes Neuzeichnen (Scroll-Position bleibt)
 */
function _ovSyncSelectionUi() {
    document.querySelectorAll('#ovTableWrap tr[data-row]').forEach(tr => {
        const sel = _ovSelected.has(_ovRows[+tr.dataset.row].uid);
        tr.classList.toggle('ov-selected', sel);
        const cb = tr.querySelector('.ov-sel');
        if (cb) cb.checked = sel;
    });
    const all = document.querySelector('#ovTableWrap .ov-sel-all');
    if (all) all.checked = _ovAllVisibleSelected();
    _ovRenderBulk();
}

function _ovSelectedRows() {
    return _ovRows.filter(r => _ovSelected.has(r.uid));
}

/**
 * Aktionsleiste für die Auswahl
 */
function _ovRenderBulk() {
    const bar = document.getElementById('ovBulk');
    if (!bar) return;
    const n = _ovSelected.size;
    if (n === 0) {
        bar.innerHTML = '';
        bar.classList.remove('active');
        return;
    }
    bar.classList.add('active');
    bar.innerHTML = `
        <span class="ov-bulk-count">${n} ausgewählt</span>
        <button type="button" data-bulk="fav-on">⭐ Favorit setzen</button>
        <button type="button" data-bulk="fav-off">☆ Favorit entfernen</button>
        <button type="button" data-bulk="move">🔀 Verschieben</button>
        <button type="button" data-bulk="delete" class="danger">🗑️ Löschen</button>
        <button type="button" data-bulk="clear" class="ov-bulk-clear">Auswahl aufheben</button>`;
}

function _ovHandleBulkClick(e) {
    const b = e.target.closest('button[data-bulk]');
    if (!b) return;
    switch (b.dataset.bulk) {
        case 'fav-on':  _ovBulkFavorite(true); break;
        case 'fav-off': _ovBulkFavorite(false); break;
        case 'move':    _ovOpenMovePanel(); break;
        case 'delete':  _ovBulkDelete(); break;
        case 'clear':
            _ovSelected.clear();
            _ovSyncSelectionUi();
            break;
    }
}

/**
 * Ausgewählte Zeilen nach Tab → Kategorie gruppieren
 */
function _ovGroupByTab(rows) {
    const byTab = new Map();
    rows.forEach(r => {
        if (!byTab.has(r.tabId)) byTab.set(r.tabId, new Map());
        const cats = byTab.get(r.tabId);
        if (!cats.has(r.categoryKey)) cats.set(r.categoryKey, []);
        cats.get(r.categoryKey).push(r);
    });
    return byTab;
}

/**
 * Welche Kategorien würden durch Entfernen der Auswahl leer?
 * @returns {Array<{tabId, tabLabel, categoryKey, categoryTitle}>}
 */
function _ovCategoriesEmptiedBy(rows, exclude) {
    const result = [];
    _ovGroupByTab(rows).forEach((cats, tabId) => {
        cats.forEach((list, catKey) => {
            if (exclude && exclude.tabId === tabId && exclude.categoryKey === catKey) return;
            const total = _ovRows.filter(r => r.tabId === tabId && r.categoryKey === catKey).length;
            if (list.length === total) {
                result.push({ tabId, tabLabel: list[0].tabLabel, categoryKey: catKey, categoryTitle: list[0].categoryTitle });
            }
        });
    });
    return result;
}

/**
 * Einmalig nachfragen, ob leer werdende Kategorien gelöscht werden sollen
 * @returns {Set<string>} "tabId\0categoryKey" der zu löschenden Kategorien
 */
function _ovAskDeleteEmptied(emptied) {
    if (!emptied.length) return new Set();
    const list = emptied.map(c => `• ${c.categoryTitle} (${c.tabLabel})`).join('\n');
    const ok = confirm(`Folgende Kategorie${emptied.length !== 1 ? 'n werden' : ' wird'} dadurch leer:\n\n${list}\n\nLeere Kategorien ebenfalls löschen?`);
    return ok ? new Set(emptied.map(c => c.tabId + '\u0000' + c.categoryKey)) : new Set();
}

/**
 * Ausgewählte Links aus den übergebenen Tab-Kopien entfernen (speichert nicht)
 * @param {Map<string, object>} cfgs – tabId → Kopie (aus _ovMutateTabs)
 * @returns {Array<object>} die entfernten Link-Objekte (in ursprünglicher Reihenfolge)
 */
function _ovRemoveRows(rows, deleteCats, cfgs) {
    const removed = [];
    _ovGroupByTab(rows).forEach((cats, tabId) => {
        const cfg = cfgs.get(tabId);
        if (!cfg) return;
        cats.forEach((list, catKey) => {
            const cat = Object.hasOwn(cfg.categories, catKey) ? cfg.categories[catKey] : null;
            if (!cat) return;
            const valid = list.filter(r => _ovResolveLink(cfg, r)).sort((a, b) => a.linkIndex - b.linkIndex);
            valid.forEach(r => removed.push(cat.links[r.linkIndex]));
            // absteigend splicen, damit Indizes stabil bleiben
            [...valid].reverse().forEach(r => cat.links.splice(r.linkIndex, 1));
            if (cat.links.length === 0 && deleteCats.has(tabId + '\u0000' + catKey)) {
                delete cfg.categories[catKey];
            }
        });
    });
    return removed;
}

function _ovBulkFavorite(value) {
    const rows = _ovSelectedRows();
    const byTab = _ovGroupByTab(rows);
    let count = 0;
    const saved = _ovMutateTabs([...byTab.keys()], cfgs => {
        byTab.forEach((cats, tabId) => {
            const cfg = cfgs.get(tabId);
            cats.forEach(list => list.forEach(r => {
                const link = _ovResolveLink(cfg, r);
                if (link && !!link.favorite !== value) { link.favorite = value; count++; }
            }));
        });
    });
    if (!saved) return;
    showMessage(`${count} Link${count !== 1 ? 's' : ''} ${value ? 'als Favorit gesetzt' : 'aus Favoriten entfernt'}`, 'success');
    _ovAfterChange();
}

function _ovBulkDelete() {
    const rows = _ovSelectedRows();
    if (!rows.length) return;

    const preview = rows.slice(0, 10).map(r => `• ${r.title} (${r.tabLabel} › ${r.categoryTitle})`).join('\n')
        + (rows.length > 10 ? `\n… und ${rows.length - 10} weitere` : '');
    if (!confirm(`${rows.length} Link${rows.length !== 1 ? 's' : ''} wirklich löschen?\n\n${preview}`)) return;

    const deleteCats = _ovAskDeleteEmptied(_ovCategoriesEmptiedBy(rows));
    let removed = [];
    const saved = _ovMutateTabs([..._ovGroupByTab(rows).keys()], cfgs => {
        removed = _ovRemoveRows(rows, deleteCats, cfgs);
    });
    if (!saved) return;

    _ovSelected.clear();
    showMessage(`${removed.length} Link${removed.length !== 1 ? 's' : ''} gelöscht`, 'success');
    _ovAfterChange();
}

// -----------------------------------------------------------------------
// MEHRFACHAUSWAHL: VERSCHIEBEN
// -----------------------------------------------------------------------

function _ovOpenMovePanel() {
    const existing = document.getElementById('ovMovePanel');
    if (existing) existing.remove();

    const n = _ovSelected.size;
    const tabOptions = tabsList
        .filter(t => t.id !== 'favorites')
        .map(t => `<option value="${esc(t.id)}"${t.id === activeTabId ? ' selected' : ''}>${esc(t.icon || '📋')} ${esc(t.label)}${t.hidden ? ' (ausgeblendet)' : ''}</option>`)
        .join('');

    const html = `
        <div class="ov-move-panel" id="ovMovePanel">
            <div class="ov-move-box">
                <div class="ov-move-title">🔀 ${n} Link${n !== 1 ? 's' : ''} verschieben</div>
                <label>Ziel-Tab</label>
                <select id="ovMoveTab" class="ov-select">${tabOptions}</select>
                <label>Ziel-Kategorie</label>
                <select id="ovMoveCat" class="ov-select"></select>
                <input type="text" id="ovMoveNewCat" class="ov-filter" placeholder="Name der neuen Kategorie" style="display:none;">
                <div class="ov-move-buttons">
                    <button type="button" class="btn btn-secondary" id="ovMoveCancel">Abbrechen</button>
                    <button type="button" class="btn btn-primary" id="ovMoveConfirm">Verschieben</button>
                </div>
            </div>
        </div>`;

    document.querySelector('#linkOverviewModal .ov-content').insertAdjacentHTML('beforeend', html);

    const panel = document.getElementById('ovMovePanel');
    panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
    document.getElementById('ovMoveTab').addEventListener('change', _ovFillMoveCategories);
    document.getElementById('ovMoveCat').addEventListener('change', () => {
        const isNew = document.getElementById('ovMoveCat').value === '__new__';
        const input = document.getElementById('ovMoveNewCat');
        input.style.display = isNew ? '' : 'none';
        if (isNew) input.focus();
    });
    document.getElementById('ovMoveCancel').addEventListener('click', () => panel.remove());
    document.getElementById('ovMoveConfirm').addEventListener('click', _ovConfirmMove);
    document.getElementById('ovMoveNewCat').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); _ovConfirmMove(); }
    });

    _ovFillMoveCategories();
}

function _ovFillMoveCategories() {
    const tabId = document.getElementById('ovMoveTab').value;
    const cfg = _ovGetTabData(tabId);
    const select = document.getElementById('ovMoveCat');
    const keys = cfg ? cfg.categoryOrder.filter(k => cfg.categories[k]) : [];

    select.innerHTML = keys.map(k => {
        const c = cfg.categories[k];
        return `<option value="${esc(k)}">${esc(c.icon || '📁')} ${esc(c.title || k)}</option>`;
    }).join('') + '<option value="__new__">➕ Neue Kategorie…</option>';

    const isNew = keys.length === 0;
    if (isNew) select.value = '__new__';
    document.getElementById('ovMoveNewCat').style.display = isNew ? '' : 'none';
}

function _ovConfirmMove() {
    const tabId = document.getElementById('ovMoveTab').value;
    let catKey  = document.getElementById('ovMoveCat').value;
    const newTitle = document.getElementById('ovMoveNewCat').value.trim();

    if (catKey === '__new__' && !newTitle) {
        showMessage('Bitte einen Namen für die neue Kategorie eingeben', 'warning');
        document.getElementById('ovMoveNewCat').focus();
        return;
    }

    // Neue Kategorie mit vorhandenem Namen → vorhandene nehmen
    if (catKey === '__new__') {
        const cfg = _ovGetTabData(tabId);
        const needle = newTitle.toLowerCase();
        const match = cfg && Object.keys(cfg.categories).find(k => (cfg.categories[k].title || '').trim().toLowerCase() === needle);
        if (match) catKey = match;
    }

    // Links, die schon in der Ziel-Kategorie liegen, bleiben unberührt
    const rows = _ovSelectedRows().filter(r => !(r.tabId === tabId && r.categoryKey === catKey));
    if (!rows.length) {
        showMessage('Die ausgewählten Links liegen bereits in dieser Kategorie', 'warning');
        return;
    }

    const target = { tabId, categoryKey: catKey };
    const deleteCats = _ovAskDeleteEmptied(_ovCategoriesEmptiedBy(rows, target));

    // Quelle(n) und Ziel werden auf Kopien geändert und in EINEM Schritt gespeichert:
    // Schlägt das Speichern fehl, bleibt jeder Link an seinem alten Platz.
    let targetTitle = newTitle;
    let moved = [];
    const sourceTabIds = [..._ovGroupByTab(rows).keys()];
    const saved = _ovMutateTabs([...sourceTabIds, tabId], cfgs => {
        moved = _ovRemoveRows(rows, deleteCats, cfgs);
        if (!moved.length) return false;

        const cfg = cfgs.get(tabId);
        if (catKey === '__new__') {
            catKey = uniqueKey(newTitle, k => Object.hasOwn(cfg.categories, k));
            cfg.categories[catKey] = { title: newTitle, icon: '📁', collapsed: false, links: [] };
            cfg.categoryOrder.push(catKey);
        }
        const cat = Object.hasOwn(cfg.categories, catKey) ? cfg.categories[catKey] : null;
        if (!cat) return false;
        targetTitle = cat.title;
        cat.links.push(...moved);
    });

    if (!saved) {
        if (!moved.length) _ovStale();
        return;
    }

    const tab = tabsList.find(t => t.id === tabId);
    _ovSelected.clear();
    document.getElementById('ovMovePanel').remove();
    showMessage(`${moved.length} Link${moved.length !== 1 ? 's' : ''} nach „${tab ? tab.label : tabId} › ${targetTitle}“ verschoben`, 'success');
    _ovAfterChange();
}
