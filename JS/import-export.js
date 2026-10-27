// ========================================================================
// LINKSAMMLUNG - IMPORT-EXPORT.JS v3.8
// ========================================================================
// Import/Export-System: Einzellink, Kategorie, Vollständige Config
// Abhängig von: config.js, categories.js
// ========================================================================

// -----------------------------------------------------------------------
// GEMEINSAME HILFSFUNKTIONEN FÜR IMPORT / EXPORT
// -----------------------------------------------------------------------

/**
 * Link für alle Exporte (Einzel-Link, Kategorie, Default-Config) einheitlich serialisieren
 */
function serializeLink(link) {
    return {
        title:       link.title,
        url:         link.url,
        description: link.description || '',
        icon:        link.icon || '🔗',
        favorite:    !!link.favorite,
        pinned:      !!link.pinned
    };
}

/**
 * Datei aus einem File-Input lesen – mit Größenlimit vor dem Einlesen
 * @param {Event} event – change-Event des File-Inputs
 * @param {function(string)} onText
 */
function readImportFile(event, onText) {
    closeMenu();
    const input = event.target;
    const file  = input.files && input.files[0];
    input.value = '';
    if (!file) return;

    if (file.size > DATA_LIMITS.fileBytes) {
        showMessage(`Datei zu groß (max. ${Math.round(DATA_LIMITS.fileBytes / 1024 / 1024)} MB)`, 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload  = e => onText(e.target.result);
    reader.onerror = () => showMessage('Datei konnte nicht gelesen werden', 'error');
    reader.readAsText(file);
}

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
        link:       serializeLink(link),
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
    readImportFile(event, text => {
        let linkData;
        try {
            linkData = JSON.parse(text);
        } catch (e) {
            showMessage('Fehler beim Importieren: Datei ist kein gültiges JSON', 'error');
            return;
        }

        const checked = validateSingleLink(linkData);
        if (checked.error) {
            showMessage({ title: '❌ Ungültige Link-Datei', content: checked.error }, 'error');
            return;
        }

        const link                  = checked.link;
        const originalCategoryKey   = typeof linkData.originalCategoryKey === 'string' ? linkData.originalCategoryKey : '';
        const originalCategoryTitle = typeof linkData.originalCategory === 'string' && linkData.originalCategory.trim()
            ? linkData.originalCategory.trim()
            : 'Importiert';

        let targetCategoryKey = null;

        if (originalCategoryKey && Object.hasOwn(linkCategories, originalCategoryKey)) {
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
            if (!saveConfig(true)) return;
            refreshViews();
            showMessage(`Link "${link.title}" erfolgreich in "${linkCategories[targetCategoryKey].title}" importiert`, 'success');
        } else {
            showCategorySelectionModal(link, originalCategoryTitle);
        }
    });
}

/**
 * Einzelnen Link prüfen (verändert linkData nicht)
 * @returns {{link: object}|{error: string}}
 */
function validateSingleLink(linkData) {
    if (!isPlainObject(linkData) || linkData.type !== 'single_link') {
        return { error: 'Die Datei ist kein Einzel-Link-Export.' };
    }
    return normalizeLink(linkData.link);
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
        if (categoryTitleExists(linkCategories, originalCategoryTitle)) {
            alert('Eine Kategorie mit diesem Namen existiert bereits!');
            return;
        }

        const newKey = uniqueKey(originalCategoryTitle, k => Object.hasOwn(linkCategories, k));

        linkCategories[newKey] = { title: originalCategoryTitle, icon: '📁', collapsed: false, links: [] };
        categoryOrder.push(newKey);
        linkCategories[newKey].links.push(pendingLinkImport);

        sortCategoriesEmptyLast();
        if (!saveConfig(true)) return;
        refreshViews();
        populateCategorySelect();
        showMessage(`Ursprüngliche Kategorie "${originalCategoryTitle}" erstellt und Link "${pendingLinkImport.title}" importiert`, 'success');

    } else if (categoryKey === '__new__') {
        const newCategoryTitle = document.getElementById('newCategoryTitle').value.trim();
        const newCategoryIcon  = document.getElementById('newCategoryIcon').value.trim() || '📁';

        if (!newCategoryTitle) {
            alert('Bitte geben Sie einen Namen für die neue Kategorie ein!');
            return;
        }

        if (categoryTitleExists(linkCategories, newCategoryTitle)) {
            alert('Eine Kategorie mit diesem Namen existiert bereits!');
            return;
        }

        const newKey = uniqueKey(newCategoryTitle, k => Object.hasOwn(linkCategories, k));

        linkCategories[newKey] = { title: newCategoryTitle, icon: newCategoryIcon, collapsed: false, links: [] };
        categoryOrder.push(newKey);
        linkCategories[newKey].links.push(pendingLinkImport);

        sortCategoriesEmptyLast();
        if (!saveConfig(true)) return;
        refreshViews();
        populateCategorySelect();
        showMessage(`Neue Kategorie "${newCategoryTitle}" erstellt und Link "${pendingLinkImport.title}" importiert`, 'success');

    } else {
        if (!Object.hasOwn(linkCategories, categoryKey)) return;
        linkCategories[categoryKey].links.push(pendingLinkImport);

        sortCategoriesEmptyLast();
        if (!saveConfig(true)) return;
        refreshViews();
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
            links:     category.links.map(serializeLink)
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
    readImportFile(event, text => {
        let rawData;
        try {
            rawData = JSON.parse(text);
        } catch (e) {
            showMessage('Fehler beim Importieren: Datei ist kein gültiges JSON', 'error');
            return;
        }

        const checked = validateSingleCategory(rawData);
        if (checked.error) {
            showMessage({ title: '❌ Ungültige Kategorie-Datei', content: checked.error }, 'error');
            return;
        }

        const categoryData        = checked.data;
        const category            = categoryData.category;
        const originalCategoryKey = categoryData.originalCategoryKey;

        let existingCategoryKey = null;
        let conflictingKey      = null;

        for (const [key, existingCategory] of Object.entries(linkCategories)) {
            if (existingCategory.title === category.title) {
                existingCategoryKey = key;
                break;
            }
        }

        if (!existingCategoryKey && originalCategoryKey && Object.hasOwn(linkCategories, originalCategoryKey)) {
            conflictingKey = originalCategoryKey;
        }

        if (existingCategoryKey || conflictingKey) {
            showCategoryImportConflictDialog(categoryData, existingCategoryKey, conflictingKey);
        } else {
            importCategoryDirectly(categoryData);
        }
    });
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
            linkCategories[targetKey].links.map(l => exactUrlKey(l.url))
        );

        let added = 0;
        let skipped = 0;
        category.links.forEach(link => {
            if (existingUrls.has(exactUrlKey(link.url))) {
                skipped++;
            } else {
                linkCategories[targetKey].links.push(link);
                existingUrls.add(exactUrlKey(link.url));
                added++;
            }
        });

        sortCategoriesEmptyLast();
        if (!saveConfig(true)) { pendingCategoryImport = null; return; }
        refreshViews();
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
    const category       = categoryData.category;
    const newCategoryKey = uniqueKey(category.title, k => Object.hasOwn(linkCategories, k));

    linkCategories[newCategoryKey] = {
        title:     category.title,
        icon:      category.icon || '📁',
        collapsed: category.collapsed || false,
        links:     category.links
    };

    categoryOrder.push(newCategoryKey);

    sortCategoriesEmptyLast();
    if (!saveConfig(true)) return;
    refreshViews();
    populateCategorySelect();

    showMessage(`Kategorie "${category.title}" mit ${category.links.length} Links erfolgreich importiert`, 'success');
}

