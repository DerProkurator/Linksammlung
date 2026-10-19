/**
 * ========================================================================
 * DEMO-KONFIGURATION: ALLGEMEIN
 * ========================================================================
 * Auslieferungsvorlage ohne persönliche Daten.
 * Enthält nur öffentliche URLs — keine privaten IPs oder Zugangsdaten.
 *
 * SETUP FÜR WEITERGABE:
 *   1. Diese Datei nach Config/ kopieren
 *   2. In Linksammlung.html das Script-Tag anpassen:
 *      <script src=".\Config\Demo_config-Allgemein.js"></script>
 * ========================================================================
 */
(function() {
    if (!window.DYNAMIC_CONFIGS) window.DYNAMIC_CONFIGS = {};
    window.DYNAMIC_CONFIGS["Allgemein"] = {
        icon:   "🌐",
        hidden: false,
        config: {
            categories: {
                "Websites": {
                    title: "Websites",
                    icon: "🌐",
                    collapsed: false,
                    links: [
                        { title: "Google",     url: "https://www.google.com",     description: "Suchmaschine",                         icon: "🔍", favorite: false },
                        { title: "YouTube",    url: "https://www.youtube.com",    description: "Videos und Tutorials",                  icon: "📺", favorite: false },
                        { title: "Wikipedia",  url: "https://www.wikipedia.org",  description: "Freie Enzyklopädie",                    icon: "📖", favorite: false },
                        { title: "Reddit",     url: "https://www.reddit.com",     description: "Foren und Communities zu allen Themen", icon: "👽", favorite: false }
                    ]
                },
                "Produktivitaet": {
                    title: "Produktivität",
                    icon: "✅",
                    collapsed: false,
                    links: [
                        { title: "Notion",        url: "https://www.notion.so",          description: "Notizen, Wikis und Projektmanagement",      icon: "📝", favorite: false },
                        { title: "Trello",         url: "https://trello.com",             description: "Kanban-Boards und Aufgabenverwaltung",       icon: "📋", favorite: false },
                        { title: "Google Drive",   url: "https://drive.google.com",       description: "Cloud-Speicher und Office-Dokumente",        icon: "☁️", favorite: false },
                        { title: "Google Kalender",url: "https://calendar.google.com",    description: "Terminplanung und Kalender",                 icon: "📅", favorite: false },
                        { title: "Bitwarden",      url: "https://vault.bitwarden.com",    description: "Open-Source Passwort-Manager",               icon: "🔒", favorite: false }
                    ]
                },
                "Medien": {
                    title: "Medien & Unterhaltung",
                    icon: "🎬",
                    collapsed: false,
                    links: [
                        { title: "Spotify",      url: "https://www.spotify.com",         description: "Musik-Streaming und Podcasts",         icon: "🎵", favorite: false },
                        { title: "Netflix",      url: "https://www.netflix.com",         description: "Serien und Filme",                     icon: "🎬", favorite: false },
                        { title: "Twitch",       url: "https://www.twitch.tv",           description: "Live-Streaming Plattform",             icon: "🟣", favorite: false },
                        { title: "Prime Video",  url: "https://www.primevideo.com",      description: "Amazon Video-Streaming",               icon: "📦", favorite: false }
                    ]
                },
                "News": {
                    title: "News",
                    icon: "📰",
                    collapsed: false,
                    links: [
                        { title: "Heise Online", url: "https://www.heise.de",            description: "IT-News und Technik",                  icon: "🖥️", favorite: false },
                        { title: "Golem",        url: "https://www.golem.de",            description: "IT-Nachrichten für Profis",            icon: "🤖", favorite: false },
                        { title: "Spiegel",      url: "https://www.spiegel.de",          description: "Nachrichten aus Deutschland",          icon: "📰", favorite: false },
                        { title: "Tagesschau",   url: "https://www.tagesschau.de",       description: "ARD Nachrichten",                      icon: "📡", favorite: false }
                    ]
                }
            },
            categoryOrder: ["Websites", "Produktivitaet", "Medien", "News"]
        }
    };
})();
