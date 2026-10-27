// ========================================================================
// LINKSAMMLUNG - A11Y.JS v3.8
// ========================================================================
// Tastaturbedienung und Dialog-Semantik – zentral für alle (auch dynamisch
// erzeugten) Dialoge und Menüs:
//   • Dialoge: role="dialog", aria-modal, Fokus beim Öffnen hinein, Tab bleibt
//     im Dialog, Escape schließt nur den obersten, Fokus kehrt zum Auslöser zurück
//   • Menüs: Pfeiltasten, Enter/Leertaste, Fokus beim Öffnen per Tastatur
//   • Klickbare DIVs mit role="button"/"link"/"menuitem": Enter/Leertaste
// Abhängig von: – (wird vor script.js geladen; Schließen-Funktionen der
// einzelnen Dialoge werden erst zur Laufzeit aufgerufen)
// ========================================================================

// Wurde zuletzt die Tastatur benutzt? (Menüs nur dann automatisch fokussieren)
let _kbdLastInput = false;

// Offene Dialoge in Öffnungsreihenfolge: { el, trigger }
const _dialogStack = [];

// Element, von dem aus ein Kontextmenü per Tastatur geöffnet wurde
let _menuTrigger = null;

const _FOCUSABLE = 'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), ' +
                   'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Dialog-ID → Schließen-Funktion (nicht aufgeführte dynamische Dialoge werden entfernt)
const _DIALOG_CLOSERS = {
    linkModal:            () => closeModal(),
    categoryModal:        () => closeCategoryModal(),
    categorySelectModal:  () => closeCategorySelectModal(),
    emptyCategoryModal:   () => closeEmptyCategoryModal(),
    addTabModal:          () => closeAddTabModal(),
    renameTabModal:       () => closeRenameTabModal(),
    bookmarkImportModal:  () => closeBookmarkImportModal(),
    moveLinkModal:        () => closeMoveLinkModal(),
    mergeTabModal:        () => closeMergeTabModal(),
    moveCategoryModal:    () => closeMoveCategoryModal(),
    snippetHintModal:     () => closeSnippetHintModal(),
    duplicatesModal:      () => closeDuplicatesModal(),
    linkOverviewModal:    () => closeLinkOverview(),
    welcomeModal:         () => {}   // eigener ESC-Handler im Welcome-Loader
};

// -----------------------------------------------------------------------
// HILFSFUNKTIONEN
// -----------------------------------------------------------------------

function _isVisible(el) {
    return !!el && el.isConnected && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
}

function _focusables(container) {
    return [...container.querySelectorAll(_FOCUSABLE)].filter(el => _isVisible(el) && !el.closest('[aria-hidden="true"]'));
}

let _a11yIdCounter = 0;

/**
 * ARIA-Rollen/Attribute für statische und neu eingefügte Elemente setzen
 */
function _enhanceA11y(root) {
    if (!root || !root.querySelectorAll) return;
    const all = sel => [...(root.matches && root.matches(sel) ? [root] : []), ...root.querySelectorAll(sel)];

    all('.modal').forEach(modal => {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        const heading = modal.querySelector('h2');
        if (heading && !modal.hasAttribute('aria-labelledby')) {
            if (!heading.id) heading.id = 'dlgTitle' + (++_a11yIdCounter);
            modal.setAttribute('aria-labelledby', heading.id);
        }
    });
    all('.context-menu, .menu-submenu').forEach(menu => menu.setAttribute('role', 'menu'));
    all('.context-menu-item, .submenu-item').forEach(item => {
        item.setAttribute('role', 'menuitem');
        item.setAttribute('tabindex', '-1');
    });
    all('.emoji-trigger').forEach(t => {
        t.setAttribute('role', 'button');
        t.setAttribute('tabindex', '0');
        if (!t.hasAttribute('aria-label')) t.setAttribute('aria-label', 'Emoji auswählen');
    });
}

// -----------------------------------------------------------------------
// DIALOGE: Fokus beim Öffnen/Schließen
// -----------------------------------------------------------------------

