// ========================================================================
// LINKSAMMLUNG - SCRIPT.JS v3.8 (Initialisierung)
// ========================================================================
// Nur noch: DOMContentLoaded, Form-Handler, globale Event-Listener
//
// Alle Funktionen sind in separate Dateien ausgelagert:
//   config.js        — Globale Variablen, loadConfig, saveConfig, Migration
//   tabs.js          — Tab-System (Storage, UI, Switching, Favoriten-Tab)
//   favorites.js     — Favoriten-Sidebar-System
//   search.js        — Globale Suche (alle Tabs), STRG+K
//   categories.js    — Kategorie-Management
//   links.js         — Link-Management
//   import-export.js — Import/Export-System
//   drag-drop.js     — Drag & Drop-System
//   ui.js            — Rendering, Modals, Status-Nachrichten, Menü
//   emoji.js         — Emoji-Picker-System
//   link-overview.js — Übersicht aller Links (Tabelle, Ähnlichkeit)
// ========================================================================

/**
 * Formular-Event-Handler registrieren
 */
function setupFormHandlers() {

    // Link-Formular
    document.getElementById('linkForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const checked = normalizeLink({
            title:       document.getElementById('linkTitle').value,
            url:         document.getElementById('linkUrl').value,
            description: document.getElementById('linkDescription').value,
            icon:        document.getElementById('linkIcon').value,
            favorite:    document.getElementById('linkFavorite').checked
        });
        if (checked.error) {
            alert('Link kann nicht gespeichert werden:\n' + checked.error + '\n\nErlaubt sind nur Adressen mit http:// oder https://');
            return;
        }
        const { title, url, description, icon, favorite } = checked.link;

        // Bearbeitung aus der Link-Übersicht (kann jeden Tab betreffen)
        if (overviewEditTarget) {
            saveOverviewLinkEdit({ title, url, description, icon, favorite });
            return;
        }

        if (isEditMode && currentEditingLink) {
            const { categoryKey, linkIndex } = currentEditingLink;
            const existingPinned = linkCategories[categoryKey].links[linkIndex].pinned || false;
            linkCategories[categoryKey].links[linkIndex] = { title, url, description, icon, favorite, pinned: existingPinned };
            if (!saveConfig(true)) return;
            showMessage('Link erfolgreich bearbeitet', 'success');
            refreshViews();
            closeModal();
        } else {
            const category = document.getElementById('linkCategory').value;

            if (!category || !linkCategories[category]) {
                alert('Bitte wähle eine Kategorie aus!');
                return;
            }

            linkCategories[category].links.push({ title, url, description, icon, favorite, pinned: false });
            sortCategoriesEmptyLast();
            if (!saveConfig(true)) return;
            showMessage('Link erfolgreich hinzugefügt', 'success');
            refreshViews();
            closeModal();
        }
    });

    // Kategorie-Formular
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('categoryTitle').value.trim();
        const icon  = document.getElementById('categoryIcon').value.trim() || '📁';

        if (!title) {
            alert('Bitte einen Kategorie-Namen eingeben!');
            return;
        }

        if (isCategoryEditMode && currentEditingCategory) {
            linkCategories[currentEditingCategory].title = title;
            linkCategories[currentEditingCategory].icon  = icon;
            if (!saveConfig(true)) return;
            showMessage('Kategorie erfolgreich bearbeitet', 'success');
        } else {
            if (categoryTitleExists(linkCategories, title)) {
                alert('Eine Kategorie mit diesem Namen existiert bereits!');
                return;
            }

            const categoryKey = uniqueKey(title, k => Object.hasOwn(linkCategories, k));

            linkCategories[categoryKey] = { title, icon, collapsed: false, links: [] };
            categoryOrder.push(categoryKey);
            sortCategoriesEmptyLast();
            if (!saveConfig(true)) return;
            showMessage('Kategorie erfolgreich erstellt', 'success');
        }

        refreshViews();
        populateCategorySelect();
        closeCategoryModal();
    });

    // Tab-Hinzufügen Formular (Enter-Taste)
    const newTabLabel = document.getElementById('newTabLabel');
    if (newTabLabel) {
        newTabLabel.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); confirmAddTab(); }
        });
    }

    // Tab-Umbenennen Formular (Enter-Taste)
    const renameTabLabel = document.getElementById('renameTabLabel');
    if (renameTabLabel) {
        renameTabLabel.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); confirmRenameTab(); }
        });
    }
}

/**
 * Globale Event-Listener einrichten
 */
