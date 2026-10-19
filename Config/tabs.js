/**
 * ========================================================================
 * TAB-LISTE: Welche Config-Dateien aus Config/ geladen werden
 * ========================================================================
 * Reihenfolge hier = Tab-Reihenfolge in der App (beim ersten Start).
 *
 * Neuer Tab:  Datei in Config/ ablegen und den Dateinamen hier ergänzen.
 * Tab weg:    Zeile hier entfernen (Datei kann danach gelöscht werden).
 *
 * Wird beim Export "Alle Default-Configs" (ZIP) automatisch mit erzeugt —
 * ZIP in Config/ entpacken, vorhandene Dateien überschreiben, fertig.
 * Fehlende Dateien werden übersprungen.
 * ========================================================================
 */
window.CONFIG_FILES = [
    "Demo_config-Allgemein.js",
    "Demo_config-Entwicklung.js"
];
