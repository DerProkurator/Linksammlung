// ========================================================================
// LINKSAMMLUNG - DRAG-DROP.JS v3.8
// ========================================================================
// Drag & Drop-System: Kategorien und Links verschieben
// Abhängig von: config.js
// ========================================================================

// -----------------------------------------------------------------------
// KATEGORIE DRAG & DROP
// -----------------------------------------------------------------------

/**
 * Kategorie für Drag & Drop vorbereiten
 */
function makeCategoryDraggable(categoryElement, categoryKey) {
    const dragHandle = categoryElement.querySelector('.drag-handle');

    dragHandle.draggable = true;
    dragHandle.addEventListener('dragstart', handleCategoryDragStart);
    dragHandle.addEventListener('dragend',   handleCategoryDragEnd);

    categoryElement.addEventListener('dragover',  handleCategoryDragOver);
    categoryElement.addEventListener('drop',      handleCategoryDrop);
    categoryElement.addEventListener('dragenter', handleCategoryDragEnter);
    categoryElement.addEventListener('dragleave', handleCategoryDragLeave);

    categoryElement.setAttribute('data-category-key', categoryKey);
    dragHandle.setAttribute('data-category-key', categoryKey);
}

function handleCategoryDragStart(e) {
    draggedElement    = this.closest('.category');
    draggedCategoryKey = this.getAttribute('data-category-key');
    draggedElement.classList.add('dragging');

    isDragging = true;
    showScrollZonesIfNeeded();
    this.classList.add('active');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.outerHTML);

    const categoryClone = draggedElement.cloneNode(true);
    Object.assign(categoryClone.style, {
        transform:     'rotate(5deg)',
        opacity:       '0.8',
        pointerEvents: 'none',
        position:      'absolute',
        top:           '-1000px',
        left:          '-1000px',
        zIndex:        '1000',
        maxWidth:      '300px'
    });
    document.body.appendChild(categoryClone);
    e.dataTransfer.setDragImage(categoryClone, 150, 50);

    setTimeout(() => {
        if (document.body.contains(categoryClone)) document.body.removeChild(categoryClone);
    }, 100);
}

function handleCategoryDragEnd(e) {
    const categoryElement = this.closest('.category');
    const dragHandle      = this;

    categoryElement.classList.remove('dragging');
    dragHandle.classList.remove('active');

    isDragging = false;
    stopAutoScroll();
    hideScrollZones();
    setTimeout(removeScrollZones, 300);

    cleanupDragAndDrop();

    if (dragStabilityTimeout) {
        clearTimeout(dragStabilityTimeout);
        dragStabilityTimeout = null;
    }

    draggedElement     = null;
    draggedCategoryKey = null;
    dragOverElement    = null;
    dropPosition       = null;
    currentDropIndicator = null;
}

function handleCategoryDragOver(e) {
    if (draggedCategoryKey && !draggedLinkData) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (this !== draggedElement) {
            if (dragStabilityTimeout) clearTimeout(dragStabilityTimeout);

            const currentElement = this;

            // 50ms Debounce: verhindert Flicker wenn DragOver durch Kindknoten feuert
            dragStabilityTimeout = setTimeout(() => {
                dragStabilityTimeout = null;

                document.querySelectorAll('.category').forEach(cat => {
                    if (cat !== currentElement) {
                        removeAllDragOverClasses(cat);
                        removeDropIndicator(cat);
                    }
                });

                const isInGrid = isCategoryInGridLayout(currentElement);
                const rect     = currentElement.getBoundingClientRect();

                if (isInGrid) {
                    const mouseX = e.clientX - rect.left;
                    if (mouseX < rect.width * 0.5) {
                        currentElement.classList.add('drag-over-before');
                        createDropIndicator(currentElement, 'left');
                        dropPosition = 'before';
                    } else {
                        currentElement.classList.add('drag-over-after');
                        createDropIndicator(currentElement, 'right');
                        dropPosition = 'after';
                    }
                } else {
                    const mouseY = e.clientY - rect.top;
                    if (mouseY < rect.height * 0.5) {
                        currentElement.classList.add('drag-over-before');
                        createDropIndicator(currentElement, 'before');
                        dropPosition = 'before';
                    } else {
                        currentElement.classList.add('drag-over-after');
                        createDropIndicator(currentElement, 'after');
                        dropPosition = 'after';
                    }
                }

                dragOverElement = currentElement;
            }, 50);
        }

        return false;
    }
}

