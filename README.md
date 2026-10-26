# Linksammlung

Eine browser-basierte Link-Sammlung für schnellen Zugriff auf Websites, Tools und Dokumentation. Läuft vollständig client-seitig als einzelne HTML-Seite — kein Backend, kein Build-System, kein Package-Manager.

## Nutzung

1. Repository klonen oder herunterladen
2. `Linksammlung.html` im Browser öffnen
3. Beim ersten Start erscheint ein Willkommensdialog — „Mitgelieferte Links verwenden“ lädt die Demo-Tabs

## Features

- Kategorien & Links frei anlegen, bearbeiten, per Drag & Drop sortieren
- Favoriten-Sidebar und angepinnte Links (Schnellzugriffsleiste oben) für schnellen Zugriff
- Volltextsuche über alle Links
- Link-Übersicht: alle Links aller Tabs als alphabetische Tabelle, mit Filter und Erkennung ähnlicher Links
- Emoji-Picker für Icons (inkl. Länderflaggen)
- Import/Export der Konfiguration als JSON (vollständige Config, einzelner Link oder einzelne Kategorie)
- Mehrere Tabs für verschiedene Themenbereiche
- Tastaturbedienung: Links, Kategorien und Menüs per Tab/Enter/Kontextmenü-Taste, Sortieren mit Alt+Pfeiltasten
- Robuste Datenhaltung: Importe werden vor dem Übernehmen geprüft, Speicherfehler und Änderungen aus anderen Fenstern überschreiben nichts
- Komplett offline-fähig, keine externen Abhängigkeiten

## Konfiguration

Die Konfiguration wird im `localStorage` des Browsers gespeichert. Eigene Links, Kategorien und Tabs lassen sich direkt in der App hinzufügen — nichts muss im Code geändert werden.

Für Entwickler: `Config/default-config.js` enthält die Standard-Konfiguration (Factory-Reset-Basis). `Config/Demo_config-*.js` sind zusätzliche Beispiel-Tabs, die beim Erststart geladen werden. Welche Config-Dateien geladen werden, steht in `Config/tabs.js` (Reihenfolge = Tab-Reihenfolge). Neue Tabs: Config-Datei nach dem gleichen Schema in `Config/` ablegen und den Dateinamen in `Config/tabs.js` eintragen — `Linksammlung.html` muss dafür nicht geändert werden. Der Export „Alle Default-Configs“ liefert eine fertige `tabs.js` gleich mit.

## Änderungen

Was sich mit welcher Version geändert hat, steht im [CHANGELOG](https://github.com/DerProkurator/Linksammlung/blob/main/CHANGELOG.md).

## Lizenz

MIT — siehe [`LICENSE`](LICENSE). Private und berufliche Nutzung, Anpassung und Weitergabe sind frei.

Drittanbieter: Die Flaggen-Schrift `CSS/fonts/TwemojiCountryFlags.woff2` stammt aus [country-flag-emoji-polyfill](https://github.com/talkjs/country-flag-emoji-polyfill) (Code: MIT); die Flaggen-Grafiken sind von [Twemoji](https://github.com/twitter/twemoji) und stehen unter [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). Details: `CSS/fonts/LICENSE-TwemojiCountryFlags.md`.
