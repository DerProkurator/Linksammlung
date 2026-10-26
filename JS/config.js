// ========================================================================
// LINKSAMMLUNG - CONFIG.JS v3.7
// ========================================================================
// Globale Variablen, Tab-aware Konfiguration laden/speichern, Migration
// ========================================================================

// -----------------------------------------------------------------------
// GLOBALE VARIABLEN
// -----------------------------------------------------------------------

// Fallback wenn default-config.js nicht geladen
const fallbackDefaultConfig = {
    categories: {
        'Websites': {
            title: 'Websites',
            icon: '🌐',
            collapsed: false,
            links: [
                { title: "Google", url: "https://www.google.com", description: "Die weltweit führende Suchmaschine", icon: "🔍", favorite: false },
                { title: "YouTube", url: "https://www.youtube.com", description: "Videos und Tutorials", icon: "📺", favorite: false }
            ]
        },
        'Entwicklung': {
            title: 'Entwicklung',
            icon: '💻',
            collapsed: false,
            links: [
                { title: "GitHub", url: "https://www.github.com", description: "Code-Repositories und Versionskontrolle", icon: "💻", favorite: false },
                { title: "Stack Overflow", url: "https://stackoverflow.com", description: "Entwickler-Community", icon: "❓", favorite: false }
            ]
        }
    },
    categoryOrder: ['Websites', 'Entwicklung']
};

// Aktuelle Konfiguration (immer des aktiven Tabs)
let config = {};
let linkCategories = {};
let categoryOrder = [];

// Variablen für Kontextmenü und Link-Bearbeitung
let currentContextLink = null;
let currentEditingLink = null;
let isEditMode = false;

// Variablen für Kategorie-Verwaltung
let currentContextCategory = null;
let currentEditingCategory = null;
let isCategoryEditMode = false;

// Such-Variablen
let currentSearchQuery = '';
let searchResults = [];
let selectedSearchIndex = -1;
let isSearchOpen = false;

// Drag and Drop Variablen
let draggedElement = null;
let draggedCategoryKey = null;
let draggedLinkData = null;
let draggedLinkElement = null;
let dragOverElement = null;
let dropPosition = null;
let currentDropIndicator = null;
let dragStabilityTimeout = null;

// Auto-Scroll während Drag-and-Drop
let autoScrollInterval = null;
let isDragging = false;
let currentMouseY = 0;

// Touch-Events für mobile Geräte
let touchStartY = 0;
let touchStartX = 0;
let isTouching = false;

// Variablen für Link-Import
let pendingLinkImport = null;
let pendingOriginalCategoryTitle = null;

// Variablen für Kategorie-Import
let pendingCategoryImport = null;

// Variablen für leere Kategorie-Behandlung
let pendingEmptyCategoryData = null;

// Favoriten-Variablen
let favoritesOpen = false;

// Emoji-Picker Variablen
let currentPickerTarget = null;
let currentPickerElement = null;

// -----------------------------------------------------------------------
// TAB-SYSTEM - GLOBALE VARIABLEN
// -----------------------------------------------------------------------

/**
 * Standard-Tabs dynamisch aus window.DYNAMIC_CONFIGS aufbauen.
 * Reihenfolge entspricht der Lade-Reihenfolge der Config-Dateien im HTML.
 * Fallback: ein einzelner Homelab-Tab falls keine Configs registriert sind.
 */
function buildDefaultTabsFromConfigs() {
    const configs = window.DYNAMIC_CONFIGS || {};
    const tabs = getDynamicConfigTabIds().map(({ id, label, key }) => ({
        id:     id,
        label:  label,
        icon:   configs[key].icon || '📋',
        hidden: configs[key].hidden || false
    }));
    if (tabs.length > 0) return tabs;
    const fallbackTab = window.DEFAULT_TAB || { id: 'allgemein', label: 'Allgemein', icon: '🌐' };
    return [fallbackTab];
}

// Aktiver Tab (wird in loadTabsList() gesetzt)
let activeTabId = null;

// Tab-Liste (wird in loadTabsList() gesetzt)
let tabsList = [];

// -----------------------------------------------------------------------
// SICHERHEITS-HILFSFUNKTIONEN
// -----------------------------------------------------------------------

/**
 * HTML-Sonderzeichen escapen (verhindert XSS in innerHTML-Templates)
 */
function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * URL-Schema prüfen — nur http: und https: erlaubt
 * Blockiert javascript:, data:, vbscript: etc.
 */
function isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Darf dieser String als Tab-ID / Kategorie-Key (= Objekt-Schlüssel) verwendet werden?
 * Geerbte Object-Eigenschaften (__proto__, constructor, toString, …) sind verboten:
 * obj[key] = … würde sonst den Prototyp verändern bzw. obj[key] liefert geerbte Werte.
 */
function isSafeKey(key) {
    return typeof key === 'string' && key !== '' && key !== 'prototype' && !(key in Object.prototype);
}