function handleCategoryDragEnter(e) {
    if (draggedCategoryKey && !draggedLinkData && this !== draggedElement) {
        e.preventDefault();
        e.stopPropagation();

        if (!dragStabilityTimeout) {
            dragOverElement = this;
            const isInGrid  = isCategoryInGridLayout(this);

            if (isInGrid) {
                this.classList.add('drag-over-before');
                createDropIndicator(this, 'left');
                dropPosition = 'before';
            } else {
                this.classList.add('drag-over-after');
                createDropIndicator(this, 'after');
                dropPosition = 'after';
            }
        }
    }
}

function handleCategoryDragLeave(e) {
    if (draggedCategoryKey && !draggedLinkData) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left - 15 || x > rect.right + 15 || y < rect.top - 15 || y > rect.bottom + 15) {
            setTimeout(() => {
                const currentRect = this.getBoundingClientRect();
                if (e.clientX < currentRect.left - 15 || e.clientX > currentRect.right + 15 ||
                    e.clientY < currentRect.top - 15  || e.clientY > currentRect.bottom + 15) {
                    removeAllDragOverClasses(this);
                    removeDropIndicator(this);
                    if (dragOverElement === this) {
                        dragOverElement = null;
                        dropPosition    = null;
                    }
                }
            }, 100);
        }
    }
}

function handleCategoryDrop(e) {
    if (draggedCategoryKey && !draggedLinkData) {
        e.preventDefault();
        e.stopPropagation();

        const targetCategoryKey = this.getAttribute('data-category-key');

        if (draggedElement && draggedElement !== this && targetCategoryKey) {
            const draggedIndex = categoryOrder.indexOf(draggedCategoryKey);
            const targetIndex  = categoryOrder.indexOf(targetCategoryKey);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const movedKey = draggedCategoryKey;

                categoryOrder.splice(draggedIndex, 1);

                let newIndex = targetIndex;
                if (draggedIndex < targetIndex) newIndex--;

                if (dropPosition === 'before') {
                    categoryOrder.splice(newIndex, 0, movedKey);
                } else {
                    categoryOrder.splice(newIndex + 1, 0, movedKey);
                }

                if (!saveConfig(true)) return false;
                renderCategories();

                requestAnimationFrame(() => {
                    const movedEl = document.querySelector(`.category[data-category-key="${movedKey}"]`);
                    if (movedEl) movedEl.classList.add('category-just-moved');
                });

                showMessage('Kategorie-Reihenfolge aktualisiert', 'success');
            }
        }

        removeAllDragOverClasses(this);
        removeDropIndicator(this);
        dragOverElement = null;
        dropPosition    = null;
        return false;
    }
}

// -----------------------------------------------------------------------
// LINK DRAG & DROP
// -----------------------------------------------------------------------

/**
 * Link für Drag & Drop vorbereiten
 */
function makeLinkDraggable(linkElement, categoryKey, linkIndex) {
    const linkDragHandle = linkElement.querySelector('.link-drag-handle');

    linkDragHandle.draggable = true;
    linkDragHandle.addEventListener('dragstart', handleLinkDragStart);
    linkDragHandle.addEventListener('dragend',   handleLinkDragEnd);

    linkElement.setAttribute('data-category-key', categoryKey);
    linkElement.setAttribute('data-link-index',   linkIndex);
    linkDragHandle.setAttribute('data-category-key', categoryKey);
    linkDragHandle.setAttribute('data-link-index',   linkIndex);
}

function makeLinkDroppable(linkElement, categoryKey, linkIndex) {
    linkElement.addEventListener('dragover',  handleLinkDragOver);
    linkElement.addEventListener('drop',      handleLinkDrop);
    linkElement.addEventListener('dragenter', handleLinkDragEnter);
    linkElement.addEventListener('dragleave', handleLinkDragLeave);

    linkElement.setAttribute('data-category-key', categoryKey);
    linkElement.setAttribute('data-link-index',   linkIndex);
}

