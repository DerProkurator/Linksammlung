// ========================================================================
// LINKSAMMLUNG - IMPORT-EXPORT.JS v3.3
// ========================================================================
// Import/Export-System: Einzellink, Kategorie, Vollständige Config
// Abhängig von: config.js, categories.js
// ========================================================================

// -----------------------------------------------------------------------
// EINZELNEN LINK EXPORTIEREN / IMPORTIEREN
// -----------------------------------------------------------------------

/**
 * Einzelnen Link als JSON exportieren
 */
function exportSingleLink() {
    if (!currentContextLink) return;

    const { categoryKey, linkIndex } = currentContextLink;
    const link     = linkCategories[categoryKey].links[linkIndex];
    const category = linkCategories[categoryKey];

    const linkData = {
        type:       'single_link',
        version:    '1.0',
        exportDate: new Date().toISOString(),
        link: {
            title:       link.title,
            url:         link.url,
            description: link.description,
            icon:        link.icon,
            favorite:    link.favorite || false
        },
        originalCategory:    category.title,
        originalCategoryKey: categoryKey
    };

    try {
        downloadJSON(linkData, `link-${sanitizeFilename(link.title)}.json`);
        showMessage(`Link "${link.title}" erfolgreich exportiert`, 'success');
    } catch (e) {
        console.error('Export error:', e);
        showMessage('Fehler beim Exportieren des Links', 'error');
    }

    hideContextMenu();
}

/**
 * Einzelnen Link importieren
 */