function isPlainObject(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

// Grenzen für Importe (Schutz vor versehentlich riesigen oder manipulierten Dateien)
const DATA_LIMITS = {
    fileBytes:   10 * 1024 * 1024,
    categories:  2000,
    linksTotal:  50000,
    title:       500,
    url:         8192,
    description: 5000,
    icon:        64
};

// -----------------------------------------------------------------------
// DATEN PRÜFEN UND NORMALISIEREN
// -----------------------------------------------------------------------
// Alle Eingänge (JSON-Importe, gespeicherter Stand, Default-Configs) laufen
// hierüber. Die Funktionen verändern ihre Eingabe nicht, sondern bauen ein
// neues, geprüftes Objekt auf.
//   mode 'strict' – Importe: jeder Fehler lehnt die ganze Datei ab
//   mode 'repair' – gespeicherter Stand: Typen werden angeglichen,
//                   unbrauchbare Einträge verworfen und in `dropped` gezählt

function _shortText(text) {
    const s = String(text);
    return s.length > 40 ? s.slice(0, 40) + '…' : s;
}

/**
 * Einen Link prüfen
 * @returns {{link: object}|{error: string}}
 */
function normalizeLink(raw, mode = 'strict') {
    const repair = mode === 'repair';
    if (!isPlainObject(raw)) return { error: 'Link ist kein Objekt' };

    let title = raw.title;
    if (repair && typeof title === 'number') title = String(title);
    if (typeof title !== 'string' || !title.trim()) return { error: 'Link ohne Titel (Text erwartet)' };
    title = title.trim();

    const url = typeof raw.url === 'string' ? raw.url.trim() : '';
    if (!isSafeUrl(url)) return { error: `„${_shortText(title)}“: URL fehlt oder ist kein http(s)-Link` };

    const texts = {};
    for (const field of ['description', 'icon']) {
        const value = raw[field];
        if (value === undefined || value === null) { texts[field] = ''; continue; }
        if (typeof value !== 'string') {
            if (!repair) return { error: `„${_shortText(title)}“: Feld „${field}“ muss Text sein` };
            texts[field] = '';
            continue;
        }
        texts[field] = value;
    }

    const flags = {};
    for (const field of ['favorite', 'pinned', 'priority']) {
        const value = raw[field];
        if (value !== undefined && typeof value !== 'boolean' && !repair) {
            return { error: `„${_shortText(title)}“: Feld „${field}“ muss true/false sein` };
        }
        flags[field] = value === true;
    }

    if (!repair) {
        if (title.length > DATA_LIMITS.title)                    return { error: `„${_shortText(title)}“: Titel zu lang` };
        if (url.length > DATA_LIMITS.url)                        return { error: `„${_shortText(title)}“: URL zu lang` };
        if (texts.description.length > DATA_LIMITS.description) return { error: `„${_shortText(title)}“: Beschreibung zu lang` };
        if (texts.icon.length > DATA_LIMITS.icon)               return { error: `„${_shortText(title)}“: Icon zu lang` };
    }

    return {
        link: {
            title,
            url,
            description: texts.description,
            icon:        texts.icon.trim() || '🔗',
            // Altformat: "priority" wurde zu "favorite"
            favorite:    raw.favorite === undefined ? flags.priority : flags.favorite,
            pinned:      flags.pinned
        }
    };
}

/**
 * Eine Kategorie prüfen
 * @returns {{category: object, dropped: number}|{error: string}}
 */
function normalizeCategory(raw, key, mode = 'strict') {
    const repair = mode === 'repair';
    if (!isPlainObject(raw)) return { error: 'Kategorie ist kein Objekt' };

    let title = raw.title;
    if (repair && (typeof title !== 'string' || !title.trim())) title = typeof title === 'number' ? String(title) : key;
    if (typeof title !== 'string' || !title.trim()) return { error: 'Kategorie ohne Titel (Text erwartet)' };
    title = title.trim();
    if (!repair && title.length > DATA_LIMITS.title) return { error: `Kategorie „${_shortText(title)}“: Titel zu lang` };

    let icon = raw.icon;
    if (icon !== undefined && icon !== null && typeof icon !== 'string') {
        if (!repair) return { error: `Kategorie „${_shortText(title)}“: Icon muss Text sein` };
        icon = '';
    }
    if (!repair && icon && icon.length > DATA_LIMITS.icon) return { error: `Kategorie „${_shortText(title)}“: Icon zu lang` };

    if (raw.collapsed !== undefined && typeof raw.collapsed !== 'boolean' && !repair) {
        return { error: `Kategorie „${_shortText(title)}“: „collapsed“ muss true/false sein` };
    }

    let rawLinks = raw.links;
    if (!Array.isArray(rawLinks)) {
        if (!repair) return { error: `Kategorie „${_shortText(title)}“: „links“ muss eine Liste sein` };
        rawLinks = [];
    }

    const links = [];
    let dropped = 0;
    for (const rawLink of rawLinks) {
        const res = normalizeLink(rawLink, mode);
        if (res.error) {
            if (!repair) return { error: `Kategorie „${_shortText(title)}“: ${res.error}` };
            dropped++;
            continue;
        }
        links.push(res.link);
    }

    return {
        category: { title, icon: (icon || '').trim() || '📁', collapsed: raw.collapsed === true, links },
        dropped
    };
}

/**
 * Vollständige Tab-Konfiguration prüfen.
 * Akzeptiert { categories, categoryOrder } und das Altformat (Kategorien direkt auf oberster Ebene).
 * Unsichere Kategorie-Keys (z.B. "__proto__") werden umbenannt, categoryOrder wird
 * bereinigt (unbekannte/doppelte Keys raus, fehlende Kategorien hinten angehängt).
 * @returns {{ok: true, config: {categories, categoryOrder}, dropped: number}|{ok: false, error: string}}
 */
function normalizeConfig(raw, options = {}) {
    const mode   = options.mode === 'repair' ? 'repair' : 'strict';
    const repair = mode === 'repair';
    const fail   = error => ({ ok: false, error });

    if (!isPlainObject(raw)) return fail('Keine Link-Konfiguration (Objekt erwartet)');

    const legacy  = raw.categories === undefined;
    const srcCats = legacy ? raw : raw.categories;
    if (!isPlainObject(srcCats)) return fail('„categories“ muss ein Objekt sein');

    let srcOrder = legacy ? [] : raw.categoryOrder;
    if (srcOrder === undefined) srcOrder = [];
    if (!Array.isArray(srcOrder)) {
        if (!repair) return fail('„categoryOrder“ muss eine Liste sein');
        srcOrder = [];
    }
    if (srcOrder.some(k => typeof k !== 'string')) {
        if (!repair) return fail('„categoryOrder“ darf nur Texte enthalten');
        srcOrder = srcOrder.filter(k => typeof k === 'string');
    }

    const srcKeys = Object.keys(srcCats);
    if (!repair && srcKeys.length > DATA_LIMITS.categories) return fail('Zu viele Kategorien');

    const categories = {};
    const keyMap     = new Map();   // Original-Key → verwendeter Key
    let dropped = 0, linkCount = 0;

    for (const key of srcKeys) {
        const res = normalizeCategory(srcCats[key], key, mode);
        if (res.error) {
            if (!repair) return fail(res.error);
            dropped++;
            continue;
        }
        const newKey = isSafeKey(key) ? key : uniqueKey(key, k => Object.hasOwn(categories, k) || Object.hasOwn(srcCats, k));
        categories[newKey] = res.category;
        keyMap.set(key, newKey);
        dropped   += res.dropped;
        linkCount += res.category.links.length;
    }
    if (!repair && linkCount > DATA_LIMITS.linksTotal) return fail('Zu viele Links');

    const order = [];
    srcOrder.forEach(k => {
        const mapped = keyMap.get(k);
        if (mapped !== undefined && !order.includes(mapped)) order.push(mapped);
    });
    Object.keys(categories).forEach(k => { if (!order.includes(k)) order.push(k); });

    return { ok: true, config: { categories, categoryOrder: order }, dropped };
}

// -----------------------------------------------------------------------
// HILFSFUNKTIONEN
// -----------------------------------------------------------------------

/**
 * Name → interner Schlüssel (Tab-ID / Kategorie-Key).
 * Format nicht ändern: bestehende Tab-IDs und localStorage-Keys basieren darauf.
 * Verschiedene Namen können denselben Schlüssel ergeben (z.B. "Büro"/"Bäro" → "b_ro"),
 * daher für neue Einträge immer uniqueKey() verwenden.
 */
function toKey(name, fallback = '') {
    return String(name).toLowerCase().replace(/[^a-z0-9]/g, '_') || fallback;
}

/**
 * Eindeutigen Schlüssel erzeugen: base, base_1, base_2, ...
 * @param {function} isTaken - (key) => true, wenn der Schlüssel schon vergeben ist
 */
function uniqueKey(name, isTaken, fallback = 'neu') {
    const base = toKey(name, fallback);
    let key = base, i = 1;
    while (!isSafeKey(key) || isTaken(key)) { key = base + '_' + i; i++; }
    return key;
}

/**
 * Tab-IDs der Config-Dateien (window.DYNAMIC_CONFIGS) in Lade-Reihenfolge.
 * Neuere Exporte enthalten eine feste Tab-ID (Feld "id") und den Anzeigenamen
 * (Feld "label"); ältere Dateien nur den Registry-Schlüssel = Anzeigename.
 * IDs werden eindeutig gemacht ("🎮"/"🎵" → "__"/"___1") — sonst teilen sich
 * zwei Tabs eine ID und zeigen denselben Inhalt.
 * @returns {Array<{id: string, label: string, key: string}>} key = Schlüssel in DYNAMIC_CONFIGS
 */
function getDynamicConfigTabIds() {
    const result  = [];
    const configs = window.DYNAMIC_CONFIGS || {};
    const isTaken = k => k === 'favorites' || result.some(t => t.id === k);
    Object.keys(configs).forEach(key => {
        const entry = configs[key] || {};
        const label = typeof entry.label === 'string' && entry.label.trim() ? entry.label : key;
        const id    = (typeof entry.id === 'string' && isSafeKey(entry.id) && !isTaken(entry.id))
            ? entry.id
            : uniqueKey(label, isTaken);
        result.push({ id, label, key });
    });
    return result;
}

/**
 * Schlüssel in window.DYNAMIC_CONFIGS zu einer Tab-ID finden
 */
function findDynamicConfigLabel(tabId) {
    const match = getDynamicConfigTabIds().find(t => t.id === tabId);
    return match ? match.key : undefined;
}

/**
 * Prüfen, ob eine Kategorie mit diesem Titel existiert (Groß-/Kleinschreibung egal)
 */
function categoryTitleExists(categories, title) {
    const needle = title.trim().toLowerCase();
    return Object.values(categories).some(cat => cat.title.trim().toLowerCase() === needle);
}

/**
 * Schlüssel für exakte URL-Vergleiche (Duplikate).
 * Nur fachlich sichere Normalisierung: Schema und Host werden vom URL-Parser
 * kleingeschrieben, Standard-Ports entfernt. Pfad, Query und Fragment bleiben
 * unverändert – /A?token=Ab und /a?token=ab sind verschiedene Ressourcen.
 */
function exactUrlKey(url) {
    const trimmed = String(url || '').trim();
    try {
        return new URL(trimmed).href;
    } catch {
        return trimmed;
    }
}

/**
 * Konfiguration streng prüfen (verändert cfg nicht).
 * Für den geprüften, normalisierten Stand normalizeConfig() verwenden.
 */
function validateConfig(cfg) {
    return normalizeConfig(cfg).ok;
}

/**
 * Leere Kategorien ans Ende sortieren
 */
function sortCategoriesEmptyLast() {
    const filled = [];
    const empty = [];

    categoryOrder.forEach(key => {
        const cat = linkCategories[key];
        if (cat && cat.links.length > 0) {
            filled.push(key);
        } else if (cat) {
            empty.push(key);
        }
    });

    const newOrder = [...filled, ...empty];

    if (JSON.stringify(categoryOrder) !== JSON.stringify(newOrder)) {
        categoryOrder = newOrder;
        return true;
    }
    return false;
}

/**
 * Gesamtanzahl der Links im aktiven Tab
 */
function getTotalLinksCount() {
    let count = 0;
    categoryOrder.forEach(key => {
        const cat = linkCategories[key];
        if (cat && cat.links) count += cat.links.length;
    });
    return count;
}

/**
 * Gesamtanzahl der Favoriten im aktiven Tab
 */
function getTotalFavoritesCount() {
    let count = 0;
    categoryOrder.forEach(key => {
        const cat = linkCategories[key];
        if (cat && cat.links) {
            cat.links.forEach(link => { if (link.favorite) count++; });
        }
    });
    return count;
}

// -----------------------------------------------------------------------
// TAB-KONFIGURATION: LESEN / SCHREIBEN
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// SPEICHER-API
// -----------------------------------------------------------------------
// Alle Schreibzugriffe auf localStorage laufen über storageTransaction():
// Jeder Aufruf gibt true/false zurück; schlägt ein Schritt fehl, werden alle
// bereits geschriebenen Schlüssel auf ihren alten Wert zurückgesetzt.

// JSON-Stand des aktiven Tabs, wie er beim Laden/Speichern im localStorage stand.
// Weicht der gespeicherte Stand davon ab, hat ein anderes Fenster geschrieben.
let _activeStoredRaw = null;

// Tabs mit beschädigtem Speicherstand, für die in dieser Sitzung schon gewarnt wurde
const _brokenTabsWarned = new Set();

/**
 * localStorage lesen, ohne bei gesperrtem Speicher (SecurityError) abzubrechen
 */
function storageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error('Lesen aus dem Browser-Speicher fehlgeschlagen:', key, e);
        return null;
    }
}