function _syncDialogs() {
    const open = [...document.querySelectorAll('.modal')].filter(_isVisible);

    // Geschlossene Dialoge entfernen; Fokus an den Auslöser zurückgeben
    for (let i = _dialogStack.length - 1; i >= 0; i--) {
        const entry = _dialogStack[i];
        if (open.includes(entry.el)) continue;
        _dialogStack.splice(i, 1);
        const focusLost = !document.activeElement || document.activeElement === document.body || !document.activeElement.isConnected;
        if (focusLost || entry.el.contains(document.activeElement)) {
            const top = _dialogStack[_dialogStack.length - 1];
            if (entry.trigger && _isVisible(entry.trigger)) entry.trigger.focus();
            else if (top) (_focusables(top.el)[0] || top.el).focus();
        }
    }

    // Neu geöffnete Dialoge aufnehmen und Fokus hineinsetzen
    open.forEach(el => {
        if (_dialogStack.some(d => d.el === el)) return;
        let trigger = document.activeElement;
        // Aus einem Kontextmenü geöffnet → zum ursprünglichen Element zurück
        if (trigger && trigger.closest && trigger.closest('.context-menu, .menu-submenu')) trigger = _menuTrigger;
        _dialogStack.push({ el, trigger: trigger && trigger !== document.body ? trigger : null });
        if (!el.contains(document.activeElement)) {
            const target = _focusables(el)[0];
            if (target) {
                target.focus();
            } else {
                const content = el.querySelector('.modal-content') || el;
                content.setAttribute('tabindex', '-1');
                content.focus();
            }
        }
    });
}

/**
 * Obersten offenen Dialog schließen
 * @returns {boolean} true wenn ein Dialog geschlossen wurde
 */
function closeTopDialog() {
    _syncDialogs();
    const top = _dialogStack[_dialogStack.length - 1];
    if (!top) return false;
    const closer = _DIALOG_CLOSERS[top.el.id];
    if (closer) closer();
    else top.el.remove();
    _syncDialogs();
    return true;
}

function hasOpenDialog() {
    _syncDialogs();
    return _dialogStack.length > 0;
}

// -----------------------------------------------------------------------
// MENÜS
// -----------------------------------------------------------------------

/**
 * Nach dem Öffnen eines Menüs: bei Tastaturbedienung ersten Eintrag fokussieren
 */
function focusMenuIfKeyboard(menu) {
    if (!_kbdLastInput || !menu) return;
    _menuTrigger = document.activeElement !== document.body ? document.activeElement : null;
    const first = [...menu.querySelectorAll('[role="menuitem"]')].find(_isVisible);
    if (first) first.focus();
}

/**
 * Fokus nach dem Schließen eines per Tastatur geöffneten Menüs zurückgeben
 */
function restoreMenuFocus() {
    const active = document.activeElement;
    const inMenu = active && active.closest && active.closest('.context-menu, .menu-submenu');
    if (_menuTrigger && (inMenu || active === document.body) && _isVisible(_menuTrigger)) _menuTrigger.focus();
    _menuTrigger = null;
}

/**
 * Position für Kontextmenüs: per Tastatur ausgelöste contextmenu-Events haben
 * oft keine Mauskoordinaten → am Element ausrichten
 */
function menuPositionFor(event) {
    if ((event.clientX || event.clientY) || !event.currentTarget || !event.currentTarget.getBoundingClientRect) {
        return { x: event.clientX, y: event.clientY };
    }
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: rect.left + 10, y: rect.bottom - 4 };
}

function _moveMenuFocus(menu, delta) {
    const items = [...menu.querySelectorAll('[role="menuitem"]')].filter(_isVisible);
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement);
    items[(idx + delta + items.length) % items.length].focus();
}

// -----------------------------------------------------------------------
// GLOBALE TASTATUR-HANDLER
// -----------------------------------------------------------------------

document.addEventListener('keydown', () => { _kbdLastInput = true; }, true);
document.addEventListener('pointerdown', () => { _kbdLastInput = false; }, true);

document.addEventListener('keydown', e => {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;

    // Fokusfalle: Tab bleibt im obersten Dialog
    if (e.key === 'Tab' && _dialogStack.length) {
        const top = _dialogStack[_dialogStack.length - 1].el;
        if (!top.isConnected) return;
        const items = _focusables(top);
        if (!items.length) { e.preventDefault(); return; }
        const first = items[0], last = items[items.length - 1];
        if (!top.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
    }

    // Menü-Navigation
    const menu = el.closest('[role="menu"]');
    if (menu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        _moveMenuFocus(menu, e.key === 'ArrowDown' ? 1 : -1);
        return;
    }

    // Klickbare Nicht-Buttons per Enter/Leertaste auslösen
    if ((e.key === 'Enter' || e.key === ' ') &&
        el.matches('[role="button"], [role="link"], [role="menuitem"]') &&
        !el.matches('button, a, input, select, textarea')) {
        if (e.key === ' ' && el.getAttribute('role') === 'link') return;   // Leertaste scrollt bei Links
        e.preventDefault();
        el.click();
    }
});

// -----------------------------------------------------------------------
// START
// -----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    _enhanceA11y(document.body);

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) _enhanceA11y(n); }));
        _syncDialogs();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
});

// ========================================================================
// ENDE A11Y.JS v3.8
// ========================================================================
