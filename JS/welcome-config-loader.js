/**
 * ========================================================================
 * ERWEITERTE WELCOME LOADER - MIT CONFIG-PRIORITÄTEN (v2.4)
 * ========================================================================
 * 
 * Neue Prioritätsreihenfolge:
 * 1. Lokale Konfiguration im Browser (localStorage) → Direktes Laden
 * 2. KEINE lokale Config → IMMER Welcome-Dialog anzeigen mit:
 *    - Option: JSON-Datei laden
 *    - Option: Standard-Config verwenden (falls verfügbar im Config-Verzeichnis)
 *    - Fallback: Einfache Grundkonfiguration erstellen
 * 
 * Features:
 * - Welcome-Dialog bei jedem ersten Start ohne lokale Config
 * - Intelligente Erkennung verfügbarer Standard-Konfigurationen
 * - Dynamische Anpassung des Dialogs je nach verfügbaren Optionen
 * - Integration mit bestehenden Import-Funktionen
 * - Unterstützung für Favoriten-System
 * 
 * ========================================================================
 */

class ExtendedWelcomeLoader {
    constructor() {
        this.hasShownWelcome = false;
        this.configLoadAttempted = false;
    }

    /**
     * Prüft, ob eine lokale Konfiguration im Browser existiert
     */
    hasLocalConfig() {
        try {
            const localConfig = localStorage.getItem('linkConfig');
            if (localConfig && localConfig.trim() !== '') {
                const parsed = JSON.parse(localConfig);
                // Prüfen ob die Konfiguration valide ist
                return parsed && typeof parsed === 'object' && parsed.categories;
            }
        } catch (error) {
            console.log('⚠️ Fehler beim Prüfen der lokalen Konfiguration:', error);
        }
        return false;
    }