function _reportStorageError(e) {
    console.error('Speichern fehlgeschlagen:', e);
    const quota = e && (e.name === 'QuotaExceededError' || e.code === 22);
    showMessage({
        title:   '❌ Änderung nicht gespeichert',
        content: quota
            ? 'Der Browser-Speicher ist voll. Die Änderung wurde verworfen – bitte Konfiguration exportieren und aufräumen.'
            : 'Der Browser-Speicher ist nicht beschreibbar (z.B. blockiert oder privates Fenster). Die Änderung wurde verworfen.'
    }, 'error');
}

/**
 * Mehrere Schlüssel als Einheit schreiben.
 * @param {Array<{key: string, value: string|null}>} ops – value null = Schlüssel löschen
 * @returns {boolean} true wenn alle Schritte geschrieben wurden
 */
function storageTransaction(ops) {
    const previous = [];
    try {
        for (const op of ops) {
            previous.push({ key: op.key, value: localStorage.getItem(op.key), written: op.value });
            if (op.value === null) localStorage.removeItem(op.key);
            else                   localStorage.setItem(op.key, op.value);
        }
        return true;
    } catch (e) {
        // Rückgängig machen: zuerst Schlüssel, die dadurch kleiner werden (schafft Platz)
        previous
            .map(p => ({ ...p, delta: (p.value || '').length - (p.written || '').length }))
            .sort((a, b) => a.delta - b.delta)
            .forEach(p => {
                try {
                    if (p.value === null) localStorage.removeItem(p.key);
                    else                  localStorage.setItem(p.key, p.value);
                } catch (rollbackError) {
                    console.error('Zurücksetzen fehlgeschlagen:', p.key, rollbackError);
                }
            });
        _reportStorageError(e);
        return false;
    }
}

