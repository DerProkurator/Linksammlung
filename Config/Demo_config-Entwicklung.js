/**
 * ========================================================================
 * DEMO-KONFIGURATION: ENTWICKLUNG
 * ========================================================================
 * Auslieferungsvorlage ohne persönliche Daten.
 * Enthält nur öffentliche URLs — keine privaten IPs oder Zugangsdaten.
 *
 * SETUP FÜR WEITERGABE:
 *   1. Diese Datei nach Config/ kopieren
 *   2. Dateinamen in Config/tabs.js eintragen:
 *      "Demo_config-Entwicklung.js",
 * ========================================================================
 */
(function() {
    if (!window.DYNAMIC_CONFIGS) window.DYNAMIC_CONFIGS = {};
    window.DYNAMIC_CONFIGS["Entwicklung"] = {
        icon:   "💻",
        hidden: false,
        config: {
            categories: {
                "Code": {
                    title: "Entwicklung",
                    icon: "💻",
                    collapsed: false,
                    links: [
                        { title: "GitHub",         url: "https://www.github.com",              description: "Code-Repositories und Versionskontrolle",      icon: "🐙", favorite: false },
                        { title: "Stack Overflow", url: "https://stackoverflow.com",           description: "Entwickler-Community für Fragen und Antworten", icon: "❓", favorite: false },
                        { title: "MDN Web Docs",   url: "https://developer.mozilla.org",       description: "Web-Dokumentation von Mozilla",                 icon: "📚", favorite: false },
                        { title: "npm",            url: "https://www.npmjs.com",               description: "Node.js Paket-Registry",                        icon: "📦", favorite: false },
                        { title: "PyPI",           url: "https://pypi.org",                    description: "Python Paket-Index",                            icon: "🐍", favorite: false },
                        { title: "crates.io",      url: "https://crates.io",                   description: "Rust Paket-Registry",                           icon: "🦀", favorite: false }
                    ]
                },
                "Tools": {
                    title: "Online Tools",
                    icon: "🔧",
                    collapsed: false,
                    links: [
                        { title: "CodePen",        url: "https://codepen.io",                  description: "HTML/CSS/JS live im Browser testen",            icon: "✏️", favorite: false },
                        { title: "Regex101",       url: "https://regex101.com",                description: "Reguläre Ausdrücke testen und debuggen",        icon: "🔎", favorite: false },
                        { title: "JSON Formatter", url: "https://jsonformatter.curiousconcept.com", description: "JSON formatieren und validieren",          icon: "📄", favorite: false },
                        { title: "Can I Use",      url: "https://caniuse.com",                 description: "Browser-Kompatibilität für Web-Features",       icon: "🌍", favorite: false },
                        { title: "Excalidraw",     url: "https://excalidraw.com",              description: "Handgezeichnete Diagramme und Skizzen",         icon: "✏️", favorite: false }
                    ]
                },
                "Dokumentation": {
                    title: "Dokumentation",
                    icon: "📖",
                    collapsed: false,
                    links: [
                        { title: "DevDocs",        url: "https://devdocs.io",                  description: "Kombinierte API-Dokumentation für viele Sprachen", icon: "📖", favorite: false },
                        { title: "Node.js Docs",   url: "https://nodejs.org/docs/latest/api/", description: "Offizielle Node.js API-Dokumentation",             icon: "🟩", favorite: false },
                        { title: "PHP Manual",     url: "https://www.php.net/manual/de/",      description: "Offizielle PHP-Dokumentation",                     icon: "🐘", favorite: false },
                        { title: "Arch Wiki",      url: "https://wiki.archlinux.org",          description: "Umfangreiches Linux-Wiki, auch für andere Distros", icon: "🏹", favorite: false }
                    ]
                },
                "CheatSheets": {
                    title: "CheatSheets",
                    icon: "📑",
                    collapsed: false,
                    links: [
                        { title: "VIM Cheat Sheet",     url: "https://vim.rtorr.com/",         description: "Kurzübersicht aller VIM-Shortcuts",               icon: "⌨️", favorite: false },
                        { title: "Git Cheat Sheet",     url: "https://education.github.com/git-cheat-sheet-education.pdf", description: "Die wichtigsten Git-Befehle auf einen Blick", icon: "📋", favorite: false },
                        { title: "Crontab Generator",   url: "https://crontab-generator.org/", description: "Cron-Ausdrücke erstellen",                         icon: "⏰", favorite: false },
                        { title: "Crontab Guru",        url: "https://crontab.guru",           description: "Cron-Ausdrücke verständlich erklären lassen",      icon: "🔄", favorite: false },
                        { title: "chmod Calculator",    url: "https://chmod-calculator.com",   description: "Linux Dateirechte visuell berechnen",              icon: "🔐", favorite: false }
                    ]
                }
            },
            categoryOrder: ["Code", "Tools", "Dokumentation", "CheatSheets"]
        }
    };
})();
