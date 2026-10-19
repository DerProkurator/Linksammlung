// ========================================================================
// LINKSAMMLUNG - CONFIG.JS v3.3
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

// Neue Variablen für temporäre leere Kategorien
let tempEmptyCategories = [];
let isLinkDragActive = false;

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
    const tabs = Object.keys(configs).map(label => ({
        id:     label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        label:  label,
        icon:   configs[label].icon || '📋',
        hidden: configs[label].hidden || false
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

// -----------------------------------------------------------------------
// HILFSFUNKTIONEN
// -----------------------------------------------------------------------

/**
 * Favoriten-Support zu allen Links im aktiven Config hinzufügen
 */
function addFavoritesSupportToLinks() {
    Object.values(linkCategories).forEach(category => {
        if (category.links) {
            category.links.forEach(link => {
                if (link.favorite === undefined) {
                    link.favorite = false;
                }
                if (link.pinned === undefined) {
                    link.pinned = false;
                }
            });
        }
    });
}

/**
 * Konfiguration validieren (und Auto-Fix)
 */
function validateConfig(cfg) {
    if (typeof cfg !== 'object' || cfg === null) return false;

    let categories = cfg.categories || cfg;

    for (const [key, category] of Object.entries(categories)) {
        if (!category?.title || !Array.isArray(category?.links)) return false;

        for (const link of category.links) {
            if (!link?.title || !link?.url) return false;
            if (!isSafeUrl(link.url)) return false;

            if (!link.description) link.description = '';
            if (!link.icon) link.icon = '🔗';
            if (link.favorite === undefined) link.favorite = false;
            if (link.pinned  === undefined) link.pinned  = false;

            // Priority → Favorite Migration
            if (link.priority !== undefined) {
                link.favorite = link.priority;
                delete link.priority;
            }
        }

        if (!category.icon) category.icon = '📁';
        if (category.collapsed === undefined) category.collapsed = false;
    }

    return true;
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

/**
 * Konfiguration eines bestimmten Tabs aus localStorage lesen (ohne sie aktiv zu setzen)
 */
function getTabConfigById(tabId) {
    if (tabId === 'favorites') return null;

    // 1. Aus localStorage lesen (bereits besuchter Tab)
    try {
        const saved = localStorage.getItem('linkConfig_' + tabId);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Fehler beim Lesen von Tab-Config:', tabId, e);
    }

    // 2. Fallback: DYNAMIC_CONFIGS (Tab noch nie besucht)
    const dynamicConfigs = window.DYNAMIC_CONFIGS || {};
    const matchingKey = Object.keys(dynamicConfigs).find(
        label => label.toLowerCase().replace(/[^a-z0-9]/g, '_') === tabId
    );
    if (matchingKey && dynamicConfigs[matchingKey].config) {
        return JSON.parse(JSON.stringify(dynamicConfigs[matchingKey].config));
    }

    // 3. Fallback-Tab: DEFAULT_TAB.id oder 'allgemein'; 'homelab' für Backward-Kompatibilität
    const fallbackId = (window.DEFAULT_TAB && window.DEFAULT_TAB.id) || 'allgemein';
    if ((tabId === fallbackId || tabId === 'homelab') && window.DEFAULT_CONFIG) {
        return JSON.parse(JSON.stringify(window.DEFAULT_CONFIG));
    }

    return null;
}

/**
 * Config eines Tabs in globale Variablen laden
 */
function loadTabConfigById(tabId) {
    if (tabId === 'favorites') return true;

    try {
        const saved = localStorage.getItem('linkConfig_' + tabId);
        if (saved) {
            config = JSON.parse(saved);
            linkCategories = config.categories || {};
            categoryOrder = config.categoryOrder || Object.keys(linkCategories);

            addFavoritesSupportToLinks();

            // collapsed-Flag sicherstellen
            Object.keys(linkCategories).forEach(key => {
                if (linkCategories[key].collapsed === undefined) {
                    linkCategories[key].collapsed = false;
                }
            });

            // categoryOrder bereinigen
            const existingKeys = Object.keys(linkCategories);
            const missingKeys = existingKeys.filter(k => !categoryOrder.includes(k));
            if (missingKeys.length > 0) categoryOrder = [...categoryOrder, ...missingKeys];
            categoryOrder = categoryOrder.filter(k => linkCategories[k]);

            sortCategoriesEmptyLast();
            return true;
        }
    } catch (e) {
        console.error('Fehler beim Laden der Tab-Konfiguration:', tabId, e);
    }

    // Kein gespeicherter Stand: Tab-spezifischen Default aus DYNAMIC_CONFIGS laden
    const dynamicConfigs = window.DYNAMIC_CONFIGS || {};
    const matchingKey = Object.keys(dynamicConfigs).find(
        label => label.toLowerCase().replace(/[^a-z0-9]/g, '_') === tabId
    );
    if (matchingKey && dynamicConfigs[matchingKey].config) {
        config = JSON.parse(JSON.stringify(dynamicConfigs[matchingKey].config));
    } else if (tabId === (window.DEFAULT_TAB && window.DEFAULT_TAB.id) || tabId === 'allgemein' || tabId === 'homelab') {
        // Fallback-Tab: 'allgemein' (Standard), 'homelab' nur für Backward-Kompatibilität
        config = JSON.parse(JSON.stringify(window.DEFAULT_CONFIG || fallbackDefaultConfig));
    } else {
        config = { categories: {}, categoryOrder: [] };
    }
    linkCategories = config.categories;
    categoryOrder = config.categoryOrder;
    addFavoritesSupportToLinks();
    return false;
}

// -----------------------------------------------------------------------
// MIGRATION: linkConfig → linkConfig_homelab
// -----------------------------------------------------------------------

/**
 * Alte linkConfig in linkConfig_homelab migrieren (einmalig)
 */
function migrateOldConfig() {
    const oldKey = 'linkConfig';
    const newKey = 'linkConfig_homelab';

    const old = localStorage.getItem(oldKey);
    if (!old) return false;

    // Nur migrieren wenn homelab noch keinen eigenen Stand hat
    if (!localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, old);
        console.log('Migration: linkConfig → linkConfig_homelab');
        return true;
    }

    // Alten Key immer entfernen sobald er existiert und homelab da ist
    localStorage.removeItem(oldKey);
    return false;
}

// -----------------------------------------------------------------------
// HAUPTFUNKTIONEN: loadConfig / saveConfig
// -----------------------------------------------------------------------

/**
 * Konfiguration laden (Tab-aware)
 * Ruft Migration auf, lädt aktiven Tab
 */
function loadConfig() {
    const wasMigrated = migrateOldConfig();

    // Tabs-Liste und activeTabId laden
    loadTabsList();

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
 * Konfiguration speichern (Tab-aware)
 * @param {boolean} silent - kein Toast anzeigen
 */
function saveConfig(silent) {
    if (!activeTabId || activeTabId === 'favorites') return; // Read-only oder nicht initialisiert

    try {
        config.categories = linkCategories;
        config.categoryOrder = categoryOrder;
        localStorage.setItem('linkConfig_' + activeTabId, JSON.stringify(config));

        if (!silent) {
            showMessage('Konfiguration gespeichert', 'success');
        }
    } catch (e) {
        console.error('Fehler beim Speichern:', e);
        showMessage('Fehler beim Speichern der Konfiguration', 'error');
    }
}

/**
 * Auf Standard-Konfiguration zurücksetzen (aktiver Tab = homelab)
 */
function resetToDefault() {
    closeMenu();

    const currentTab = tabsList.find(t => t.id === activeTabId);
    const tabLabel   = currentTab ? `${esc(currentTab.icon)} ${esc(currentTab.label)}` : esc(activeTabId);

    const dynamicConfigs = window.DYNAMIC_CONFIGS || {};
    const matchingKey = Object.keys(dynamicConfigs).find(
        label => label.toLowerCase().replace(/[^a-z0-9]/g, '_') === activeTabId
    );
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

    config         = JSON.parse(JSON.stringify(configToUse));
    linkCategories = config.categories;
    categoryOrder  = config.categoryOrder;

    addFavoritesSupportToLinks();

    // Tab-Reihenfolge + Icons aus DYNAMIC_CONFIGS (= HTML-Reihenfolge) wiederherstellen
    const defaultTabs   = buildDefaultTabsFromConfigs();
    const currentTabMap = {};
    tabsList.forEach(t => { currentTabMap[t.id] = t; });

    // Reihenfolge aus HTML, hidden-Status des Nutzers beibehalten
    const defaultIds = new Set(defaultTabs.map(t => t.id));
    tabsList = [
        ...defaultTabs.map(dt => ({
            ...dt,
            hidden: currentTabMap[dt.id]?.hidden || false
        })),
        // Manuell angelegte Tabs (nicht in DYNAMIC_CONFIGS) ans Ende
        ...tabsList.filter(t => !defaultIds.has(t.id))
    ];

    saveTabsList();
    renderTabBar();

    saveConfig(true);
    renderCategories();
    updateFavoritesCount();
    showMessage({
        title:   `🔄 Tab "${tabLabelText}" zurückgesetzt`,
        content: `Quelle: ${configSource}`
    }, 'success');

    delete window._pendingResetMatchingKey;
    delete window._pendingResetConfigSource;
    delete window._pendingResetTabLabel;
}
