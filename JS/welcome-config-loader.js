/**
 * ========================================================================
 * SIMPLE WELCOME LOADER - NUR WILLKOMMENSDIALOG
 * ========================================================================
 * 
 * Ganz einfach: Beim ersten Start Dialog zeigen.
 * Keine zusätzlichen Menüeinträge, kein Drag & Drop.
 * Nutzt die bereits vorhandenen Import-Funktionen.
 * 
 * ========================================================================
 */

class SimpleWelcomeLoader {
    constructor() {
        this.hasShownWelcome = false;
        console.log('👋 SimpleWelcomeLoader initialisiert');
    }

    /**
     * Prüft, ob eine lokale Konfiguration im Browser existiert
     */
    hasLocalConfig() {
        try {
            const localConfig = localStorage.getItem('linkConfig');
            return localConfig && localConfig.trim() !== '';
        } catch (error) {
            console.log('ℹ️ LocalStorage nicht verfügbar');
            return false;
        }
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
     * Zeigt den Willkommensdialog
     */
    showWelcomeDialog() {
        if (this.hasShownWelcome) return;
        this.hasShownWelcome = true;

        // Modal HTML erstellen
        const modalHTML = `
            <div class="modal" id="welcomeModal" style="display: block;">
                <div class="modal-content" style="max-width: 500px;">
                    <h2 style="text-align: center; margin-bottom: 25px; line-height: 1.4; color: #40e0d0; font-size: 1.8em;">
                        Willkommen zu Ihrer Linksammlung!
                    </h2>
                    
                    <div style="margin-bottom: 25px; padding: 20px; background: rgba(64, 224, 208, 0.1); border-radius: 12px; border: 1px solid rgba(64, 224, 208, 0.3);">
                        <div style="font-size: 1.1em; margin-bottom: 15px; color: #f0f0f0;">
                            <strong>Keine gespeicherte Konfiguration gefunden.</strong>
                        </div>
                        <div style="color: #d0d0d0; line-height: 1.5; font-size: 14px;">
                            Sie können entweder eine vorhandene Konfiguration aus einer JSON-Datei laden 
                            oder mit der Standard-Konfiguration beginnen.
                        </div>
                    </div>

                    <div class="form-buttons" style="display: flex; flex-direction: column; gap: 15px;">
                        <button type="button" class="btn btn-primary" id="loadJsonBtn" style="padding: 16px 24px; font-size: 16px;">
                            <span>📂</span> JSON-Datei laden
                        </button>
                        
                        <button type="button" class="btn btn-secondary" id="useDefaultBtn" style="padding: 16px 24px; font-size: 16px;">
                            <span>🚀</span> Mit Standard-Konfiguration starten
                        </button>
                        
                        <div style="text-align: center; margin-top: 10px;">
                            <small style="color: rgba(240, 240, 240, 0.7); font-size: 12px;">
                                💡 Sie können später über das Menü → "Konfiguration laden" weitere JSON-Dateien importieren
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

        console.log('👋 Willkommensdialog angezeigt');
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
            console.warn('⚠️ Bestehendes File-Input nicht gefunden');
            this.showStatusMessage('❌ Import-Funktion nicht verfügbar', 'error');
        }
    }

    /**
     * Verwendet die Standard-Konfiguration
     */
    useDefaultConfig() {
        console.log('🚀 Verwende Standard-Konfiguration');
        
        // Rufe die normale loadConfig-Funktion auf
        if (typeof window.loadConfig === 'function') {
            window.loadConfig();
        }

        this.showStatusMessage({
            title: '🚀 Standard-Konfiguration geladen',
            content: 'Sie können jederzeit über das Menü → "Konfiguration laden" neue JSON-Dateien importieren.'
        }, 'success');
    }

    /**
     * Initialisiert den Welcome Loader
     */
    initialize() {
        // Warte bis die Hauptanwendung geladen ist
        const checkMainApp = () => {
            // Prüfe ob die Hauptfunktionen verfügbar sind
            if (typeof window.loadConfig === 'function' && 
                typeof window.renderCategories === 'function' &&
                document.getElementById('categoriesContainer')) {
                
                console.log('✅ Hauptanwendung erkannt');
                
                // Prüfe lokale Konfiguration
                if (!this.hasLocalConfig()) {
                    console.log('ℹ️ Keine lokale Konfiguration gefunden - zeige Willkommensdialog');
                    setTimeout(() => this.showWelcomeDialog(), 500);
                } else {
                    console.log('✅ Lokale Konfiguration gefunden - normaler Start');
                }
                
            } else {
                // Wiederhole nach kurzer Zeit
                setTimeout(checkMainApp, 200);
            }
        };

        checkMainApp();
    }
}

// ========================================================================
// INITIALISIERUNG
// ========================================================================

// Globale Instanz erstellen
window.simpleWelcomeLoader = new SimpleWelcomeLoader();

// Nach DOM-Laden initialisieren
document.addEventListener('DOMContentLoaded', function() {
    // Kurz warten, dann initialisieren
    setTimeout(() => {
        window.simpleWelcomeLoader.initialize();
    }, 1000);
});

console.log('👋 SimpleWelcomeLoader Modul geladen (reparierte Version)');