function storageSet(key, value) {
    return storageTransaction([{ key, value }]);
}

function _tabConfigJSON(cfg) {
    return JSON.stringify({ categories: cfg.categories, categoryOrder: cfg.categoryOrder });
}

/**
 * Tab-Configs (und optional die Tab-Liste) gemeinsam speichern.
 * Ist der aktive Tab betroffen, wird der Laufzeit-State danach aus dem Speicher neu geladen.
 * @param {Map<string, object>|Array<[string, object]>} entries – tabId → { categories, categoryOrder }
 * @param {object} [options]
 * @param {string[]} [options.remove] – Tab-IDs, deren Config gelöscht wird
 * @param {boolean}  [options.tabs]   – Tab-Liste (tabsList/activeTabId) mitspeichern
 * @returns {boolean}
 */
function writeTabConfigs(entries, options = {}) {
    const ops = [];
    for (const [tabId, cfg] of entries) {
        if (typeof tabId !== 'string' || !tabId || tabId === 'favorites') continue;
        ops.push({ key: 'linkConfig_' + tabId, value: _tabConfigJSON(cfg) });
    }
    (options.remove || []).forEach(tabId => ops.push({ key: 'linkConfig_' + tabId, value: null }));
    if (options.tabs) ops.push({ key: 'linkTabs', value: _tabsListJSON() });

    const touchesActive = !!activeTabId && activeTabId !== 'favorites' &&
        ops.some(op => op.key === 'linkConfig_' + activeTabId);
    if (touchesActive && _activeTabChangedElsewhere()) return false;

    if (!storageTransaction(ops)) return false;

    if (touchesActive) loadTabConfigById(activeTabId);
    return true;
}