/**
 * Einzelne Kategorie prüfen (verändert categoryData nicht)
 * @returns {{data: {category: object, originalCategoryKey: string}}|{error: string}}
 */
function validateSingleCategory(categoryData) {
    if (!isPlainObject(categoryData) || categoryData.type !== 'single_category') {
        return { error: 'Die Datei ist kein Kategorie-Export.' };
    }
    const res = normalizeCategory(categoryData.category, '');
    if (res.error) return { error: res.error };
    if (res.category.links.length > DATA_LIMITS.linksTotal) return { error: 'Zu viele Links' };

    const key = categoryData.originalCategoryKey;
    return {
        data: {
            category:            res.category,
            originalCategoryKey: typeof key === 'string' && isSafeKey(key) ? key : ''
        }
    };
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
        // Immer der aktuell angezeigte Stand – nicht eine evtl. veraltete config-Referenz
        downloadJSON(getActiveConfigSnapshot(), filename);
        showMessage('Konfiguration erfolgreich exportiert', 'success');
    } catch (e) {
        showMessage('Fehler beim Exportieren der Konfiguration', 'error');
    }
}

/**
 * Konfiguration aus JSON importieren.
 * Die Datei wird vollständig geprüft; erst nach erfolgreichem Speichern wird
 * der aktive Tab ersetzt. Ein abgelehnter Import ändert weder Speicher noch Ansicht.
 */
