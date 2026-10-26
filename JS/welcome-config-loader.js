/**
 * ========================================================================
 * WELCOME LOADER - MIT CONFIG-PRIORITÄTEN (v3.7)
 * ========================================================================
 *
 * Prioritätsreihenfolge beim Start:
 * 1. Lokale Konfiguration im Browser (localStorage) → Direktes Laden, kein Dialog
 * 2. Keine lokale Config → Welcome-Dialog mit zwei Optionen:
 *    a) JSON-Datei importieren (bestehende Sicherung)
 *    b) Default-Configs aus Config/ direkt übernehmen
 *
 * Deaktivierung des Welcome-Dialogs:
 * Diese Datei (welcome-config-loader.js) einfach löschen oder umbenennen.
 * Dann werden beim Erststart automatisch die Default-Configs aus Config/
 * geladen — ohne Dialog. Tabs und Kategorien erscheinen sofort.
 *
 * ========================================================================
 */

class ExtendedWelcomeLoader {
    constructor() {
        this.hasShownWelcome = false;
        this.configLoadAttempted = false;
    }

    /**
     * Prüft, ob die Sammlung in diesem Browser bereits eingerichtet ist.
     * Eingerichtet = Erststart abgeschlossen (linkSetupDone) oder irgendein gespeicherter
     * Tab-Stand (linkConfig_*) – auch eine bewusst leere Sammlung zählt.
     * Altes Format (linkConfig) wird beim nächsten loadConfig() migriert.
     * linkTabs wird bewusst NICHT geprüft, da es beim ersten Start automatisch angelegt wird.
     */
    hasLocalConfig() {
        try {
            if (localStorage.getItem('linkSetupDone')) return true;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('linkConfig_') && localStorage.getItem(key)) return true;
            }