/**
 * Hat ein anderes Fenster den aktiven Tab seit dem Laden geändert?
 * Dann nicht überschreiben, sondern neu laden und den Nutzer informieren.
 */
function _activeTabChangedElsewhere() {
    if (storageGet('linkConfig_' + activeTabId) === _activeStoredRaw) return false;
    reloadActiveTabFromStorage();
    showMessage({
        title:   '⚠️ Änderung nicht gespeichert',
        content: 'Dieser Tab wurde inzwischen in einem anderen Fenster geändert. Die Ansicht zeigt jetzt den aktuellen Stand – bitte die letzte Änderung wiederholen.'
    }, 'warning');
    return true;
}

function writeTabConfig(tabId, cfg) {
    return writeTabConfigs([[tabId, cfg]]);
}

/**
 * Beschädigten Speicherstand sichern, bevor er durch einen reparierten ersetzt werden kann
 */
function _backupBrokenTab(tabId, raw, reason) {
    const backupKey = 'linkConfigBackup_' + tabId;
    if (storageGet(backupKey) !== raw) {
        try { localStorage.setItem(backupKey, raw); } catch (e) { console.error('Sicherung fehlgeschlagen:', backupKey, e); }
    }
    if (_brokenTabsWarned.has(tabId)) return;
    _brokenTabsWarned.add(tabId);
    const tab = tabsList.find(t => t.id === tabId);
    setTimeout(() => showMessage({
        title:   `⚠️ Gespeicherte Daten im Tab „${tab ? tab.label : tabId}“ waren fehlerhaft`,
        content: `${reason} Der ursprüngliche Stand wurde unter „${backupKey}“ im Browser-Speicher gesichert.`
    }, 'warning'), 800);
}

/**
 * Gespeicherten Stand eines Tabs lesen und prüfen
 * @returns {{raw: string|null, config: object|null}} config null = nichts (brauchbares) gespeichert
 */
