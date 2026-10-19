/**
 * ========================================================================
 * STANDARD-KONFIGURATION FÜR LINKSAMMLUNG
 * ========================================================================
 *
 * Diese Datei enthält die Standard-Konfiguration, die geladen wird,
 * wenn keine lokale Konfiguration im Browser gespeichert ist.
 *
 * ========================================================================
 */

// Standard-Konfiguration
const DEFAULT_CONFIG = {
    categories: {
        'Websites': {
            title: 'Websites',
            icon: '🌐',
            collapsed: false,
            links: [
                {
                    title: "Google",
                    url: "https://www.google.com",
                    description: "Die weltweit führende Suchmaschine",
                    icon: "🔍",
                    favorite: false
                },
                {
                    title: "YouTube",
                    url: "https://www.youtube.com",
                    description: "Videos und Tutorials",
                    icon: "📺",
                    favorite: false
                }
            ]
        },
        'Entwicklung': {
            title: 'Entwicklung',
            icon: '💻',
            collapsed: false,
            links: [
                {
                    title: "GitHub",
                    url: "https://www.github.com",
                    description: "Code-Repositories und Versionskontrolle",
                    icon: "💻",
                    favorite: false
                },
                {
                    title: "Stack Overflow",
                    url: "https://stackoverflow.com",
                    description: "Entwickler-Community für Fragen und Antworten",
                    icon: "❓",
                    favorite: false
                },
                {
                    title: "MDN Web Docs",
                    url: "https://developer.mozilla.org",
                    description: "Mozilla Developer Network – Web-Dokumentation",
                    icon: "📚",
                    favorite: false
                }
            ]
        },
        'Produktivität': {
            title: 'Produktivität',
            icon: '✅',
            collapsed: false,
            links: [
                {
                    title: "Notion",
                    url: "https://www.notion.so",
                    description: "Notizen, Wikis und Projektmanagement",
                    icon: "📝",
                    favorite: false
                },
                {
                    title: "Trello",
                    url: "https://trello.com",
                    description: "Kanban-Boards und Aufgabenverwaltung",
                    icon: "📋",
                    favorite: false
                },
                {
                    title: "Bitwarden",
                    url: "https://vault.bitwarden.com",
                    description: "Open-Source Passwort-Manager",
                    icon: "🔒",
                    favorite: false
                }
            ]
        },
        'Lernen': {
            title: 'Lernen',
            icon: '🎓',
            collapsed: false,
            links: [
                {
                    title: "TryHackMe",
                    url: "https://tryhackme.com",
                    description: "Hands-on Cybersecurity Training · Rooms & Learning Paths",
                    icon: "🎯",
                    favorite: false
                }
            ]
        },
        'Sonstiges': {
            title: 'Sonstiges',
            icon: '📁',
            collapsed: false,
            links: [
                {
                    title: "Spotify",
                    url: "https://www.spotify.com",
                    description: "Musik-Streaming und Podcasts",
                    icon: "🎵",
                    favorite: false
                },
                {
                    title: "Netflix",
                    url: "https://www.netflix.com",
                    description: "Video-Streaming-Dienst",
                    icon: "🎬",
                    favorite: false
                },
                {
                    title: "Notion",
                    url: "https://www.notion.so",
                    description: "Notizen und Projekt-Management",
                    icon: "📝",
                    favorite: false
                }
            ]
        }
    },
    categoryOrder: ['Lernen', 'Produktivität', 'Websites', 'Entwicklung', 'Sonstiges']
};

// Funktion zum Abrufen der Standard-Konfiguration
function getDefaultConfig() {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

// Für Kompatibilität mit älteren Versionen
window.DEFAULT_CONFIG = DEFAULT_CONFIG;
window.getDefaultConfig = getDefaultConfig;

// Fallback-Tab wenn keine DYNAMIC_CONFIGS vorhanden (z.B. altes System ohne Tab-Dateien)
window.DEFAULT_TAB = { id: 'allgemein', label: 'Allgemein', icon: '🌐' };

console.log('✅ Standard-Konfiguration geladen');