    /**
     * Prüft, ob die default-config.js erfolgreich geladen wurde
     */
    hasDefaultConfig() {
        return typeof window.DEFAULT_CONFIG !== 'undefined' && 
               window.DEFAULT_CONFIG && 
               typeof window.DEFAULT_CONFIG === 'object' &&
               window.DEFAULT_CONFIG.categories;
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
        
        // Verschiedene Nachrichten je nach verfügbarer Standard-Config
        const configInfoSection = hasDefaultConfig ? `
            <div style="margin-bottom: 25px; padding: 20px; background: rgba(46, 204, 113, 0.1); border-radius: 12px; border: 1px solid rgba(46, 204, 113, 0.3);">
                <div style="font-size: 1.1em; margin-bottom: 15px; color: #2ecc71;">
                    <strong>✅ Standard-Konfiguration verfügbar</strong>
                </div>
                <div style="color: #d0d0d0; line-height: 1.5; font-size: 14px; margin-bottom: 15px;">
                    Es wurde eine Standard-Konfiguration im Config-Verzeichnis gefunden. Sie haben folgende Optionen:
                </div>
                <div style="color: #2ecc71; font-size: 13px; line-height: 1.4;">
                    <strong>💡 Empfehlung:</strong> Verwenden Sie die Standard-Konfiguration als Ausgangsbasis und passen Sie diese nach Ihren Wünschen an.
                </div>
            </div>
        ` : `
            <div style="margin-bottom: 25px; padding: 20px; background: rgba(255, 193, 7, 0.1); border-radius: 12px; border: 1px solid rgba(255, 193, 7, 0.3);">
                <div style="font-size: 1.1em; margin-bottom: 15px; color: #ffc107;">
                    <strong>⚠️ Keine Standard-Konfiguration gefunden</strong>
                </div>
                <div style="color: #d0d0d0; line-height: 1.5; font-size: 14px; margin-bottom: 15px;">
                    Es wurde keine Standard-Konfiguration im Config-Verzeichnis gefunden. Sie haben folgende Optionen:
                </div>
                <div style="color: #ffc107; font-size: 13px; line-height: 1.4;">
                    <strong>💡 Hinweis:</strong> Falls verfügbar, laden Sie eine vorhandene JSON-Konfiguration. Andernfalls wird eine einfache Grundkonfiguration erstellt.
                </div>
            </div>
        `;

        const defaultConfigButton = hasDefaultConfig ? `
            <button type="button" class="btn btn-secondary" id="useDefaultBtn" style="padding: 16px 24px; font-size: 16px;">
                <span>🌟</span> Standard-Konfiguration aus Config-Verzeichnis verwenden
            </button>
        ` : `
            <button type="button" class="btn btn-secondary" id="useDefaultBtn" style="padding: 16px 24px; font-size: 16px;">
                <span>🔧</span> Einfache Grundkonfiguration erstellen
            </button>
        `;

        // Modal HTML erstellen mit dynamischen Inhalten
        const modalHTML = `
            <div class="modal" id="welcomeModal" style="display: block;">
                <div class="modal-content" style="max-width: 600px;">
                    <h2 style="text-align: center; margin-bottom: 25px; line-height: 1.4; color: #40e0d0; font-size: 1.8em;">
                        🚀 Willkommen zu Ihrer Linksammlung!
                    </h2>
                    
                    ${configInfoSection}

                    <div style="margin-bottom: 25px; padding: 20px; background: rgba(64, 224, 208, 0.1); border-radius: 12px; border: 1px solid rgba(64, 224, 208, 0.3);">
                        <div style="color: #40e0d0; font-size: 13px; line-height: 1.4;">
                            <strong>🆕 Neue Features in dieser Version:</strong><br>
                            • <strong>Favoriten-System</strong> - Markieren Sie wichtige Links mit ⭐<br>
                            • <strong>Kategorie-Import/Export</strong> - Teilen Sie Kategorien als JSON-Dateien<br>
                            • <strong>Erweiterte Suche</strong> - Durchsuchen Sie alle Links mit STRG+K<br>
                            • <strong>Drag & Drop</strong> - Sortieren Sie Links und Kategorien per Maus<br>
                            • <strong>Responsive Design</strong> - Optimiert für Desktop und Mobile
                        </div>
                    </div>

                    <div class="form-buttons" style="display: flex; flex-direction: column; gap: 15px;">
                        <button type="button" class="btn btn-primary" id="loadJsonBtn" style="padding: 16px 24px; font-size: 16px;">
                            <span>📂</span> Bestehende Konfiguration aus JSON-Datei laden
                        </button>
                        
                        ${defaultConfigButton}
                        
                        <div style="text-align: center; margin-top: 15px; padding: 15px; background: rgba(255, 193, 7, 0.1); border-radius: 10px; border: 1px solid rgba(255, 193, 7, 0.3);">
                            <div style="color: #ffd54f; font-size: 14px; margin-bottom: 8px;">
                                <strong>💾 Hinweis zur Datenspeicherung</strong>
                            </div>
                            <div style="color: rgba(255, 255, 255, 0.9); font-size: 12px; line-height: 1.4;">
                                Ihre Konfiguration wird lokal in Ihrem Browser gespeichert.<br>
                                Sie können jederzeit über das Menü (⚙️ → Daten verwalten) Backups erstellen.
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 10px;">
                            <small style="color: rgba(240, 240, 240, 0.7); font-size: 12px;">
                                ⚙️ Später: Menü → "Konfiguration laden" für weitere JSON-Importe
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Modal zum DOM hinzufügen
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
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                this.closeWelcomeDialog();
                this.useDefaultConfig(); // Fallback bei ESC
                document.removeEventListener('keydown', handleEscapeKey);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);

        const configType = hasDefaultConfig ? 'mit Standard-Konfiguration' : 'mit Fallback-Konfiguration';
    }

    /**
     * Schließt den Willkommensdialog
     */
    closeWelcomeDialog() {
        const modal = document.getElementById('welcomeModal');
        if (modal) {
            modal.remove();
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
            content: 'Bitte verwenden Sie das Menü (⚙️ → Konfiguration laden) um eine JSON-Datei zu importieren.'
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
            
            if (configLoaded && hasDefaultConfig) {
                this.showStatusMessage({
                    title: '🌟 Standard-Konfiguration geladen',
                    content: 'Die vorkonfigurierte Standard-Konfiguration wurde erfolgreich geladen! Erkunden Sie die neuen Features wie Favoriten (⭐) und Kategorie-Export.'
                }, 'success');
            } else if (!configLoaded && hasDefaultConfig) {
                // Standard-Config ist da, aber loadConfig gab false zurück
                this.showStatusMessage({
                    title: '⚠️ Problem beim Laden der Standard-Konfiguration',
                    content: 'Es gab ein Problem beim Laden der Standard-Konfiguration. Fallback wird verwendet.'
                }, 'warning');
            } else {
                // Keine Standard-Config verfügbar → Fallback verwendet
                this.showStatusMessage({
                    title: '🔧 Grundkonfiguration erstellt',
                    content: 'Eine einfache Grundkonfiguration wurde erstellt. Sie können jederzeit neue Kategorien und Links hinzufügen oder eine JSON-Konfiguration importieren.'
                }, 'info');
            }
        } else {
            console.error('❌ loadConfig-Funktion nicht verfügbar');
            this.showStatusMessage('❌ Konfigurationssystem nicht verfügbar', 'error');
        }
    }

    /**
     * Zeigt Konfigurationsstatus an (nur für lokale Konfigurationen)
     */
    showConfigStatus() {
        const status = this.determineConfigSource();
        
        // Nur Status zeigen wenn lokale Konfiguration geladen wurde
        if (status.source === 'local') {
            setTimeout(() => {
                this.showStatusMessage({
                    title: '✅ Lokale Konfiguration erfolgreich geladen',
                    content: 'Ihre gespeicherte Konfiguration wurde aus dem Browser-Speicher geladen. Alle Features sind verfügbar!'
                }, 'success');
            }, 1000);
        }
        // Für alle anderen Fälle wird der Welcome-Dialog angezeigt
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
                
                if (configStatus.showWelcome) {
                    // Zeige Welcome-Dialog
                    setTimeout(() => this.showWelcomeDialog(), 800);
                } else {
                    // Normale Initialisierung mit Status-Anzeige (nur für lokale Config)
                    this.showConfigStatus();
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