function makeCategoryDroppable(categoryElement, categoryKey) {
    categoryElement.removeEventListener('dragover',  handleCategoryLinkDragOver);
    categoryElement.removeEventListener('drop',      handleCategoryLinkDrop);
    categoryElement.removeEventListener('dragenter', handleCategoryLinkDragEnter);
    categoryElement.removeEventListener('dragleave', handleCategoryLinkDragLeave);

    categoryElement.addEventListener('dragover',  handleCategoryLinkDragOver);
    categoryElement.addEventListener('drop',      handleCategoryLinkDrop);
    categoryElement.addEventListener('dragenter', handleCategoryLinkDragEnter);
    categoryElement.addEventListener('dragleave', handleCategoryLinkDragLeave);
}

function handleLinkDragStart(e) {
    const categoryKey = this.getAttribute('data-category-key');
    const linkIndex   = parseInt(this.getAttribute('data-link-index'));

    document.querySelectorAll('.category').forEach(cat => cat.classList.remove('link-drag-over'));
    document.querySelectorAll('.link-item').forEach(link => removeAllDragOverClasses(link));

    draggedLinkElement = this.closest('.link-item');
    draggedLinkData    = {
        categoryKey,
        linkIndex,
        linkData: linkCategories[categoryKey].links[linkIndex]
    };

    isDragging = true;
    showScrollZonesIfNeeded();

    draggedLinkElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedLinkElement.outerHTML);

    const linkClone = draggedLinkElement.cloneNode(true);
    Object.assign(linkClone.style, {
        transform:     'rotate(5deg)',
        opacity:       '0.8',
        pointerEvents: 'none',
        position:      'absolute',
        top:           '-1000px',
        left:          '-1000px',
        zIndex:        '1000',
        maxWidth:      '280px'
    });
    document.body.appendChild(linkClone);
    e.dataTransfer.setDragImage(linkClone, 140, 30);

    setTimeout(() => {
        if (document.body.contains(linkClone)) document.body.removeChild(linkClone);
    }, 100);

    e.stopPropagation();
}

function handleLinkDragEnd(e) {
    if (draggedLinkElement) draggedLinkElement.classList.remove('dragging');

    isDragging = false;
    stopAutoScroll();
    hideScrollZones();
    setTimeout(removeScrollZones, 300);

    cleanupDragAndDrop();

    draggedLinkElement = null;
    draggedLinkData    = null;
    dragOverElement    = null;
    dropPosition       = null;
}

function handleLinkDragOver(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        const targetLinkIndex   = parseInt(this.getAttribute('data-link-index'));

        if (targetCategoryKey !== draggedLinkData.categoryKey) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const categoryElement = this.closest('.category');
            if (categoryElement) {
                document.querySelectorAll('.category').forEach(cat => {
                    if (cat !== categoryElement) cat.classList.remove('link-drag-over');
                });
                categoryElement.classList.add('link-drag-over');
            }
            return true;

        } else if (targetLinkIndex !== draggedLinkData.linkIndex) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';

            document.querySelectorAll('.category').forEach(cat => cat.classList.remove('link-drag-over'));
            removeAllDragOverClasses(this);

            const isInGrid = isElementInGridLayout(this);
            const rect     = this.getBoundingClientRect();

            if (isInGrid) {
                const mouseX      = e.clientX - rect.left;
                const mouseY      = e.clientY - rect.top;
                const inSameRow   = areElementsInSameRow(this, draggedLinkElement);

                if (inSameRow) {
                    if (mouseX < rect.width * 0.3) {
                        this.classList.add('drag-over-top-left');
                        dropPosition = 'before';
                    } else if (mouseX > rect.width * 0.7) {
                        this.classList.add('drag-over-bottom-right');
                        dropPosition = 'after';
                    } else {
                        this.classList.add('drag-over-center');
                        dropPosition = 'replace';
                    }
                } else {
                    if (mouseY < rect.height * 0.3) {
                        this.classList.add('drag-over-top-left');
                        dropPosition = 'before';
                    } else if (mouseY > rect.height * 0.7) {
                        this.classList.add('drag-over-bottom-right');
                        dropPosition = 'after';
                    } else {
                        this.classList.add('drag-over-center');
                        dropPosition = 'replace';
                    }
                }
            } else {
                const mouseY = e.clientY - rect.top;
                if (mouseY < rect.height * 0.3) {
                    this.classList.add('drag-over-top-left');
                    dropPosition = 'before';
                } else if (mouseY > rect.height * 0.7) {
                    this.classList.add('drag-over-bottom-right');
                    dropPosition = 'after';
                } else {
                    this.classList.add('drag-over-center');
                    dropPosition = 'replace';
                }
            }

            dragOverElement = this;
            return false;
        }
    }
}

