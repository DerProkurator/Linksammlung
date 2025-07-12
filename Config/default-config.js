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
                    favorite: true
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
                    favorite: true
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
                    description: "Mozilla Developer Network - Web-Entwicklung Dokumentation", 
                    icon: "📚",
                    favorite: false
                }
            ]
        },
        'Server': {
            title: 'Server',
            icon: '🖥️',
            collapsed: false,
            links: [
                { 
                    title: "Admin Panel", 
                    url: "https://example.com/admin", 
                    description: "Server-Verwaltungsoberfläche", 
                    icon: "⚙️",
                    favorite: false
                },
                { 
                    title: "Monitoring", 
                    url: "https://example.com/monitoring", 
                    description: "Server-Überwachung und Metriken", 
                    icon: "📊",
                    favorite: false
                }
            ]
        },
        'Sicherheit': {
            title: 'Sicherheit',
            icon: '🛡️',
            collapsed: false,
            links: [
                { 
                    title: "Firewall", 
                    url: "https://example.com/firewall", 
                    description: "Firewall-Einstellungen und Regeln", 
                    icon: "🔥",
                    favorite: false
                },
                { 
                    title: "VPN Dashboard", 
                    url: "https://example.com/vpn", 
                    description: "VPN-Verwaltung und Konfiguration", 
                    icon: "🔒",
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
                    favorite: true
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
    categoryOrder: ['Websites', 'Entwicklung', 'Server', 'Sicherheit', 'Sonstiges']
};

// Funktion zum Abrufen der Standard-Konfiguration
function getDefaultConfig() {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

// Für Kompatibilität mit älteren Versionen
window.DEFAULT_CONFIG = DEFAULT_CONFIG;
window.getDefaultConfig = getDefaultConfig;

console.log('✅ Standard-Konfiguration geladen');