function importConfig(event) {
    readImportFile(event, text => {
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            showMessage('Fehler beim Importieren: Datei ist kein gültiges JSON', 'error');
            return;
        }

        const res = normalizeConfig(parsed);
        if (!res.ok) {
            showMessage({ title: '❌ Import abgelehnt – ungültige Konfiguration', content: res.error }, 'error');
            return;
        }

        if (activeTabId === 'favorites') {
            showMessage('Bitte zuerst den Tab wählen, der ersetzt werden soll.', 'warning');
            return;
        }
        if (!confirm('Möchten Sie die aktuelle Konfiguration ersetzen?')) return;

        if (!writeTabConfig(activeTabId, res.config)) return;
        refreshViews();
        showMessage('Konfiguration erfolgreich importiert', 'success');
    });
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
                        • Eine <code>${esc(_defaultConfigFilenameForTab(activeTabId))}</code> Datei wird heruntergeladen<br>
                        • Diese enthält die aktuelle Konfiguration im Self-Registrierungs-Format<br>
                        • Datei in <code>Config/</code> ablegen — neuer Tab: zusätzlich Dateinamen in <code>Config/tabs.js</code> eintragen
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
        const filename   = _defaultConfigFilenameForTab(activeTabId);

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
 * Nach Export: Hinweis anzeigen, was mit der/den Datei(en) zu tun ist
 * @param {string|string[]} filenames – eine Datei oder Array von Dateinamen
 * @param {boolean} multiMode        – true = ZIP-Export inkl. tabs.js
 */