function handleLinkDragEnter(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');

        if (targetCategoryKey !== draggedLinkData.categoryKey) {
            e.preventDefault();
            const categoryElement = this.closest('.category');
            if (categoryElement) {
                document.querySelectorAll('.category').forEach(cat => {
                    if (cat !== categoryElement) cat.classList.remove('link-drag-over');
                });
                categoryElement.classList.add('link-drag-over');
            }
        } else {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

function handleLinkDragLeave(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        if (targetCategoryKey === draggedLinkData.categoryKey) {
            if (!this.contains(e.relatedTarget)) {
                removeAllDragOverClasses(this);
                if (dragOverElement === this) {
                    dragOverElement = null;
                    dropPosition    = null;
                }
            }
        }
    }
}

function handleLinkDrop(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        const targetLinkIndex   = parseInt(this.getAttribute('data-link-index'));

        if (targetCategoryKey === draggedLinkData.categoryKey &&
            targetLinkIndex !== draggedLinkData.linkIndex) {
            e.preventDefault();
            e.stopPropagation();

            const category  = linkCategories[targetCategoryKey];
            const linkToMove = category.links[draggedLinkData.linkIndex];

            category.links.splice(draggedLinkData.linkIndex, 1);

            let newIndex = targetLinkIndex;
            if (draggedLinkData.linkIndex < targetLinkIndex) newIndex--;

            if (dropPosition === 'before') {
                category.links.splice(newIndex, 0, linkToMove);
            } else if (dropPosition === 'after') {
                category.links.splice(newIndex + 1, 0, linkToMove);
            } else if (dropPosition === 'replace') {
                category.links.splice(newIndex, 0, linkToMove);
            }

            cleanupAllTemporaryElements();
            if (saveConfig(true)) {
                refreshViews();
                showMessage(`Link "${linkToMove.title}" neu positioniert`, 'success');
            }
        }

        removeAllDragOverClasses(this);
        dragOverElement = null;
        dropPosition    = null;
        return false;
    }
}

// -----------------------------------------------------------------------
// KATEGORIE ALS LINK-DROP-TARGET
// -----------------------------------------------------------------------

function handleCategoryLinkDragOver(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const targetCategoryKey = this.getAttribute('data-category-key');
        if (targetCategoryKey !== draggedLinkData.categoryKey) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';

            document.querySelectorAll('.category').forEach(cat => {
                if (cat !== this) cat.classList.remove('link-drag-over');
            });
            this.classList.add('link-drag-over');
            return false;
        }
    }
}

function handleCategoryLinkDragEnter(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        e.preventDefault();
        e.stopPropagation();
        const targetCategoryKey = this.getAttribute('data-category-key');
        if (targetCategoryKey && targetCategoryKey !== draggedLinkData.categoryKey) {
            document.querySelectorAll('.category').forEach(cat => {
                if (cat !== this) cat.classList.remove('link-drag-over');
            });
            this.classList.add('link-drag-over');
        }
    }
}

function handleCategoryLinkDragLeave(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        const rect = this.getBoundingClientRect();
        if (e.clientX < rect.left - 10 || e.clientX > rect.right + 10 ||
            e.clientY < rect.top - 10  || e.clientY > rect.bottom + 10) {
            setTimeout(() => {
                const elementUnderMouse   = document.elementFromPoint(e.clientX, e.clientY);
                const categoryUnderMouse  = elementUnderMouse?.closest('.category[data-category-key]');
                if (!categoryUnderMouse || categoryUnderMouse !== this) {
                    this.classList.remove('link-drag-over');
                }
            }, 50);
        }
    }
}

