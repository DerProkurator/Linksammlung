/**
 * ========================================================================
 * ERWEITERTE WELCOME LOADER - MIT CONFIG-PRIORITÄTEN
 * ========================================================================
 * 
 * Neue Prioritätsreihenfolge:
 * 1. Lokale Konfiguration im Browser (localStorage)
 * 2. Standard-Konfiguration aus Config/default-config.js
 * 3. Welcome-Dialog falls beide nicht verfügbar
 * 
 * Features:
 * - Intelligente Konfigurations-Erkennung
 * - Willkommensdialog nur bei echtem ersten Start
 * - Integration mit bestehenden Import-Funktionen
 * - Unterstützung für Favoriten-System
 * 
 * ========================================================================
 */

class ExtendedWelcomeLoader {
    constructor() {
        this.hasShownWelcome = false;
        this.configLoadAttempted = false;
        console.log('🚀 ExtendedWelcomeLoader initialisiert (v2.3)');
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
        console.log('🔍 Bestimme Konfigurationsquelle...');
        
        // 1. Priorität: Lokale Konfiguration
        if (this.hasLocalConfig()) {
            console.log('✅ Lokale Konfiguration gefunden');
            return {
                source: 'local',
                message: 'Lokale Konfiguration wird verwendet',
                showWelcome: false
            };
        }
        
        // 2. Priorität: Standard-Konfiguration aus default-config.js
        if (this.hasDefaultConfig()) {
            console.log('✅ Standard-Konfiguration aus default-config.js gefunden');
            return {
                source: 'default-config',
                message: 'Standard-Konfiguration aus Config-Datei geladen',
                showWelcome: false
            };
        }
        
        // 3. Fallback: Welcome-Dialog anzeigen
        console.log('ℹ️ Keine Konfiguration gefunden - Welcome-Dialog erforderlich');
        return {
            source: 'welcome',
            message: 'Willkommensdialog wird angezeigt',
            showWelcome: true
        };
    }