function readStoredTabConfig(tabId) {
    const raw = storageGet('linkConfig_' + tabId);
    if (!raw) return { raw: null, config: null };

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        _backupBrokenTab(tabId, raw, 'Der Speicherstand war kein gültiges JSON.');
        return { raw, config: null };
    }

    const res = normalizeConfig(parsed, { mode: 'repair' });
    if (!res.ok) {
        _backupBrokenTab(tabId, raw, res.error + '.');
        return { raw, config: null };
    }
    if (res.dropped > 0) {
        _backupBrokenTab(tabId, raw, `${res.dropped} unbrauchbare${res.dropped === 1 ? 'r Eintrag wird' : ' Einträge werden'} nicht angezeigt (z.B. Links ohne http(s)-Adresse).`);
    }
    return { raw, config: res.config };
}

/**
 * Standard-Inhalt eines Tabs (Config-Datei bzw. Fallback), geprüft und kopiert
 */
function getDefaultTabConfig(tabId) {
    const dynamicConfigs = window.DYNAMIC_CONFIGS || {};
    const matchingKey = findDynamicConfigLabel(tabId);
    let source = null;
    if (matchingKey && dynamicConfigs[matchingKey].config) {
        source = dynamicConfigs[matchingKey].config;
    } else {
        // Fallback-Tab: DEFAULT_TAB.id oder 'allgemein'; 'homelab' für Backward-Kompatibilität
        const fallbackId = (window.DEFAULT_TAB && window.DEFAULT_TAB.id) || 'allgemein';
        if (tabId === fallbackId || tabId === 'allgemein' || tabId === 'homelab') {
            source = window.DEFAULT_CONFIG || fallbackDefaultConfig;
        }
    }
    if (!source) return null;
    const res = normalizeConfig(source, { mode: 'repair' });
    return res.ok ? res.config : null;
}

// -----------------------------------------------------------------------
// TAB-KONFIGURATION: LESEN / SCHREIBEN
// -----------------------------------------------------------------------

/**
 * Konfiguration eines bestimmten Tabs lesen (ohne sie aktiv zu setzen).
 * Liefert immer eine eigene Kopie – Änderungen daran wirken erst über writeTabConfigs().
 */
function getTabConfigById(tabId) {
    if (tabId === 'favorites') return null;

    // 1. Gespeicherter Stand (bereits besuchter Tab)
    const stored = readStoredTabConfig(tabId);
    if (stored.config) return stored.config;

    // 2. Fallback: Default-Config (Tab noch nie gespeichert)
    return getDefaultTabConfig(tabId);
}

/**
 * Snapshot des aktiven Tabs (Kopie) – z.B. für Export
 */
function getActiveConfigSnapshot() {
    return JSON.parse(JSON.stringify({ categories: linkCategories, categoryOrder }));
}

/**
 * Config eines Tabs in globale Variablen laden
 * @returns {boolean} true wenn ein gespeicherter Stand existierte
 */
function loadTabConfigById(tabId) {
    if (tabId === 'favorites') return true;

    const stored = readStoredTabConfig(tabId);
    const cfg = stored.config || getDefaultTabConfig(tabId) || { categories: {}, categoryOrder: [] };

    config         = cfg;
    linkCategories = cfg.categories;
    categoryOrder  = cfg.categoryOrder;
    _activeStoredRaw = stored.raw;

    sortCategoriesEmptyLast();
    config.categoryOrder = categoryOrder;
    return !!stored.config;
}

/**
 * Erststart abschließen: Standard-Inhalte aller Tabs, die Tab-Liste und eine
 * Markierung "Einrichtung erledigt" speichern. Danach gilt die Sammlung als
 * eingerichtet – auch wenn der Nutzer später alle Kategorien löscht.
 * @returns {boolean}
 */
function persistInitialSetup() {
    const ops = [];
    tabsList.forEach(tab => {
        if (storageGet('linkConfig_' + tab.id) !== null) return;
        const cfg = getDefaultTabConfig(tab.id) || { categories: {}, categoryOrder: [] };
        ops.push({ key: 'linkConfig_' + tab.id, value: _tabConfigJSON(cfg) });
    });
    ops.push({ key: 'linkTabs', value: _tabsListJSON() });
    ops.push({ key: 'linkSetupDone', value: new Date().toISOString() });

    if (!storageTransaction(ops)) return false;
    if (activeTabId && activeTabId !== 'favorites') loadTabConfigById(activeTabId);
    return true;
}

/**
 * Aktiven Tab aus dem Speicher neu laden und alle Ansichten aktualisieren
 * (nach fehlgeschlagenem Speichern oder Änderungen aus einem anderen Fenster)
 */
function reloadActiveTabFromStorage() {
    if (activeTabId && activeTabId !== 'favorites') loadTabConfigById(activeTabId);
    refreshViews();
}

// -----------------------------------------------------------------------
// MIGRATION: linkConfig → linkConfig_homelab
// -----------------------------------------------------------------------

