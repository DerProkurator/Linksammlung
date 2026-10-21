/**
 * ========================================================================
 * WELCOME LOADER - MIT CONFIG-PRIORITÄTEN (v3.5)
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
     * Prüft, ob eine lokale Konfiguration im Browser existiert.
     * Unterstützt altes Format (linkConfig) und neues Tab-Format (linkConfig_*).
     * linkTabs wird bewusst NICHT geprüft, da es beim ersten Start automatisch angelegt wird.
     */
    hasLocalConfig() {
        try {
            // Neues Tab-Format: linkConfig_<tabId> (v3.0)
            // Mindestens einer dieser Keys muss Kategorien enthalten
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('linkConfig_')) {
                    const raw = localStorage.getItem(key);
                    if (raw && raw.trim() !== '') {
                        const parsed = JSON.parse(raw);
                        if (parsed && typeof parsed === 'object' && parsed.categories &&
                            Object.keys(parsed.categories).length > 0) {
                            return true;
                        }
                    }
                }
            }

            // Altes Format (linkConfig) — wird beim nächsten loadConfig() migriert
            const localConfig = localStorage.getItem('linkConfig');
            if (localConfig && localConfig.trim() !== '') {
                const parsed = JSON.parse(localConfig);
                return parsed && typeof parsed === 'object' && parsed.categories;
            }

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
            <button type="button" class="btn btn-primary" id="useDefaultBtn" style="padding: 16px 24px; font-size: 16px;">
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
                        <span class="modal-emoji">🚀</span> Willkommen zu Ihrer Linksammlung!
                    </h2>
                    
                    ${configInfoSection}

                    <div style="margin-bottom: 25px; padding: 20px; background: rgba(64, 224, 208, 0.1); border-radius: 12px; border: 1px solid rgba(64, 224, 208, 0.3);">
                        <div style="color: #40e0d0; font-size: 13px; line-height: 1.6;">
                            <strong>✨ Features (v3.5):</strong><br>
                            • <strong>Multi-Tab-System</strong> – Tabs aus Config/-Dateien, Liste in Config/tabs.js (keine HTML-Änderung nötig)<br>
                            • <strong>Favoriten-Tab</strong> – Alle markierten Links aus allen Tabs auf einen Blick<br>
                            • <strong>Angepinnte Links</strong> – Tab-übergreifende Schnellzugriffsleiste oben (📌 Rechtsklick auf Link)<br>
                            • <strong>Bento-Grid-Layout</strong> – Kacheln skalieren automatisch nach Link-Anzahl<br>
                            • <strong>Globale Suche</strong> – Alle Tabs gleichzeitig durchsuchen (Strg+K)<br>
                            • <strong>Rechtsklick-Menü</strong> – Links/Kategorien bearbeiten, löschen, verschieben, anpinnen<br>
                            • <strong>Tab-Kontextmenü</strong> – Rechtsklick auf Tab: umbenennen, ausblenden, zusammenführen<br>
                            • <strong>Emoji-Picker</strong> – Icons für Links, Kategorien und Tabs, inkl. Länderflaggen<br>
                            • <strong>Import / Export</strong> – Vollständige Config, einzelne Kategorie oder einzelner Link<br>
                            • <strong>Standard zurücksetzen</strong> – Stellt Config, Icon und Tab-Reihenfolge aus der Default-Config wieder her
                        </div>
                    </div>

                    <div class="form-buttons" style="display: flex; flex-direction: column; gap: 15px;">
                        <button type="button" class="${hasDefaultConfig ? 'btn btn-secondary' : 'btn btn-primary'}" id="loadJsonBtn" style="padding: 16px 24px; font-size: 16px;">
                            <span>📂</span> Bestehende Konfiguration aus JSON-Datei laden
                        </button>

                        ${defaultConfigButton}

                        <div style="text-align: center; margin-top: 15px; padding: 15px; background: rgba(255, 193, 7, 0.1); border-radius: 10px; border: 1px solid rgba(255, 193, 7, 0.3);">
                            <div style="color: #ffd54f; font-size: 14px; margin-bottom: 8px;">
                                <strong>💾 Datenspeicherung</strong>
                            </div>
                            <div style="color: rgba(255, 255, 255, 0.9); font-size: 12px; line-height: 1.4;">
                                Die Konfiguration wird lokal im Browser gespeichert.<br>
                                Über das Menü (☰) jederzeit exportieren, importieren oder zurücksetzen.
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 8px; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.07);">
                            <div style="color: rgba(200, 200, 200, 0.55); font-size: 11px; line-height: 1.5;">
                                💡 <strong style="color: rgba(200,200,200,0.7);">Diesen Dialog dauerhaft deaktivieren:</strong><br>
                                <code style="font-size: 10px; background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 3px;">JS/welcome-config-loader.js</code> löschen oder umbenennen.<br>
                                Beim nächsten Erststart werden die Default-Configs aus <code style="font-size: 10px; background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 3px;">Config/</code> direkt geladen.
                            </div>
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
            const hasDynamicConfigs = typeof window.DYNAMIC_CONFIGS !== 'undefined' &&
                Object.keys(window.DYNAMIC_CONFIGS).length > 0;

            if (configLoaded || hasDynamicConfigs) {
                this.showStatusMessage({
                    title: '🌟 Standard-Konfiguration geladen',
                    content: 'Die Default-Konfiguration wurde geladen. Tabs, Links und Kategorien sind bereit — jetzt anpassen oder per Rechtsklick bearbeiten.'
                }, 'success');
            } else if (hasDefaultConfig) {
                // Standard-Config ist da, aber keine DYNAMIC_CONFIGS und kein localStorage
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
                    content: 'Ihre gespeicherte Konfiguration wurde aus dem Browser-Speicher geladen.'
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