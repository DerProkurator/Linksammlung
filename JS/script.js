// Emoji-Datenbank mit Kategorien
const emojiDatabase = {
    'devices_hardware': {
        name: 'Geräte & Hardware',
        icon: '💻',
        emojis: [
            { emoji: '💻', name: 'Laptop' },
            { emoji: '🖥️', name: 'Desktop-PC' },
            { emoji: '🖨️', name: 'Drucker' },
            { emoji: '⌨️', name: 'Tastatur' },
            { emoji: '🖱️', name: 'Maus' },
            { emoji: '🖲️', name: 'Trackball' },
            { emoji: '📱', name: 'Smartphone' },
            { emoji: '📲', name: 'Handy mit Pfeil' },
            { emoji: '📞', name: 'Telefon' },
            { emoji: '📟', name: 'Pager' },
            { emoji: '💾', name: 'Diskette' },
            { emoji: '💿', name: 'CD' },
            { emoji: '📀', name: 'DVD' },
            { emoji: '🔋', name: 'Akku' },
            { emoji: '🔌', name: 'Stecker' },
            { emoji: '📡', name: 'Satellitenschüssel' },
            { emoji: '🛰️', name: 'Satellit' }
        ]
    },
    'development': {
        name: 'Entwicklung & Tools',
        icon: '🧑‍💻',
        emojis: [
            { emoji: '👨‍💻', name: 'Entwickler (männlich)' },
            { emoji: '👩‍💻', name: 'Entwicklerin (weiblich)' },
            { emoji: '🧑‍💻', name: 'Programmierer' },
            { emoji: '🪲', name: 'Bug' },
            { emoji: '🔧', name: 'Schraubenschlüssel' },
            { emoji: '🔨', name: 'Hammer' },
            { emoji: '⚙️', name: 'Zahnrad' },
            { emoji: '🧰', name: 'Werkzeugkasten' },
            { emoji: '🪛', name: 'Schraubenzieher' },
            { emoji: '🔬', name: 'Mikroskop (Analyse)' },
            { emoji: '🧪', name: 'Test (Labor)' },
            { emoji: '📋', name: 'Zwischenablage' },
            { emoji: '📑', name: 'Registerkarte' },
            { emoji: '🗃️', name: 'Ablage' },
            { emoji: '🗄️', name: 'Aktenschrank' }
        ]
    },
    'internet_communication': {
        name: 'Internet & Kommunikation',
        icon: '🌐',
        emojis: [
            { emoji: '🌐', name: 'Internet' },
            { emoji: '🔗', name: 'Link' },
            { emoji: '🔖', name: 'Lesezeichen' },
            { emoji: '📎', name: 'Büroklammer' },
            { emoji: '📧', name: 'E-Mail' },
            { emoji: '📨', name: 'E-Mail eingehend' },
            { emoji: '📩', name: 'E-Mail ausgehend' },
            { emoji: '📤', name: 'Upload' },
            { emoji: '📥', name: 'Download' },
            { emoji: '🆙', name: 'Hochladen' },
            { emoji: '📶', name: 'WLAN/Signal' },
            { emoji: '🗨️', name: 'Sprechblase' },
            { emoji: '💬', name: 'Chat' },
            { emoji: '📲', name: 'Mobiler Zugriff' },
            { emoji: '🛜', name: 'Netzwerkanschluss' }
        ]
    },
    'security': {
        name: 'Sicherheit & Verschlüsselung',
        icon: '🔒',
        emojis: [
            { emoji: '🔒', name: 'Schloss geschlossen' },
            { emoji: '🔓', name: 'Schloss offen' },
            { emoji: '🔐', name: 'Schloss mit Schlüssel' },
            { emoji: '🗝️', name: 'Schlüssel' },
            { emoji: '🛡️', name: 'Schild' },
            { emoji: '🚨', name: 'Alarm' },
            { emoji: '🧱', name: 'Firewall' },
            { emoji: '🪪', name: 'Zugangskarte' }
        ]
    },
    'files_media': {
        name: 'Dateien & Medien',
        icon: '📁',
        emojis: [
            { emoji: '📝', name: 'Notiz' },
            { emoji: '📄', name: 'Dokument' },
            { emoji: '📃', name: 'Papierrolle' },
            { emoji: '📜', name: 'Pergament' },
            { emoji: '📊', name: 'Balkendiagramm' },
            { emoji: '📈', name: 'Aufwärtstrend' },
            { emoji: '📉', name: 'Abwärtstrend' },
            { emoji: '📂', name: 'Ordner offen' },
            { emoji: '📁', name: 'Ordner geschlossen' },
            { emoji: '🗑️', name: 'Papierkorb' },
            { emoji: '💡', name: 'Idee' },
            { emoji: '🎥', name: 'Video' },
            { emoji: '🎧', name: 'Audio' },
            { emoji: '🎤', name: 'Mikrofon' },
            { emoji: '📷', name: 'Kamera' }
        ]
    },
    'admin_infrastructure': {
        name: 'Administration & Infrastruktur',
        icon: '🖧',
        emojis: [
            { emoji: '🖧', name: 'Netzwerk' },
            { emoji: '🗼', name: 'Funkmast' },
            { emoji: '☁️', name: 'Cloud' },
            { emoji: '🔄', name: 'Synchronisierung' },
            { emoji: '🔃', name: 'Rotation / Refresh' },
            { emoji: '🪟', name: 'Fenster / VM' },
            { emoji: '📊', name: 'Monitoring' },
            { emoji: '🪄', name: 'Automatisierung / Magic' }
        ]
    },
    'alerts_status': {
        name: 'Warnungen & Status',
        icon: '⚠️',
        emojis: [
            { emoji: '⚠️', name: 'Warnung' },
            { emoji: '❗', name: 'Wichtig' },
            { emoji: '❓', name: 'Frage' },
            { emoji: '🔥', name: 'Kritisch / Brand' },
            { emoji: '🚫', name: 'Verboten / Blockiert' },
            { emoji: '🆘', name: 'Notfall / Hilfe' },
            { emoji: '💣', name: 'Crash' },
            { emoji: '💥', name: 'Explosion / Fehler' },
            { emoji: '♻️', name: 'Wiederherstellung / Recycling' }
        ]
    },
    'ui_ux': {
        name: 'UI & Interaktion',
        icon: '🖱️',
        emojis: [
            { emoji: '🖱️', name: 'Maus' },
            { emoji: '🔘', name: 'Radio Button' },
            { emoji: '🗳️', name: 'Auswahlfeld' },
            { emoji: '🎛️', name: 'Regler' },
            { emoji: '🎚️', name: 'Schieberegler' },
            { emoji: '⏺️', name: 'Aufnahme' },
            { emoji: '▶', name: 'Play' },
            { emoji: '⏸️', name: 'Pause' },
            { emoji: '⏹️', name: 'Stop' },
            { emoji: '⏭️', name: 'Nächster' },
            { emoji: '⏮️', name: 'Vorheriger' }
        ]
    },
    'crypto_finance': {
        name: 'Krypto & Finanzen',
        icon: '💰',
        emojis: [
            { emoji: '💰', name: 'Geldsack' },
            { emoji: '💸', name: 'Fliegendes Geld' },
            { emoji: '💳', name: 'Kreditkarte' },
            { emoji: '💲', name: 'Dollar-Zeichen' },
            { emoji: '💱', name: 'Währungsumtausch' },
            { emoji: '💹', name: 'Aktiengewinn' },
            { emoji: '🪙', name: 'Münze' },
            { emoji: '🏦', name: 'Bank' },
            { emoji: '📈', name: 'Kursanstieg' },
            { emoji: '📉', name: 'Kursabfall' },
            { emoji: '🔗', name: 'Blockchain-Link' },
            { emoji: '🪙', name: 'Kryptowährung (Symbolisch)' },
            { emoji: '🧾', name: 'Quittung / Abrechnung' },
            { emoji: '💼', name: 'Aktenkoffer / Finanzen' }
        ]
    }
};

// Aktuelle Picker-Instanz
let currentPickerTarget = null;
let currentPickerElement = null;

// Variables für Link-Import
let pendingLinkImport = null;
let pendingOriginalCategoryTitle = null;

// Variables für Kategorie-Import
let pendingCategoryImport = null;

// Variables für leere Kategorie-Behandlung
let pendingEmptyCategoryData = null;

// Favoriten-Variablen
let favoritesOpen = false;

// Standard-Konfiguration (wird von default-config.js überschrieben falls vorhanden)
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

// Aktuelle Konfiguration
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

// =============================================================================
// FAVORITEN-FUNKTIONEN
// =============================================================================

function toggleFavorites() {
    const favoritesOverlay = document.getElementById('favoritesOverlay');
    const favoritesSidebar = document.getElementById('favoritesSidebar');
    const favoritesToggle = document.getElementById('favoritesToggle');
    
    favoritesOpen = !favoritesOpen;
    
    if (favoritesOpen) {
        favoritesOverlay.classList.add('active');
        favoritesSidebar.classList.add('active');
        favoritesToggle.classList.add('active');
        updateFavoritesList();
        
        // Body-Scroll verhindern
        document.body.style.overflow = 'hidden';
        
        // Overlay-Click zum Schließen
        favoritesOverlay.addEventListener('click', handleOverlayClick);
    } else {
        favoritesOverlay.classList.remove('active');
        favoritesSidebar.classList.remove('active');
        favoritesToggle.classList.remove('active');
        
        // Body-Scroll wieder erlauben
        document.body.style.overflow = '';
        
        // Event Listener entfernen
        favoritesOverlay.removeEventListener('click', handleOverlayClick);
    }
}

function handleOverlayClick(event) {
    // Nur schließen wenn direkt auf das Overlay geklickt wird
    if (event.target === event.currentTarget) {
        toggleFavorites();
    }
}

function updateFavoritesList() {
    // Sidebar-Container verwenden (korrekte ID)
    const favoritesContent = document.querySelector('#favoritesSidebar .favorites-sidebar-content');
    const favoritesCount = document.getElementById('favoritesCount');
    
    if (!favoritesContent || !favoritesCount) {
        console.error('Favoriten-Container nicht gefunden');
        return;
    }
    
    // Alle Favoriten sammeln
    const favorites = [];
    categoryOrder.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        if (!category) return;
        
        category.links.forEach((link, linkIndex) => {
            if (link.favorite) {
                favorites.push({
                    ...link,
                    categoryKey: categoryKey,
                    categoryTitle: category.title,
                    categoryIcon: category.icon,
                    linkIndex: linkIndex
                });
            }
        });
    });
    
    // Favoriten-Anzahl aktualisieren
    favoritesCount.textContent = favorites.length;
    
    // Favoriten-Liste leeren
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
    
    // Favoriten nach Titel sortieren
    favorites.sort((a, b) => a.title.localeCompare(b.title));
    
    // Favoriten anzeigen
    favorites.forEach(favorite => {
        const favoriteElement = document.createElement('div');
        favoriteElement.className = 'favorite-item';
        favoriteElement.innerHTML = `
            <div class="favorite-item-icon">${favorite.icon}</div>
            <div class="favorite-item-content">
                <div class="favorite-item-title">${favorite.title}</div>
                <div class="favorite-item-category">
                    <span>${favorite.categoryIcon}</span>
                    <span>${favorite.categoryTitle}</span>
                </div>
                <div class="favorite-item-url">${favorite.url}</div>
            </div>
            <div class="favorite-item-remove" onclick="removeFavorite('${favorite.categoryKey}', ${favorite.linkIndex}); event.stopPropagation();">
                ✕
            </div>
        `;
        
        favoriteElement.addEventListener('click', () => {
            window.open(favorite.url, '_blank');
        });
        
        favoritesContent.appendChild(favoriteElement);
    });
}

function updateFavoritesCount() {
    const favoritesCount = document.getElementById('favoritesCount');
    
    if (!favoritesCount) {
        console.error('Favoriten-Counter nicht gefunden');
        return;
    }
    
    let count = 0;
    categoryOrder.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        if (!category) return;
        
        category.links.forEach(link => {
            if (link.favorite) count++;
        });
    });
    
    favoritesCount.textContent = count;
    
    // Favoriten-Liste aktualisieren falls offen
    if (favoritesOpen) {
        updateFavoritesList();
    }
}

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

