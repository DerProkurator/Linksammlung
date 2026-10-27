// ========================================================================
// LINKSAMMLUNG - CATEGORIES.JS v3.8
// ========================================================================
// Kategorie-Management: auf-/zuklappen, bearbeiten, löschen, erstellen
// Abhängig von: config.js
// ========================================================================

/**
 * Kategorie auf-/zuklappen
 */
function toggleCategoryCollapsed(categoryKey) {
    if (linkCategories[categoryKey]) {
        linkCategories[categoryKey].collapsed = !linkCategories[categoryKey].collapsed;
        if (!saveConfig(true)) return;
        renderCategories();

        const category = linkCategories[categoryKey];
        const status   = category.collapsed ? 'zugeklappt' : 'aufgeklappt';
        showMessage(`Kategorie "${category.title}" ${status}`, 'success');
    }
}

/**
 * Kategorie über Kontext-Menü umschalten
 */
function toggleCategoryFromContext() {
    if (currentContextCategory) {
        toggleCategoryCollapsed(currentContextCategory);
    }
    hideContextMenu();
}

/**
 * Alle Kategorien zuklappen
 */
function collapseAllCategories() {
    closeMenu();
    let changedCount = 0;

    categoryOrder.forEach(key => {
        if (linkCategories[key] && !linkCategories[key].collapsed) {
            linkCategories[key].collapsed = true;
            changedCount++;
        }
    });

    if (changedCount > 0) {
        if (!saveConfig(true)) return;
        renderCategories();
        showMessage(`Alle ${changedCount} Kategorien zugeklappt`, 'success');
    } else {
        showMessage('Alle Kategorien sind bereits zugeklappt', 'success');
    }
}

/**
 * Alle Kategorien aufklappen
 */
function expandAllCategories() {
    closeMenu();
    let changedCount = 0;

    categoryOrder.forEach(key => {
        if (linkCategories[key] && linkCategories[key].collapsed) {
            linkCategories[key].collapsed = false;
            changedCount++;
        }
    });

    if (changedCount > 0) {
        if (!saveConfig(true)) return;
        renderCategories();
        showMessage(`Alle ${changedCount} Kategorien aufgeklappt`, 'success');
    } else {
        showMessage('Alle Kategorien sind bereits aufgeklappt', 'success');
    }
}

/**
 * Kategorie bearbeiten (öffnet Modal mit vorausgefüllten Feldern)
 *
 * isCategoryEditMode verhindert in openCategoryModal(), dass das Formular
 * zurückgesetzt wird — das Modal verhält sich dann als "Bearbeiten" statt "Neu erstellen".
 * currentEditingCategory muss hier gesichert werden, da hideContextMenu() weiter unten
 * currentContextCategory auf null setzt.
 */
function editCategory() {
    if (!currentContextCategory) return;

    const category = linkCategories[currentContextCategory];

    isCategoryEditMode     = true;   // Modal in Bearbeiten-Modus versetzen
    currentEditingCategory = currentContextCategory; // Key sichern vor hideContextMenu()

    document.getElementById('categoryTitle').value = category.title;
    document.getElementById('categoryIcon').value  = category.icon;

    document.querySelector('#categoryModal h2').textContent          = 'Kategorie bearbeiten';
    document.querySelector('#categoryModal .btn-primary').textContent = 'Speichern';

    hideContextMenu();
    document.getElementById('categoryModal').style.display = 'block';
}

/**
 * Kategorie löschen
 */
function deleteCategory() {
    if (!currentContextCategory) return;

    const category  = linkCategories[currentContextCategory];
    const linkCount = category.links.length;

    let confirmMessage = `Möchten Sie die Kategorie "${category.title}" wirklich löschen?`;
    if (linkCount > 0) {
        confirmMessage += `\n\nWichtig: Diese Kategorie enthält ${linkCount} Link${linkCount > 1 ? 's' : ''}. Diese werden ebenfalls gelöscht!`;
    }

    if (confirm(confirmMessage)) {
        delete linkCategories[currentContextCategory];
        categoryOrder = categoryOrder.filter(k => k !== currentContextCategory);

        if (saveConfig(true)) {
            refreshViews();
            showMessage('Kategorie erfolgreich gelöscht', 'success');
        }
    }

    hideContextMenu();
}

/**
 * Kategorie-Modal öffnen
 */
function openCategoryModal() {
    closeMenu();

    if (!isCategoryEditMode) {
        document.querySelector('#categoryModal h2').textContent          = 'Neue Kategorie erstellen';
        document.querySelector('#categoryModal .btn-primary').textContent = 'Erstellen';
        document.getElementById('categoryForm').reset();
        currentEditingCategory = null;
    }

    document.getElementById('categoryModal').style.display = 'block';
}