function handleCategoryLinkDrop(e) {
    if (draggedLinkData && draggedLinkData.linkData) {
        e.preventDefault();
        e.stopPropagation();

        const targetCategoryKey = this.getAttribute('data-category-key');

        if (targetCategoryKey && targetCategoryKey !== draggedLinkData.categoryKey) {
            const sourceCategory    = linkCategories[draggedLinkData.categoryKey];
            const sourceCategoryKey = draggedLinkData.categoryKey;
            const linkToMove        = sourceCategory.links.splice(draggedLinkData.linkIndex, 1)[0];

            linkCategories[targetCategoryKey].links.push(linkToMove);

            cleanupAllTemporaryElements();
            this.classList.remove('link-drag-over');

            // Verschieben sofort abschließen; über eine leer gewordene Quelle wird danach entschieden
            sortCategoriesEmptyLast();
            if (!saveConfig(true)) return false;
            refreshViews();

            if (sourceCategory.links.length === 0) {
                showEmptyCategoryModal({
                    action:           'move',
                    linkTitle:        linkToMove.title,
                    sourceTitle:      sourceCategory.title,
                    targetTitle:      linkCategories[targetCategoryKey].title,
                    sourceCategoryKey
                });
            } else {
                showMessage(`Link "${linkToMove.title}" von "${sourceCategory.title}" zu "${linkCategories[targetCategoryKey].title}" verschoben`, 'success');
            }
        } else {
            this.classList.remove('link-drag-over');
        }

        return false;
    }
}

// -----------------------------------------------------------------------
// HILFSFUNKTIONEN
// -----------------------------------------------------------------------

function areElementsInSameRow(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return Math.abs(rect1.top - rect2.top) < 10;
}

function isElementInGridLayout(element) {
    const parent        = element.parentElement;
    const computedStyle = window.getComputedStyle(parent);
    return computedStyle.display === 'grid' && computedStyle.gridTemplateColumns !== 'none';
}

function isCategoryInGridLayout(categoryElement) {
    const parent        = categoryElement.parentElement;
    const computedStyle = window.getComputedStyle(parent);
    return (parent.classList.contains('categories-grid-section') ||
            (computedStyle.display === 'grid' && computedStyle.gridTemplateColumns !== 'none'));
}

function removeAllDragOverClasses(element) {
    element.classList.remove(
        'drag-over', 'drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right',
        'drag-over-top-left', 'drag-over-bottom-right', 'drag-over-top-right', 'drag-over-bottom-left',
        'drag-over-center', 'drag-over-before', 'drag-over-after'
    );
}

function createDropIndicator(element, position) {
    const existing = element.querySelector('.drop-indicator-line');
    if (existing) existing.remove();

    const indicator = document.createElement('div');
    indicator.className = `drop-indicator-line ${position} active`;
    element.appendChild(indicator);
    return indicator;
}

function removeDropIndicator(element) {
    const indicator = element.querySelector('.drop-indicator-line');
    if (indicator) indicator.remove();
}

// -----------------------------------------------------------------------
// AUFRÄUMEN
// -----------------------------------------------------------------------
// Leere Kategorien werden von renderCategories() regulär (als .empty-category)
// gerendert und sind damit normale Drop-Ziele – keine temporären Elemente mehr.

function cleanupDragAndDrop() {
    cleanupAllTemporaryElements();

    document.querySelectorAll('.category').forEach(cat => {
        cat.classList.remove('link-drag-over');
        removeAllDragOverClasses(cat);
        removeDropIndicator(cat);
    });

    document.querySelectorAll('.link-item').forEach(link => {
        removeAllDragOverClasses(link);
    });
}

function cleanupAllTemporaryElements() {
    document.querySelectorAll('.scroll-zone').forEach(el => el.remove());

    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }

    if (isDragging) isDragging = false;
}

// -----------------------------------------------------------------------
// AUTO-SCROLL
// -----------------------------------------------------------------------

