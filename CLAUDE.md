# Hinweise für Claude

## Versionsnummer

Bei **jedem Commit** die Versionsnummer anpassen (Schema `MAJOR.MINOR.PATCH`):

- **Patch** (z. B. 3.3.1 → 3.3.2): Fehlerbehebungen, kleine Anpassungen.
  Nur die sichtbare Version im Footer von `Linksammlung.html` erhöhen
  (`© 2026 DP (BS) - Link-Sammlung vX.Y.Z`).
- **Minor** (z. B. 3.3.x → 3.4): neue Funktionen. Zusätzlich überall anpassen:
  Kopfzeilen aller `JS/*.js` und `CSS/styles.css`,
  `Nutzeranleitung.html` (Titel, Badge, Fußzeile, Druck-Kopfzeile).
- **Major**: nur nach Rücksprache.

Die aktuelle Version steht im Footer von `Linksammlung.html`.

## Changelog

Bei jedem Commit, der die App für Nutzer sichtbar verändert, in `CHANGELOG.md`
unter der passenden Minor-Version oben eine Zeile ergänzen:
`- X.Y.Z — kurze Beschreibung aus Nutzersicht`. Technische Details gehören in die
Commit-Nachricht. Reine Repo-Pflege (Doku-Ablage, .gitignore u. ä.) nicht eintragen.

## Lokale Dateien

Alles, was nur lokal gebraucht wird (Audits, Tests, Notizen), gehört in den Ordner
`Lokal/` – er steht in der `.gitignore` und wird nie veröffentlicht.

- Regressionstests: `node Lokal/Tests/regression.cjs` (aus dem Projektverzeichnis)
- Audits: `Lokal/Audit/<Datum>/`