function toggleLinkFavorite() {
    if (!currentContextLink) return;
    
    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];
    
    link.favorite = !link.favorite;
    
    const action = link.favorite ? 'zu Favoriten hinzugefügt' : 'aus Favoriten entfernt';
    const icon = link.favorite ? '⭐' : '☆';
    
    saveConfig(true);
    updateFavoritesCount();
    renderCategories();
    
    showMessage(`${icon} "${link.title}" ${action}`, 'success');
    hideContextMenu();
}

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

function updateFavoritesCheckboxUI() {
    const checkbox = document.getElementById('linkFavorite');
    const group = document.getElementById('favoritesGroup');
    
    if (checkbox && group) {
        if (checkbox.checked) {
            group.classList.add('checked');
        } else {
            group.classList.remove('checked');
        }
    }
}

// =============================================================================
// KATEGORIE EXPORT/IMPORT FUNKTIONEN
// =============================================================================

function exportSingleCategory() {
    if (!currentContextCategory) return;
    
    const category = linkCategories[currentContextCategory];
    
    const categoryData = {
        type: 'single_category',
        version: '1.0',
        exportDate: new Date().toISOString(),
        category: {
            title: category.title,
            icon: category.icon,
            collapsed: category.collapsed,
            links: category.links.map(link => ({
                title: link.title,
                url: link.url,
                description: link.description,
                icon: link.icon,
                favorite: link.favorite || false
            }))
        },
        originalCategoryKey: currentContextCategory
    };
    
    try {
        const dataStr = JSON.stringify(categoryData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link_el = document.createElement('a');
        link_el.href = url;
        
        const cleanTitle = category.title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, '').replace(/\s+/g, '-');
        link_el.download = `kategorie-${cleanTitle}.json`;
        link_el.click();
        URL.revokeObjectURL(url);
        
        showMessage(`Kategorie "${category.title}" erfolgreich exportiert`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Fehler beim Exportieren der Kategorie', 'error');
    }
    
    hideContextMenu();
}

function importSingleCategory(event) {
    closeMenu();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const categoryData = JSON.parse(e.target.result);
            
            if (!validateSingleCategory(categoryData)) {
                throw new Error('Ungültige Kategorie-Datei');
            }

            const category = categoryData.category;
            const originalCategoryKey = categoryData.originalCategoryKey;
            
            // Prüfen ob eine Kategorie mit dem gleichen Namen bereits existiert
            let existingCategoryKey = null;
            let conflictingKey = null;
            
            // Nach Titel suchen
            for (const [key, existingCategory] of Object.entries(linkCategories)) {
                if (existingCategory.title === category.title) {
                    existingCategoryKey = key;
                    break;
                }
            }
            
            // Nach originalCategoryKey suchen falls Titel nicht gefunden
            if (!existingCategoryKey && originalCategoryKey && linkCategories[originalCategoryKey]) {
                conflictingKey = originalCategoryKey;
            }
            
            if (existingCategoryKey || conflictingKey) {
                // Konflikt-Dialog anzeigen
                showCategoryImportConflictDialog(categoryData, existingCategoryKey, conflictingKey);
            } else {
                // Kategorie direkt importieren
                importCategoryDirectly(categoryData);
            }
            
        } catch (error) {
            console.error('Import error:', error);
            showMessage('Fehler beim Importieren: Ungültige Kategorie-Datei', 'error');
        }
    };
    reader.readAsText(file);
    
    event.target.value = '';
}

function showCategoryImportConflictDialog(categoryData, existingCategoryKey, conflictingKey) {
    pendingCategoryImport = categoryData;
    
    const category = categoryData.category;
    const conflictType = existingCategoryKey ? 'title' : 'key';
    const conflictingCategory = existingCategoryKey ? 
        linkCategories[existingCategoryKey] : 
        linkCategories[conflictingKey];
    
    let message = '';
    if (conflictType === 'title') {
        message = `Eine Kategorie mit dem Namen "${category.title}" existiert bereits.`;
    } else {
        message = `Eine Kategorie mit dem Schlüssel "${conflictingKey}" existiert bereits.`;
    }
    
    if (confirm(`${message}\n\nWie möchten Sie fortfahren?\n\n` +
                `OK = Links zur bestehenden Kategorie hinzufügen\n` +
                `Abbrechen = Neue Kategorie mit anderem Namen erstellen`)) {
        // Links zur bestehenden Kategorie hinzufügen
        const targetCategoryKey = existingCategoryKey || conflictingKey;
        category.links.forEach(link => {
            // Sicherstellen, dass favorite-Eigenschaft existiert
            if (link.favorite === undefined) {
                link.favorite = false;
            }
            linkCategories[targetCategoryKey].links.push(link);
        });
        
        sortCategoriesEmptyLast();
        saveConfig(true);
        renderCategories();
        updateFavoritesCount();
        
        showMessage(`${category.links.length} Links zur bestehenden Kategorie "${conflictingCategory.title}" hinzugefügt`, 'success');
    } else {
        // Neuen Namen eingeben
        const newName = prompt(`Neuer Name für die Kategorie:`, category.title + ' (Importiert)');
        if (newName && newName.trim()) {
            category.title = newName.trim();
            importCategoryDirectly(categoryData);
        }
    }
    
    pendingCategoryImport = null;
}

function importCategoryDirectly(categoryData) {
    const category = categoryData.category;
    const originalCategoryKey = categoryData.originalCategoryKey;
    
    // Neuen Kategorie-Schlüssel generieren
    let newCategoryKey = category.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Falls der Schlüssel bereits existiert, Nummer anhängen
    let counter = 1;
    const baseKey = newCategoryKey;
    while (linkCategories[newCategoryKey]) {
        newCategoryKey = `${baseKey}_${counter}`;
        counter++;
    }
    
    // Sicherstellen, dass alle Links die favorite-Eigenschaft haben
    category.links.forEach(link => {
        if (link.favorite === undefined) {
            link.favorite = false;
        }
    });
    
    // Kategorie erstellen
    linkCategories[newCategoryKey] = {
        title: category.title,
        icon: category.icon || '📁',
        collapsed: category.collapsed || false,
        links: category.links
    };
    
    categoryOrder.push(newCategoryKey);
    
    sortCategoriesEmptyLast();
    saveConfig(true);
    renderCategories();
    populateCategorySelect();
    updateFavoritesCount();
    
    showMessage(`Kategorie "${category.title}" mit ${category.links.length} Links erfolgreich importiert`, 'success');
}

function validateSingleCategory(categoryData) {
    if (typeof categoryData !== 'object' || categoryData === null) return false;
    if (categoryData.type !== 'single_category') return false;
    if (!categoryData.category || typeof categoryData.category !== 'object') return false;
    
    const category = categoryData.category;
    
    // Basis-Validierung
    if (!category.title || !Array.isArray(category.links)) return false;
    
    // Auto-Fix für Kategorie
    if (!category.icon) category.icon = '📁';
    if (category.collapsed === undefined) category.collapsed = false;
    
    // Links reparieren
    for (const link of category.links) {
        if (!link.title || !link.url) return false;
        
        // Auto-Fix
        if (!link.description) link.description = 'Keine Beschreibung';
        if (!link.icon) link.icon = '🔗';
        if (link.favorite === undefined) link.favorite = false;
        
        // Priority → Favorite Migration
        if (link.priority !== undefined) {
            link.favorite = link.priority;
            delete link.priority;
        }
    }
    
    return true;
}

// =============================================================================
// EMOJI-PICKER FUNKTIONEN
// =============================================================================

function toggleEmojiPicker(inputId) {
    const input = document.getElementById(inputId);
    const picker = document.getElementById(inputId + 'Picker');
    const trigger = input.parentElement.querySelector('.emoji-trigger');
    
    // Alle anderen Picker schließen
    document.querySelectorAll('.emoji-picker').forEach(p => {
        if (p !== picker) {
            p.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.emoji-trigger').forEach(t => {
        if (t !== trigger) {
            t.classList.remove('active');
        }
    });
    
    if (picker.classList.contains('active')) {
        picker.classList.remove('active');
        trigger.classList.remove('active');
        currentPickerTarget = null;
        currentPickerElement = null;
    } else {
        picker.classList.add('active');
        trigger.classList.add('active');
        currentPickerTarget = inputId;
        currentPickerElement = picker;
        
        // Emoji-Picker initialisieren
        initEmojiPicker(inputId);
    }
}

function initEmojiPicker(inputId) {
    const picker = document.getElementById(inputId + 'Picker');
    const categoriesContainer = document.getElementById(inputId + 'Categories');
    const gridContainer = document.getElementById(inputId + 'Grid');
    
    // Kategorien erstellen
    categoriesContainer.innerHTML = '';
    const categoryKeys = Object.keys(emojiDatabase);
    
    categoryKeys.forEach((categoryKey, index) => {
        const category = emojiDatabase[categoryKey];
        const categoryBtn = document.createElement('div');
        categoryBtn.className = 'emoji-category-btn';
        categoryBtn.innerHTML = category.icon;
        categoryBtn.title = category.name;
        categoryBtn.onclick = () => showEmojiCategory(categoryKey, inputId);
        
        if (index === 0) {
            categoryBtn.classList.add('active');
        }
        
        categoriesContainer.appendChild(categoryBtn);
    });
    
    // Erste Kategorie anzeigen
    showEmojiCategory(categoryKeys[0], inputId);
}

function showEmojiCategory(categoryKey, inputId) {
    const picker = document.getElementById(inputId + 'Picker');
    const categoriesContainer = document.getElementById(inputId + 'Categories');
    const gridContainer = document.getElementById(inputId + 'Grid');
    
    // Aktive Kategorie-Button aktualisieren
    categoriesContainer.querySelectorAll('.emoji-category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = Array.from(categoriesContainer.children).find(btn => 
        btn.innerHTML === emojiDatabase[categoryKey].icon
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Emojis anzeigen
    const category = emojiDatabase[categoryKey];
    gridContainer.innerHTML = '';
    
    category.emojis.forEach(emojiData => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.innerHTML = `
            ${emojiData.emoji}
            <div class="emoji-tooltip">${emojiData.name}</div>
        `;
        emojiItem.onclick = () => selectEmoji(emojiData.emoji, inputId);
        gridContainer.appendChild(emojiItem);
    });
}

function selectEmoji(emoji, inputId) {
    const input = document.getElementById(inputId);
    const picker = document.getElementById(inputId + 'Picker');
    const trigger = input.parentElement.querySelector('.emoji-trigger');
    
    input.value = emoji;
    picker.classList.remove('active');
    trigger.classList.remove('active');
    
    currentPickerTarget = null;
    currentPickerElement = null;
    
    // Input-Event auslösen für eventuelle Validierung
    input.dispatchEvent(new Event('input'));
}

function searchEmojis(query, pickerId) {
    const inputId = pickerId.replace('Picker', '');
    const gridContainer = document.getElementById(inputId + 'Grid');
    
    if (!query.trim()) {
        // Wenn keine Suche, erste Kategorie anzeigen
        const firstCategory = Object.keys(emojiDatabase)[0];
        showEmojiCategory(firstCategory, inputId);
        return;
    }
    
    // Alle Emojis durchsuchen
    const results = [];
    Object.values(emojiDatabase).forEach(category => {
        category.emojis.forEach(emojiData => {
            if (emojiData.name.toLowerCase().includes(query.toLowerCase()) ||
                emojiData.emoji.includes(query)) {
                results.push(emojiData);
            }
        });
    });
    
    // Ergebnisse anzeigen
    gridContainer.innerHTML = '';
    
    if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'emoji-no-results';
        noResults.textContent = 'Keine Emojis gefunden';
        gridContainer.appendChild(noResults);
        return;
    }
    
    results.forEach(emojiData => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.innerHTML = `
            ${emojiData.emoji}
            <div class="emoji-tooltip">${emojiData.name}</div>
        `;
        emojiItem.onclick = () => selectEmoji(emojiData.emoji, inputId);
        gridContainer.appendChild(emojiItem);
    });
}

