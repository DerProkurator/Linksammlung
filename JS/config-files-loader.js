// ========================================================================
// LINKSAMMLUNG - CONFIG-FILES-LOADER.JS v3.8
// ========================================================================
// Lädt die in Config/tabs.js (window.CONFIG_FILES) gelisteten Tab-Configs.
//
// document.write() ist hier Absicht: Die Script-Tags werden während des
// Parsens synchron eingefügt und laufen in Listen-Reihenfolge, noch bevor
// config.js & Co. geladen werden. Funktioniert lokal (file://) und auf
// GitHub Pages — ein Verzeichnis-Listing ist im Browser nicht möglich.
// Fehlende Dateien lösen nur einen 404 aus und werden übersprungen.
// ========================================================================

(function() {
    const files = Array.isArray(window.CONFIG_FILES) ? window.CONFIG_FILES : [];

    files.forEach(file => {
        // Nur einfache Dateinamen in Config/ zulassen (kein Pfad, keine Sonderzeichen für HTML)
        if (typeof file !== 'string' || !/^[^\/\\"'<>&]+\.js$/.test(file)) {
            console.warn('Config/tabs.js: ungültiger Dateiname übersprungen:', file);
            return;
        }
        document.write(`<script src="Config/${encodeURI(file)}"><\/script>`);
    });
})();
