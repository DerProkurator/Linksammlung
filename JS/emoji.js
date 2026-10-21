// ========================================================================
// LINKSAMMLUNG - EMOJI.JS v3.5
// ========================================================================
// Emoji-Picker-System
// Abhängig von: emoji-database.js (EMOJI_DATABASE global)
// ========================================================================

/**
 * Emoji-Picker ein-/ausblenden
 */
function toggleEmojiPicker(inputId) {
    const input   = document.getElementById(inputId);
    const picker  = document.getElementById(inputId + 'Picker');
    const trigger = input.parentElement.querySelector('.emoji-trigger');

    // Alle anderen Picker schließen
    document.querySelectorAll('.emoji-picker').forEach(p => {
        if (p !== picker) p.classList.remove('active');
    });
    document.querySelectorAll('.emoji-trigger').forEach(t => {
        if (t !== trigger) t.classList.remove('active');
    });

    if (picker.classList.contains('active')) {
        picker.classList.remove('active');
        trigger.classList.remove('active');
        currentPickerTarget  = null;
        currentPickerElement = null;
    } else {
        picker.classList.add('active');
        trigger.classList.add('active');
        currentPickerTarget  = inputId;
        currentPickerElement = picker;
        initEmojiPicker(inputId);
    }
}

/**
 * Emoji-Picker initialisieren
 */
function initEmojiPicker(inputId) {
    const categoriesContainer = document.getElementById(inputId + 'Categories');
    const gridContainer       = document.getElementById(inputId + 'Grid');

    categoriesContainer.innerHTML = '';
    const categoryKeys = Object.keys(EMOJI_DATABASE);

    categoryKeys.forEach((categoryKey, index) => {
        const category    = EMOJI_DATABASE[categoryKey];
        const categoryBtn = document.createElement('div');
        categoryBtn.className = 'emoji-category-btn';
        categoryBtn.innerHTML = esc(category.icon);
        categoryBtn.title     = category.name;
        categoryBtn.onclick   = () => showEmojiCategory(categoryKey, inputId);

        if (index === 0) categoryBtn.classList.add('active');
        categoriesContainer.appendChild(categoryBtn);
    });

    showEmojiCategory(categoryKeys[0], inputId);
}

/**
 * Emoji-Kategorie anzeigen
 */
function showEmojiCategory(categoryKey, inputId) {
    const categoriesContainer = document.getElementById(inputId + 'Categories');
    const gridContainer       = document.getElementById(inputId + 'Grid');

    categoriesContainer.querySelectorAll('.emoji-category-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = Array.from(categoriesContainer.children).find(btn =>
        btn.innerHTML === EMOJI_DATABASE[categoryKey].icon
    );
    if (activeBtn) activeBtn.classList.add('active');

    const category = EMOJI_DATABASE[categoryKey];
    gridContainer.innerHTML = '';

    category.emojis.forEach(emojiData => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.innerHTML = `
            ${esc(emojiData.emoji)}
            <div class="emoji-tooltip">${esc(emojiData.name)}</div>
        `;
        emojiItem.onclick = () => selectEmoji(emojiData.emoji, inputId);
        gridContainer.appendChild(emojiItem);
    });

    // Picker kann durch größere Kategorie wachsen → wieder ganz sichtbar machen
    const picker = document.getElementById(inputId + 'Picker');
    if (picker && picker.closest('.form-group')) {
        picker.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

/**
 * Emoji auswählen
 */
function selectEmoji(emoji, inputId) {
    const input   = document.getElementById(inputId);
    const picker  = document.getElementById(inputId + 'Picker');
    const trigger = input.parentElement.querySelector('.emoji-trigger');

    input.value = emoji;
    picker.classList.remove('active');
    trigger.classList.remove('active');

    currentPickerTarget  = null;
    currentPickerElement = null;

    input.dispatchEvent(new Event('input'));
}

/**
 * Emojis suchen
 */
function searchEmojis(query, pickerId) {
    const inputId         = pickerId.replace('Picker', '');
    const gridContainer   = document.getElementById(inputId + 'Grid');
    const categoriesContainer = document.getElementById(inputId + 'Categories');

    if (!gridContainer) {
        console.error('Grid container nicht gefunden:', inputId + 'Grid');
        return;
    }

    if (typeof EMOJI_DATABASE === 'undefined' || !EMOJI_DATABASE) {
        gridContainer.innerHTML = '<div class="emoji-no-results">Emoji-Datenbank nicht verfügbar</div>';
        return;
    }

    if (!query || !query.trim()) {
        const firstCategory = Object.keys(EMOJI_DATABASE)[0];
        if (firstCategory) showEmojiCategory(firstCategory, inputId);
        return;
    }

    if (categoriesContainer) {
        categoriesContainer.querySelectorAll('.emoji-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    const results   = [];
    const seenEmojis = new Set();
    const queryLower = query.toLowerCase();

    try {
        Object.values(EMOJI_DATABASE).forEach(category => {
            if (category && category.emojis && Array.isArray(category.emojis)) {
                category.emojis.forEach(emojiData => {
                    if (emojiData &&
                        typeof emojiData === 'object' &&
                        emojiData.name  && typeof emojiData.name  === 'string' &&
                        emojiData.emoji && typeof emojiData.emoji === 'string') {

                        try {
                            const nameMatch    = emojiData.name.toLowerCase().includes(queryLower);
                            const emojiMatch   = emojiData.emoji.includes(query);
                            const keywordMatch = Array.isArray(emojiData.keywords) &&
                                                 emojiData.keywords.some(k => k.toLowerCase().includes(queryLower));

                            if ((nameMatch || emojiMatch || keywordMatch) && !seenEmojis.has(emojiData.emoji)) {
                                seenEmojis.add(emojiData.emoji);
                                results.push(emojiData);
                            }
                        } catch (err) {
                            console.warn('Fehler beim Verarbeiten von Emoji-Daten:', emojiData, err);
                        }
                    }
                });
            }
        });
    } catch (err) {
        console.error('Fehler beim Durchsuchen der Emoji-Datenbank:', err);
        gridContainer.innerHTML = '<div class="emoji-no-results">Fehler beim Durchsuchen der Emojis</div>';
        return;
    }

    gridContainer.innerHTML = '';

    if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.className   = 'emoji-no-results';
        noResults.textContent = 'Keine Emojis gefunden';
        gridContainer.appendChild(noResults);
        return;
    }

    try {
        results.sort((a, b) => {
            if (!a.name || !b.name) return 0;

            const aLower = a.name.toLowerCase();
            const bLower = b.name.toLowerCase();
            const aExact = aLower === queryLower;
            const bExact = bLower === queryLower;
            const aStart = aLower.startsWith(queryLower);
            const bStart = bLower.startsWith(queryLower);
            const aName  = aLower.includes(queryLower);
            const bName  = bLower.includes(queryLower);

            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            if (aStart && !bStart) return -1;
            if (!aStart && bStart) return 1;
            if (aName  && !bName)  return -1;
            if (!aName && bName)   return 1;

            return a.name.localeCompare(b.name);
        });
    } catch (err) {
        console.warn('Fehler beim Sortieren der Emoji-Ergebnisse:', err);
    }

    results.forEach(emojiData => {
        if (emojiData && emojiData.emoji && emojiData.name) {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.innerHTML = `
                ${emojiData.emoji}
                <div class="emoji-tooltip">${emojiData.name}</div>
            `;
            emojiItem.onclick = () => selectEmoji(emojiData.emoji, inputId);
            gridContainer.appendChild(emojiItem);
        }
    });
}