// Emoji-Picker schließen wenn außerhalb geklickt wird
document.addEventListener('click', function(event) {
    const picker = event.target.closest('.emoji-picker');
    const trigger = event.target.closest('.emoji-trigger');
    
    if (!picker && !trigger && currentPickerElement) {
        currentPickerElement.classList.remove('active');
        const activeTrigger = document.querySelector('.emoji-trigger.active');
        if (activeTrigger) {
            activeTrigger.classList.remove('active');
        }
        currentPickerTarget = null;
        currentPickerElement = null;
    }
});

// =============================================================================
// KONFIGURATION LADEN MIT ERWEITERTEN PRIORITÄTEN
// =============================================================================

// Konfiguration laden mit Rückwärtskompatibilität und neuer Priorität
function loadConfigWithCollapsedSupport() {
    
    // 1. Priorität: Lokale Konfiguration im Browser
    try {
        const saved = localStorage.getItem('linkConfig');
        if (saved) {
            config = JSON.parse(saved);
            linkCategories = config.categories || {};
            categoryOrder = config.categoryOrder || Object.keys(linkCategories);
            
            // Favoriten-Support hinzufügen falls nicht vorhanden
            addFavoritesSupportToLinks();
            
            // Collapsed-Eigenschaft zu bestehenden Kategorien hinzufügen falls nicht vorhanden
            Object.keys(linkCategories).forEach(categoryKey => {
                if (linkCategories[categoryKey].collapsed === undefined) {
                    linkCategories[categoryKey].collapsed = false;
                }
            });
            
            // Sicherstellen, dass categoryOrder alle Kategorien enthält
            const existingKeys = Object.keys(linkCategories);
            const missingKeys = existingKeys.filter(key => !categoryOrder.includes(key));
            if (missingKeys.length > 0) {
                categoryOrder = [...categoryOrder, ...missingKeys];
            }
            
            // Entfernen von Kategorien aus der Order, die nicht mehr existieren
            const originalOrderLength = categoryOrder.length;
            categoryOrder = categoryOrder.filter(key => linkCategories[key]);
            
            // Leere Kategorien ans Ende sortieren
            const orderChanged = sortCategoriesEmptyLast();
            
            if (missingKeys.length > 0 || categoryOrder.length !== originalOrderLength || orderChanged) {
                saveConfig(true);
            }
            
            // showMessage('Konfiguration aus dem lokalen Speicher geladen', 'success');
            return true;
        }
    } catch (error) {
        console.error('Fehler beim Laden der lokalen Konfiguration:', error);
    }
    
    // 2. Priorität: Standard-Konfiguration aus default-config.js
    if (window.DEFAULT_CONFIG) {
        config = JSON.parse(JSON.stringify(window.DEFAULT_CONFIG));
        linkCategories = config.categories;
        categoryOrder = config.categoryOrder;
        
        // Favoriten-Support hinzufügen
        addFavoritesSupportToLinks();
        
        // showMessage('Standard-Konfiguration aus Config-Datei geladen', 'success');
        return true;
    }
    
    // 3. Fallback: Eingebaute Standard-Konfiguration
    config = JSON.parse(JSON.stringify(fallbackDefaultConfig));
    linkCategories = config.categories;
    categoryOrder = config.categoryOrder;
    
    // Favoriten-Support hinzufügen
    addFavoritesSupportToLinks();
    
    return false; // Indikiert, dass keine gespeicherte Konfiguration gefunden wurde
}

function addFavoritesSupportToLinks() {
    // Alle Links durchgehen und favorite-Eigenschaft hinzufügen falls nicht vorhanden
    Object.values(linkCategories).forEach(category => {
        if (category.links) {
            category.links.forEach(link => {
                if (link.favorite === undefined) {
                    link.favorite = false;
                }
            });
        }
    });
}

// =============================================================================
// ALLE ANDEREN BESTEHENDEN FUNKTIONEN VOLLSTÄNDIG IMPLEMENTIERT
// =============================================================================

// Status-Nachricht anzeigen
function showMessage(message, type) {
    const messageEl = document.getElementById('statusMessage');
    messageEl.className = `status-message status-${type}`;
    
    // Unterscheide zwischen einfachen und wichtigen Nachrichten
    if (typeof message === 'object') {
        messageEl.classList.add('important');
        messageEl.innerHTML = `
            <div class="status-title">${message.title}</div>
            <div class="status-content">${message.content}</div>
        `;
    } else {
        messageEl.textContent = message;
    }
    
    // Toast anzeigen
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 100);
    
    // Toast nach längerer Zeit ausblenden wenn wichtig
    const duration = messageEl.classList.contains('important') ? 6000 : 3000;
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, duration);
}

// Neue Funktionen für leere Kategorie-Modal
function showEmptyCategoryModal(data) {
    pendingEmptyCategoryData = data;
    
    const modal = document.getElementById('emptyCategoryModal');
    const messageDiv = document.getElementById('emptyCategoryMessage');
    
    // Dynamische Nachricht mit besserer Dark Mode Formatierung
    let message = '';
    if (data.action === 'move') {
        message = `
            <div class="empty-category-section success">
                <div class="empty-category-section-title">✅ Link erfolgreich verschoben</div>
                <div class="empty-category-section-content">Der Link "<strong>${data.linkTitle}</strong>" wurde von "<strong>${data.sourceTitle}</strong>" zu "<strong>${data.targetTitle}</strong>" verschoben.</div>
            </div>
            <div class="empty-category-section warning">
                <div class="empty-category-section-title">⚠️ Leere Kategorie</div>
                <div class="empty-category-section-content">Die Kategorie "<strong>${data.sourceTitle}</strong>" ist jetzt leer.</div>
                <div class="empty-category-section-note">Möchten Sie die leere Kategorie löschen oder behalten?</div>
            </div>
        `;
    } else if (data.action === 'delete') {
        message = `
            <div class="empty-category-section success">
                <div class="empty-category-section-title">✅ Link erfolgreich gelöscht</div>
                <div class="empty-category-section-content">Der Link "<strong>${data.linkTitle}</strong>" wurde gelöscht.</div>
            </div>
            <div class="empty-category-section warning">
                <div class="empty-category-section-title">⚠️ Leere Kategorie</div>
                <div class="empty-category-section-content">Die Kategorie "<strong>${data.sourceTitle}</strong>" ist jetzt leer.</div>
                <div class="empty-category-section-note">Möchten Sie die leere Kategorie löschen oder behalten?</div>
            </div>
        `;
    }
    
    messageDiv.innerHTML = message;
    modal.style.display = 'block';
}

function closeEmptyCategoryModal() {
    document.getElementById('emptyCategoryModal').style.display = 'none';
    pendingEmptyCategoryData = null;
}

function handleEmptyCategoryDecision(shouldDelete) {
    if (!pendingEmptyCategoryData) return;
    
    const data = pendingEmptyCategoryData;
    
    if (shouldDelete) {
        // Kategorie löschen
        delete linkCategories[data.sourceCategoryKey];
        categoryOrder = categoryOrder.filter(key => key !== data.sourceCategoryKey);
        
        let successMessage = '';
        if (data.action === 'move') {
            successMessage = `Link verschoben und leere Kategorie "${data.sourceTitle}" gelöscht`;
        } else {
            successMessage = `Link gelöscht und leere Kategorie "${data.sourceTitle}" entfernt`;
        }
        
        showMessage(successMessage, 'success');
    } else {
        // Kategorie behalten mit schöner Warnung
        sortCategoriesEmptyLast();
        
        let successMessage = '';
        if (data.action === 'move') {
            successMessage = `Link verschoben - leere Kategorie "${data.sourceTitle}" beibehalten`;
        } else {
            successMessage = `Link gelöscht - leere Kategorie "${data.sourceTitle}" beibehalten`;
        }
        
        showMessage(successMessage, 'success');
        
        // Schöne Warnung als Toast
        setTimeout(() => {
            showMessage({
                title: '💡 Hinweis zu leeren Kategorien',
                content: `Die Kategorie "${data.sourceTitle}" ist leer und kann bei Drag & Drop zu visuellen Problemen führen. Sie können jederzeit neue Links hinzufügen oder die Kategorie über Rechtsklick löschen.`
            }, 'warning');
        }, 1000);
    }
    
    // Konfiguration speichern und Interface aktualisieren
    saveConfig(true);
    renderCategories();
    closeEmptyCategoryModal();
}

// Funktionen zum Sortieren der Kategorien (leere ans Ende)
function sortCategoriesEmptyLast() {
    const filledCategories = [];
    const emptyCategories = [];
    
    categoryOrder.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        if (category && category.links.length > 0) {
            filledCategories.push(categoryKey);
        } else if (category) {
            emptyCategories.push(categoryKey);
        }
    });
    
    const newOrder = [...filledCategories, ...emptyCategories];
    
    if (JSON.stringify(categoryOrder) !== JSON.stringify(newOrder)) {
        categoryOrder = newOrder;
        return true;
    }
    return false;
}

// Funktionen zum Auf-/Zuklappen einzelner Kategorien
function toggleCategoryCollapsed(categoryKey) {
    if (linkCategories[categoryKey]) {
        linkCategories[categoryKey].collapsed = !linkCategories[categoryKey].collapsed;
        saveConfig(true);
        renderCategories();
        
        const category = linkCategories[categoryKey];
        const status = category.collapsed ? 'zugeklappt' : 'aufgeklappt';
        showMessage(`Kategorie "${category.title}" ${status}`, 'success');
    }
}

function toggleCategoryFromContext() {
    if (currentContextCategory) {
        toggleCategoryCollapsed(currentContextCategory);
    }
    hideContextMenu();
}

// Funktionen zum Auf-/Zuklappen aller Kategorien
function collapseAllCategories() {
    closeMenu();
    let changedCount = 0;
    
    categoryOrder.forEach(categoryKey => {
        if (linkCategories[categoryKey] && !linkCategories[categoryKey].collapsed) {
            linkCategories[categoryKey].collapsed = true;
            changedCount++;
        }
    });
    
    if (changedCount > 0) {
        saveConfig(true);
        renderCategories();
        showMessage(`Alle ${changedCount} Kategorien zugeklappt`, 'success');
    } else {
        showMessage('Alle Kategorien sind bereits zugeklappt', 'success');
    }
}

function expandAllCategories() {
    closeMenu();
    let changedCount = 0;
    
    categoryOrder.forEach(categoryKey => {
        if (linkCategories[categoryKey] && linkCategories[categoryKey].collapsed) {
            linkCategories[categoryKey].collapsed = false;
            changedCount++;
        }
    });
    
    if (changedCount > 0) {
        saveConfig(true);
        renderCategories();
        showMessage(`Alle ${changedCount} Kategorien aufgeklappt`, 'success');
    } else {
        showMessage('Alle Kategorien sind bereits aufgeklappt', 'success');
    }
}

// Konfiguration laden
function loadConfig() {
    return loadConfigWithCollapsedSupport();
}

// Konfiguration speichern
function saveConfig() {
    try {
        config.categories = linkCategories;
        config.categoryOrder = categoryOrder;
        
        localStorage.setItem('linkConfig', JSON.stringify(config));
        
        if (arguments.length === 0) {
            showMessage('Konfiguration gespeichert', 'success');
        }
    } catch (error) {
        console.error('Save config error:', error);
        showMessage('Fehler beim Speichern der Konfiguration', 'error');
    }
}

// Prüfen ob die Seite scrollbar ist
function isPageScrollable() {
    const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
    );
    const windowHeight = window.innerHeight;
    console.log(windowHeight)
    console.log(documentHeight)
    return documentHeight > windowHeight;
}

// Auto-Scroll Funktionen
function createScrollZones() {
    if (document.querySelector('.scroll-zone')) return;
    
    const topZone = document.createElement('div');
    topZone.className = 'scroll-zone top';
    topZone.id = 'scroll-zone-top';
    document.body.appendChild(topZone);
    
    const bottomZone = document.createElement('div');
    bottomZone.className = 'scroll-zone bottom';
    bottomZone.id = 'scroll-zone-bottom';
    document.body.appendChild(bottomZone);
}