    /**
     * Zeigt den erweiterten Willkommensdialog
     */
    showWelcomeDialog() {
        if (this.hasShownWelcome) return;
        this.hasShownWelcome = true;

        // Modal HTML erstellen mit erweiterten Informationen
        const modalHTML = `
            <div class="modal" id="welcomeModal" style="display: block;">
                <div class="modal-content" style="max-width: 550px;">
                    <h2 style="text-align: center; margin-bottom: 25px; line-height: 1.4; color: #40e0d0; font-size: 1.8em;">
                        🚀 Willkommen zu Ihrer Linksammlung!
                    </h2>
                    
                    <div style="margin-bottom: 25px; padding: 20px; background: rgba(64, 224, 208, 0.1); border-radius: 12px; border: 1px solid rgba(64, 224, 208, 0.3);">
                        <div style="font-size: 1.1em; margin-bottom: 15px; color: #f0f0f0;">
                            <strong>🆕 Erste Einrichtung</strong>
                        </div>
                        <div style="color: #d0d0d0; line-height: 1.5; font-size: 14px; margin-bottom: 15px;">
                            Es wurde keine gespeicherte Konfiguration gefunden. Sie haben folgende Optionen:
                        </div>
                        <div style="color: #40e0d0; font-size: 13px; line-height: 1.4;">
                            <strong>💡 Hinweise:</strong><br>
                            • Die Linksammlung unterstützt jetzt <strong>Favoriten</strong> (⭐)<br>
                            • <strong>Kategorien exportieren/importieren</strong> möglich<br>
                            • <strong>Drag & Drop</strong> für Links und Kategorien<br>
                            • <strong>Suchfunktion</strong> mit STRG+K
                        </div>
                    </div>

                    <div class="form-buttons" style="display: flex; flex-direction: column; gap: 15px;">
                        <button type="button" class="btn btn-primary" id="loadJsonBtn" style="padding: 16px 24px; font-size: 16px;">
                            <span>📂</span> Bestehende Konfiguration aus JSON-Datei laden
                        </button>
                        
                        <button type="button" class="btn btn-secondary" id="useDefaultBtn" style="padding: 16px 24px; font-size: 16px;">
                            <span>🌟</span> Mit Beispiel-Konfiguration starten
                        </button>
                        
                        <div style="text-align: center; margin-top: 15px; padding: 15px; background: rgba(255, 193, 7, 0.1); border-radius: 10px; border: 1px solid rgba(255, 193, 7, 0.3);">
                            <div style="color: #ffd54f; font-size: 14px; margin-bottom: 8px;">
                                <strong>💾 Hinweis zur Datenspeicherung</strong>
                            </div>
                            <div style="color: rgba(255, 255, 255, 0.9); font-size: 12px; line-height: 1.4;">
                                Ihre Konfiguration wird lokal in Ihrem Browser gespeichert.<br>
                                Sie können jederzeit über das Menü (+ → Daten verwalten) Backups erstellen.
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

        console.log('👋 Erweiterte Willkommensdialog angezeigt');
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
            console.log('📂 Verwende bereits vorhandenen Import-Dialog');
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
            content: 'Bitte verwenden Sie das Menü (+ → Konfiguration laden) um eine JSON-Datei zu importieren.'
        }, 'warning');
        
        // Fallback auf Standard-Konfiguration
        setTimeout(() => {
            this.useDefaultConfig();
        }, 3000);
    }

    /**
     * Verwendet die Standard-Konfiguration
     */
    useDefaultConfig() {
        console.log('🌟 Verwende Standard-Konfiguration');
        
        // Prüfen ob die Hauptfunktion verfügbar ist
        if (typeof window.loadConfig === 'function') {
            const configLoaded = window.loadConfig();
            
            if (configLoaded) {
                this.showStatusMessage({
                    title: '🌟 Standard-Konfiguration geladen',
                    content: 'Die Linksammlung ist einsatzbereit! Erkunden Sie die neuen Features wie Favoriten (⭐) und Kategorie-Export.'
                }, 'success');
            } else {
                // Falls loadConfig false zurückgibt (keine Config gefunden)
                this.showStatusMessage({
                    title: '🔧 Fallback-Konfiguration geladen',
                    content: 'Eine einfache Grundkonfiguration wurde erstellt. Sie können sie jederzeit anpassen.'
                }, 'info');
            }
        } else {
            console.error('❌ loadConfig-Funktion nicht verfügbar');
            this.showStatusMessage('❌ Konfigurationssystem nicht verfügbar', 'error');
        }
    }

    /**
     * Zeigt Konfigurationsstatus an
     */
    showConfigStatus() {
        const status = this.determineConfigSource();
        
        if (status.source !== 'welcome') {
            setTimeout(() => {
                this.showStatusMessage({
                    title: '✅ Konfiguration erfolgreich geladen',
                    content: `Quelle: ${status.source === 'local' ? 'Lokaler Browser-Speicher' : 'Standard Config-Datei'}. Alle Features sind verfügbar!`
                }, 'success');
            }, 1000);
        }
    }

    /**
     * Hauptinitialisierung
     */
    initialize() {
        if (this.configLoadAttempted) {
            console.log('⚠️ Konfiguration bereits initialisiert');
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
                
                console.log('✅ Hauptanwendung erkannt');
                
                // Bestimme Konfigurationsquelle
                const configStatus = this.determineConfigSource();
                
                if (configStatus.showWelcome) {
                    // Zeige Welcome-Dialog
                    setTimeout(() => this.showWelcomeDialog(), 800);
                } else {
                    // Normale Initialisierung mit Status-Anzeige
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
                console.log('⏰ Timeout erreicht - zeige Welcome-Dialog');
                this.showWelcomeDialog();
            }
        }, 10000);
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
    console.log('📄 DOM geladen - starte Welcome Loader...');
    
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
            console.log('🔄 Fallback-Initialisierung gestartet');
            window.extendedWelcomeLoader.initialize();
        }
    }, 2000);
});

// Export für Debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExtendedWelcomeLoader;
}

console.log('🚀 ExtendedWelcomeLoader Modul erfolgreich geladen (v2.3 - Favoriten + Kategorien)');