function _showSnippetHint(filenames, multiMode) {
    const modal   = document.getElementById('snippetHintModal');
    const titleEl = document.getElementById('snippetHintTitle');
    const codeEl  = document.getElementById('snippetHintCode');
    const boxEl   = document.getElementById('snippetHintBox');
    const descEl  = document.getElementById('snippetHintDesc');
    if (!modal || !codeEl || !descEl) return;

    const files      = Array.isArray(filenames) ? filenames : [filenames];
    const knownFiles = Array.isArray(window.CONFIG_FILES) ? window.CONFIG_FILES : [];
    let emoji, title, desc, code = '';

    if (multiMode) {
        emoji = '📦'; title = 'ZIP in Config/ entpacken';
        desc  = `Die ZIP-Datei in den Ordner <code>Config/</code> entpacken und vorhandene Dateien
                 <strong>überschreiben</strong>. Die mitgelieferte <code>tabs.js</code> enthält bereits
                 alle exportierten Tabs — danach die Seite neu laden, fertig.
                 <span style="margin-top:8px;display:block;color:rgba(64,224,208,0.8);font-size:0.92em;">
                     💡 Alte Config-Dateien, die nicht mehr in <code>tabs.js</code> stehen, werden
                     nicht mehr geladen und können gelöscht werden.
                 </span>`;
        code  = files.join('\n');
    } else if (knownFiles.includes(files[0])) {
        emoji = '✅'; title = 'Datei überschreiben';
        desc  = `Die Datei in den Ordner <code>Config/</code> legen und die vorhandene
                 <strong>überschreiben</strong>. Der Tab ist bereits in <code>Config/tabs.js</code>
                 eingetragen — sonst ist nichts zu tun.`;
    } else {
        emoji = '📋'; title = 'Neuen Tab eintragen';
        desc  = `Die Datei in den Ordner <code>Config/</code> legen und diese Zeile in
                 <code>Config/tabs.js</code> in die Liste <code>window.CONFIG_FILES</code> einfügen
                 (Komma am Zeilenende beachten):`;
        code  = `    ${JSON.stringify(files[0])},`;
    }

    if (titleEl) titleEl.innerHTML = `<span class="modal-emoji">${emoji}</span> ${title}`;
    descEl.innerHTML   = desc;
    codeEl.textContent = code;
    if (boxEl) boxEl.style.display = code ? '' : 'none';

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
                return serializeLink(link);
            })
        };
    });

    // Registry-Schlüssel eindeutig halten: zwei Tabs mit gleichem Namen dürfen sich
    // beim Wiederherstellen nicht gegenseitig überschreiben. Maßgeblich für den Tab
    // sind die Felder id und label, nicht der Schlüssel.
    const tabId = typeof tab.id === 'string' && isSafeKey(tab.id) ? tab.id : '';
    return `/**
 * ========================================================================
 * STANDARD-KONFIGURATION: ${String(tab.label).toUpperCase().replace(/\*\//g, '* /')}
 * ========================================================================
 * Generiert am: ${new Date().toLocaleString('de-DE')}
 * Kategorien: ${order.length}
 * Links gesamt: ${totalLinks}
 * Favoriten: ${totalFavorites}
 *
 * Datei in Config/ ablegen + Dateinamen in Config/tabs.js eintragen → Tab erscheint automatisch.
 * ========================================================================
 */
(function() {
    if (!window.DYNAMIC_CONFIGS) window.DYNAMIC_CONFIGS = {};
    var label = ${JSON.stringify(tab.label)};
    var key = label;
    for (var i = 2; key === '__proto__' || Object.prototype.hasOwnProperty.call(window.DYNAMIC_CONFIGS, key); i++) {
        key = label + ' #' + i;
    }
    window.DYNAMIC_CONFIGS[key] = {
        id:     ${JSON.stringify(tabId)},
        label:  label,
        icon:   ${JSON.stringify(tab.icon)},
        hidden: ${tab.hidden ? 'true' : 'false'},
        config: ${JSON.stringify(cleanedConfig, null, 8)}
    };
})();`;
}

/**
 * Dateinamen Default_config-{TabName}.js für mehrere Tabs — eindeutig gemacht,
 * da z.B. "Tools!"/"Tools?" oder reine Emoji-Namen sonst denselben Namen ergeben
 * @returns {string[]} gleiche Reihenfolge wie tabs
 */
function _defaultConfigFilenames(tabs) {
    const names = [];
    tabs.forEach(tab => {
        const base = 'Default_config-' + (sanitizeFilename(tab.label) || 'Tab');
        let name = base + '.js';
        for (let i = 2; names.includes(name); i++) name = `${base}-${i}.js`;
        names.push(name);
    });
    return names;
}

/**
 * Dateiname für einen einzelnen Tab — identisch mit dem Namen beim ZIP-Export aller Tabs
 */
function _defaultConfigFilenameForTab(tabId) {
    const exportableTabs = tabsList.filter(t => t.id !== 'favorites');
    const idx = exportableTabs.findIndex(t => t.id === tabId);
    return idx >= 0 ? _defaultConfigFilenames(exportableTabs)[idx] : 'Default_config-Config.js';
}