            const localConfig = localStorage.getItem('linkConfig');
            if (localConfig && localConfig.trim() !== '') return true;

        } catch (error) {
            console.log('⚠️ Fehler beim Prüfen der lokalen Konfiguration:', error);
        }
        return false;
    }

    /**
     * Prüft, ob eine Standard-Konfiguration verfügbar ist —
     * entweder als DEFAULT_CONFIG (altes Format) oder als DYNAMIC_CONFIGS (Tab-Format)
     */
    hasDefaultConfig() {
        // Altes Format: DEFAULT_CONFIG mit categories-Objekt
        if (typeof window.DEFAULT_CONFIG !== 'undefined' &&
               window.DEFAULT_CONFIG &&
               typeof window.DEFAULT_CONFIG === 'object' &&
               window.DEFAULT_CONFIG.categories) {
            return true;
        }
        // Neues Tab-Format: DYNAMIC_CONFIGS mit mindestens einem Eintrag
        if (typeof window.DYNAMIC_CONFIGS !== 'undefined' &&
               window.DYNAMIC_CONFIGS &&
               typeof window.DYNAMIC_CONFIGS === 'object' &&
               Object.keys(window.DYNAMIC_CONFIGS).length > 0) {
            return true;
        }
        return false;
    }

    /**
     * Zeigt eine Statusmeldung an
     */
    showStatusMessage(message, type = 'info') {
        if (typeof window.showMessage === 'function') {
            window.showMessage(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${typeof message === 'object' ? message.title + ' - ' + message.content : message}`);
        }
    }

    /**
     * Bestimmt welche Konfiguration geladen werden soll
     */
    determineConfigSource() {
        
        // 1. Priorität: Lokale Konfiguration - nur dann KEIN Welcome-Dialog
        if (this.hasLocalConfig()) {
            return {
                source: 'local',
                message: 'Lokale Konfiguration wird verwendet',
                showWelcome: false
            };
        }
        
        // 2. Keine lokale Config → Welcome-Dialog anzeigen (egal ob Standard-Config verfügbar)
        const hasDefaultConfig = this.hasDefaultConfig();        
        return {
            source: hasDefaultConfig ? 'welcome-with-default' : 'welcome-fallback-only',
            message: 'Willkommensdialog wird angezeigt',
            showWelcome: true,
            hasDefaultConfig: hasDefaultConfig
        };
    }

    /**
     * Zeigt den erweiterten Willkommensdialog
     */
    showWelcomeDialog() {
        if (this.hasShownWelcome) return;
        this.hasShownWelcome = true;

        const configStatus = this.determineConfigSource();
        const hasDefaultConfig = configStatus.hasDefaultConfig;

        // Ohne Config-Dateien gibt es nur die eingebaute Grundkonfiguration
        const defaultLabel = hasDefaultConfig
            ? '<span>🌟</span> Mitgelieferte Links verwenden'
            : '<span>🔧</span> Mit Grundkonfiguration starten';

        const modalHTML = `
            <div class="modal" id="welcomeModal" style="display: block;">
                <div class="modal-content" style="max-width: 480px;">
                    <h2 style="text-align: center; margin-bottom: 12px; color: #40e0d0;">
                        <span class="modal-emoji">🚀</span> Willkommen!
                    </h2>
                    <p style="text-align: center; color: #d0d0d0; font-size: 14px; line-height: 1.5; margin-bottom: 22px;">
                        Womit soll die Linksammlung starten?
                    </p>

                    <div class="form-buttons" style="display: flex; flex-direction: column; gap: 12px;">
                        <button type="button" class="btn btn-primary" id="useDefaultBtn" style="padding: 14px 20px; font-size: 15px;">
                            ${defaultLabel}
                        </button>
                        <button type="button" class="btn btn-secondary" id="loadJsonBtn" style="padding: 14px 20px; font-size: 15px;">
                            <span>📂</span> Backup laden (JSON-Datei)
                        </button>
                    </div>

                    <p style="margin-top: 22px; color: rgba(220, 220, 220, 0.7); font-size: 12px; line-height: 1.6; text-align: center;">
                        Alles wird nur lokal in diesem Browser gespeichert.<br>
                        Menü über <strong>＋</strong> unten rechts · Bearbeiten per Rechtsklick · Suche mit <strong>Strg+K</strong><br>
                        <a href="Nutzeranleitung.html" target="_blank" rel="noopener noreferrer" style="color: #40e0d0;">Nutzeranleitung öffnen</a>
                    </p>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event Listener hinzufügen
        const loadJsonBtn = document.getElementById('loadJsonBtn');
        const useDefaultBtn = document.getElementById('useDefaultBtn');
        
        if (loadJsonBtn) {
            loadJsonBtn.addEventListener('click', () => {
                this.closeWelcomeDialog();
                this.triggerExistingImport();
            });
        }

        if (useDefaultBtn) {
            useDefaultBtn.addEventListener('click', () => {
                this.closeWelcomeDialog();
                this.useDefaultConfig();
            });
        }

        // ESC-Taste Support
        this.escapeHandler = (event) => {
            if (event.key === 'Escape') {
                this.closeWelcomeDialog();
                this.useDefaultConfig(); // Fallback bei ESC
            }
        };
        document.addEventListener('keydown', this.escapeHandler);

    }

    /**
     * Schließt den Willkommensdialog (inkl. ESC-Listener, sonst würde ein späteres
     * ESC erneut die Standard-Konfiguration laden)
     */
    closeWelcomeDialog() {
        const modal = document.getElementById('welcomeModal');
        if (modal) {
            modal.remove();
        }
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    }

    /**
     * Löst die bereits vorhandene Import-Funktion aus
     */
    triggerExistingImport() {
        // Nutze das bereits vorhandene File-Input Element
        const existingFileInput = document.getElementById('fileInput');
        if (existingFileInput) {
            existingFileInput.click();
        } else {
            console.warn('⚠️ Bestehendes File-Input nicht gefunden - zeige Fallback');
            this.showImportFallbackMessage();
        }
    }

    /**
     * Zeigt Fallback-Nachricht wenn Import nicht funktioniert
     */
    showImportFallbackMessage() {
        this.showStatusMessage({
            title: '⚠️ Import-Dialog nicht verfügbar',
            content: 'Bitte über das Menü (＋ → Konfiguration laden) eine JSON-Datei importieren.'
        }, 'warning');
        
        // Fallback auf Standard-Konfiguration
        setTimeout(() => {
            this.useDefaultConfig();
        }, 3000);
    }

    /**
     * Verwendet die Standard-Konfiguration oder Fallback
     */
    useDefaultConfig() {
        const hasDefaultConfig = this.hasDefaultConfig();
        
        // Prüfen ob die Hauptfunktion verfügbar ist
        if (typeof window.loadConfig === 'function') {
            const configLoaded = window.loadConfig();
            const hasDynamicConfigs = typeof window.DYNAMIC_CONFIGS !== 'undefined' &&
                Object.keys(window.DYNAMIC_CONFIGS).length > 0;

            // Auswahl dauerhaft speichern – sonst erscheint der Dialog beim nächsten Start erneut
            if (typeof window.persistInitialSetup === 'function' && !window.persistInitialSetup()) return;
            if (typeof window.renderTabBar === 'function') window.renderTabBar();
            if (typeof window.refreshViews === 'function') window.refreshViews();

            if (configLoaded || hasDynamicConfigs) {
                this.showStatusMessage('🌟 Mitgelieferte Links geladen', 'success');
            } else if (hasDefaultConfig) {
                // Standard-Config ist da, aber keine DYNAMIC_CONFIGS und kein localStorage
                this.showStatusMessage({
                    title: '⚠️ Standard-Konfiguration nicht ladbar',
                    content: 'Es wird die eingebaute Grundkonfiguration verwendet.'
                }, 'warning');
            } else {
                this.showStatusMessage('🔧 Grundkonfiguration erstellt', 'info');
            }
        } else {
            console.error('❌ loadConfig-Funktion nicht verfügbar');
            this.showStatusMessage('❌ Konfigurationssystem nicht verfügbar', 'error');
        }
    }

    /**
     * Hauptinitialisierung
     */
    initialize() {
        if (this.configLoadAttempted) {
            return;
        }
        
        this.configLoadAttempted = true;
        
        // Warte bis die Hauptanwendung geladen ist
        const checkMainApp = () => {
            // Prüfe ob die Hauptfunktionen verfügbar sind
            if (typeof window.loadConfig === 'function' && 
                typeof window.renderCategories === 'function' &&
                typeof window.updateFavoritesCount === 'function' &&
                document.getElementById('categoriesContainer')) {
                
                // Bestimme Konfigurationsquelle
                const configStatus = this.determineConfigSource();
                
                // Normaler Start (lokale Config vorhanden): bewusst ohne Meldung
                if (configStatus.showWelcome) {
                    setTimeout(() => this.showWelcomeDialog(), 800);
                }
                
            } else {
                // Wiederhole nach kurzer Zeit (max. 10 Sekunden)
                if (this.configLoadAttempted) {
                    setTimeout(checkMainApp, 200);
                }
            }
        };

        // Starte Überprüfung
        checkMainApp();

        // Timeout als Sicherheitsnetz
        setTimeout(() => {
            if (!this.hasShownWelcome && this.determineConfigSource().showWelcome) {
                this.showWelcomeDialog();
            }
        }, 5000);
    }

    /**
     * Bereinigung bei Bedarf
     */
    cleanup() {
        this.closeWelcomeDialog();
        this.configLoadAttempted = false;
        this.hasShownWelcome = false;
    }

    /**
     * Debug-Informationen
     */
    getDebugInfo() {
        return {
            hasLocalConfig: this.hasLocalConfig(),
            hasDefaultConfig: this.hasDefaultConfig(),
            configSource: this.determineConfigSource(),
            hasShownWelcome: this.hasShownWelcome,
            configLoadAttempted: this.configLoadAttempted
        };
    }
}

// ========================================================================
// INITIALISIERUNG UND GLOBALE INTEGRATION
// ========================================================================

// Globale Instanz erstellen
window.extendedWelcomeLoader = new ExtendedWelcomeLoader();

// Debug-Funktion global verfügbar machen
window.getWelcomeLoaderDebug = () => window.extendedWelcomeLoader.getDebugInfo();

// Nach DOM-Laden initialisieren
document.addEventListener('DOMContentLoaded', function() {
    
    // Kurz warten damit andere Scripts laden können
    setTimeout(() => {
        window.extendedWelcomeLoader.initialize();
    }, 1200);
});

// Fallback für späte Initialisierung
window.addEventListener('load', function() {
    // Nur initialisieren falls noch nicht geschehen
    setTimeout(() => {
        if (!window.extendedWelcomeLoader.configLoadAttempted) {
            window.extendedWelcomeLoader.initialize();
        }
    }, 2000);
});

// Export für Debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExtendedWelcomeLoader;
}