/**
 * Kategorie-Modal schließen
 */
function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();

    isCategoryEditMode     = false;
    currentEditingCategory = null;
    document.querySelector('#categoryModal h2').textContent          = 'Neue Kategorie erstellen';
    document.querySelector('#categoryModal .btn-primary').textContent = 'Erstellen';
}

// -----------------------------------------------------------------------
// KATEGORIE IN ANDEREN TAB VERSCHIEBEN
// -----------------------------------------------------------------------

let _moveCategorySource = null; // gesicherte Referenz, da hideContextMenu() currentContextCategory nullt

/**
 * Move-Kategorie-Modal öffnen
 */
function openMoveCategoryModal() {
    if (!currentContextCategory) return;
    _moveCategorySource = currentContextCategory;
    hideContextMenu();

    const category = linkCategories[_moveCategorySource];
    const linkCount = category.links.length;
    const infoText = `„${category.icon} ${category.title}" (${linkCount} Link${linkCount !== 1 ? 's' : ''})`;
    document.getElementById('moveCategoryInfo').textContent = infoText;

    const tabSel = document.getElementById('moveCategoryTargetTab');
    tabSel.innerHTML = tabsList
        .filter(t => t.id !== activeTabId && t.id !== 'favorites')
        .map(t => `<option value="${t.id}">${esc(t.icon)} ${esc(t.label)}</option>`)
        .join('');

    if (!tabSel.options.length) {
        showMessage('Keine anderen Tabs vorhanden', 'warning');
        _moveCategorySource = null;
        return;
    }

    document.getElementById('moveCategoryModal').style.display = 'block';
}

/**
 * Kategorie verschieben bestätigen
 */
function confirmMoveCategory() {
    if (!_moveCategorySource) return;

    const targetTabId = document.getElementById('moveCategoryTargetTab').value;
    if (!targetTabId) return;

    const targetCfg = getTabConfigById(targetTabId) || { categories: {}, categoryOrder: [] };

    const sourceKey = _moveCategorySource;
    const category  = linkCategories[sourceKey];
    if (!category) { closeMoveCategoryModal(); return; }
    const copy = JSON.parse(JSON.stringify(category));

    // Zusammenführen nur bei gleichem Titel und nur auf ausdrücklichen Wunsch –
    // ein gleicher technischer Key allein sagt nichts über die Kategorie aus.
    const needle       = category.title.trim().toLowerCase();
    const sameTitleKey = Object.keys(targetCfg.categories)
        .find(k => targetCfg.categories[k].title.trim().toLowerCase() === needle);
    let merged = false;

    if (sameTitleKey && confirm(`Im Ziel-Tab gibt es bereits die Kategorie „${targetCfg.categories[sameTitleKey].title}".\n\nOK = Links dort anhängen (zusammenführen)\nAbbrechen = als eigene Kategorie übernehmen`)) {
        targetCfg.categories[sameTitleKey].links.push(...copy.links);
        merged = true;
    } else {
        const targetKey = Object.hasOwn(targetCfg.categories, sourceKey)
            ? uniqueKey(category.title, k => Object.hasOwn(targetCfg.categories, k))
            : sourceKey;
        targetCfg.categories[targetKey] = copy;
        targetCfg.categoryOrder.push(targetKey);
    }

    // Quelle (aktiver Tab) ohne die Kategorie – beide Tabs gemeinsam speichern
    const sourceCfg = getActiveConfigSnapshot();
    delete sourceCfg.categories[sourceKey];
    sourceCfg.categoryOrder = sourceCfg.categoryOrder.filter(k => k !== sourceKey);

    if (!writeTabConfigs([[targetTabId, targetCfg], [activeTabId, sourceCfg]])) return;
    refreshViews();

    const targetTab = tabsList.find(t => t.id === targetTabId);
    showMessage(`„${category.icon} ${category.title}" nach „${targetTab?.label}" ${merged ? 'verschoben und zusammengeführt' : 'verschoben'}`, 'success');

    closeMoveCategoryModal();
}

function closeMoveCategoryModal() {
    document.getElementById('moveCategoryModal').style.display = 'none';
    _moveCategorySource = null;
}

/**
 * Kategorie-Select für Link-Modal befüllen
 */
function populateCategorySelect() {
    const select = document.getElementById('linkCategory');
    select.innerHTML = '<option value="">Kategorie auswählen</option>';

    categoryOrder.forEach(key => {
        if (linkCategories[key]) {
            const category = linkCategories[key];
            const option   = document.createElement('option');
            option.value       = key;
            option.textContent = category.title;
            select.appendChild(option);
        }
    });
}