/**
 * Alte linkConfig (vor dem Tab-System) in einen eigenen Tab "Homelab" migrieren.
 * Muss nach loadTabsList() laufen: Daten und Tab-Eintrag werden gemeinsam gespeichert,
 * der Altstand wird erst danach entfernt. Mehrfaches Ausführen ist unschädlich.
 * @returns {boolean} true wenn in diesem Aufruf migriert wurde
 */
function migrateOldConfig() {
    const old = storageGet('linkConfig');
    if (!old) return false;

    // Ziel: 'homelab' – außer dort liegt bereits ein anderer Stand
    let targetId = 'homelab';
    const existing = storageGet('linkConfig_' + targetId);
    if (existing && existing !== old) {
        targetId = uniqueKey('homelab', k => k === 'favorites' || tabsList.some(t => t.id === k) || !!storageGet('linkConfig_' + k));
    }

    const ops = [];
    if (storageGet('linkConfig_' + targetId) !== old) ops.push({ key: 'linkConfig_' + targetId, value: old });

    const isNewTab = !tabsList.some(t => t.id === targetId);
    if (isNewTab) {
        tabsList.unshift({ id: targetId, label: targetId === 'homelab' ? 'Homelab' : 'Homelab (alt)', icon: '🏠' });
        activeTabId = targetId;
    }
    ops.push({ key: 'linkTabs', value: _tabsListJSON() });
    ops.push({ key: 'linkConfig', value: null });

    if (!storageTransaction(ops)) {
        if (isNewTab) tabsList = tabsList.filter(t => t.id !== targetId);
        return false;
    }
    console.log('Migration: linkConfig → linkConfig_' + targetId);
    return true;
}

// -----------------------------------------------------------------------
// HAUPTFUNKTIONEN: loadConfig / saveConfig
// -----------------------------------------------------------------------

/**
 * Konfiguration laden (Tab-aware)
 * Lädt Tab-Liste, führt Migration aus, lädt aktiven Tab
 */
function loadConfig() {
    // Tabs-Liste und activeTabId laden
    loadTabsList();

    const wasMigrated = migrateOldConfig();

    // Aktiven Tab laden
    const found = loadTabConfigById(activeTabId);

    if (wasMigrated) {
        // Toast nach kurzer Verzögerung damit DOM fertig ist
        setTimeout(() => {
            showMessage('Deine Konfiguration wurde zum Tab "🏠 Homelab" migriert.', 'success');
        }, 600);
    }

    return found;
}

/**
 * Konfiguration des aktiven Tabs speichern.
 * Schlägt das Speichern fehl oder hat ein anderes Fenster den Tab inzwischen
 * geändert, wird der gespeicherte Stand neu geladen und false zurückgegeben –
 * Aufrufer dürfen dann keine Erfolgsmeldung zeigen.
 * @param {boolean} silent - kein Toast anzeigen
 * @returns {boolean}
 */
function saveConfig(silent) {
    if (!activeTabId || activeTabId === 'favorites') return true; // Read-only oder nicht initialisiert

    const key = 'linkConfig_' + activeTabId;
    if (_activeTabChangedElsewhere()) return false;

    config = { categories: linkCategories, categoryOrder };
    const json = JSON.stringify(config);
    if (!storageSet(key, json)) {
        reloadActiveTabFromStorage();
        return false;
    }
    _activeStoredRaw = json;

    if (!silent) {
        showMessage('Konfiguration gespeichert', 'success');
    }
    return true;
}

// -----------------------------------------------------------------------
// MEHRERE FENSTER: Änderungen anderer Instanzen übernehmen
// -----------------------------------------------------------------------

function isAnyModalOpen() {
    return [...document.querySelectorAll('.modal, .ov-modal')].some(m => m.isConnected && getComputedStyle(m).display !== 'none');
}

window.addEventListener('storage', e => {
    if (e.storageArea !== localStorage || !activeTabId) return;
    const key = e.key;
    if (key !== null && key !== 'linkTabs' && !key.startsWith('linkConfig_')) return;

    if (key === null || key === 'linkTabs') {
        // Eigenen aktiven Tab behalten, nur die Liste übernehmen
        const ownActive = activeTabId;
        loadTabsList();
        activeTabId = (ownActive === 'favorites' || tabsList.some(t => t.id === ownActive))
            ? ownActive
            : (tabsList[0] && tabsList[0].id);
        renderTabBar();
    }

    const activeChanged = key === null || key === 'linkTabs' || key === 'linkConfig_' + activeTabId;
    if (activeChanged && activeTabId !== 'favorites' && isAnyModalOpen()) {
        // Offener Dialog: nicht unter der Hand austauschen – saveConfig() erkennt den Konflikt
        showMessage('Diese Sammlung wurde in einem anderen Fenster geändert.', 'warning');
        updatePinnedBar();
        return;
    }
    if (activeTabId !== 'favorites') loadTabConfigById(activeTabId);
    refreshViews();
});