/**
 * Inhalt für Config/tabs.js generieren (Liste der zu ladenden Config-Dateien)
 * @param {string[]} filenames – in Tab-Reihenfolge
 */
function generateTabsListJS(filenames) {
    return `/**
 * ========================================================================
 * TAB-LISTE: Welche Config-Dateien aus Config/ geladen werden
 * ========================================================================
 * Generiert am: ${new Date().toLocaleString('de-DE')}
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
${filenames.map(f => '    ' + JSON.stringify(f)).join(',\n')}
];
`;
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
    const filenames = _defaultConfigFilenames(exportableTabs);

    exportableTabs.forEach((tab, idx) => {
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
        const filename = filenames[idx];
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
                        • Enthält für jeden Tab eine <code>Default_config-*.js</code> Datei und die passende <code>tabs.js</code><br>
                        • ZIP in <code>Config/</code> entpacken und überschreiben — in <code>Linksammlung.html</code> muss nichts geändert werden
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

    const files = [];
    const exportedFilenames = [];
    const filenames = _defaultConfigFilenames(exportableTabs);

    exportableTabs.forEach((tab, idx) => {
        try {
            const cfg      = getTabConfigById(tab.id);
            const content  = generateDefaultConfigJS(tab, cfg);
            const filename = filenames[idx];
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

    // Passende Tab-Liste mitliefern → nach dem Entpacken ist nichts mehr von Hand einzutragen
    files.push({ name: 'tabs.js', content: generateTabsListJS(exportedFilenames) });

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
            ...u16(0x0800),             // General purpose flags: Bit 11 = Dateiname in UTF-8 (sonst wird "Büro" zu "B├╝ro")
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
            ...u16(0x0800),             // General purpose flags: UTF-8
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
    readImportFile(event, text => {
        try {
            const parsed = _bmParse(text);
            if (parsed.folders.length === 0 && parsed.rootLinks.length === 0) {
                showMessage(parsed.skipped > 0
                    ? `Keine importierbaren Lesezeichen gefunden (${parsed.skipped} ohne http(s)-Adresse übersprungen).`
                    : 'Keine Lesezeichen in der Datei gefunden.', 'error');
                return;
            }
            _bmData = parsed;
            _bmShowDialog(parsed);
        } catch (err) {
            console.error('Bookmark parse error:', err);
            showMessage('Fehler beim Lesen der Lesezeichen-Datei', 'error');
        }
    });
}

// Ordner, die Browser beim Export als technische Hülle anlegen (nicht vom Nutzer).
// Sie werden übersprungen, ihre Inhalte rücken eine Ebene nach oben.
const _BM_BROWSER_CONTAINERS = new Set([
    'bookmarks bar', 'bookmarks toolbar', 'favorites bar', 'other bookmarks', 'mobile bookmarks',
    'other favorites', 'bookmarks menu',
    'lesezeichenleiste', 'lesezeichen-symbolleiste', 'favoritenleiste', 'weitere lesezeichen',
    'andere lesezeichen', 'mobile lesezeichen', 'weitere favoriten', 'lesezeichen-menü'
]);

const _BM_MAX_DEPTH = 50;

/**
 * Netscape Bookmark HTML → { rootLinks, folders, skipped } parsen.
 * Nur http(s)-Links werden übernommen (gleiche Regel wie überall), der Rest gezählt.
 */
function _bmParse(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let folderId = 0;
    let skipped  = 0;

    function parseDL(dl, depth) {
        const result = { directLinks: [], children: [] };
        if (!dl || depth > _BM_MAX_DEPTH) return result;

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
                    const child = parseDL(childDL, depth + 1);
                    const name  = (h3.textContent.trim() || 'Ordner').slice(0, DATA_LIMITS.title);
                    result.children.push({
                        id:          'bm_f' + (folderId++),
                        name,
                        // Browser-Hülle: Lesezeichenleiste/"Weitere Lesezeichen" o.ä.
                        isContainer: h3.hasAttribute('personal_toolbar_folder') ||
                                     h3.hasAttribute('unfiled_bookmarks_folder') ||
                                     _BM_BROWSER_CONTAINERS.has(name.toLowerCase()),
                        directLinks: child.directLinks,
                        children:    child.children
                    });
                } else if (a) {
                    const href = (a.getAttribute('href') || '').trim();
                    // Gleiche Regeln wie beim JSON-Import, damit jeder Export wieder importierbar ist
                    if (isSafeUrl(href) && href.length <= DATA_LIMITS.url) {
                        result.directLinks.push({
                            title:       (a.textContent.trim() || 'Ohne Titel').slice(0, DATA_LIMITS.title),
                            url:         href,
                            description: '',
                            icon:        '🔗',
                            favorite:    false,
                            pinned:      false
                        });
                    } else {
                        skipped++;
                    }
                }
            }
            node = node.nextElementSibling;
        }
        return result;
    }

    const rootDL = doc.querySelector('dl');
    if (!rootDL) return { rootLinks: [], folders: [], skipped };
    const root = parseDL(rootDL, 0);

    // Nur echte Browser-Hüllen überspringen – vom Nutzer angelegte Ordner der
    // obersten Ebene bleiben erhalten und werden zur Tab-Ebene.
    const flatFolders   = [];
    const flatRootLinks = [...root.directLinks];
    root.children.forEach(folder => {
        if (folder.isContainer) {
            flatRootLinks.push(...folder.directLinks);
            flatFolders.push(...folder.children);
        } else {
            flatFolders.push(folder);
        }
    });
    return { rootLinks: flatRootLinks, folders: flatFolders, skipped };
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

    if (data.skipped > 0) {
        html += `
        <div class="bm-stat-item" title="Nur Adressen mit http:// oder https:// werden übernommen (z.B. keine javascript:-, ftp:- oder place:-Einträge)">
            <span class="bm-stat-value" style="color:#ff8080;">${data.skipped}</span>
            <span class="bm-stat-label">Übersprungen</span>
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
                 title="Icon wählen">${_bmEsc(savedIcon)}</div>
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
            html += `<option value="${_bmEsc(t.id)}"${sel}>→ ${_bmEsc(t.icon)} ${_bmEsc(t.label)}${warning}</option>`;
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
        `<option value="${_bmEsc(t.id)}"${cur === t.id ? ' selected' : ''}>${_bmEsc(t.icon)} ${_bmEsc(t.label)}</option>`
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
    const previousTabs = tabsList.slice();

    // Map statt Objekt: Ordner-/Tab-Namen wie "__proto__" sind Nutzerdaten
    const newTabCache     = new Map(); // customName → tabId
    const mergedTabIds    = new Set();
    const folderTabMap    = new Map(); // folderId → tabId
    const folderTabConfig = new Map(); // tabId → config (geteilt bei gleichem Custom-Namen)

    const newTab = (name, icon) => {
        const id = _bmMakeTab(name, icon);
        folderTabConfig.set(id, { categories: {}, categoryOrder: [] });
        newTabCount++;
        return id;
    };
    const existingTab = tabId => {
        if (!tabsList.some(t => t.id === tabId)) return null;
        if (!folderTabConfig.has(tabId)) {
            folderTabConfig.set(tabId, getTabConfigById(tabId) || { categories: {}, categoryOrder: [] });
        }
        return tabId;
    };

    // Schritt 1: Tab-Ziele vorberechnen — Custom-Namen deduplizieren
    _bmData.folders.forEach(topFolder => {
        const choice = window._bmTabChoices[topFolder.id] || 'new';
        let tabId;
        if (choice === 'new') {
            const customName = (window._bmTabNames[topFolder.id] || '').trim() || topFolder.name;
            const customIcon = (window._bmTabIcons[topFolder.id] || '').trim() || '📂';
            if (!newTabCache.has(customName)) newTabCache.set(customName, newTab(customName, customIcon));
            tabId = newTabCache.get(customName);
        } else {
            tabId = existingTab(choice);
            if (!tabId) return;
            if (!mergedTabIds.has(tabId)) {
                mergedTabIds.add(tabId);
                mergeTabCount++;
            }
        }
        folderTabMap.set(topFolder.id, tabId);
    });

    // Schritt 2: Kategorien + Links in die (gemeinsamen) Configs eintragen
    _bmData.folders.forEach(topFolder => {
        const tabId = folderTabMap.get(topFolder.id);
        if (!tabId) return;
        const tabConfig = folderTabConfig.get(tabId);

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

    // Root-Links
    if (_bmData.rootLinks.length > 0 && window._bmRootTabChoice) {
        let tabId;
        if (window._bmRootTabChoice === 'new') {
            const customName = (window._bmRootTabName || '').trim() || 'Importiert';
            // Prüfen ob dieser Name schon durch regulären Import angelegt wurde
            tabId = newTabCache.get(customName) || newTab(customName);
        } else {
            tabId = existingTab(window._bmRootTabChoice);
        }
        if (tabId) {
            const tabConfig = folderTabConfig.get(tabId);
            const catKey    = _bmMakeCat('Importiert', '📥', tabConfig);
            _bmData.rootLinks.forEach(link => { tabConfig.categories[catKey].links.push({...link}); totalLinks++; });
        }
    }

    // Schritt 3: Gleiche Grenzen wie beim JSON-Import, sonst wäre das Backup nicht wieder einlesbar
    for (const [tabId, cfg] of folderTabConfig) {
        const check = normalizeConfig(cfg);
        if (!check.ok) {
            const label = (tabsList.find(t => t.id === tabId) || {}).label || tabId;
            tabsList = previousTabs;
            showMessage({ title: '❌ Import abgebrochen – nichts wurde gespeichert',
                          content: `${check.error} (Tab „${label}“, max. ${DATA_LIMITS.categories} Kategorien / ${DATA_LIMITS.linksTotal} Links je Tab)` }, 'error');
            return;
        }
    }

    // Schritt 4: Alle Configs und die Tab-Liste gemeinsam speichern
    if (!writeTabConfigs(folderTabConfig, { tabs: true })) {
        tabsList = previousTabs;
        return;
    }

    const skipped = _bmData.skipped || 0;
    renderTabBar();
    loadTabConfigById(activeTabId);
    refreshViews();
    closeBookmarkImportModal();

    const info = [];
    if (newTabCount  > 0) info.push(`${newTabCount} neue${newTabCount === 1 ? 'r' : ''} Tab`);
    if (mergeTabCount > 0) info.push(`${mergeTabCount} Tab${mergeTabCount === 1 ? '' : 's'} ergänzt`);
    if (skipped > 0) info.push(`${skipped} ohne http(s)-Adresse übersprungen`);

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
    const key = uniqueKey(name, k => Object.hasOwn(cfg.categories, k), 'importiert');
    cfg.categories[key] = { title: name, icon: icon || '📁', collapsed: false, links: [] };
    if (!cfg.categoryOrder) cfg.categoryOrder = [];
    cfg.categoryOrder.push(key);
    return key;
}

/** Neuen Tab anlegen und zu tabsList hinzufügen */
function _bmMakeTab(name, icon) {
    // Auch IDs aus Config-Dateien meiden, sonst erbt der neue Tab deren Default-Inhalt
    const dynamicIds = getDynamicConfigTabIds().map(t => t.id);
    const id = uniqueKey(name, k => k === 'favorites' || tabsList.some(t => t.id === k) || dynamicIds.includes(k), 'importiert');
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
        const cfg = getTabConfigById(tab.id);
        if (!cfg) return;

        Object.entries(cfg.categories).forEach(([catKey, cat]) => {
            cat.links.forEach((link, idx) => {
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
                    // Nur exakt gleiche Zieladressen gelten als Duplikat (Pfad/Query bleiben case-sensitiv)
                    normalizedUrl: exactUrlKey(link.url)
                });
            });
        });
    });
    return result;
}

/**
 * Öffnet den Duplikat-Dialog.
 * Zeigt alle tabübergreifenden Link-Duplikate (gleiche URL) und erlaubt deren Bereinigung.
 */
function openDuplicatesModal() {
    closeMenu();
    closeDuplicatesModal();

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
                            data-url="${_bmEsc(link.url)}"
                            data-group="${gIdx}"
                            ${isChecked ? 'checked' : ''}
                            style="margin-top:4px; cursor:pointer; accent-color:#ff6b6b; flex-shrink:0;">
                        <div style="font-size:1.3em; flex-shrink:0; margin-top:1px;">${_bmEsc(icon)}</div>
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
                    <button type="button" class="btn btn-secondary" onclick="closeDuplicatesModal()">
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

    _dupEscHandler = (e) => {
        if (e.key === 'Escape') closeDuplicatesModal();
    };
    document.addEventListener('keydown', _dupEscHandler);
}

let _dupEscHandler = null;

/**
 * Duplikat-Dialog schließen (inkl. Escape-Listener)
 */
function closeDuplicatesModal() {
    const modal = document.getElementById('duplicatesModal');
    if (modal) modal.remove();
    if (_dupEscHandler) {
        document.removeEventListener('keydown', _dupEscHandler);
        _dupEscHandler = null;
    }
}

/**
 * Löscht alle im Duplikat-Dialog angehakten Links.
 * Alle betroffenen Tabs werden gemeinsam gespeichert; gezählt wird erst danach.
 */
function deleteCheckedDuplicates() {
    const checkboxes = [...document.querySelectorAll('#duplicatesModal input[type="checkbox"]:checked')];
    if (checkboxes.length === 0) {
        showMessage('Keine Links markiert.', 'warning');
        return;
    }

    // Sammeln und nach Tab → Kategorie gruppieren (Map: Tab-/Kategorie-Namen sind Nutzerdaten)
    const byTab = new Map();
    checkboxes.forEach(cb => {
        const tabId  = cb.dataset.tab;
        const catKey = cb.dataset.cat;
        if (!byTab.has(tabId)) byTab.set(tabId, new Map());
        const cats = byTab.get(tabId);
        if (!cats.has(catKey)) cats.set(catKey, []);
        cats.get(catKey).push({ idx: parseInt(cb.dataset.idx, 10), url: cb.dataset.url });
    });

    const changed = new Map();
    let toDelete = 0, stale = 0;

    byTab.forEach((categories, tabId) => {
        const cfg = getTabConfigById(tabId);
        if (!cfg) return;
        categories.forEach((entries, catKey) => {
            const cat = Object.hasOwn(cfg.categories, catKey) ? cfg.categories[catKey] : null;
            if (!cat) { stale += entries.length; return; }
            // Absteigend, damit Indizes beim Splicen stabil bleiben; URL als Kontrolle
            entries.sort((a, b) => b.idx - a.idx).forEach(({ idx, url }) => {
                if (!cat.links[idx] || cat.links[idx].url !== url) { stale++; return; }
                cat.links.splice(idx, 1);
                toDelete++;
            });
        });
        changed.set(tabId, cfg);
    });

    if (!writeTabConfigs(changed)) return;

    closeDuplicatesModal();
    refreshViews();
    const staleNote = stale > 0 ? ` (${stale} inzwischen geändert, übersprungen)` : '';
    showMessage(`${toDelete} Duplikat${toDelete !== 1 ? 'e' : ''} gelöscht${staleNote}.`, stale > 0 ? 'warning' : 'success');
}