function setupGlobalEventListeners() {

    // Klick außerhalb von Modals/Menüs schließt diese
    window.onclick = function(event) {
        const modal                = document.getElementById('linkModal');
        const categoryModal        = document.getElementById('categoryModal');
        const categorySelectModal  = document.getElementById('categorySelectModal');
        const emptyCategoryModal   = document.getElementById('emptyCategoryModal');
        const addTabModal          = document.getElementById('addTabModal');
        const renameTabModal       = document.getElementById('renameTabModal');
        const submenu              = document.getElementById('menuSubmenu');
        const menuButton           = document.getElementById('mainMenuButton');
        const contextMenu          = document.getElementById('contextMenu');
        const categoryContextMenu  = document.getElementById('categoryContextMenu');
        const tabContextMenu       = document.getElementById('tabContextMenu');
        const favoritesSidebar     = document.getElementById('favoritesSidebar');
        const favoritesToggle      = document.getElementById('favoritesToggle');

        if (event.target === modal)               closeModal();
        if (event.target === categoryModal)       closeCategoryModal();
        if (event.target === categorySelectModal) closeCategorySelectModal();
        if (event.target === emptyCategoryModal)  closeEmptyCategoryModal();
        if (event.target === addTabModal)         closeAddTabModal();
        if (event.target === renameTabModal)      closeRenameTabModal();

        if (submenu && menuButton) {
            if (!submenu.contains(event.target) && !menuButton.contains(event.target)) {
                closeMenu();
            }
        }

        if (contextMenu && categoryContextMenu) {
            if (!contextMenu.contains(event.target) && !categoryContextMenu.contains(event.target)) {
                hideContextMenu();
            }
        }

        if (tabContextMenu && !tabContextMenu.contains(event.target)) {
            hideTabContextMenu();
        }

        if (favoritesSidebar && favoritesToggle) {
            if (!favoritesSidebar.contains(event.target) && !favoritesToggle.contains(event.target)) {
                if (favoritesOpen) toggleFavorites();
            }
        }
    };

    // Escape-Taste: alle offenen Overlays schließen
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // Offener Dialog: nur den obersten schließen (Fokus kehrt zum Auslöser zurück)
            if (closeTopDialog()) return;

            closeMenu();
            hideContextMenu();
            hideTabContextMenu();

            if (isSearchOpen) closeSearchModal();
            if (favoritesOpen) toggleFavorites();

            if (isDragging) {
                isDragging = false;
                stopAutoScroll();
                hideScrollZones();
                setTimeout(removeScrollZones, 300);
            }

            cleanupAllTemporaryElements();
        }
    });

    // Globales Maus-Tracking für Auto-Scroll
    document.addEventListener('dragover', function(e) {
        if (isDragging) {
            currentMouseY = e.clientY;
            const scrollZoneSize = 100;
            if (currentMouseY < scrollZoneSize || currentMouseY > window.innerHeight - scrollZoneSize) {
                startAutoScroll();
            } else {
                stopAutoScroll();
            }
        }
    });

    document.addEventListener('dragend', function() {
        isDragging = false;
        stopAutoScroll();
        hideScrollZones();
    });

    // Emoji-Picker schließen wenn außerhalb geklickt
    document.addEventListener('click', function(event) {
        const picker  = event.target.closest('.emoji-picker');
        const trigger = event.target.closest('.emoji-trigger');

        if (!picker && !trigger && currentPickerElement) {
            currentPickerElement.classList.remove('active');
            const activeTrigger = document.querySelector('.emoji-trigger.active');
            if (activeTrigger) activeTrigger.classList.remove('active');
            currentPickerTarget  = null;
            currentPickerElement = null;
        }
    });
}

// ========================================================================
// HAUPTINITIALISIERUNG
// ========================================================================

document.addEventListener('DOMContentLoaded', function() {

    // Favoriten-Checkbox UI einrichten
    setupFavoritesCheckbox();

    // Kurze Verzögerung damit alle Scripts geladen sind
    setTimeout(() => {
        // 1. Konfiguration + Tabs laden (inkl. Migration)
        loadConfig();

        // 2. Ansichts-Einstellungen laden (Beschreibungsmodus)
        loadDescriptionMode();

        // 3. Tab-Leiste rendern
        renderTabBar();

        // 4. Inhalt rendern
        if (activeTabId === 'favorites') {
            renderFavoritesTab();
        } else {
            renderCategories();
        }

        // 5. Restliche Initialisierung
        initializeSearch();
        updateFavoritesCount();
        updatePinnedBar();
        updateMenuButtonVisibility();
        setupFormHandlers();
        setupGlobalEventListeners();

    }, 100);
});

// ========================================================================
// ENDE SCRIPT.JS v3.8
// ========================================================================