function isPageScrollable() {
    const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    return documentHeight > window.innerHeight;
}

function createScrollZones() {
    if (document.querySelector('.scroll-zone')) return;

    const topZone    = document.createElement('div');
    topZone.className = 'scroll-zone top';
    topZone.id        = 'scroll-zone-top';
    document.body.appendChild(topZone);

    const bottomZone    = document.createElement('div');
    bottomZone.className = 'scroll-zone bottom';
    bottomZone.id        = 'scroll-zone-bottom';
    document.body.appendChild(bottomZone);
}

function showScrollZones() {
    const topZone    = document.getElementById('scroll-zone-top');
    const bottomZone = document.getElementById('scroll-zone-bottom');
    if (topZone)    topZone.classList.add('active');
    if (bottomZone) bottomZone.classList.add('active');
}

function showScrollZonesIfNeeded() {
    if (isPageScrollable()) {
        createScrollZones();
        showScrollZones();
    }
}

function hideScrollZones() {
    const topZone    = document.getElementById('scroll-zone-top');
    const bottomZone = document.getElementById('scroll-zone-bottom');
    if (topZone)    topZone.classList.remove('active');
    if (bottomZone) bottomZone.classList.remove('active');
}

function removeScrollZones() {
    document.querySelectorAll('.scroll-zone').forEach(zone => zone.remove());
}

function startAutoScroll() {
    if (autoScrollInterval) return;

    autoScrollInterval = setInterval(() => {
        if (!isDragging) { stopAutoScroll(); return; }

        const scrollZoneSize = 100;
        const scrollSpeed    = 15;
        const windowHeight   = window.innerHeight;

        if (currentMouseY < scrollZoneSize) {
            window.scrollBy(0, -scrollSpeed * ((scrollZoneSize - currentMouseY) / scrollZoneSize));
        } else if (currentMouseY > windowHeight - scrollZoneSize) {
            window.scrollBy(0,  scrollSpeed * ((currentMouseY - (windowHeight - scrollZoneSize)) / scrollZoneSize));
        }
    }, 16);
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// -----------------------------------------------------------------------
// TOUCH-EVENTS (MOBILE)
// -----------------------------------------------------------------------

function handleTouchStart(e) {
    if (e.target.classList.contains('drag-handle')) {
        isTouching         = true;
        touchStartY        = e.touches[0].clientY;
        touchStartX        = e.touches[0].clientX;
        draggedElement     = e.target.closest('.category');
        draggedCategoryKey = e.target.getAttribute('data-category-key');
        draggedElement.classList.add('dragging');
        e.preventDefault();
    }
}

function handleTouchMove(e) {
    if (!isTouching || !draggedElement) return;
    e.preventDefault();

    const touch        = e.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const categoryBelow = elementBelow?.closest('.category');

    document.querySelectorAll('.category').forEach(cat => {
        removeAllDragOverClasses(cat);
        removeDropIndicator(cat);
    });

    if (categoryBelow && categoryBelow !== draggedElement) {
        categoryBelow.classList.add('drag-over-after');
        createDropIndicator(categoryBelow, 'after');
    }
}

function handleTouchEnd(e) {
    if (!isTouching || !draggedElement) return;
    isTouching = false;

    const touch        = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const categoryBelow = elementBelow?.closest('.category');

    if (categoryBelow && categoryBelow !== draggedElement) {
        const targetCategoryKey = categoryBelow.getAttribute('data-category-key');
        const draggedIndex      = categoryOrder.indexOf(draggedCategoryKey);
        const targetIndex       = categoryOrder.indexOf(targetCategoryKey);

        categoryOrder.splice(draggedIndex, 1);
        categoryOrder.splice(targetIndex, 0, draggedCategoryKey);

        if (saveConfig(true)) {
            renderCategories();
            showMessage('Kategorie-Reihenfolge aktualisiert', 'success');
        }
    }

    draggedElement.classList.remove('dragging');

    document.querySelectorAll('.category').forEach(cat => {
        removeAllDragOverClasses(cat);
        removeDropIndicator(cat);
    });

    draggedElement     = null;
    draggedCategoryKey = null;
}