function showScrollZones() {
    const topZone = document.getElementById('scroll-zone-top');
    const bottomZone = document.getElementById('scroll-zone-bottom');
    
    if (topZone) topZone.classList.add('active');
    if (bottomZone) bottomZone.classList.add('active');
}

function showScrollZonesIfNeeded() {
    if (isPageScrollable()) {
        createScrollZones();
        showScrollZones();
    }
}

function hideScrollZones() {
    const topZone = document.getElementById('scroll-zone-top');
    const bottomZone = document.getElementById('scroll-zone-bottom');
    
    if (topZone) topZone.classList.remove('active');
    if (bottomZone) bottomZone.classList.remove('active');
}

function removeScrollZones() {
    const zones = document.querySelectorAll('.scroll-zone');
    zones.forEach(zone => zone.remove());
}

function startAutoScroll() {
    if (autoScrollInterval) return;
    
    autoScrollInterval = setInterval(() => {
        if (!isDragging) {
            stopAutoScroll();
            return;
        }
        
        const scrollZoneSize = 100;
        const scrollSpeed = 15;
        const windowHeight = window.innerHeight;
        
        if (currentMouseY < scrollZoneSize) {
            const intensity = (scrollZoneSize - currentMouseY) / scrollZoneSize;
            window.scrollBy(0, -scrollSpeed * intensity);
        } else if (currentMouseY > windowHeight - scrollZoneSize) {
            const intensity = (currentMouseY - (windowHeight - scrollZoneSize)) / scrollZoneSize;
            window.scrollBy(0, scrollSpeed * intensity);
        }
    }, 16);
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// Globale Maus-Tracking für Auto-Scroll
document.addEventListener('dragover', function(e) {
    if (isDragging) {
        currentMouseY = e.clientY;
        
        const scrollZoneSize = 100;
        const windowHeight = window.innerHeight;
        
        if (currentMouseY < scrollZoneSize || currentMouseY > windowHeight - scrollZoneSize) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    }
});

document.addEventListener('dragend', function(e) {
    isDragging = false;
    stopAutoScroll();
    hideScrollZones();
});

// Suchfunktionen
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchModalInput = document.getElementById('searchModalInput');
    const searchOverlay = document.getElementById('searchOverlay');

    // Event Listeners für Suchleiste
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', openSearchModal);
    searchInput.addEventListener('keydown', handleSearchKeydown);

    // Event Listeners für Such-Modal
    searchModalInput.addEventListener('input', handleModalSearchInput);
    searchModalInput.addEventListener('keydown', handleModalSearchKeydown);

    // Event Listener für Overlay-Klick
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            closeSearchModal();
        }
    });

    // Globale Keyboard Shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+K oder Cmd+K öffnet Suche
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        
        // Escape schließt Suche
        if (e.key === 'Escape' && isSearchOpen) {
            closeSearchModal();
        }
    });
}

function handleSearchInput(e) {
    const query = e.target.value;
    if (query.trim()) {
        openSearchModal();
        document.getElementById('searchModalInput').value = query;
        performSearch(query);
    }
}

function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        openSearchModal();
    }
}

function handleModalSearchInput(e) {
    const query = e.target.value;
    document.getElementById('searchInput').value = query;
    performSearch(query);
}

function handleModalSearchKeydown(e) {
    switch(e.key) {
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

function openSearchModal() {
    const searchOverlay = document.getElementById('searchOverlay');
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

function closeSearchModal() {
    const searchOverlay = document.getElementById('searchOverlay');
    
    searchOverlay.classList.remove('active');
    isSearchOpen = false;
    selectedSearchIndex = -1;
    
    // Suchfelder leeren
    document.getElementById('searchInput').value = '';
    document.getElementById('searchModalInput').value = '';
    currentSearchQuery = '';
}

function performSearch(query) {
    currentSearchQuery = query.toLowerCase();
    searchResults = [];
    selectedSearchIndex = -1;

    if (!query.trim()) {
        showAllLinks();
        return;
    }

    // Durch alle Kategorien und Links suchen
    categoryOrder.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        if (!category) return;

        category.links.forEach((link, linkIndex) => {
            const titleMatch = link.title.toLowerCase().includes(currentSearchQuery);
            const descriptionMatch = link.description.toLowerCase().includes(currentSearchQuery);
            const urlMatch = link.url.toLowerCase().includes(currentSearchQuery);
            
            if (titleMatch || descriptionMatch || urlMatch) {
                searchResults.push({
                    ...link,
                    categoryKey: categoryKey,
                    categoryTitle: category.title,
                    categoryIcon: category.icon,
                    linkIndex: linkIndex,
                    relevanceScore: calculateRelevanceScore(link, currentSearchQuery)
                });
            }
        });
    });

    // Nach Relevanz sortieren
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    renderSearchResults();
}

function calculateRelevanceScore(link, query) {
    let score = 0;
    const titleLower = link.title.toLowerCase();
    const descriptionLower = link.description.toLowerCase();
    
    // Exakte Übereinstimmung im Titel hat höchste Priorität
    if (titleLower === query) score += 100;
    else if (titleLower.startsWith(query)) score += 50;
    else if (titleLower.includes(query)) score += 25;
    
    // Übereinstimmung in der Beschreibung
    if (descriptionLower.includes(query)) score += 10;
    
    // URL-Übereinstimmung
    if (link.url.toLowerCase().includes(query)) score += 5;
    
    return score;
}

function showAllLinks() {
    searchResults = [];
    
    categoryOrder.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        if (!category || category.collapsed) return;

        category.links.forEach((link, linkIndex) => {
            searchResults.push({
                ...link,
                categoryKey: categoryKey,
                categoryTitle: category.title,
                categoryIcon: category.icon,
                linkIndex: linkIndex,
                relevanceScore: 0
            });
        });
    });

    renderSearchResults();
}

function renderSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    const statsContainer = document.getElementById('searchStats');
    
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
        
        const highlightedTitle = highlightSearchTerm(result.title, currentSearchQuery);
        const highlightedDescription = highlightSearchTerm(result.description, currentSearchQuery);
        
        resultElement.innerHTML = `
            <div class="search-result-header">
                <span class="search-result-icon">${result.icon}</span>
                <div class="search-result-title">${highlightedTitle}</div>
                <div class="search-result-category">${result.categoryIcon} ${result.categoryTitle}</div>
            </div>
            <div class="search-result-description">${highlightedDescription}</div>
            <div class="search-result-url">${result.url}</div>
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

    // Statistiken aktualisieren
    const resultText = searchResults.length === 1 ? 'Ergebnis' : 'Ergebnisse';
    statsContainer.textContent = `${searchResults.length} ${resultText}`;
    
    updateSearchSelection();
}

function highlightSearchTerm(text, query) {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

function updateSearchSelection() {
    const resultElements = document.querySelectorAll('.search-result-item');
    
    resultElements.forEach((element, index) => {
        if (index === selectedSearchIndex) {
            element.classList.add('selected');
        } else {
            element.classList.remove('selected');
        }
    });
}

function scrollToSelectedResult() {
    const selectedElement = document.querySelector('.search-result-item.selected');
    if (selectedElement) {
        selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

function openSelectedSearchResult() {
    if (selectedSearchIndex >= 0 && selectedSearchIndex < searchResults.length) {
        const selectedResult = searchResults[selectedSearchIndex];
        openLink(selectedResult.url);
        closeSearchModal();
    }
}

function openLink(url) {
    window.open(url, '_blank');
}

// Hilfsfunktionen für Layout-Erkennung
function isElementInGridLayout(element) {
    const parent = element.parentElement;
    const computedStyle = window.getComputedStyle(parent);
    return computedStyle.display === 'grid' && computedStyle.gridTemplateColumns !== 'none';
}

function isCategoryInGridLayout(categoryElement) {
    const parent = categoryElement.parentElement;
    const computedStyle = window.getComputedStyle(parent);
    return (parent.classList.contains('categories-grid-section') || 
           (computedStyle.display === 'grid' && computedStyle.gridTemplateColumns !== 'none'));
}

function removeAllDragOverClasses(element) {
    element.classList.remove(
        'drag-over', 'drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right',
        'drag-over-top-left', 'drag-over-bottom-right', 'drag-over-top-right', 'drag-over-bottom-left',
        'drag-over-center', 'drag-over-before', 'drag-over-after'
    );
}

function createDropIndicator(element, position) {
    const existingIndicator = element.querySelector('.drop-indicator-line');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    const indicator = document.createElement('div');
    indicator.className = `drop-indicator-line ${position} active`;
    element.appendChild(indicator);
    
    return indicator;
}

function removeDropIndicator(element) {
    const indicator = element.querySelector('.drop-indicator-line');
    if (indicator) {
        indicator.remove();
    }
}

// Temporäre leere Kategorien anzeigen/verstecken
function showEmptyCategories() {
    if (isLinkDragActive) return;
    
    cleanupAllTemporaryElements();
    
    isLinkDragActive = true;
    tempEmptyCategories = [];
    
    categoryOrder.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        if (category && category.links.length === 0) {
            tempEmptyCategories.push(categoryKey);
        }
    });
    
    if (tempEmptyCategories.length > 0) {
        addEmptyCategoriesToDom();
    }
}

function hideEmptyCategories() {
    if (!isLinkDragActive) return;
    cleanupAllTemporaryElements();
}

function addEmptyCategoriesToDom() {
    const categoriesWrapper = document.querySelector('.categories-wrapper');
    if (!categoriesWrapper) return;
    
    const emptyGridSection = document.createElement('div');
    emptyGridSection.className = 'categories-grid-section empty-categories-section';
    
    tempEmptyCategories.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        if (!category) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category empty-category';
        categoryDiv.setAttribute('data-category-key', categoryKey);
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.innerHTML = `<span class="category-icon">${category.icon}</span> ${category.title}`;
        
        categoryHeader.appendChild(categoryTitle);
        categoryDiv.appendChild(categoryHeader);
        
        makeCategoryDroppable(categoryDiv, categoryKey);
        
        emptyGridSection.appendChild(categoryDiv);
    });
    
    if (tempEmptyCategories.length > 0) {
        categoriesWrapper.appendChild(emptyGridSection);
    }
}

// Link-Import/Export Funktionen
function exportSingleLink() {
    if (!currentContextLink) return;
    
    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];
    const category = linkCategories[categoryKey];
    
    const linkData = {
        type: 'single_link',
        version: '1.0',
        exportDate: new Date().toISOString(),
        link: {
            title: link.title,
            url: link.url,
            description: link.description,
            icon: link.icon,
            favorite: link.favorite || false
        },
        originalCategory: category.title,
        originalCategoryKey: categoryKey
    };
    
    try {
        const dataStr = JSON.stringify(linkData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link_el = document.createElement('a');
        link_el.href = url;
        
        const cleanTitle = link.title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, '').replace(/\s+/g, '-');
        link_el.download = `link-${cleanTitle}.json`;
        link_el.click();
        URL.revokeObjectURL(url);
        
        showMessage(`Link "${link.title}" erfolgreich exportiert`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Fehler beim Exportieren des Links', 'error');
    }
    
    hideContextMenu();
}

function importSingleLink(event) {
    closeMenu();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const linkData = JSON.parse(e.target.result);
            
            if (!validateSingleLink(linkData)) {
                throw new Error('Ungültige Link-Datei');
            }

            const link = linkData.link;
            const originalCategoryKey = linkData.originalCategoryKey;
            const originalCategoryTitle = linkData.originalCategory;
            
            // Favoriten-Support hinzufügen falls nicht vorhanden
            if (link.favorite === undefined) {
                link.favorite = false;
            }
            
            let targetCategoryKey = null;
            
            if (originalCategoryKey && linkCategories[originalCategoryKey]) {
                targetCategoryKey = originalCategoryKey;
            } else {
                for (const [key, category] of Object.entries(linkCategories)) {
                    if (category.title === originalCategoryTitle) {
                        targetCategoryKey = key;
                        break;
                    }
                }
            }
            
            if (targetCategoryKey) {
                linkCategories[targetCategoryKey].links.push(link);
                
                if (sortCategoriesEmptyLast()) {
                    saveConfig(true);
                } else {
                    saveConfig(true);
                }
                
                renderCategories();
                updateFavoritesCount();
                showMessage(`Link "${link.title}" erfolgreich in "${linkCategories[targetCategoryKey].title}" importiert`, 'success');
            } else {
                showCategorySelectionModal(link, originalCategoryTitle);
            }
            
        } catch (error) {
            console.error('Import error:', error);
            showMessage('Fehler beim Importieren: Ungültige Link-Datei', 'error');
        }
    };
    reader.readAsText(file);
    
    event.target.value = '';
}

function validateSingleLink(linkData) {
    if (typeof linkData !== 'object' || linkData === null) return false;
    if (linkData.type !== 'single_link') return false;
    if (!linkData.link || typeof linkData.link !== 'object') return false;
    
    const link = linkData.link;
    
    // Nur essentials prüfen
    if (!link.title || !link.url) return false;
    
    // Auto-Fix für fehlende Felder
    if (!link.description) link.description = 'Keine Beschreibung';
    if (!link.icon) link.icon = '🔗';
    if (link.favorite === undefined) link.favorite = false;
    
    // Priority → Favorite Migration
    if (link.priority !== undefined) {
        link.favorite = link.priority;
        delete link.priority;
    }
    
    return true;
}

function showCategorySelectionModal(link, originalCategoryTitle) {
    pendingLinkImport = link;
    pendingOriginalCategoryTitle = originalCategoryTitle;
    
    document.getElementById('importLinkTitle').value = link.title;
    document.getElementById('importLinkUrl').value = link.url;
    
    const messageEl = document.getElementById('categorySelectMessage');
    messageEl.textContent = `Die ursprüngliche Kategorie "${originalCategoryTitle}" wurde nicht gefunden. Wählen Sie eine Option:`;
    
    const select = document.getElementById('importLinkCategory');
    select.innerHTML = '<option value="">Option auswählen</option>';
    
    const originalCategoryOption = document.createElement('option');
    originalCategoryOption.value = '__original__';
    originalCategoryOption.textContent = `📁 Ursprüngliche Kategorie "${originalCategoryTitle}" erstellen`;
    select.appendChild(originalCategoryOption);
    
    const newCategoryOption = document.createElement('option');
    newCategoryOption.value = '__new__';
    newCategoryOption.textContent = '📝 Neue Kategorie erstellen';
    select.appendChild(newCategoryOption);
    
    const existingGroup = document.createElement('optgroup');
    existingGroup.label = 'In vorhandene Kategorie einfügen:';
    
    categoryOrder.forEach(categoryKey => {
        if (linkCategories[categoryKey]) {
            const category = linkCategories[categoryKey];
            const option = document.createElement('option');
            option.value = categoryKey;
            option.textContent = `${category.icon} ${category.title}`;
            existingGroup.appendChild(option);
        }
    });
    
    select.appendChild(existingGroup);
    
    document.getElementById('newCategoryFields').style.display = 'none';
    document.getElementById('categorySelectModal').style.display = 'block';
}

function toggleNewCategoryFields() {
    const select = document.getElementById('importLinkCategory');
    const newCategoryFields = document.getElementById('newCategoryFields');
    
    if (select.value === '__new__') {
        newCategoryFields.style.display = 'block';
        document.getElementById('newCategoryTitle').value = '';
        document.getElementById('newCategoryIcon').value = '';
        setTimeout(() => {
            document.getElementById('newCategoryTitle').focus();
        }, 100);
    } else {
        newCategoryFields.style.display = 'none';
        document.getElementById('newCategoryTitle').value = '';
        document.getElementById('newCategoryIcon').value = '';
    }
}

function closeCategorySelectModal() {
    document.getElementById('categorySelectModal').style.display = 'none';
    
    document.getElementById('importLinkCategory').value = '';
    document.getElementById('newCategoryFields').style.display = 'none';
    document.getElementById('newCategoryTitle').value = '';
    document.getElementById('newCategoryIcon').value = '';
    
    pendingLinkImport = null;
    pendingOriginalCategoryTitle = null;
}

function confirmLinkImport() {
    if (!pendingLinkImport) return;
    
    const categoryKey = document.getElementById('importLinkCategory').value;
    if (!categoryKey) {
        alert('Bitte wählen Sie eine Option aus!');
        return;
    }
    
    if (categoryKey === '__original__') {
        const originalCategoryTitle = pendingOriginalCategoryTitle;
        const newCategoryKey = originalCategoryTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        if (linkCategories[newCategoryKey]) {
            alert('Eine Kategorie mit diesem Namen existiert bereits!');
            return;
        }
        
        linkCategories[newCategoryKey] = {
            title: originalCategoryTitle,
            icon: '📁',
            collapsed: false,
            links: []
        };
        
        categoryOrder.push(newCategoryKey);
        linkCategories[newCategoryKey].links.push(pendingLinkImport);
        
        sortCategoriesEmptyLast();
        saveConfig(true);
        renderCategories();
        populateCategorySelect();
        updateFavoritesCount();
        
        showMessage(`Ursprüngliche Kategorie "${originalCategoryTitle}" erstellt und Link "${pendingLinkImport.title}" importiert`, 'success');
        
    } else if (categoryKey === '__new__') {
        const newCategoryTitle = document.getElementById('newCategoryTitle').value.trim();
        const newCategoryIcon = document.getElementById('newCategoryIcon').value.trim() || '📁';
        
        if (!newCategoryTitle) {
            alert('Bitte geben Sie einen Namen für die neue Kategorie ein!');
            return;
        }
        
        const newCategoryKey = newCategoryTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        if (linkCategories[newCategoryKey]) {
            alert('Eine Kategorie mit diesem Namen existiert bereits!');
            return;
        }
        
        linkCategories[newCategoryKey] = {
            title: newCategoryTitle,
            icon: newCategoryIcon,
            collapsed: false,
            links: []
        };
        
        categoryOrder.push(newCategoryKey);
        linkCategories[newCategoryKey].links.push(pendingLinkImport);
        
        sortCategoriesEmptyLast();
        saveConfig(true);
        renderCategories();
        populateCategorySelect();
        updateFavoritesCount();
        
        showMessage(`Neue Kategorie "${newCategoryTitle}" erstellt und Link "${pendingLinkImport.title}" importiert`, 'success');
        
    } else {
        linkCategories[categoryKey].links.push(pendingLinkImport);
        
        sortCategoriesEmptyLast();
        saveConfig(true);
        renderCategories();
        updateFavoritesCount();
        
        const categoryTitle = linkCategories[categoryKey].title;
        showMessage(`Link "${pendingLinkImport.title}" erfolgreich in "${categoryTitle}" importiert`, 'success');
    }
    
    closeCategorySelectModal();
}

// Konfiguration als JSON exportieren
function exportConfig() {
    closeMenu();
    try {
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'meine-links-config.json';
        link.click();
        URL.revokeObjectURL(url);
        showMessage('Konfiguration erfolgreich exportiert', 'success');
    } catch (error) {
        showMessage('Fehler beim Exportieren der Konfiguration', 'error');
    }
}

// Konfiguration aus JSON importieren
function importConfig(event) {
    closeMenu();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedConfig = JSON.parse(e.target.result);
            
            if (!validateConfig(importedConfig)) {
                throw new Error('Ungültige Konfiguration');
            }

            if (confirm('Möchten Sie die aktuelle Konfiguration ersetzen?')) {
                if (importedConfig.categories) {
                    config = importedConfig;
                    linkCategories = config.categories;
                    categoryOrder = config.categoryOrder || Object.keys(linkCategories);
                } else {
                    linkCategories = importedConfig;
                    categoryOrder = Object.keys(linkCategories);
                    config = { categories: linkCategories, categoryOrder: categoryOrder };
                }
                
                // Favoriten-Support hinzufügen
                addFavoritesSupportToLinks();
                
                Object.keys(linkCategories).forEach(categoryKey => {
                    if (linkCategories[categoryKey].collapsed === undefined) {
                        linkCategories[categoryKey].collapsed = false;
                    }
                });
                
                const existingKeys = Object.keys(linkCategories);
                const missingKeys = existingKeys.filter(key => !categoryOrder.includes(key));
                if (missingKeys.length > 0) {
                    categoryOrder = [...categoryOrder, ...missingKeys];
                }
                
                categoryOrder = categoryOrder.filter(key => linkCategories[key]);
                
                sortCategoriesEmptyLast();
                
                saveConfig(true);
                renderCategories();
                updateFavoritesCount();
                showMessage('Konfiguration erfolgreich importiert', 'success');
            }
        } catch (error) {
            console.error('Import error:', error);
            showMessage('Fehler beim Importieren: Ungültige JSON-Datei', 'error');
        }
    };
    reader.readAsText(file);
    
    event.target.value = '';
}

// Konfiguration validieren
function validateConfig(config) {
    if (typeof config !== 'object' || config === null) return false;
    
    let categories = config.categories || config;
    
    for (const [key, category] of Object.entries(categories)) {
        if (!category?.title || !Array.isArray(category?.links)) return false;
        
        for (const link of category.links) {
            if (!link?.title || !link?.url) return false;
            
            // Auto-Fix für fehlende Felder
            if (!link.description) link.description = '';
            if (!link.icon) link.icon = '🔗';
            if (link.favorite === undefined) link.favorite = false;
            
            // Priority → Favorite Migration
            if (link.priority !== undefined) {
                link.favorite = link.priority;
                delete link.priority;
            }
        }
        
        // Auto-Fix für Kategorie
        if (!category.icon) category.icon = '📁';
        if (category.collapsed === undefined) category.collapsed = false;
    }
    
    return true;
}

// Auf Standard zurücksetzen
function resetToDefault() {
    closeMenu();
    if (confirm('Möchten Sie wirklich alle Änderungen verwerfen und zur Standard-Konfiguration zurückkehren?')) {
        // Prüfen ob Standard-Konfiguration aus default-config.js verfügbar ist
        const configToUse = window.DEFAULT_CONFIG || fallbackDefaultConfig;
        config = JSON.parse(JSON.stringify(configToUse));
        linkCategories = config.categories;
        categoryOrder = config.categoryOrder;
        
        // Favoriten-Support hinzufügen
        addFavoritesSupportToLinks();
        
        saveConfig(true);
        renderCategories();
        updateFavoritesCount();
        showMessage('Auf Standard-Konfiguration zurückgesetzt', 'success');
    }
}

// =============================================================================
// VOLLSTÄNDIGE DRAG AND DROP FUNKTIONALITÄT
// =============================================================================

// Drag and Drop Funktionalität für Kategorien
function makeCategoryDraggable(categoryElement, categoryKey) {
    const dragHandle = categoryElement.querySelector('.drag-handle');
    
    dragHandle.draggable = true;
    dragHandle.addEventListener('dragstart', handleCategoryDragStart);
    dragHandle.addEventListener('dragend', handleCategoryDragEnd);
    
    categoryElement.addEventListener('dragover', handleCategoryDragOver);
    categoryElement.addEventListener('drop', handleCategoryDrop);
    categoryElement.addEventListener('dragenter', handleCategoryDragEnter);
    categoryElement.addEventListener('dragleave', handleCategoryDragLeave);
    
    categoryElement.setAttribute('data-category-key', categoryKey);
    dragHandle.setAttribute('data-category-key', categoryKey);
}

function handleCategoryDragStart(e) {
    draggedElement = this.closest('.category');
    draggedCategoryKey = this.getAttribute('data-category-key');
    draggedElement.classList.add('dragging');
    
    isDragging = true;
    showScrollZonesIfNeeded();
    
    this.classList.add('active');
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.outerHTML);
    
    const categoryClone = draggedElement.cloneNode(true);
    categoryClone.style.transform = 'rotate(5deg)';
    categoryClone.style.opacity = '0.8';
    categoryClone.style.pointerEvents = 'none';
    categoryClone.style.position = 'absolute';
    categoryClone.style.top = '-1000px';
    categoryClone.style.left = '-1000px';
    categoryClone.style.zIndex = '1000';
    categoryClone.style.maxWidth = '300px';
    document.body.appendChild(categoryClone);
    
    e.dataTransfer.setDragImage(categoryClone, 150, 50);
    
    setTimeout(() => {
        if (document.body.contains(categoryClone)) {
            document.body.removeChild(categoryClone);
        }
    }, 100);
}

function handleCategoryDragEnd(e) {
    const categoryElement = this.closest('.category');
    const dragHandle = this;
    
    categoryElement.classList.remove('dragging');
    dragHandle.classList.remove('active');
    
    isDragging = false;
    stopAutoScroll();
    hideScrollZones();
    setTimeout(removeScrollZones, 300);
    
    cleanupDragAndDrop();
    
    if (dragStabilityTimeout) {
        clearTimeout(dragStabilityTimeout);
        dragStabilityTimeout = null;
    }
    
    draggedElement = null;
    draggedCategoryKey = null;
    dragOverElement = null;
    dropPosition = null;
    currentDropIndicator = null;
}

function handleCategoryDragOver(e) {
    if (draggedCategoryKey && !draggedLinkData) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (this !== draggedElement) {
            if (dragStabilityTimeout) {
                clearTimeout(dragStabilityTimeout);
            }
            
            const currentElement = this;
            
            dragStabilityTimeout = setTimeout(() => {
                document.querySelectorAll('.category').forEach(cat => {
                    if (cat !== currentElement) {
                        removeAllDragOverClasses(cat);
                        removeDropIndicator(cat);
                    }
                });
                
                const isInGrid = isCategoryInGridLayout(currentElement);
                const rect = currentElement.getBoundingClientRect();
                
                if (isInGrid) {
                    const mouseX = e.clientX - rect.left;
                    const elementWidth = rect.width;
                    
                    if (mouseX < elementWidth * 0.5) {
                        currentElement.classList.add('drag-over-before');
                        createDropIndicator(currentElement, 'left');
                        dropPosition = 'before';
                    } else {
                        currentElement.classList.add('drag-over-after');
                        createDropIndicator(currentElement, 'right');
                        dropPosition = 'after';
                    }
                } else {
                    const mouseY = e.clientY - rect.top;
                    const elementHeight = rect.height;
                    
                    if (mouseY < elementHeight * 0.5) {
                        currentElement.classList.add('drag-over-before');
                        createDropIndicator(currentElement, 'before');
                        dropPosition = 'before';
                    } else {
                        currentElement.classList.add('drag-over-after');
                        createDropIndicator(currentElement, 'after');
                        dropPosition = 'after';
                    }
                }
                
                dragOverElement = currentElement;
            }, 50);
        }
        
        return false;
    }
}

function handleCategoryDragEnter(e) {
    if (draggedCategoryKey && !draggedLinkData && this !== draggedElement) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!dragStabilityTimeout) {
            dragOverElement = this;
            
            const rect = this.getBoundingClientRect();
            const isInGrid = isCategoryInGridLayout(this);
            
            if (isInGrid) {
                this.classList.add('drag-over-before');
                createDropIndicator(this, 'left');
                dropPosition = 'before';
            } else {
                this.classList.add('drag-over-after');
                createDropIndicator(this, 'after');
                dropPosition = 'after';
            }
        }
    }
}

function handleCategoryDragLeave(e) {
    if (draggedCategoryKey && !draggedLinkData) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        if (x < rect.left - 15 || x > rect.right + 15 || y < rect.top - 15 || y > rect.bottom + 15) {
            setTimeout(() => {
                const currentRect = this.getBoundingClientRect();
                const currentX = e.clientX;
                const currentY = e.clientY;
                
                if (currentX < currentRect.left - 15 || currentX > currentRect.right + 15 || 
                    currentY < currentRect.top - 15 || currentY > currentRect.bottom + 15) {
                    removeAllDragOverClasses(this);
                    removeDropIndicator(this);
                    
                    if (dragOverElement === this) {
                        dragOverElement = null;
                        dropPosition = null;
                    }
                }
            }, 100);
        }
    }
}

function handleCategoryDrop(e) {
    if (draggedCategoryKey && !draggedLinkData) {
        e.preventDefault();
        e.stopPropagation();

        const targetCategoryKey = this.getAttribute('data-category-key');
        
        if (draggedElement && draggedElement !== this && targetCategoryKey) {
            const draggedIndex = categoryOrder.indexOf(draggedCategoryKey);
            const targetIndex = categoryOrder.indexOf(targetCategoryKey);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
                categoryOrder.splice(draggedIndex, 1);
                
                let newIndex = targetIndex;
                
                if (draggedIndex < targetIndex) {
                    newIndex--;
                }
                
                if (dropPosition === 'before') {
                    categoryOrder.splice(newIndex, 0, draggedCategoryKey);
                } else if (dropPosition === 'after') {
                    categoryOrder.splice(newIndex + 1, 0, draggedCategoryKey);
                }
                
                saveConfig(true);
                renderCategories();
                
                showMessage('Kategorie-Reihenfolge aktualisiert', 'success');
            }
        }

        removeAllDragOverClasses(this);
        removeDropIndicator(this);
        dragOverElement = null;
        dropPosition = null;
        return false;
    }
}

// Drag and Drop Funktionalität für Links
function makeLinkDraggable(linkElement, categoryKey, linkIndex) {
    const linkDragHandle = linkElement.querySelector('.link-drag-handle');
    
    linkDragHandle.draggable = true;
    linkDragHandle.addEventListener('dragstart', handleLinkDragStart);
    linkDragHandle.addEventListener('dragend', handleLinkDragEnd);
    
    linkElement.setAttribute('data-category-key', categoryKey);
    linkElement.setAttribute('data-link-index', linkIndex);
    linkDragHandle.setAttribute('data-category-key', categoryKey);
    linkDragHandle.setAttribute('data-link-index', linkIndex);
}

function makeLinkDroppable(linkElement, categoryKey, linkIndex) {
    linkElement.addEventListener('dragover', handleLinkDragOver);
    linkElement.addEventListener('drop', handleLinkDrop);
    linkElement.addEventListener('dragenter', handleLinkDragEnter);
    linkElement.addEventListener('dragleave', handleLinkDragLeave);
    
    linkElement.setAttribute('data-category-key', categoryKey);
    linkElement.setAttribute('data-link-index', linkIndex);
}

function makeCategoryDroppable(categoryElement, categoryKey) {
    categoryElement.removeEventListener('dragover', handleCategoryLinkDragOver);
    categoryElement.removeEventListener('drop', handleCategoryLinkDrop);
    categoryElement.removeEventListener('dragenter', handleCategoryLinkDragEnter);
    categoryElement.removeEventListener('dragleave', handleCategoryLinkDragLeave);
    
    categoryElement.addEventListener('dragover', handleCategoryLinkDragOver);
    categoryElement.addEventListener('drop', handleCategoryLinkDrop);
    categoryElement.addEventListener('dragenter', handleCategoryLinkDragEnter);
    categoryElement.addEventListener('dragleave', handleCategoryLinkDragLeave);
}

function handleLinkDragStart(e) {
    const categoryKey = this.getAttribute('data-category-key');
    const linkIndex = parseInt(this.getAttribute('data-link-index'));
    
    document.querySelectorAll('.category').forEach(cat => {
        cat.classList.remove('link-drag-over');
    });
    document.querySelectorAll('.link-item').forEach(link => {
        removeAllDragOverClasses(link);
    });
    
    draggedLinkElement = this.closest('.link-item');
    draggedLinkData = {
        categoryKey: categoryKey,
        linkIndex: linkIndex,
        linkData: linkCategories[categoryKey].links[linkIndex]
    };
    
    isDragging = true;
    showScrollZonesIfNeeded();
    
    draggedLinkElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedLinkElement.outerHTML);
    
    const linkClone = draggedLinkElement.cloneNode(true);
    linkClone.style.transform = 'rotate(5deg)';
    linkClone.style.opacity = '0.8';
    linkClone.style.pointerEvents = 'none';
    linkClone.style.position = 'absolute';
    linkClone.style.top = '-1000px';
    linkClone.style.left = '-1000px';
    linkClone.style.zIndex = '1000';
    linkClone.style.maxWidth = '280px';
    document.body.appendChild(linkClone);
    
    e.dataTransfer.setDragImage(linkClone, 140, 30);
    
    setTimeout(() => {
        if (document.body.contains(linkClone)) {
            document.body.removeChild(linkClone);
        }
    }, 100);
    
    showEmptyCategories();
    
    e.stopPropagation();
}

function cleanupDragAndDrop() {
    cleanupAllTemporaryElements();
    
    document.querySelectorAll('.category').forEach(cat => {
        cat.classList.remove('link-drag-over');
        removeAllDragOverClasses(cat);
        removeDropIndicator(cat);
    });
    
    document.querySelectorAll('.link-item').forEach(link => {
        removeAllDragOverClasses(link);
    });
}

function handleLinkDragEnd(e) {
    if (draggedLinkElement) {
        draggedLinkElement.classList.remove('dragging');
    }
    
    isDragging = false;
    stopAutoScroll();
    hideScrollZones();
    setTimeout(removeScrollZones, 300);
    
    cleanupDragAndDrop();
    
    draggedLinkElement = null;
    draggedLinkData = null;
    dragOverElement = null;
    dropPosition = null;
}

function handleLinkDragOver(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        const targetLinkIndex = parseInt(this.getAttribute('data-link-index'));
        
        if (targetCategoryKey !== draggedLinkData.categoryKey) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const categoryElement = this.closest('.category');
            if (categoryElement) {
                document.querySelectorAll('.category').forEach(cat => {
                    if (cat !== categoryElement) {
                        cat.classList.remove('link-drag-over');
                    }
                });
                
                categoryElement.classList.add('link-drag-over');
            }
            
            return true;
        } else if (targetLinkIndex !== draggedLinkData.linkIndex) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            
            document.querySelectorAll('.category').forEach(cat => {
                cat.classList.remove('link-drag-over');
            });
            
            removeAllDragOverClasses(this);
            
            const isInGrid = isElementInGridLayout(this);
            const rect = this.getBoundingClientRect();
            
            if (isInGrid) {
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const elementWidth = rect.width;
                const elementHeight = rect.height;
                
                const inSameRow = areElementsInSameRow(this, draggedLinkElement);
                
                if (inSameRow) {
                    if (mouseX < elementWidth * 0.3) {
                        this.classList.add('drag-over-top-left');
                        dropPosition = 'before';
                    } else if (mouseX > elementWidth * 0.7) {
                        this.classList.add('drag-over-bottom-right');
                        dropPosition = 'after';
                    } else {
                        this.classList.add('drag-over-center');
                        dropPosition = 'replace';
                    }
                } else {
                    if (mouseY < elementHeight * 0.3) {
                        this.classList.add('drag-over-top-left');
                        dropPosition = 'before';
                    } else if (mouseY > elementHeight * 0.7) {
                        this.classList.add('drag-over-bottom-right');
                        dropPosition = 'after';
                    } else {
                        this.classList.add('drag-over-center');
                        dropPosition = 'replace';
                    }
                }
            } else {
                const mouseY = e.clientY - rect.top;
                const elementHeight = rect.height;
                
                if (mouseY < elementHeight * 0.3) {
                    this.classList.add('drag-over-top-left');
                    dropPosition = 'before';
                } else if (mouseY > elementHeight * 0.7) {
                    this.classList.add('drag-over-bottom-right');
                    dropPosition = 'after';
                } else {
                    this.classList.add('drag-over-center');
                    dropPosition = 'replace';
                }
            }
            
            dragOverElement = this;
            return false;
        }
    }
}

function handleLinkDragEnter(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        
        if (targetCategoryKey !== draggedLinkData.categoryKey) {
            e.preventDefault();
            
            const categoryElement = this.closest('.category');
            if (categoryElement) {
                document.querySelectorAll('.category').forEach(cat => {
                    if (cat !== categoryElement) {
                        cat.classList.remove('link-drag-over');
                    }
                });
                
                categoryElement.classList.add('link-drag-over');
            }
        } else {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

function handleLinkDragLeave(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        
        if (targetCategoryKey === draggedLinkData.categoryKey) {
            if (!this.contains(e.relatedTarget)) {
                removeAllDragOverClasses(this);
                
                if (dragOverElement === this) {
                    dragOverElement = null;
                    dropPosition = null;
                }
            }
        }
    }
}

function handleLinkDrop(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        const targetLinkIndex = parseInt(this.getAttribute('data-link-index'));
        
        if (targetCategoryKey === draggedLinkData.categoryKey && 
            targetLinkIndex !== draggedLinkData.linkIndex) {
            e.preventDefault();
            e.stopPropagation();
            
            const category = linkCategories[targetCategoryKey];
            const linkToMove = category.links[draggedLinkData.linkIndex];
            
            category.links.splice(draggedLinkData.linkIndex, 1);
            
            let newIndex = targetLinkIndex;
            
            if (draggedLinkData.linkIndex < targetLinkIndex) {
                newIndex--;
            }
            
            if (dropPosition === 'before') {
                category.links.splice(newIndex, 0, linkToMove);
            } else if (dropPosition === 'after') {
                category.links.splice(newIndex + 1, 0, linkToMove);
            } else if (dropPosition === 'replace') {
                category.links.splice(newIndex, 0, linkToMove);
            }
            
            cleanupAllTemporaryElements();
            
            saveConfig(true);
            renderCategories();
            
            showMessage(`Link "${linkToMove.title}" neu positioniert`, 'success');
        }
        
        removeAllDragOverClasses(this);
        dragOverElement = null;
        dropPosition = null;
        
        return false;
    }
}

function handleCategoryLinkDragOver(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        
        if (targetCategoryKey !== draggedLinkData.categoryKey) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            
            document.querySelectorAll('.category').forEach(cat => {
                if (cat !== this) {
                    cat.classList.remove('link-drag-over');
                }
            });
            
            this.classList.add('link-drag-over');
            
            return false;
        }
    }
}

function handleCategoryLinkDragEnter(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        e.preventDefault();
        e.stopPropagation();
        const targetCategoryKey = this.getAttribute('data-category-key');
        
        if (targetCategoryKey && targetCategoryKey !== draggedLinkData.categoryKey) {
            document.querySelectorAll('.category').forEach(cat => {
                if (cat !== this) {
                    cat.classList.remove('link-drag-over');
                }
            });
            
            this.classList.add('link-drag-over');
        }
    }
}

function handleCategoryLinkDragLeave(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        if (x < rect.left - 10 || x > rect.right + 10 || y < rect.top - 10 || y > rect.bottom + 10) {
            setTimeout(() => {
                const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
                const linkUnderMouse = elementUnderMouse?.closest('.link-item');
                const categoryUnderMouse = elementUnderMouse?.closest('.category[data-category-key]');
                
                if (!categoryUnderMouse || categoryUnderMouse !== this) {
                    this.classList.remove('link-drag-over');
                }
            }, 50);
        }
    }
}

function handleCategoryLinkDrop(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetCategoryKey = this.getAttribute('data-category-key');
        
        if (targetCategoryKey && targetCategoryKey !== draggedLinkData.categoryKey) {
            const sourceCategory = linkCategories[draggedLinkData.categoryKey];
            const sourceCategoryKey = draggedLinkData.categoryKey;
            const linkToMove = sourceCategory.links.splice(draggedLinkData.linkIndex, 1)[0];
            
            linkCategories[targetCategoryKey].links.push(linkToMove);
            
            cleanupAllTemporaryElements();
            this.classList.remove('link-drag-over');
            
            if (sourceCategory.links.length === 0) {
                showEmptyCategoryModal({
                    action: 'move',
                    linkTitle: linkToMove.title,
                    sourceTitle: sourceCategory.title,
                    targetTitle: linkCategories[targetCategoryKey].title,
                    sourceCategoryKey: sourceCategoryKey
                });
            } else {
                const sourceTitle = sourceCategory.title;
                const targetTitle = linkCategories[targetCategoryKey].title;
                showMessage(`Link "${linkToMove.title}" von "${sourceTitle}" zu "${targetTitle}" verschoben`, 'success');
                
                sortCategoriesEmptyLast();
                
                saveConfig(true);
                renderCategories();
            }
        } else {
            this.classList.remove('link-drag-over');
        }
        
        return false;
    }
}

function areElementsInSameRow(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return Math.abs(rect1.top - rect2.top) < 10;
}

function cleanupAllTemporaryElements() {
    document.querySelectorAll('.category.empty-category').forEach(categoryElement => {
        categoryElement.remove();
    });
    
    document.querySelectorAll('.empty-categories-section').forEach(section => {
        section.remove();
    });
    
    document.querySelectorAll('.scroll-zone').forEach(zone => {
        zone.remove();
    });
    
    isLinkDragActive = false;
    tempEmptyCategories = [];
    
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
    
    if (isDragging) {
        isDragging = false;
    }
}

// Touch-Events für mobile Geräte
let touchStartY = 0;
let touchStartX = 0;
let isTouching = false;

function handleTouchStart(e) {
    if (e.target.classList.contains('drag-handle')) {
        isTouching = true;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        draggedElement = e.target.closest('.category');
        draggedCategoryKey = e.target.getAttribute('data-category-key');
        draggedElement.classList.add('dragging');
        
        e.preventDefault();
    }
}

function handleTouchMove(e) {
    if (!isTouching || !draggedElement) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const currentY = touch.clientY;
    
    const elementBelow = document.elementFromPoint(touch.clientX, currentY);
    const categoryBelow = elementBelow?.closest('.category');
    
    document.querySelectorAll('.category').forEach(cat => {
        removeAllDragOverClasses(cat);
        removeDropIndicator(cat);
    });
    
    if (categoryBelow && categoryBelow !== draggedElement) {
        categoryBelow.classList.add('drag-over-after');
        createDropIndicator(categoryBelow, 'after');
    }
}

function handleTouchEnd(e) {
    if (!isTouching || !draggedElement) return;
    
    isTouching = false;
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const categoryBelow = elementBelow?.closest('.category');
    
    if (categoryBelow && categoryBelow !== draggedElement) {
        const targetCategoryKey = categoryBelow.getAttribute('data-category-key');
        
        const draggedIndex = categoryOrder.indexOf(draggedCategoryKey);
        const targetIndex = categoryOrder.indexOf(targetCategoryKey);
        
        categoryOrder.splice(draggedIndex, 1);
        categoryOrder.splice(targetIndex, 0, draggedCategoryKey);
        
        saveConfig(true);
        renderCategories();
        
        showMessage('Kategorie-Reihenfolge aktualisiert', 'success');
    }
    
    draggedElement.classList.remove('dragging');
    
    document.querySelectorAll('.category').forEach(cat => {
        removeAllDragOverClasses(cat);
        removeDropIndicator(cat);
    });
    
    draggedElement = null;
    draggedCategoryKey = null;
}

// Menü-Funktionalität
function toggleMenu() {
    const submenu = document.getElementById('menuSubmenu');
    const menuButton = document.getElementById('mainMenuButton');
    
    if (submenu.classList.contains('active')) {
        submenu.classList.remove('active');
        menuButton.classList.remove('active');
    } else {
        submenu.classList.add('active');
        menuButton.classList.add('active');
    }
}

function closeMenu() {
    const submenu = document.getElementById('menuSubmenu');
    const menuButton = document.getElementById('mainMenuButton');
    submenu.classList.remove('active');
    menuButton.classList.remove('active');
}

// Kontextmenü-Funktionen
function showContextMenu(event, categoryKey, linkIndex) {
    event.preventDefault();
    event.stopPropagation();
    
    const contextMenu = document.getElementById('contextMenu');
    currentContextLink = { categoryKey, linkIndex };
    
    // Favoriten-Option aktualisieren
    updateContextMenuFavoriteOption();
    
    const rect = contextMenu.getBoundingClientRect();
    let x = event.clientX;
    let y = event.clientY;
    
    if (x + 200 > window.innerWidth) {
        x = window.innerWidth - 200;
    }
    if (y + 100 > window.innerHeight) {
        y = window.innerHeight - 100;
    }
    
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
    
    return false;
}

function showCategoryContextMenu(event, categoryKey) {
    event.preventDefault();
    event.stopPropagation();
    
    const categoryContextMenu = document.getElementById('categoryContextMenu');
    currentContextCategory = categoryKey;
    
    let x = event.clientX;
    let y = event.clientY;
    
    if (x + 200 > window.innerWidth) {
        x = window.innerWidth - 200;
    }
    if (y + 100 > window.innerHeight) {
        y = window.innerHeight - 100;
    }
    
    categoryContextMenu.style.left = x + 'px';
    categoryContextMenu.style.top = y + 'px';
    categoryContextMenu.style.display = 'block';
    
    return false;
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    const categoryContextMenu = document.getElementById('categoryContextMenu');
    contextMenu.style.display = 'none';
    categoryContextMenu.style.display = 'none';
    currentContextLink = null;
    currentContextCategory = null;
}

function editLink() {
    if (!currentContextLink) return;
    
    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];
    
    isEditMode = true;
    currentEditingLink = { categoryKey, linkIndex };
    
    document.getElementById('linkCategory').value = categoryKey;
    document.getElementById('linkTitle').value = link.title;
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkDescription').value = link.description;
    document.getElementById('linkIcon').value = link.icon;
    document.getElementById('linkFavorite').checked = link.favorite || false;
    
    document.querySelector('#linkModal h2').textContent = 'Link bearbeiten';
    document.querySelector('#linkModal .btn-primary').textContent = 'Speichern';
    
    document.getElementById('linkCategoryGroup').style.display = 'none';
    document.getElementById('linkCategory').removeAttribute('required');
    
    hideContextMenu();
    populateCategorySelect();
    document.getElementById('linkModal').style.display = 'block';
    
    // WICHTIG: UI nach dem Setzen der Werte aktualisieren
    setTimeout(() => {
        updateFavoritesCheckboxUI();
    }, 50);
}


function deleteLink() {
    if (!currentContextLink) return;
    
    const { categoryKey, linkIndex } = currentContextLink;
    const link = linkCategories[categoryKey].links[linkIndex];
    const category = linkCategories[categoryKey];
    
    if (confirm(`Möchten Sie den Link "${link.title}" wirklich löschen?`)) {
        linkCategories[categoryKey].links.splice(linkIndex, 1);
        
        if (category.links.length === 0) {
            showEmptyCategoryModal({
                action: 'delete',
                linkTitle: link.title,
                sourceTitle: category.title,
                sourceCategoryKey: categoryKey
            });
        } else {
            sortCategoriesEmptyLast();
            showMessage('Link erfolgreich gelöscht', 'success');
            
            saveConfig(true);
            renderCategories();
            updateFavoritesCount();
        }
    }
    
    hideContextMenu();
}

// Kategorie-Verwaltung
function editCategory() {
    if (!currentContextCategory) return;
    
    const category = linkCategories[currentContextCategory];
    
    isCategoryEditMode = true;
    currentEditingCategory = currentContextCategory;
    
    document.getElementById('categoryTitle').value = category.title;
    document.getElementById('categoryIcon').value = category.icon;
    
    document.querySelector('#categoryModal h2').textContent = 'Kategorie bearbeiten';
    document.querySelector('#categoryModal .btn-primary').textContent = 'Speichern';
    
    hideContextMenu();
    document.getElementById('categoryModal').style.display = 'block';
}

function deleteCategory() {
    if (!currentContextCategory) return;
    
    const category = linkCategories[currentContextCategory];
    const linkCount = category.links.length;
    
    let confirmMessage = `Möchten Sie die Kategorie "${category.title}" wirklich löschen?`;
    if (linkCount > 0) {
        confirmMessage += `\n\nWichtig: Diese Kategorie enthält ${linkCount} Link${linkCount > 1 ? 's' : ''}. Diese werden ebenfalls gelöscht!`;
    }
    
    if (confirm(confirmMessage)) {
        delete linkCategories[currentContextCategory];
        categoryOrder = categoryOrder.filter(key => key !== currentContextCategory);
        
        saveConfig(true);
        renderCategories();
        updateFavoritesCount();
        showMessage('Kategorie erfolgreich gelöscht', 'success');
    }
    
    hideContextMenu();
}

function openCategoryModal() {
    closeMenu();
    
    if (!isCategoryEditMode) {
        document.querySelector('#categoryModal h2').textContent = 'Neue Kategorie erstellen';
        document.querySelector('#categoryModal .btn-primary').textContent = 'Erstellen';
        document.getElementById('categoryForm').reset();
        currentEditingCategory = null;
    }
    
    document.getElementById('categoryModal').style.display = 'block';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();
    
    isCategoryEditMode = false;
    currentEditingCategory = null;
    document.querySelector('#categoryModal h2').textContent = 'Neue Kategorie erstellen';
    document.querySelector('#categoryModal .btn-primary').textContent = 'Erstellen';
}

function openModal() {
    closeMenu();
    
    if (!isEditMode) {
        document.querySelector('#linkModal h2').textContent = 'Neuen Link hinzufügen';
        document.querySelector('#linkModal .btn-primary').textContent = 'Hinzufügen';
        document.getElementById('linkForm').reset();
        currentEditingLink = null;
        
        document.getElementById('linkCategoryGroup').style.display = 'block';
        document.getElementById('linkCategory').setAttribute('required', 'required');
        
        // WICHTIG: Favoriten-Checkbox zurücksetzen
        document.getElementById('linkFavorite').checked = false;
        updateFavoritesCheckboxUI();
    }
    
    populateCategorySelect();
    document.getElementById('linkModal').style.display = 'block';
    
    // Nach dem Öffnen nochmal aktualisieren
    setTimeout(() => {
        updateFavoritesCheckboxUI();
    }, 50);
}

function closeModal() {
    document.getElementById('linkModal').style.display = 'none';
    document.getElementById('linkForm').reset();
    
    document.getElementById('linkCategoryGroup').style.display = 'block';
    document.getElementById('linkCategory').setAttribute('required', 'required');
    
    isEditMode = false;
    currentEditingLink = null;
    document.querySelector('#linkModal h2').textContent = 'Neuen Link hinzufügen';
    document.querySelector('#linkModal .btn-primary').textContent = 'Hinzufügen';
    
    // WICHTIG: Favoriten-Checkbox zurücksetzen
    document.getElementById('linkFavorite').checked = false;
    updateFavoritesCheckboxUI();
}

function populateCategorySelect() {
    const select = document.getElementById('linkCategory');
    select.innerHTML = '<option value="">Kategorie auswählen</option>';
    
    categoryOrder.forEach(categoryKey => {
        if (linkCategories[categoryKey]) {
            const category = linkCategories[categoryKey];
            const option = document.createElement('option');
            option.value = categoryKey;
            option.textContent = category.title;
            select.appendChild(option);
        }
    });
}

function cleanupEventListeners() {
    document.querySelectorAll('.link-drag-handle').forEach(handle => {
        handle.removeEventListener('dragstart', handleLinkDragStart);
        handle.removeEventListener('dragend', handleLinkDragEnd);
    });
}

function renderCategories() {
    cleanupEventListeners(); // Aufräumen

    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';

    cleanupAllTemporaryElements();

    const categoriesWrapper = document.createElement('div');
    categoriesWrapper.className = 'categories-wrapper';

    let currentGridSection = null;
    
    categoryOrder.forEach(categoryKey => {
        const category = linkCategories[categoryKey];
        
        if (category && category.links.length > 0) {
            const isLargeCategory = category.links.length >= 4 && !category.collapsed;
            
            if (isLargeCategory) {
                currentGridSection = null;
                
                const categoryDiv = createCategoryElement(categoryKey, category);
                categoriesWrapper.appendChild(categoryDiv);
                
            } else {
                if (!currentGridSection) {
                    currentGridSection = document.createElement('div');
                    currentGridSection.className = 'categories-grid-section';
                    categoriesWrapper.appendChild(currentGridSection);
                }
                
                const categoryDiv = createCategoryElement(categoryKey, category);
                currentGridSection.appendChild(categoryDiv);
            }
        }
    });

    container.appendChild(categoriesWrapper);
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function createCategoryElement(categoryKey, category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    
    if (category.collapsed) {
        categoryDiv.classList.add('collapsed');
    }
    
    if (category.links.length >= 4) {
        categoryDiv.classList.add('has-many-items');
    }
    
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    
    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'category-title';
    categoryTitle.innerHTML = `<span class="category-icon">${category.icon}</span> ${category.title}`;
    
    categoryTitle.addEventListener('click', () => {
        toggleCategoryCollapsed(categoryKey);
    });
    
    categoryTitle.addEventListener('contextmenu', (e) => {
        showCategoryContextMenu(e, categoryKey);
    });
    
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.title = 'Kategorie verschieben';
    
    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(dragHandle);
    
    const linkGrid = document.createElement('div');
    linkGrid.className = 'link-grid';
    
    if (category.links.length >= 4) {
        linkGrid.classList.add('many-items');
    }
    
    if (!category.collapsed) {
        category.links.forEach((link, linkIndex) => {
            const linkElement = document.createElement('div');
            linkElement.className = 'link-item draggable';
            
            // Favoriten-Stern hinzufügen falls es ein Favorit ist
            const favoriteStarHTML = link.favorite ? '<div class="link-favorite-star">⭐</div>' : '';
            
            linkElement.innerHTML = `
                <div class="link-header">
                    <span class="link-icon">${link.icon}</span>
                    <div class="link-title">${link.title}</div>
                </div>
                <div class="link-description">${link.description}</div>
                <div class="link-drag-handle" title="Link verschieben">⋮⋮</div>
                ${favoriteStarHTML}
            `;
            
            linkElement.addEventListener('contextmenu', (e) => {
                showContextMenu(e, categoryKey, linkIndex);
            });
            
            linkElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('link-drag-handle')) {
                    window.open(link.url, '_blank');
                }
            });
            
            const dragHandle = linkElement.querySelector('.link-drag-handle');
            dragHandle.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
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

// Form Event Handlers
document.getElementById('linkForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    const description = document.getElementById('linkDescription').value;
    const icon = document.getElementById('linkIcon').value.trim() || '🔗';
    const favorite = document.getElementById('linkFavorite').checked;
    
    if (isEditMode && currentEditingLink) {
        const { categoryKey, linkIndex } = currentEditingLink;
        linkCategories[categoryKey].links[linkIndex] = { title, url, description, icon, favorite };
        saveConfig(true);
        showMessage('Link erfolgreich bearbeitet', 'success');
        renderCategories();
        updateFavoritesCount();
        closeModal();
    } else {
        const category = document.getElementById('linkCategory').value;
        
        if (!category) {
            alert('Bitte wähle eine Kategorie aus!');
            return;
        }
        
        linkCategories[category].links.push({ title, url, description, icon, favorite });
        
        sortCategoriesEmptyLast();
        
        saveConfig(true);
        showMessage('Link erfolgreich hinzugefügt', 'success');
        renderCategories();
        updateFavoritesCount();
        closeModal();
    }
});

document.getElementById('categoryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('categoryTitle').value;
    const icon = document.getElementById('categoryIcon').value.trim() || '📁';
    
    if (isCategoryEditMode && currentEditingCategory) {
        linkCategories[currentEditingCategory].title = title;
        linkCategories[currentEditingCategory].icon = icon;
        saveConfig(true);
        showMessage('Kategorie erfolgreich bearbeitet', 'success');
    } else {
        const categoryKey = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        if (linkCategories[categoryKey]) {
            alert('Eine Kategorie mit diesem Namen existiert bereits!');
            return;
        }
        
        linkCategories[categoryKey] = {
            title: title,
            icon: icon,
            collapsed: false,
            links: []
        };
        
        categoryOrder.push(categoryKey);
        
        sortCategoriesEmptyLast();
        
        saveConfig(true);
        showMessage('Kategorie erfolgreich erstellt', 'success');
    }
    
    renderCategories();
    populateCategorySelect();
    updateFavoritesCount();
    closeCategoryModal();
});

// Modal und Menü schließen beim Klick außerhalb
window.onclick = function(event) {
    const modal = document.getElementById('linkModal');
    const categoryModal = document.getElementById('categoryModal');
    const categorySelectModal = document.getElementById('categorySelectModal');
    const emptyCategoryModal = document.getElementById('emptyCategoryModal');
    const submenu = document.getElementById('menuSubmenu');
    const menuButton = document.getElementById('mainMenuButton');
    const contextMenu = document.getElementById('contextMenu');
    const categoryContextMenu = document.getElementById('categoryContextMenu');
    const favoritesList = document.getElementById('favoritesList');
    const favoritesToggle = document.getElementById('favoritesToggle');
    
    if (event.target === modal) {
        closeModal();
    }
    
    if (event.target === categoryModal) {
        closeCategoryModal();
    }
    
    if (event.target === categorySelectModal) {
        closeCategorySelectModal();
    }
    
    if (event.target === emptyCategoryModal) {
        closeEmptyCategoryModal();
    }
    
    if (!submenu.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu();
    }
    
    if (!contextMenu.contains(event.target) && !categoryContextMenu.contains(event.target)) {
        hideContextMenu();
    }
    
    // Favoriten schließen wenn außerhalb geklickt
    if (!favoritesList.contains(event.target) && !favoritesToggle.contains(event.target)) {
        if (favoritesOpen) {
            toggleFavorites();
        }
    }
}

// Sicherheits-Cleanup beim Klicken außerhalb von Drag-Bereichen
document.addEventListener('click', function(event) {
    if (!event.target.closest('.drag-handle') && 
        !event.target.closest('.link-drag-handle') && 
        !event.target.closest('.category.empty-category')) {
        
        if (document.querySelectorAll('.category.empty-category').length > 0) {
            cleanupAllTemporaryElements();
        }
    }
});

// Escape-Taste zum Schließen
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        closeCategoryModal();
        closeCategorySelectModal();
        closeEmptyCategoryModal();
        closeMenu();
        hideContextMenu();
        
        if (isSearchOpen) {
            closeSearchModal();
        }
        
        if (favoritesOpen) {
            toggleFavorites();
        }
        
        if (isDragging) {
            isDragging = false;
            stopAutoScroll();
            hideScrollZones();
            setTimeout(removeScrollZones, 300);
        }
        
        cleanupAllTemporaryElements();
    }
}); 

// Beim Laden der Seite die Konfiguration laden und Kategorien rendern
// Fix nach dem Laden um Link-Drag-Probleme zu beheben
document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('linkFavorite');
    const group = document.getElementById('favoritesGroup');
    
    if (checkbox && group) {
        // Initial state setzen
        updateFavoritesCheckboxUI();
        
        // Bei Änderungen UI aktualisieren
        checkbox.addEventListener('change', function() {
            updateFavoritesCheckboxUI();
        });
        
        // Clicking auf die Gruppe togglet auch die Checkbox
        group.addEventListener('click', function(e) {
            // Verhindere Doppel-Klicks wenn direkt auf Label geklickt wird
            if (e.target !== checkbox && !e.target.closest('label[for="linkFavorite"]')) {
                checkbox.checked = !checkbox.checked;
                updateFavoritesCheckboxUI();
                
                // Event für Form-Validierung triggern
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }
    
    // Rest deines bestehenden DOMContentLoaded Codes...
    setTimeout(() => {
        loadConfig();
        renderCategories();
        initializeSearch();
        updateFavoritesCount();
    }, 100);

    setTimeout(() => {
        const allHandles = document.querySelectorAll('.link-drag-handle');
        
        allHandles.forEach((handle, index) => {
            handle.addEventListener('dragstart', function(e) {
                return handleLinkDragStart.call(this, e);
            });
            
            handle.addEventListener('dragend', function(e) {
                return handleLinkDragEnd.call(this, e);
            });
        });
    }, 500);
});