/**
 * Auf Standard-Konfiguration zurücksetzen (aktiver Tab = homelab)
 */
function resetToDefault() {
    closeMenu();

    const currentTab = tabsList.find(t => t.id === activeTabId);
    const tabLabel   = currentTab ? `${esc(currentTab.icon)} ${esc(currentTab.label)}` : esc(activeTabId);

    const dynamicConfigs = window.DYNAMIC_CONFIGS || {};
    const matchingKey = findDynamicConfigLabel(activeTabId);
    const hasDefaultConfig = !!(matchingKey && dynamicConfigs[matchingKey]?.config) || !!window.DEFAULT_CONFIG;
    const configSource = hasDefaultConfig
        ? `Default_config-${esc(currentTab?.label || activeTabId)}.js`
        : 'Basis-Fallback (keine Default-Config-Datei vorhanden)';

    const modalHTML = `
        <div class="modal" id="resetConfirmModal" style="display:block;">
            <div class="modal-content" style="max-width:480px;">
                <h2 style="text-align:center;margin-bottom:20px;">
                    <span class="modal-emoji">🔄</span> Tab zurücksetzen
                </h2>
                <div style="margin-bottom:18px;padding:14px 16px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.25);border-radius:10px;">
                    <div style="font-size:0.95em;font-weight:600;color:#ff8080;margin-bottom:8px;">⚠️ Achtung – nicht rückgängig machbar</div>
                    <div style="font-size:0.88em;color:rgba(220,220,220,0.85);line-height:1.5;">
                        Alle Kategorien und Links im Tab <strong style="color:#e0e0e0;">${tabLabel}</strong> werden durch den Inhalt der Default-Config ersetzt.
                    </div>
                </div>
                <div style="margin-bottom:22px;padding:12px 16px;background:rgba(64,224,208,0.06);border:1px solid rgba(64,224,208,0.18);border-radius:10px;font-size:0.85em;color:rgba(200,200,200,0.8);">
                    <span style="color:rgba(64,224,208,0.7);font-weight:600;">Quelle:</span> ${configSource}
                </div>
                <div class="form-buttons" style="display:flex;gap:10px;justify-content:flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('resetConfirmModal').remove()">Abbrechen</button>
                    <button type="button" class="btn" style="background:rgba(255,60,60,0.2);border:1px solid rgba(255,80,80,0.5);color:#ff8080;" onclick="confirmResetToDefault()">Zurücksetzen</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // State-Bridge: wird von confirmResetToDefault() gelesen, das als onclick im
    // dynamisch eingefügten Modal läuft und keinen Closure-Zugriff auf lokale Vars hat.
    window._pendingResetMatchingKey  = matchingKey;
    window._pendingResetConfigSource = configSource;
    window._pendingResetTabLabel     = currentTab?.label || activeTabId;
}

function confirmResetToDefault() {
    const modal = document.getElementById('resetConfirmModal');
    if (modal) modal.remove();

    const dynamicConfigs = window.DYNAMIC_CONFIGS || {};
    const matchingKey    = window._pendingResetMatchingKey;
    const configSource   = window._pendingResetConfigSource;
    const tabLabelText   = window._pendingResetTabLabel;

    let configToUse;
    if (matchingKey && dynamicConfigs[matchingKey]?.config) {
        configToUse = dynamicConfigs[matchingKey].config;
    } else {
        configToUse = window.DEFAULT_CONFIG || fallbackDefaultConfig;
    }

    const checked = normalizeConfig(configToUse, { mode: 'repair' });
    if (!checked.ok) {
        showMessage({ title: '❌ Default-Config fehlerhaft', content: checked.error }, 'error');
        return;
    }

    // Tab-Reihenfolge + Icons aus DYNAMIC_CONFIGS (= HTML-Reihenfolge) wiederherstellen
    const defaultTabs   = buildDefaultTabsFromConfigs();
    const currentTabMap = new Map(tabsList.map(t => [t.id, t]));

    // Reihenfolge aus HTML, hidden-Status des Nutzers beibehalten
    const defaultIds   = new Set(defaultTabs.map(t => t.id));
    const previousTabs = tabsList;
    tabsList = [
        ...defaultTabs.map(dt => ({
            ...dt,
            hidden: currentTabMap.get(dt.id)?.hidden || false
        })),
        // Manuell angelegte Tabs (nicht in DYNAMIC_CONFIGS) ans Ende
        ...tabsList.filter(t => !defaultIds.has(t.id))
    ];

    if (!writeTabConfigs([[activeTabId, checked.config]], { tabs: true })) {
        tabsList = previousTabs;
        return;
    }

    renderTabBar();
    refreshViews();
    showMessage({
        title:   `🔄 Tab "${tabLabelText}" zurückgesetzt`,
        content: `Quelle: ${configSource}`
    }, 'success');

    delete window._pendingResetMatchingKey;
    delete window._pendingResetConfigSource;
    delete window._pendingResetTabLabel;
}