function importSingleLink(event) {
    closeMenu();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const linkData = JSON.parse(e.target.result);

            if (!validateSingleLink(linkData)) {
                throw new Error('Ungültige Link-Datei');
            }

            const link                 = linkData.link;
            const originalCategoryKey  = linkData.originalCategoryKey;
            const originalCategoryTitle = linkData.originalCategory;

            if (link.favorite === undefined) link.favorite = false;

            let targetCategoryKey = null;

            if (originalCategoryKey && linkCategories[originalCategoryKey]) {
                targetCategoryKey = originalCategoryKey;
            } else {
                for (const [key, category] of Object.entries(linkCategories)) {
                    if (category.title === originalCategoryTitle) {
                        targetCategoryKey = key;
                        break;
                    }
                }
            }

            if (targetCategoryKey) {
                linkCategories[targetCategoryKey].links.push(link);
                sortCategoriesEmptyLast();
                saveConfig(true);
                renderCategories();
                updateFavoritesCount();
                showMessage(`Link "${link.title}" erfolgreich in "${linkCategories[targetCategoryKey].title}" importiert`, 'success');
            } else {
                showCategorySelectionModal(link, originalCategoryTitle);
            }

        } catch (e) {
            console.error('Import error:', e);
            showMessage('Fehler beim Importieren: Ungültige Link-Datei', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

/**
 * Einzelnen Link validieren
 */
function validateSingleLink(linkData) {
    if (typeof linkData !== 'object' || linkData === null) return false;
    if (linkData.type !== 'single_link') return false;
    if (!linkData.link || typeof linkData.link !== 'object') return false;

    const link = linkData.link;
    if (!link.title || !link.url) return false;
    if (!isSafeUrl(link.url)) return false;

    if (!link.description) link.description = 'Keine Beschreibung';
    if (!link.icon)        link.icon = '🔗';
    if (link.favorite === undefined) link.favorite = false;

    if (link.priority !== undefined) {
        link.favorite = link.priority;
        delete link.priority;
    }

    return true;
}

// -----------------------------------------------------------------------
// KATEGORIE-AUSWAHL-MODAL (bei fehlender Zielkategorie)
// -----------------------------------------------------------------------

/**
 * Kategorie-Auswahl-Modal anzeigen
 */
function showCategorySelectionModal(link, originalCategoryTitle) {
    pendingLinkImport           = link;
    pendingOriginalCategoryTitle = originalCategoryTitle;

    document.getElementById('importLinkTitle').value = link.title;
    document.getElementById('importLinkUrl').value   = link.url;

    const messageEl = document.getElementById('categorySelectMessage');
    messageEl.textContent = `Die ursprüngliche Kategorie "${originalCategoryTitle}" wurde nicht gefunden. Wählen Sie eine Option:`;

    const select = document.getElementById('importLinkCategory');
    select.innerHTML = '<option value="">Option auswählen</option>';

    const originalOption = document.createElement('option');
    originalOption.value       = '__original__';
    originalOption.textContent = `📁 Ursprüngliche Kategorie "${originalCategoryTitle}" erstellen`;
    select.appendChild(originalOption);

    const newOption = document.createElement('option');
    newOption.value       = '__new__';
    newOption.textContent = '📝 Neue Kategorie erstellen';
    select.appendChild(newOption);

    const existingGroup = document.createElement('optgroup');
    existingGroup.label = 'In vorhandene Kategorie einfügen:';
    categoryOrder.forEach(key => {
        if (linkCategories[key]) {
            const category = linkCategories[key];
            const option   = document.createElement('option');
            option.value       = key;
            option.textContent = `${category.icon} ${category.title}`;
            existingGroup.appendChild(option);
        }
    });
    select.appendChild(existingGroup);

    document.getElementById('newCategoryFields').style.display   = 'none';
    document.getElementById('categorySelectModal').style.display = 'block';
}

/**
 * Neue Kategorie-Felder ein-/ausblenden
 */
function toggleNewCategoryFields() {
    const select           = document.getElementById('importLinkCategory');
    const newCategoryFields = document.getElementById('newCategoryFields');

    if (select.value === '__new__') {
        newCategoryFields.style.display = 'block';
        document.getElementById('newCategoryTitle').value = '';
        document.getElementById('newCategoryIcon').value  = '';
        setTimeout(() => document.getElementById('newCategoryTitle').focus(), 100);
    } else {
        newCategoryFields.style.display = 'none';
        document.getElementById('newCategoryTitle').value = '';
        document.getElementById('newCategoryIcon').value  = '';
    }
}

/**
 * Kategorie-Auswahl-Modal schließen
 */
function closeCategorySelectModal() {
    document.getElementById('categorySelectModal').style.display = 'none';
    document.getElementById('importLinkCategory').value          = '';
    document.getElementById('newCategoryFields').style.display   = 'none';
    document.getElementById('newCategoryTitle').value            = '';
    document.getElementById('newCategoryIcon').value             = '';

    pendingLinkImport           = null;
    pendingOriginalCategoryTitle = null;
}

/**
 * Link-Import bestätigen
 */
function confirmLinkImport() {
    if (!pendingLinkImport) return;

    const categoryKey = document.getElementById('importLinkCategory').value;
    if (!categoryKey) {
        alert('Bitte wählen Sie eine Option aus!');
        return;
    }

    if (categoryKey === '__original__') {
        const originalCategoryTitle = pendingOriginalCategoryTitle;
        const newKey = originalCategoryTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');

        if (linkCategories[newKey]) {
            alert('Eine Kategorie mit diesem Namen existiert bereits!');
            return;
        }

        linkCategories[newKey] = { title: originalCategoryTitle, icon: '📁', collapsed: false, links: [] };
        categoryOrder.push(newKey);
        linkCategories[newKey].links.push(pendingLinkImport);

        sortCategoriesEmptyLast();
        saveConfig(true);
        renderCategories();
        populateCategorySelect();
        updateFavoritesCount();
        showMessage(`Ursprüngliche Kategorie "${originalCategoryTitle}" erstellt und Link "${pendingLinkImport.title}" importiert`, 'success');

    } else if (categoryKey === '__new__') {
        const newCategoryTitle = document.getElementById('newCategoryTitle').value.trim();
        const newCategoryIcon  = document.getElementById('newCategoryIcon').value.trim() || '📁';

        if (!newCategoryTitle) {
            alert('Bitte geben Sie einen Namen für die neue Kategorie ein!');
            return;
        }

        const newKey = newCategoryTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');

        if (linkCategories[newKey]) {
            alert('Eine Kategorie mit diesem Namen existiert bereits!');
            return;
        }

        linkCategories[newKey] = { title: newCategoryTitle, icon: newCategoryIcon, collapsed: false, links: [] };
        categoryOrder.push(newKey);
        linkCategories[newKey].links.push(pendingLinkImport);

        sortCategoriesEmptyLast();
        saveConfig(true);
        renderCategories();
        populateCategorySelect();
        updateFavoritesCount();
        showMessage(`Neue Kategorie "${newCategoryTitle}" erstellt und Link "${pendingLinkImport.title}" importiert`, 'success');

    } else {
        linkCategories[categoryKey].links.push(pendingLinkImport);

        sortCategoriesEmptyLast();
        saveConfig(true);
        renderCategories();
        updateFavoritesCount();
        showMessage(`Link "${pendingLinkImport.title}" erfolgreich in "${linkCategories[categoryKey].title}" importiert`, 'success');
    }

    closeCategorySelectModal();
}

// -----------------------------------------------------------------------
// EINZELNE KATEGORIE EXPORTIEREN / IMPORTIEREN
// -----------------------------------------------------------------------

/**
 * Einzelne Kategorie als JSON exportieren
 */
function exportSingleCategory() {
    if (!currentContextCategory) return;

    const category = linkCategories[currentContextCategory];

    const categoryData = {
        type:       'single_category',
        version:    '1.0',
        exportDate: new Date().toISOString(),
        category: {
            title:     category.title,
            icon:      category.icon,
            collapsed: category.collapsed,
            links:     category.links.map(link => ({
                title:       link.title,
                url:         link.url,
                description: link.description,
                icon:        link.icon,
                favorite:    link.favorite || false
            }))
        },
        originalCategoryKey: currentContextCategory
    };

    try {
        downloadJSON(categoryData, `kategorie-${sanitizeFilename(category.title)}.json`);
        showMessage(`Kategorie "${category.title}" erfolgreich exportiert`, 'success');
    } catch (e) {
        console.error('Export error:', e);
        showMessage('Fehler beim Exportieren der Kategorie', 'error');
    }

    hideContextMenu();
}

/**
 * Einzelne Kategorie importieren
 */
function importSingleCategory(event) {
    closeMenu();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const categoryData = JSON.parse(e.target.result);

            if (!validateSingleCategory(categoryData)) {
                throw new Error('Ungültige Kategorie-Datei');
            }

            const category             = categoryData.category;
            const originalCategoryKey  = categoryData.originalCategoryKey;

            let existingCategoryKey = null;
            let conflictingKey      = null;

            for (const [key, existingCategory] of Object.entries(linkCategories)) {
                if (existingCategory.title === category.title) {
                    existingCategoryKey = key;
                    break;
                }
            }

            if (!existingCategoryKey && originalCategoryKey && linkCategories[originalCategoryKey]) {
                conflictingKey = originalCategoryKey;
            }

            if (existingCategoryKey || conflictingKey) {
                showCategoryImportConflictDialog(categoryData, existingCategoryKey, conflictingKey);
            } else {
                importCategoryDirectly(categoryData);
            }

        } catch (e) {
            console.error('Import error:', e);
            showMessage('Fehler beim Importieren: Ungültige Kategorie-Datei', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

/**
 * Kategorie-Import-Konflikt-Dialog anzeigen
 */
function showCategoryImportConflictDialog(categoryData, existingCategoryKey, conflictingKey) {
    pendingCategoryImport = categoryData;

    const category        = categoryData.category;
    const conflictType    = existingCategoryKey ? 'title' : 'key';
    const conflictingCategory = existingCategoryKey
        ? linkCategories[existingCategoryKey]
        : linkCategories[conflictingKey];

    const message = conflictType === 'title'
        ? `Eine Kategorie mit dem Namen "${category.title}" existiert bereits.`
        : `Eine Kategorie mit dem Schlüssel "${conflictingKey}" existiert bereits.`;

    if (confirm(`${message}\n\nWie möchten Sie fortfahren?\n\nOK = Links zur bestehenden Kategorie hinzufügen\nAbbrechen = Neue Kategorie mit anderem Namen erstellen`)) {
        const targetKey = existingCategoryKey || conflictingKey;
        const existingUrls = new Set(
            linkCategories[targetKey].links.map(l => l.url.trim().toLowerCase())
        );

        let added = 0;
        let skipped = 0;
        category.links.forEach(link => {
            if (link.favorite === undefined) link.favorite = false;
            if (existingUrls.has(link.url.trim().toLowerCase())) {
                skipped++;
            } else {
                linkCategories[targetKey].links.push(link);
                existingUrls.add(link.url.trim().toLowerCase());
                added++;
            }
        });

        sortCategoriesEmptyLast();
        saveConfig(true);
        renderCategories();
        updateFavoritesCount();
        const skipNote = skipped > 0 ? ` (${skipped} Duplikat${skipped > 1 ? 'e' : ''} übersprungen)` : '';
        showMessage(`${added} Link${added !== 1 ? 's' : ''} zur Kategorie "${conflictingCategory.title}" hinzugefügt${skipNote}`, added > 0 ? 'success' : 'warning');
    } else {
        const newName = prompt('Neuer Name für die Kategorie:', category.title + ' (Importiert)');
        if (newName && newName.trim()) {
            category.title = newName.trim();
            importCategoryDirectly(categoryData);
        }
    }

    pendingCategoryImport = null;
}

/**
 * Kategorie direkt importieren
 */
function importCategoryDirectly(categoryData) {
    const category            = categoryData.category;
    let newCategoryKey        = category.title.toLowerCase().replace(/[^a-z0-9]/g, '_');

    let counter = 1;
    const baseKey = newCategoryKey;
    while (linkCategories[newCategoryKey]) {
        newCategoryKey = `${baseKey}_${counter}`;
        counter++;
    }

    category.links.forEach(link => {
        if (link.favorite === undefined) link.favorite = false;
    });

    linkCategories[newCategoryKey] = {
        title:     category.title,
        icon:      category.icon || '📁',
        collapsed: category.collapsed || false,
        links:     category.links
    };

    categoryOrder.push(newCategoryKey);

    sortCategoriesEmptyLast();
    saveConfig(true);
    renderCategories();
    populateCategorySelect();
    updateFavoritesCount();

    showMessage(`Kategorie "${category.title}" mit ${category.links.length} Links erfolgreich importiert`, 'success');
}

/**
 * Einzelne Kategorie validieren
 */
function validateSingleCategory(categoryData) {
    if (typeof categoryData !== 'object' || categoryData === null) return false;
    if (categoryData.type !== 'single_category') return false;
    if (!categoryData.category || typeof categoryData.category !== 'object') return false;

    const category = categoryData.category;
    if (!category.title || !Array.isArray(category.links)) return false;

    if (!category.icon)                        category.icon = '📁';
    if (category.collapsed === undefined)      category.collapsed = false;

    for (const link of category.links) {
        if (!link.title || !link.url) return false;
        if (!isSafeUrl(link.url)) return false;
        if (!link.description)        link.description = 'Keine Beschreibung';
        if (!link.icon)               link.icon = '🔗';
        if (link.favorite === undefined) link.favorite = false;
        if (link.priority !== undefined) {
            link.favorite = link.priority;
            delete link.priority;
        }
    }

    return true;
}

// -----------------------------------------------------------------------
// VOLLSTÄNDIGE KONFIGURATION EXPORTIEREN / IMPORTIEREN
// -----------------------------------------------------------------------

/**
 * Vollständige Konfiguration (aktueller Tab) als JSON exportieren
 */
function exportConfig() {
    closeMenu();
    try {
        const tab     = tabsList.find(t => t.id === activeTabId) || { label: activeTabId };
        const filename = `meine-links-${sanitizeFilename(tab.label)}.json`;
        downloadJSON(config, filename);
        showMessage('Konfiguration erfolgreich exportiert', 'success');
    } catch (e) {
        showMessage('Fehler beim Exportieren der Konfiguration', 'error');
    }
}

/**
 * Konfiguration aus JSON importieren
 */
function importConfig(event) {
    closeMenu();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedConfig = JSON.parse(e.target.result);

            if (!validateConfig(importedConfig)) {
                throw new Error('Ungültige Konfiguration');
            }

            if (confirm('Möchten Sie die aktuelle Konfiguration ersetzen?')) {
                if (importedConfig.categories) {
                    config        = importedConfig;
                    linkCategories = config.categories;
                    categoryOrder  = config.categoryOrder || Object.keys(linkCategories);
                } else {
                    linkCategories = importedConfig;
                    categoryOrder  = Object.keys(linkCategories);
                    config        = { categories: linkCategories, categoryOrder };
                }

                addFavoritesSupportToLinks();

                Object.keys(linkCategories).forEach(key => {
                    if (linkCategories[key].collapsed === undefined) {
                        linkCategories[key].collapsed = false;
                    }
                });

                const existingKeys = Object.keys(linkCategories);
                const missingKeys  = existingKeys.filter(k => !categoryOrder.includes(k));
                if (missingKeys.length > 0) categoryOrder = [...categoryOrder, ...missingKeys];
                categoryOrder = categoryOrder.filter(k => linkCategories[k]);

                sortCategoriesEmptyLast();
                saveConfig(true);
                renderCategories();
                updateFavoritesCount();
                showMessage('Konfiguration erfolgreich importiert', 'success');
            }
        } catch (e) {
            console.error('Import error:', e);
            showMessage('Fehler beim Importieren: Ungültige JSON-Datei', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// -----------------------------------------------------------------------
// DEFAULT-CONFIG EXPORT
// -----------------------------------------------------------------------

/**
 * Default-Config Export Vorschau anzeigen
 */
function previewDefaultConfig() {
    closeMenu();

    const totalLinks      = getTotalLinksCount();
    const totalFavorites  = getTotalFavoritesCount();
    const totalCategories = categoryOrder.length;

    let categoriesPreview = '';
    categoryOrder.forEach(key => {
        const category = linkCategories[key];
        if (category) {
            const linkCount     = category.links.length;
            const favoriteCount = category.links.filter(l => l.favorite).length;
            const favoriteInfo  = favoriteCount > 0 ? ` (${favoriteCount} ⭐)` : '';

            categoriesPreview += `<div style="margin:8px 0;padding:8px 12px;background:rgba(64,224,208,0.1);border-radius:8px;display:flex;align-items:center;gap:10px;">
                <span style="font-size:1.2em;">${esc(category.icon)}</span>
                <span style="flex-grow:1;font-weight:500;">${esc(category.title)}</span>
                <span style="color:rgba(255,255,255,0.7);font-size:0.9em;">${linkCount} Links${favoriteInfo}</span>
            </div>`;
        }
    });

    const previewHTML = `
        <div class="modal" id="defaultConfigPreviewModal" style="display:block;">
            <div class="modal-content" style="max-width:650px;">
                <h2 style="text-align:center;margin-bottom:25px;"><span class="modal-emoji">🌟</span> Default-Config Export Vorschau</h2>
                <div style="margin-bottom:25px;padding:20px;background:rgba(64,224,208,0.1);border-radius:12px;border:1px solid rgba(64,224,208,0.3);">
                    <div style="font-size:1.1em;margin-bottom:15px;color:#40e0d0;"><strong>📊 Konfigurationsübersicht</strong></div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:15px;">
                        <div style="text-align:center;padding:10px;background:rgba(35,35,55,0.6);border-radius:8px;">
                            <div style="font-size:1.5em;color:#40e0d0;font-weight:bold;">${totalCategories}</div>
                            <div style="font-size:0.9em;color:#b0b0b0;">Kategorien</div>
                        </div>
                        <div style="text-align:center;padding:10px;background:rgba(35,35,55,0.6);border-radius:8px;">
                            <div style="font-size:1.5em;color:#40e0d0;font-weight:bold;">${totalLinks}</div>
                            <div style="font-size:0.9em;color:#b0b0b0;">Links gesamt</div>
                        </div>
                        <div style="text-align:center;padding:10px;background:rgba(35,35,55,0.6);border-radius:8px;">
                            <div style="font-size:1.5em;color:#ffd54f;font-weight:bold;">${totalFavorites}</div>
                            <div style="font-size:0.9em;color:#b0b0b0;">Favoriten ⭐</div>
                        </div>
                    </div>
                </div>
                <div style="margin-bottom:25px;">
                    <div style="font-size:1.1em;margin-bottom:15px;color:#40e0d0;"><strong>📁 Kategorien-Details</strong></div>
                    <div class="modal-scrollable">${categoriesPreview}</div>
                </div>
                <div style="margin-bottom:25px;padding:15px;background:rgba(255,193,7,0.1);border-radius:10px;border:1px solid rgba(255,193,7,0.3);">
                    <div style="color:#ffd54f;font-size:14px;margin-bottom:8px;"><strong>💡 Was passiert beim Export?</strong></div>
                    <div style="color:rgba(255,255,255,0.9);font-size:13px;line-height:1.4;">
                        • Eine <code>Default_config-${esc(tabsList.find(t => t.id === activeTabId)?.label || activeTabId)}.js</code> Datei wird heruntergeladen<br>
                        • Diese enthält die aktuelle Konfiguration im Self-Registrierungs-Format<br>
                        • Datei in <code>Config/</code> ablegen + &lt;script&gt;-Tag in HTML → Tab erscheint automatisch
                    </div>
                </div>
                <div class="form-buttons" style="display:flex;gap:12px;justify-content:flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeDefaultConfigPreview()">Abbrechen</button>
                    <button type="button" class="btn btn-primary" onclick="confirmDefaultConfigExport()"><span>💾</span> Default-Config exportieren</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', previewHTML);
}

/**
 * Default-Config Vorschau schließen
 */
function closeDefaultConfigPreview() {
    const modal = document.getElementById('defaultConfigPreviewModal');
    if (modal) modal.remove();
}

/**
 * Default-Config Export bestätigen
 */
function confirmDefaultConfigExport() {
    closeDefaultConfigPreview();
    exportAsDefaultConfig();
}

/**
 * Standard-Konfiguration als Default_config-{TabName}.js exportieren
 */
function exportAsDefaultConfig() {
    closeMenu();

    try {
        const defaultConfigContent = generateDefaultConfigJS();
        const currentTab = tabsList.find(t => t.id === activeTabId);
        const tabLabel   = currentTab ? currentTab.label : 'Config';
        const filename   = 'Default_config-' + sanitizeFilename(tabLabel) + '.js';

        const dataBlob = new Blob([defaultConfigContent], { type: 'text/javascript' });
        const url  = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);

        _showSnippetHint(filename);
    } catch (e) {
        console.error('Export error:', e);
        showMessage('Fehler beim Exportieren der Default-Konfiguration', 'error');
    }
}

/**
 * Nach Export: HTML-Snippet-Hinweis anzeigen
 * @param {string|string[]} filenames – eine Datei oder Array von Dateinamen
 * @param {boolean} multiMode        – true = "Alle exportieren"-Modus mit erweitertem Hinweis
 */
function _showSnippetHint(filenames, multiMode) {
    const modal   = document.getElementById('snippetHintModal');
    const codeEl  = document.getElementById('snippetHintCode');
    const descEl  = document.getElementById('snippetHintDesc');
    if (!modal || !codeEl) return;

    const files   = Array.isArray(filenames) ? filenames : [filenames];
    const snippet = files.map(f => `<script src="Config/${f}"><\/script>`).join('\n');
    codeEl.textContent = snippet;

    const searchHint = `<span style="margin-top:8px;display:block;color:rgba(64,224,208,0.8);font-size:0.92em;">
        💡 In <code>Linksammlung.html</code> nach <code>Dynamische Tab-Configs</code> suchen —
        dort befinden sich die bestehenden <code>&lt;script&gt;</code>-Zeilen.
    </span>`;

    if (descEl) {
        if (multiMode) {
            descEl.innerHTML = `
                Dateien in <code>Config/</code> ablegen. Die Script-Tags unten müssen nur
                angepasst werden, wenn Tabs <strong>neu angelegt</strong> oder
                <strong>gelöscht</strong> wurden — bei bestehenden Tabs reicht es,
                die Datei zu überschreiben.${searchHint}`;
        } else {
            descEl.innerHTML = `
                Kopiere diesen Tag und füge ihn in <code>Linksammlung.html</code> nach den
                bestehenden <code>&lt;script src="Config/..."&gt;</code>-Zeilen ein.${searchHint}`;
        }
    }

    modal.style.display = 'block';
}

function copySnippetHint() {
    const codeEl = document.getElementById('snippetHintCode');
    if (!codeEl) return;
    navigator.clipboard.writeText(codeEl.textContent).then(() => {
        showMessage('Snippet kopiert', 'success');
    });
}

function closeSnippetHintModal() {
    const modal = document.getElementById('snippetHintModal');
    if (modal) modal.style.display = 'none';
}

/**
 * JavaScript-Code für die Default_config-{TabName}.js Datei generieren
 * @param {object} tabObj  – { id, label, icon } — falls null: aktiver Tab
 * @param {object} cfgObj  – { categories, categoryOrder } — falls null: aktiver Tab
 */
function generateDefaultConfigJS(tabObj, cfgObj) {
    const tab   = tabObj || tabsList.find(t => t.id === activeTabId) || { label: 'Config', icon: '📋' };
    const cfg   = cfgObj || { categories: linkCategories, categoryOrder };

    const order = cfg.categoryOrder || Object.keys(cfg.categories || {});
    const cats  = cfg.categories || {};

    const cleanedConfig = {
        categories:    {},
        categoryOrder: [...order]
    };

    let totalLinks     = 0;
    let totalFavorites = 0;

    order.forEach(key => {
        const category = cats[key];
        if (!category) return;

        cleanedConfig.categories[key] = {
            title:     category.title,
            icon:      category.icon || '📁',
            collapsed: category.collapsed || false,
            links:     category.links.map(link => {
                totalLinks++;
                if (link.favorite) totalFavorites++;
                return {
                    title:       link.title,
                    url:         link.url,
                    description: link.description || '',
                    icon:        link.icon || '🔗',
                    favorite:    link.favorite || false,
                    pinned:      link.pinned || false
                };
            })
        };
    });

    return `/**
 * ========================================================================
 * STANDARD-KONFIGURATION: ${tab.label.toUpperCase().replace(/\*\//g, '* /')}
 * ========================================================================
 * Generiert am: ${new Date().toLocaleString('de-DE')}
 * Kategorien: ${order.length}
 * Links gesamt: ${totalLinks}
 * Favoriten: ${totalFavorites}
 *
 * Tab wird automatisch aus dem Dateinamen erkannt.
 * Datei in Config/ ablegen + <script>-Tag in Linksammlung.html → Tab erscheint automatisch.
 * ========================================================================
 */
(function() {
    if (!window.DYNAMIC_CONFIGS) window.DYNAMIC_CONFIGS = {};
    window.DYNAMIC_CONFIGS[${JSON.stringify(tab.label)}] = {
        icon:   ${JSON.stringify(tab.icon)},
        hidden: ${tab.hidden ? 'true' : 'false'},
        config: ${JSON.stringify(cleanedConfig, null, 8)}
    };
})();`;
}

/**
 * Vorschau-Modal für "Alle Default-Configs exportieren"
 */
function previewAllDefaultConfigs() {
    closeMenu();

    const exportableTabs = tabsList.filter(t => t.id !== 'favorites');
    if (exportableTabs.length === 0) {
        showMessage('Keine Tabs zum Exportieren vorhanden.', 'error');
        return;
    }

    let totalLinks = 0, totalFavorites = 0, totalCategories = 0;
    let tabsPreview = '';

    exportableTabs.forEach(tab => {
        const cfg = getTabConfigById(tab.id);
        if (!cfg) return;
        const order = cfg.categoryOrder || Object.keys(cfg.categories || {});
        const cats  = cfg.categories || {};
        let tabLinks = 0, tabFavs = 0;
        order.forEach(key => {
            const cat = cats[key];
            if (!cat) return;
            tabLinks += cat.links.length;
            tabFavs  += cat.links.filter(l => l.favorite).length;
        });
        totalCategories += order.length;
        totalLinks      += tabLinks;
        totalFavorites  += tabFavs;

        const favInfo = tabFavs > 0 ? ` (${tabFavs} ⭐)` : '';
        const filename = 'Default_config-' + sanitizeFilename(tab.label) + '.js';
        tabsPreview += `<div style="margin:8px 0;padding:8px 12px;background:rgba(64,224,208,0.1);border-radius:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:1.2em;">${esc(tab.icon || '📄')}</span>
                <span style="flex-grow:1;font-weight:500;">${esc(tab.label)}</span>
                <span style="color:rgba(255,255,255,0.7);font-size:0.9em;">${order.length} Kat. · ${tabLinks} Links${favInfo}</span>
            </div>
            <div style="margin-top:4px;font-size:0.8em;color:rgba(255,255,255,0.45);padding-left:2px;">${esc(filename)}</div>
        </div>`;
    });

    const date = new Date().toISOString().slice(0, 10);
    const zipName = `Default_configs_${date}.zip`;

    const previewHTML = `
        <div class="modal" id="allDefaultConfigsPreviewModal" style="display:block;">
            <div class="modal-content" style="max-width:650px;">
                <h2 style="text-align:center;margin-bottom:25px;"><span class="modal-emoji">📦</span> Alle Default-Configs exportieren</h2>
                <div style="margin-bottom:25px;padding:20px;background:rgba(64,224,208,0.1);border-radius:12px;border:1px solid rgba(64,224,208,0.3);">
                    <div style="font-size:1.1em;margin-bottom:15px;color:#40e0d0;"><strong>📊 Gesamtübersicht</strong></div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:15px;">
                        <div style="text-align:center;padding:10px;background:rgba(35,35,55,0.6);border-radius:8px;">
                            <div style="font-size:1.5em;color:#40e0d0;font-weight:bold;">${exportableTabs.length}</div>
                            <div style="font-size:0.9em;color:#b0b0b0;">Tabs</div>
                        </div>
                        <div style="text-align:center;padding:10px;background:rgba(35,35,55,0.6);border-radius:8px;">
                            <div style="font-size:1.5em;color:#40e0d0;font-weight:bold;">${totalCategories}</div>
                            <div style="font-size:0.9em;color:#b0b0b0;">Kategorien</div>
                        </div>
                        <div style="text-align:center;padding:10px;background:rgba(35,35,55,0.6);border-radius:8px;">
                            <div style="font-size:1.5em;color:#40e0d0;font-weight:bold;">${totalLinks}</div>
                            <div style="font-size:0.9em;color:#b0b0b0;">Links gesamt</div>
                        </div>
                        <div style="text-align:center;padding:10px;background:rgba(35,35,55,0.6);border-radius:8px;">
                            <div style="font-size:1.5em;color:#ffd54f;font-weight:bold;">${totalFavorites}</div>
                            <div style="font-size:0.9em;color:#b0b0b0;">Favoriten ⭐</div>
                        </div>
                    </div>
                </div>
                <div style="margin-bottom:25px;">
                    <div style="font-size:1.1em;margin-bottom:15px;color:#40e0d0;"><strong>📁 Tabs im Export</strong></div>
                    <div class="modal-scrollable">${tabsPreview}</div>
                </div>
                <div style="margin-bottom:25px;padding:15px;background:rgba(255,193,7,0.1);border-radius:10px;border:1px solid rgba(255,193,7,0.3);">
                    <div style="color:#ffd54f;font-size:14px;margin-bottom:8px;"><strong>💡 Was passiert beim Export?</strong></div>
                    <div style="color:rgba(255,255,255,0.9);font-size:13px;line-height:1.4;">
                        • Eine ZIP-Datei <code>${esc(zipName)}</code> wird heruntergeladen<br>
                        • Enthält für jeden Tab eine <code>Default_config-*.js</code> Datei<br>
                        • Dateien in <code>Config/</code> ablegen — bestehende Tabs werden automatisch aktualisiert
                    </div>
                </div>
                <div class="form-buttons" style="display:flex;gap:12px;justify-content:flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeAllDefaultConfigsPreview()">Abbrechen</button>
                    <button type="button" class="btn btn-primary" onclick="confirmAllDefaultConfigsExport()"><span>📦</span> Alle exportieren</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', previewHTML);
}

function closeAllDefaultConfigsPreview() {
    const modal = document.getElementById('allDefaultConfigsPreviewModal');
    if (modal) modal.remove();
}

function confirmAllDefaultConfigsExport() {
    closeAllDefaultConfigsPreview();
    exportAllDefaultConfigs();
}

/**
 * Alle Tabs als Default-Config exportieren — eine ZIP-Datei
 */
function exportAllDefaultConfigs() {
    closeMenu();

    const exportableTabs = tabsList.filter(t => t.id !== 'favorites');
    if (exportableTabs.length === 0) {
        showMessage('Keine Tabs zum Exportieren vorhanden.', 'error');
        return;
    }

    if (activeTabId && activeTabId !== 'favorites') {
        saveConfig(true);
    }

    const files = [];
    const exportedFilenames = [];

    exportableTabs.forEach(tab => {
        try {
            const cfg      = getTabConfigById(tab.id);
            const content  = generateDefaultConfigJS(tab, cfg);
            const filename = 'Default_config-' + sanitizeFilename(tab.label) + '.js';
            files.push({ name: filename, content });
            exportedFilenames.push(filename);
        } catch (e) {
            console.error('Export-Fehler für Tab', tab.label, e);
        }
    });

    if (files.length === 0) {
        showMessage('Keine Dateien zum Exportieren.', 'error');
        return;
    }

    try {
        const date     = new Date().toISOString().slice(0, 10);
        const zipName  = `Default_configs_${date}.zip`;
        const zipBytes = _buildZip(files);
        const blob     = new Blob([zipBytes], { type: 'application/zip' });
        const url      = URL.createObjectURL(blob);
        const a        = document.createElement('a');
        a.href         = url;
        a.download     = zipName;
        a.click();
        URL.revokeObjectURL(url);

        _showSnippetHint(exportedFilenames, true);
    } catch (e) {
        console.error('ZIP-Fehler:', e);
        showMessage('Fehler beim Erstellen der ZIP-Datei', 'error');
    }
}

/**
 * Minimaler ZIP-Builder (Store-Modus, keine Kompression).
 * Gibt ein Uint8Array zurück, das eine gültige .zip-Datei enthält.
 * @param {Array<{name: string, content: string}>} files
 * @returns {Uint8Array}
 */
function _buildZip(files) {
    const enc = new TextEncoder();

    function u16(n) { return [(n & 0xff), (n >> 8) & 0xff]; }
    function u32(n) { return [(n & 0xff), (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]; }

    // CRC-32 Lookup-Table nach IEEE 802.3 Polynomial (0xEDB88320 = 0x04C11DB7 bit-reversed)
    const crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        crcTable[i] = c;
    }
    function crc32(buf) {
        let c = 0xFFFFFFFF;
        for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
        return (c ^ 0xFFFFFFFF) >>> 0;
    }

    const localHeaders = [];
    const parts        = [];
    let   offset       = 0;

    files.forEach(file => {
        const nameBytes = enc.encode(file.name);
        const data      = enc.encode(file.content);
        const crc       = crc32(data);
        const dosDate   = _zipDosDate(new Date());

        const local = [
            0x50, 0x4B, 0x03, 0x04,   // Local file header signature
            ...u16(20),                 // Version needed: 2.0
            ...u16(0),                  // General purpose flags
            ...u16(0),                  // Compression: store
            ...u16(dosDate.time),
            ...u16(dosDate.date),
            ...u32(crc),
            ...u32(data.length),        // Compressed size = uncompressed (store)
            ...u32(data.length),
            ...u16(nameBytes.length),
            ...u16(0),                  // Extra field length
            ...nameBytes
        ];

        localHeaders.push({ nameBytes, crc, size: data.length, offset, dosDate });
        parts.push(new Uint8Array(local), data);
        offset += local.length + data.length;
    });

    // Central directory
    const centralParts = [];
    localHeaders.forEach(({ nameBytes, crc, size, offset: lhOffset, dosDate }) => {
        const central = [
            0x50, 0x4B, 0x01, 0x02,   // Central directory signature
            ...u16(20),                 // Version made by
            ...u16(20),                 // Version needed
            ...u16(0),
            ...u16(0),                  // Compression: store
            ...u16(dosDate.time),
            ...u16(dosDate.date),
            ...u32(crc),
            ...u32(size),
            ...u32(size),
            ...u16(nameBytes.length),
            ...u16(0),                  // Extra field length
            ...u16(0),                  // Comment length
            ...u16(0),                  // Disk number start
            ...u16(0),                  // Internal attr
            ...u32(0),                  // External attr
            ...u32(lhOffset),
            ...nameBytes
        ];
        centralParts.push(new Uint8Array(central));
    });

    const centralSize   = centralParts.reduce((s, p) => s + p.length, 0);
    const centralOffset = offset;

    const eocd = [
        0x50, 0x4B, 0x05, 0x06,   // End of central directory signature
        ...u16(0),                  // Disk number
        ...u16(0),                  // Disk with central dir
        ...u16(files.length),
        ...u16(files.length),
        ...u32(centralSize),
        ...u32(centralOffset),
        ...u16(0)                   // Comment length
    ];

    // Zusammenbauen
    const total  = offset + centralSize + eocd.length;
    const result = new Uint8Array(total);
    let   pos    = 0;
    for (const part of [...parts, ...centralParts, new Uint8Array(eocd)]) {
        result.set(part, pos);
        pos += part.length;
    }
    return result;
}

/**
 * Konvertiert ein Date-Objekt in das MS-DOS-Datum/Zeit-Format für ZIP.
 */
function _zipDosDate(d) {
    return {
        time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
        date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
    };
}

// -----------------------------------------------------------------------
// HILFSFUNKTIONEN
// -----------------------------------------------------------------------

/**
 * JSON-Datei herunterladen
 */
function downloadJSON(data, filename) {
    const dataStr  = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url  = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Dateinamen bereinigen
 */
function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-_]/g, '').replace(/\s+/g, '-');
}

// -----------------------------------------------------------------------
// BROWSER-LESEZEICHEN IMPORTIEREN (Netscape Bookmark HTML Format)
// -----------------------------------------------------------------------

let _bmData = null;

/**
 * File-Input Handler für Browser-Lesezeichen
 */
function importBrowserBookmarks(event) {
    closeMenu();
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = _bmParse(e.target.result);
            if (parsed.folders.length === 0 && parsed.rootLinks.length === 0) {
                showMessage('Keine Lesezeichen in der Datei gefunden.', 'error');
                return;
            }
            _bmData = parsed;
            _bmShowDialog(parsed);
        } catch (err) {
            console.error('Bookmark parse error:', err);
            showMessage('Fehler beim Lesen der Lesezeichen-Datei', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

/**
 * Netscape Bookmark HTML → { rootLinks, folders } parsen
 */
function _bmParse(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let folderId = 0;

    function parseDL(dl) {
        const result = { directLinks: [], children: [] };
        if (!dl) return result;

        let node = dl.firstElementChild;
        while (node) {
            if (node.tagName === 'DT') {
                const h3 = node.querySelector('h3');
                const a  = node.querySelector('a');

                if (h3) {
                    // Folder: DL kann direkt in DT stecken ODER als Geschwister folgen
                    let childDL = node.querySelector('dl');
                    if (!childDL) {
                        const next = node.nextElementSibling;
                        if (next && next.tagName === 'DL') {
                            childDL = next;
                            node    = childDL; // Geschwister-DL im outer Loop überspringen
                        }
                    }
                    const child = parseDL(childDL);
                    result.children.push({
                        id:          'bm_f' + (folderId++),
                        name:        h3.textContent.trim() || 'Ordner',
                        directLinks: child.directLinks,
                        children:    child.children
                    });
                } else if (a) {
                    const href = a.getAttribute('href');
                    if (href && !href.startsWith('place:') && !href.startsWith('javascript:')) {
                        result.directLinks.push({
                            title:       a.textContent.trim() || 'Ohne Titel',
                            url:         href,
                            description: '',
                            icon:        '🔗',
                            favorite:    false
                        });
                    }
                }
            }
            node = node.nextElementSibling;
        }
        return result;
    }

    const rootDL = doc.querySelector('dl');
    if (!rootDL) return { rootLinks: [], folders: [] };
    const root = parseDL(rootDL);

    // Browser-Exporte haben immer eine Wrapper-Ebene (Favoritenleiste, Mozilla Firefox,
    // Weitere Lesezeichen, Bookmarks bar, …). Diese überspringen: Level-1 wird Tab-Ebene.
    const flatFolders = [];
    const flatRootLinks = [...root.directLinks];
    root.children.forEach(browserContainer => {
        flatRootLinks.push(...browserContainer.directLinks);
        flatFolders.push(...browserContainer.children);
    });
    return { rootLinks: flatRootLinks, folders: flatFolders };
}

/**
 * Links in einem Ordner (rekursiv) zählen
 */
function _bmCountLinks(folder) {
    let n = folder.directLinks.length;
    folder.children.forEach(c => { n += _bmCountLinks(c); });
    return n;
}

/**
 * Dialog-State initialisieren + Dialog öffnen
 */
function _bmShowDialog(data) {
    window._bmTabChoices    = {};
    window._bmFolderChoices = {};
    window._bmTabNames      = {};
    window._bmTabIcons      = {};
    window._bmRootTabName   = '';
    window._bmRootTabChoice = (activeTabId && activeTabId !== 'favorites') ? activeTabId : (tabsList[0]?.id || 'new');

    data.folders.forEach(topFolder => {
        // Tab-Auswahl: gleich-namigen Tab vorschlagen, sonst "new"
        const existingTab = tabsList.find(t =>
            t.label.toLowerCase() === topFolder.name.toLowerCase()
        );
        window._bmTabChoices[topFolder.id] = existingTab ? existingTab.id : 'new';

        // Level-2+ Unterordner: alle auf 'embed' vorbelegen
        function initEmbed(folder) {
            window._bmFolderChoices[folder.id] = 'embed';
            folder.children.forEach(initEmbed);
        }
        topFolder.children.forEach(l1 => l1.children.forEach(initEmbed));
    });

    _bmRenderDialog(data);
    document.getElementById('bookmarkImportModal').style.display = 'block';
}

/**
 * Kompletten Dialog-Inhalt neu aufbauen
 */
function _bmRenderDialog(data) {
    _bmRenderStats(data);
    _bmRenderTree(data);
    _bmRenderRootLinks(data);
    _bmUpdateImportButton();
}

/**
 * Icon-Picker im Import-Dialog.
 * Picker wird an document.body gehängt damit position:fixed korrekt
 * funktioniert — .modal-content hat transform:translate(-50%,-50%) was
 * sonst einen neuen Containing Block für fixed-Kinder erzeugt.
 */
function _bmToggleIconPicker(triggerId, inputId) {
    const picker  = document.getElementById(inputId + 'Picker');
    const trigger = document.getElementById(triggerId);
    if (!picker || !trigger) return;

    // Alle anderen Picker schließen und zurück in ihren Original-Parent verschieben
    document.querySelectorAll('.emoji-picker.active').forEach(p => {
        if (p !== picker) {
            p.classList.remove('active');
            p.style.position = '';
            p.style.top = p.style.left = p.style.right = p.style.bottom = p.style.width = p.style.zIndex = '';
            if (p._bmOriginalParent && p._bmOriginalParent.isConnected) {
                p._bmOriginalParent.appendChild(p);
                p._bmOriginalParent = null;
            }
        }
    });
    document.querySelectorAll('.emoji-trigger.active').forEach(t => {
        if (t !== trigger) t.classList.remove('active');
    });

    if (picker.classList.contains('active')) {
        picker.classList.remove('active');
        picker.style.position = '';
        picker.style.top = picker.style.left = picker.style.right = picker.style.bottom = picker.style.width = picker.style.zIndex = '';
        if (picker._bmOriginalParent && picker._bmOriginalParent.isConnected) {
            picker._bmOriginalParent.appendChild(picker);
            picker._bmOriginalParent = null;
        }
        trigger.classList.remove('active');
        currentPickerTarget  = null;
        currentPickerElement = null;
        return;
    }

    // Picker an body hängen → entkommt dem transform-Kontext des Modals
    picker._bmOriginalParent = picker.parentElement;
    document.body.appendChild(picker);

    // Position relativ zum Trigger berechnen
    const rect        = trigger.getBoundingClientRect();
    const pickerWidth = 310;
    let leftPos = rect.left;
    if (leftPos + pickerWidth > window.innerWidth - 8) leftPos = window.innerWidth - pickerWidth - 8;
    if (leftPos < 8) leftPos = 8;

    picker.style.position = 'fixed';
    picker.style.top      = (rect.bottom + 6) + 'px';
    picker.style.left     = leftPos + 'px';
    picker.style.width    = pickerWidth + 'px';
    picker.style.right    = 'auto';
    picker.style.bottom   = 'auto';
    picker.style.zIndex   = '10000';

    picker.classList.add('active');
    trigger.classList.add('active');
    currentPickerTarget  = inputId;
    currentPickerElement = picker;
    initEmojiPicker(inputId);
}

/** Link-Vorschau ein-/ausklappen */
function _bmToggleLinkPreview(id) {
    const el  = document.getElementById('bm_preview_' + id);
    const btn = el && el.previousElementSibling && el.previousElementSibling.querySelector('.bm-preview-btn');
    if (!el) return;
    const open = el.classList.toggle('open');
    if (btn) btn.textContent = open ? '▼' : '▶';
}

/** Alle Links eines Ordners (inkl. Unterordner) als HTML-Liste */
function _bmRenderLinkPreviewItems(folder) {
    let html = '';
    folder.directLinks.forEach(l => {
        html += `<div class="bm-link-item">🔗 <span>${_bmEsc(l.title)}</span></div>`;
    });
    folder.children.forEach(sub => {
        html += `<div class="bm-link-item bm-link-subfolder">📁 <span>${_bmEsc(sub.name)}</span></div>`;
        html += _bmRenderLinkPreviewItems(sub);
    });
    return html;
}

/** Stats-Leiste */
function _bmRenderStats(data) {
    const totalFolders = data.folders.length;
    const totalLinks   = data.rootLinks.length +
        data.folders.reduce((s, f) => s + _bmCountLinks(f), 0);

    let html = `
        <div class="bm-stat-item">
            <span class="bm-stat-value">${totalFolders}</span>
            <span class="bm-stat-label">Haupt-Ordner</span>
        </div>
        <div class="bm-stat-item">
            <span class="bm-stat-value">${totalLinks}</span>
            <span class="bm-stat-label">Links gesamt</span>
        </div>`;

    if (data.rootLinks.length > 0) {
        html += `
        <div class="bm-stat-item">
            <span class="bm-stat-value" style="color:#ffd54f;">${data.rootLinks.length}</span>
            <span class="bm-stat-label">Ohne Ordner</span>
        </div>`;
    }

    document.getElementById('bmStats').innerHTML = html;
}

/** Ordner-Baum */
function _bmRenderTree(data) {
    let html = '';

    data.folders.forEach(topFolder => {
        const totalLinks   = _bmCountLinks(topFolder);
        const directCount  = topFolder.directLinks.length;
        const existingTab  = tabsList.find(t =>
            t.label.toLowerCase() === topFolder.name.toLowerCase()
        );
        const currentChoice = window._bmTabChoices[topFolder.id];
        const hasConflict   = existingTab && currentChoice === existingTab.id;

        // --- Tab-Block Header ---
        const savedName = window._bmTabNames[topFolder.id] || '';
        const savedIcon = window._bmTabIcons[topFolder.id] || '📂';
        const inputId   = 'bmTabIcon_' + topFolder.id;
        const isNew     = currentChoice === 'new';

        html += `<div class="bm-tab-block">`;
        html += `<div class="bm-tab-header">`;

        // Linkes Icon: statisch wenn bestehender Tab, Picker-Button wenn Neuer Tab
        html += `<span class="bm-static-icon" id="bmStaticIcon_${topFolder.id}"
                       style="display:${isNew ? 'none' : 'inline'};font-size:1.1em;">📂</span>`;
        html += `
        <div class="emoji-input-container bm-import-icon-picker" id="bmIconContainer_${topFolder.id}"
             style="display:${isNew ? 'inline-flex' : 'none'};">
            <input type="text" id="${inputId}" value="${_bmEsc(savedIcon)}" maxlength="2"
                   style="position:absolute;opacity:0;pointer-events:none;width:0;height:0;"
                   oninput="window._bmTabIcons['${topFolder.id}']=this.value||'📂';
                            var t=document.getElementById('bmIconTrigger_${topFolder.id}');
                            if(t)t.textContent=this.value||'📂';">
            <div class="emoji-trigger" id="bmIconTrigger_${topFolder.id}"
                 onclick="_bmToggleIconPicker('bmIconTrigger_${topFolder.id}','${inputId}')"
                 title="Icon wählen">${savedIcon}</div>
            <div class="emoji-picker" id="${inputId}Picker">
                <div class="emoji-picker-header">
                    <input type="text" class="emoji-search" placeholder="Emoji suchen..."
                           onkeyup="searchEmojis(this.value,'${inputId}Picker')">
                    <div class="emoji-categories" id="${inputId}Categories"></div>
                </div>
                <div class="emoji-grid" id="${inputId}Grid"></div>
            </div>
        </div>`;

        // Ordner-Name (statisch) + Info
        html += `<span class="bm-tab-name">${_bmEsc(topFolder.name)}</span>`;
        html += `<span class="bm-tab-info">${totalLinks} Links${directCount > 0 ? ` · ${directCount} direkt` : ''}</span>`;

        // Dropdown für Tab-Ziel
        html += `<select class="bm-tab-select${hasConflict ? ' merge-warning' : ''}"
                         id="bmTabChoice_${topFolder.id}"
                         onchange="window._bmTabChoices['${topFolder.id}']=this.value; _bmToggleNameInput('${topFolder.id}'); _bmUpdateImportButton()">`;
        html += `<option value="new"${currentChoice === 'new' ? ' selected' : ''}>📋 Neuer Tab</option>`;
        tabsList.forEach(t => {
            const sel     = currentChoice === t.id ? ' selected' : '';
            const warning = t.label.toLowerCase() === topFolder.name.toLowerCase() ? ' ⚠️' : '';
            html += `<option value="${t.id}"${sel}>→ ${t.icon} ${_bmEsc(t.label)}${warning}</option>`;
        });
        html += `</select>`;

        // Custom Tab-Name (nur bei "Neuer Tab")
        html += `<input type="text" class="bm-tab-name-input" id="bmTabName_${topFolder.id}"
                        placeholder="${_bmEsc(topFolder.name)}"
                        value="${_bmEsc(savedName)}"
                        style="display:${isNew ? 'inline-block' : 'none'};"
                        oninput="window._bmTabNames['${topFolder.id}']=this.value; _bmUpdateImportButton()">`;

        html += `</div>`; // bm-tab-header

        // --- Tab-Body: Direkte Links + Level-1/2+ Unterordner ---
        if (directCount > 0 || topFolder.children.length > 0) {
            html += `<div class="bm-tab-body">`;

            if (directCount > 0) {
                html += `<div class="bm-folder-row">
                    <div style="width:16px;flex-shrink:0;"></div>
                    <span>🔗</span>
                    <span class="bm-folder-name" style="color:rgba(255,255,255,0.45);">${directCount} direkte Links</span>
                    <span class="bm-category-badge">Kat. „${_bmEsc(topFolder.name)}"</span>
                    <button class="bm-preview-btn" onclick="_bmToggleLinkPreview('${topFolder.id}_direct')">▶</button>
                </div>
                <div class="bm-link-list" id="bm_preview_${topFolder.id}_direct">
                    ${topFolder.directLinks.map(l => `<div class="bm-link-item">🔗 <span>${_bmEsc(l.title)}</span></div>`).join('')}
                </div>`;
            }

            topFolder.children.forEach(level1 => {
                const l1Count = _bmCountLinks(level1);
                html += `<div class="bm-folder-row">
                    <div style="width:16px;flex-shrink:0;"></div>
                    <span>📁</span>
                    <span class="bm-folder-name">${_bmEsc(level1.name)}</span>
                    <span class="bm-folder-count">${l1Count} Links</span>
                    <span class="bm-category-badge">Kategorie</span>
                    <button class="bm-preview-btn" onclick="_bmToggleLinkPreview('${level1.id}')">▶</button>
                </div>
                <div class="bm-link-list" id="bm_preview_${level1.id}">
                    ${_bmRenderLinkPreviewItems(level1)}
                </div>`;

                level1.children.forEach(sub => {
                    html += _bmSubRow(sub, 2);
                });
            });

            html += `</div>`; // bm-tab-body
        }

        html += `</div>`; // bm-tab-block
    });

    document.getElementById('bmImportTree').innerHTML = html;
}

/** Rekursive Unterordner-Zeile (Level 2+) */
function _bmSubRow(folder, depth) {
    const count  = _bmCountLinks(folder);
    const choice = window._bmFolderChoices[folder.id] || 'embed';
    const indent = depth * 16;

    let html = `<div class="bm-folder-row">
        <div style="width:${indent}px;flex-shrink:0;"></div>
        <span>📁</span>
        <span class="bm-folder-name">${_bmEsc(folder.name)}</span>
        <span class="bm-folder-count">${count} Link${count !== 1 ? 's' : ''}</span>
        <div class="bm-choice">
            <label>
                <input type="radio" name="bm_${folder.id}" value="embed"
                       ${choice === 'embed' ? 'checked' : ''}
                       onchange="window._bmFolderChoices['${folder.id}']='embed';_bmUpdateImportButton()">
                Einbetten
            </label>
            <label>
                <input type="radio" name="bm_${folder.id}" value="own"
                       ${choice === 'own' ? 'checked' : ''}
                       onchange="window._bmFolderChoices['${folder.id}']='own';_bmUpdateImportButton()">
                Eigene Kat.
            </label>
        </div>
    </div>`;

    folder.children.forEach(child => { html += _bmSubRow(child, depth + 1); });
    return html;
}

/** Root-Links-Sektion */
function _bmRenderRootLinks(data) {
    const el = document.getElementById('bmRootLinksSection');
    if (!data.rootLinks.length) { el.innerHTML = ''; return; }

    const cur = window._bmRootTabChoice;
    let opts = `<option value="new"${cur === 'new' ? ' selected' : ''}>📋 Neuer Tab</option>`;
    opts += tabsList.map(t =>
        `<option value="${t.id}"${cur === t.id ? ' selected' : ''}>${t.icon} ${_bmEsc(t.label)}</option>`
    ).join('');

    const savedName = window._bmRootTabName || '';
    el.innerHTML = `<div class="bm-root-links-section">
        <div class="bm-root-links-title">⚠️ ${data.rootLinks.length} Links ohne Ordner-Zuordnung</div>
        <div class="bm-root-links-row">
            <span>Ablegen in Kategorie „Importiert" im Tab:</span>
            <select class="bm-tab-select" id="bmRootLinksTab"
                    onchange="window._bmRootTabChoice=this.value; _bmToggleRootNameInput(); _bmUpdateImportButton()">${opts}</select>
            <input type="text" class="bm-tab-name-input" id="bmRootTabName"
                   placeholder="Importiert"
                   value="${_bmEsc(savedName)}"
                   style="display:${cur === 'new' ? 'inline-block' : 'none'};"
                   oninput="window._bmRootTabName=this.value; _bmUpdateImportButton()">
        </div>
    </div>`;
}

/** Root-Tab-Namensfeld ein-/ausblenden */
function _bmToggleRootNameInput() {
    const input = document.getElementById('bmRootTabName');
    if (!input) return;
    input.style.display = window._bmRootTabChoice === 'new' ? 'inline-block' : 'none';
}

/** Tab-Name-Feld + Icon-Picker + statisches Icon ein-/ausblenden */
function _bmToggleNameInput(folderId) {
    const isNew         = window._bmTabChoices[folderId] === 'new';
    const name          = document.getElementById('bmTabName_' + folderId);
    const iconContainer = document.getElementById('bmIconContainer_' + folderId);
    const staticIcon    = document.getElementById('bmStaticIcon_' + folderId);
    if (name)          name.style.display          = isNew ? 'inline-block' : 'none';
    if (iconContainer) iconContainer.style.display = isNew ? 'inline-flex'  : 'none';
    if (staticIcon)    staticIcon.style.display    = isNew ? 'none'         : 'inline';
}

/** Import-Button Text aktualisieren */
function _bmUpdateImportButton() {
    if (!_bmData) return;
    const newTabNames = new Set();
    let mergeTabs = 0, cats = 0;

    _bmData.folders.forEach(topFolder => {
        if (window._bmTabChoices[topFolder.id] === 'new') {
            const n = (window._bmTabNames[topFolder.id] || '').trim() || topFolder.name;
            newTabNames.add(n);
        } else { mergeTabs++; }

        if (topFolder.directLinks.length > 0) cats++;
        cats += topFolder.children.length;

        function countOwn(f) {
            if (window._bmFolderChoices[f.id] === 'own') cats++;
            f.children.forEach(countOwn);
        }
        topFolder.children.forEach(l1 => l1.children.forEach(countOwn));
    });

    if (_bmData.rootLinks.length > 0) cats++;

    const newTabs = newTabNames.size;
    const parts = [];
    if (newTabs  > 0) parts.push(`${newTabs} neue${newTabs  === 1 ? 'r' : ''} Tab`);
    if (mergeTabs > 0) parts.push(`${mergeTabs} Tab${mergeTabs === 1 ? '' : 's'} ergänzt`);
    parts.push(`${cats} Kategorien`);

    const btn = document.getElementById('bmImportBtnText');
    if (btn) btn.textContent = parts.join(' · ') + ' importieren';
}

/** Dialog schließen */
function closeBookmarkImportModal() {
    document.getElementById('bookmarkImportModal').style.display = 'none';
    _bmData = null;
    window._bmTabChoices    = {};
    window._bmFolderChoices = {};
    window._bmTabNames      = {};
    window._bmTabIcons      = {};
    window._bmRootTabName   = '';
    window._bmRootTabChoice = null;
}

/** Import ausführen */
function confirmBookmarkImport() {
    if (!_bmData) return;
    let totalLinks = 0, newTabCount = 0, mergeTabCount = 0;

    // Schritt 1: Tab-Ziele vorberechnen — Custom-Namen dедuplizieren
    const newTabCache  = {}; // customName → tabId
    const mergedTabIds = new Set();
    const folderTabMap    = {}; // folderId → tabId
    const folderTabConfig = {}; // tabId → config (geteilt bei gleichem Custom-Namen)

    _bmData.folders.forEach(topFolder => {
        const choice = window._bmTabChoices[topFolder.id] || 'new';
        let tabId;
        if (choice === 'new') {
            const customName = (window._bmTabNames[topFolder.id] || '').trim() || topFolder.name;
            const customIcon = (window._bmTabIcons[topFolder.id] || '').trim() || '📂';
            if (!newTabCache[customName]) {
                newTabCache[customName] = _bmMakeTab(customName, customIcon);
                newTabCount++;
            }
            tabId = newTabCache[customName];
            if (!folderTabConfig[tabId]) folderTabConfig[tabId] = { categories: {}, categoryOrder: [] };
        } else {
            tabId = choice;
            if (!mergedTabIds.has(tabId)) {
                mergedTabIds.add(tabId);
                mergeTabCount++;
                const existing = getTabConfigById(tabId);
                folderTabConfig[tabId] = existing ? JSON.parse(JSON.stringify(existing)) : { categories: {}, categoryOrder: [] };
            }
        }
        folderTabMap[topFolder.id] = tabId;
    });

    // Schritt 2: Kategorien + Links in die (gemeinsamen) Configs eintragen
    _bmData.folders.forEach(topFolder => {
        const tabId    = folderTabMap[topFolder.id];
        const tabConfig = folderTabConfig[tabId];

        // Direkte Links im Top-Ordner → eigene Kategorie mit Ordner-Name
        if (topFolder.directLinks.length > 0) {
            const catKey = _bmMakeCat(topFolder.name, '📂', tabConfig);
            topFolder.directLinks.forEach(link => { tabConfig.categories[catKey].links.push({...link}); totalLinks++; });
        }

        // Level-1 → Kategorien
        topFolder.children.forEach(level1 => {
            const catKey = _bmMakeCat(level1.name, '📁', tabConfig);
            level1.directLinks.forEach(link => { tabConfig.categories[catKey].links.push({...link}); totalLinks++; });
            level1.children.forEach(sub => { totalLinks += _bmRunSubfolder(sub, catKey, tabConfig); });
        });
    });

    // Schritt 3: Alle Configs speichern
    Object.entries(folderTabConfig).forEach(([tabId, config]) => {
        localStorage.setItem('linkConfig_' + tabId, JSON.stringify(config));
    });

    // Root-Links
    if (_bmData.rootLinks.length > 0 && window._bmRootTabChoice) {
        let tabId;
        if (window._bmRootTabChoice === 'new') {
            const customName = (window._bmRootTabName || '').trim() || 'Importiert';
            // Prüfen ob dieser Name schon durch regulären Import angelegt wurde
            const existing = newTabCache[customName];
            if (existing) {
                tabId = existing;
            } else {
                tabId = _bmMakeTab(customName);
                newTabCount++;
            }
        } else {
            tabId = window._bmRootTabChoice;
        }
        let tabConfig = folderTabConfig[tabId] || getTabConfigById(tabId);
        tabConfig = tabConfig ? JSON.parse(JSON.stringify(tabConfig)) : { categories: {}, categoryOrder: [] };
        const catKey  = _bmMakeCat('Importiert', '📥', tabConfig);
        _bmData.rootLinks.forEach(link => { tabConfig.categories[catKey].links.push({...link}); totalLinks++; });
        localStorage.setItem('linkConfig_' + tabId, JSON.stringify(tabConfig));
    }

    saveTabsList();
    renderTabBar();
    loadTabConfigById(activeTabId);
    renderCategories();
    updateFavoritesCount();
    closeBookmarkImportModal();

    const info = [];
    if (newTabCount  > 0) info.push(`${newTabCount} neue${newTabCount === 1 ? 'r' : ''} Tab`);
    if (mergeTabCount > 0) info.push(`${mergeTabCount} Tab${mergeTabCount === 1 ? '' : 's'} ergänzt`);

    showMessage({ title: `✅ ${totalLinks} Links importiert`, content: info.join(' · ') }, 'success');
}

/** Level-2+ Unterordner rekursiv abarbeiten; gibt Link-Anzahl zurück */
function _bmRunSubfolder(folder, parentCatKey, tabConfig) {
    let count  = 0;
    const own  = window._bmFolderChoices[folder.id] === 'own';
    const myKey = own ? _bmMakeCat(folder.name, '📁', tabConfig) : parentCatKey;

    folder.directLinks.forEach(link => { tabConfig.categories[myKey].links.push({...link}); count++; });
    folder.children.forEach(child => { count += _bmRunSubfolder(child, myKey, tabConfig); });
    return count;
}

/** Kategorie anlegen oder vorhandene zurückgeben */
function _bmMakeCat(name, icon, cfg) {
    for (const [k, cat] of Object.entries(cfg.categories)) {
        if (cat.title === name) return k;
    }
    const base = (name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'importiert');
    let key = base, i = 1;
    while (cfg.categories[key]) { key = base + '_' + i; i++; }
    cfg.categories[key] = { title: name, icon: icon || '📁', collapsed: false, links: [] };
    if (!cfg.categoryOrder) cfg.categoryOrder = [];
    cfg.categoryOrder.push(key);
    return key;
}

/** Neuen Tab anlegen und zu tabsList hinzufügen */
function _bmMakeTab(name, icon) {
    const base = (name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'importiert');
    let id = base, i = 1;
    while (tabsList.find(t => t.id === id) || id === 'favorites') { id = base + '_' + i; i++; }
    tabsList.push({ id, label: name, icon: icon || '📂' });
    return id;
}

/** HTML-Sonderzeichen escapen */
function _bmEsc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ========================================================================
// DUPLIKAT-PRÜFUNG
// ========================================================================

/**
 * Sammelt alle Links aus allen Tabs (aus localStorage) mit ihrem Kontext.
 */
function _collectAllLinks() {
    const result = [];
    if (typeof tabsList === 'undefined') return result;

    tabsList.forEach(tab => {
        try {
            const raw = localStorage.getItem('linkConfig_' + tab.id);
            if (!raw) return;
            const config = JSON.parse(raw);
            if (!config || !config.categories) return;

            Object.entries(config.categories).forEach(([catKey, cat]) => {
                if (!Array.isArray(cat.links)) return;
                cat.links.forEach((link, idx) => {
                    if (!link.url || typeof link.url !== 'string') return;
                    result.push({
                        tabId:         tab.id,
                        tabLabel:      tab.label,
                        categoryKey:   catKey,
                        categoryTitle: cat.title || catKey,
                        linkIndex:     idx,
                        title:         link.title || link.url,
                        url:           link.url,
                        icon:          link.icon || '',
                        description:   link.description || '',
                        normalizedUrl: link.url.trim().toLowerCase()
                    });
                });
            });
        } catch (e) { /* defekten Tab überspringen */ }
    });
    return result;
}

/**
 * Öffnet den Duplikat-Dialog.
 * Zeigt alle tabübergreifenden Link-Duplikate (gleiche URL) und erlaubt deren Bereinigung.
 */
function openDuplicatesModal() {
    closeMenu();

    const existing = document.getElementById('duplicatesModal');
    if (existing) existing.remove();

    const allLinks = _collectAllLinks();

    // Nach URL gruppieren
    const urlMap = new Map();
    allLinks.forEach(link => {
        if (!urlMap.has(link.normalizedUrl)) urlMap.set(link.normalizedUrl, []);
        urlMap.get(link.normalizedUrl).push(link);
    });

    const groups = [];
    urlMap.forEach(links => { if (links.length > 1) groups.push(links); });

    // Modal-Inhalt aufbauen
    let bodyHtml;
    if (groups.length === 0) {
        bodyHtml = `
            <div style="padding:28px; text-align:center; background:rgba(46,204,113,0.1); border-radius:12px; border:1px solid rgba(46,204,113,0.3);">
                <div style="font-size:2.2em; margin-bottom:10px;">✅</div>
                <div style="color:#2ecc71; font-size:1.1em; font-weight:bold;">Keine Duplikate gefunden</div>
                <div style="color:rgba(255,255,255,0.6); margin-top:8px; font-size:13px;">Alle Links sind eindeutig.</div>
            </div>`;
    } else {
        const totalDups = groups.reduce((sum, g) => sum + g.length - 1, 0);

        const groupsHtml = groups.map((group, gIdx) => {
            const itemsHtml = group.map((link, i) => {
                const cbId      = `dup_cb_${gIdx}_${i}`;
                const badgeId   = `dup_badge_${gIdx}_${i}`;
                const isChecked = i !== 0; // erster Eintrag standardmäßig behalten
                const icon      = link.icon || '🔗';
                const descHtml  = link.description
                    ? `<div style="color:rgba(240,240,240,0.5); font-size:11px; margin-top:3px; font-style:italic;">${_bmEsc(link.description)}</div>`
                    : '';
                return `
                    <div style="display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); margin-bottom:5px;">
                        <input type="checkbox" id="${cbId}"
                            data-tab="${_bmEsc(link.tabId)}"
                            data-cat="${_bmEsc(link.categoryKey)}"
                            data-idx="${link.linkIndex}"
                            data-group="${gIdx}"
                            ${isChecked ? 'checked' : ''}
                            style="margin-top:4px; cursor:pointer; accent-color:#ff6b6b; flex-shrink:0;">
                        <div style="font-size:1.3em; flex-shrink:0; margin-top:1px;">${icon}</div>
                        <label for="${cbId}" style="flex:1; cursor:pointer; min-width:0;">
                            <div style="color:#f0f0f0; font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${_bmEsc(link.title)}</div>
                            ${descHtml}
                            <div style="color:rgba(240,240,240,0.4); font-size:11px; margin-top:3px;">
                                Tab: <span style="color:#40e0d0;">${_bmEsc(link.tabLabel)}</span> ·
                                Kategorie: <span style="color:#40e0d0;">${_bmEsc(link.categoryTitle)}</span>
                            </div>
                        </label>
                        <span id="${badgeId}" style="font-size:11px; color:#2ecc71; white-space:nowrap; padding:2px 7px; background:rgba(46,204,113,0.15); border-radius:4px; border:1px solid rgba(46,204,113,0.3); flex-shrink:0; align-self:center; ${isChecked ? 'display:none;' : ''}">behalten</span>
                    </div>`;
            }).join('');

            return `
                <div style="margin-bottom:16px;" data-group="${gIdx}">
                    <div style="color:rgba(240,240,240,0.35); font-size:11px; margin-bottom:7px; word-break:break-all; padding:5px 10px; background:rgba(0,0,0,0.25); border-radius:6px;">🔗 ${_bmEsc(group[0].url)}</div>
                    ${itemsHtml}
                </div>`;
        }).join('<hr style="border:none; border-top:1px solid rgba(255,255,255,0.07); margin:0 0 16px;">');

        bodyHtml = `
            <div style="margin-bottom:14px; padding:11px 15px; background:rgba(255,193,7,0.1); border-radius:10px; border:1px solid rgba(255,193,7,0.3); color:#ffc107; font-size:13px; line-height:1.5;">
                ⚠️ <strong>${groups.length} Duplikat-Gruppe${groups.length !== 1 ? 'n' : ''}</strong> mit insgesamt
                <strong>${totalDups} überflüssigen Link${totalDups !== 1 ? 's' : ''}</strong> gefunden.
                <span style="color:rgba(255,255,255,0.5); display:block; margin-top:4px; font-size:12px;">
                    Angehakt = löschen · Nicht angehakt = behalten.
                </span>
            </div>
            <style>
                #dupScrollArea::-webkit-scrollbar { width: 6px; }
                #dupScrollArea::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 3px; }
                #dupScrollArea::-webkit-scrollbar-thumb { background: rgba(64,224,208,0.35); border-radius: 3px; }
                #dupScrollArea::-webkit-scrollbar-thumb:hover { background: rgba(64,224,208,0.6); }
            </style>
            <div id="dupScrollArea" style="max-height:48vh; overflow-y:auto; padding-right:6px;">
                ${groupsHtml}
            </div>`;
    }

    const hasGroups = groups.length > 0;
    const modalHtml = `
        <div class="modal" id="duplicatesModal" style="display:block;">
            <div class="modal-content" style="max-width:600px;">
                <h2><span class="modal-emoji">🔍</span> Duplikate prüfen</h2>
                ${bodyHtml}
                <div class="form-buttons" style="margin-top:20px; justify-content:flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('duplicatesModal').remove()">
                        ${hasGroups ? 'Abbrechen' : 'Schließen'}
                    </button>
                    ${hasGroups ? `<button type="button" class="btn btn-danger-confirm" onclick="deleteCheckedDuplicates()" style="padding:12px 20px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; border:1px solid rgba(220,53,69,0.6); transition:all 0.2s ease;">
                        🗑️ Markierte löschen
                    </button>` : ''}
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // "behalten"-Badge live aktualisieren wenn Checkbox-Status wechselt
    document.querySelectorAll('#duplicatesModal input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const badge = document.getElementById(cb.id.replace('dup_cb_', 'dup_badge_'));
            if (badge) badge.style.display = cb.checked ? 'none' : '';
        });
    });

    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            const m = document.getElementById('duplicatesModal');
            if (m) { m.remove(); document.removeEventListener('keydown', handleEsc); }
        }
    };
    document.addEventListener('keydown', handleEsc);
}

/**
 * Löscht alle im Duplikat-Dialog angehakten Links.
 */
function deleteCheckedDuplicates() {
    const checkboxes = [...document.querySelectorAll('#duplicatesModal input[type="checkbox"]:checked')];
    if (checkboxes.length === 0) {
        showMessage('Keine Links markiert.', 'warning');
        return;
    }

    // Sammeln, nach Tab gruppieren, Indizes absteigend sortieren
    const byTab = {};
    checkboxes.forEach(cb => {
        const tabId   = cb.dataset.tab;
        const catKey  = cb.dataset.cat;
        const idx     = parseInt(cb.dataset.idx);
        if (!byTab[tabId]) byTab[tabId] = {};
        if (!byTab[tabId][catKey]) byTab[tabId][catKey] = [];
        byTab[tabId][catKey].push(idx);
    });

    let totalDeleted = 0;

    Object.entries(byTab).forEach(([tabId, categories]) => {
        try {
            const raw = localStorage.getItem('linkConfig_' + tabId);
            if (!raw) return;
            const config = JSON.parse(raw);

            Object.entries(categories).forEach(([catKey, indices]) => {
                if (!config.categories[catKey]) return;
                // Absteigend sortieren, damit Indizes beim Splicen stabil bleiben
                indices.sort((a, b) => b - a);
                indices.forEach(i => {
                    config.categories[catKey].links.splice(i, 1);
                    totalDeleted++;
                });
            });

            localStorage.setItem('linkConfig_' + tabId, JSON.stringify(config));

            // Laufzeit-State des aktiven Tabs synchronisieren
            if (tabId === activeTabId) {
                linkCategories = config.categories;
                categoryOrder  = config.categoryOrder || Object.keys(config.categories);
            }
        } catch (e) {
            console.error('Fehler beim Löschen in Tab', tabId, e);
        }
    });

    document.getElementById('duplicatesModal').remove();
    renderCategories();
    updateFavoritesCount();
    showMessage(`${totalDeleted} Duplikat${totalDeleted !== 1 ? 'e' : ''} gelöscht.`, 'success');
}
