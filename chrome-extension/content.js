if (!window.hasRun) {
    window.hasRun = true;

    const CONSTANTS = {
        NOW_PLAYING_SELECTOR: '[data-testid="now-playing-widget"]',
        LYRICS_SELECTOR: '.BXlQFspJp_jq9SKhUSP3',
        LYRICS_TOOLBAR_SELECTOR: '.mwpJrmCgLlVkJVtWjlI1',
        BASE_BUTTON_CLASSES: ['Button-sc-1dqy6lx-0', 'fprjoI', 'e-91000-overflow-wrap-anywhere', 'e-91000-button-tertiary--icon-only', 'KAZD28usA1vPz5GVpm63'],
        ACTIVE_BUTTON_CLASS: 'EHxL6K_6WWDlTCZP6x5w',
        ICON_COLOR_ACTIVE: '#1ed760',
        ICON_COLOR_INACTIVE: '#b3b3b3',
        NPV_BUTTON_SELECTOR: 'button[data-testid="control-button-npv"]',
        NPV_TRACK_LINK_SELECTOR: 'aside[aria-label="Now playing view"] a[data-testid="context-link"][href*="track"]',
    };

    const ICONS = {
        subtitle: (color = CONSTANTS.ICON_COLOR_INACTIVE) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="m19.06 18.67-2.14-4.27-2.14 4.27M15.17 17.91h3.52" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.92 22a5.08 5.08 0 1 1 .002-10.162A5.08 5.08 0 0 1 16.92 22ZM5.02 2h3.92c2.07 0 3.07 1 3.02 3.02v3.92c.05 2.07-.95 3.07-3.02 3.02H5.02C3 12 2 11 2 8.93V5.01C2 3 3 2 5.02 2ZM9.01 5.85H4.95M6.97 5.17v.68" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7.99 5.84c0 1.75-1.37 3.17-3.05 3.17" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.01 9.01c-.73 0-1.39-.39-1.85-1.01M2 15c0 3.87 3.13 7 7 7l-1.05-1.75M22 9c0-3.87-3.13-7-7-7l1.05 1.75" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        check: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.1 4.2L6.2 11.1 2.9 7.8l1.4-1.4 1.9 1.9 5.5-5.5L13.1 4.2z"></path></svg>`
    };

    let currentSongIdentifier = null;
    let currentSongId = null;
    let subtitleData = null;
    let displayMode = 'combined';
    let menuElement = null;
    let subtitleButtonWrapper = null;
    let isProcessingMutation = false;


    function injectStyles() {
        if (document.getElementById('spotify-subtitle-styles')) return;
        const style = document.createElement('style');
        style.id = 'spotify-subtitle-styles';
        style.innerHTML = `
            .original-text-wrapper.hidden { display: none !important; }
            .spotify-subtitle-menu { position: absolute; bottom: 125%; right: 0; background-color: #282828; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 4px; z-index: 9999; width: 200px; }
            .spotify-subtitle-menu-item { display: flex; justify-content: space-between; align-items: center; background: none; border: none; color: #eee; width: 100%; padding: 8px; text-align: left; border-radius: 3px; cursor: pointer; font-size: 14px; }
            .spotify-subtitle-menu-item:hover { background-color: #3e3e3e; }
            .spotify-subtitle-menu-item .check-icon { visibility: hidden; color: ${CONSTANTS.ICON_COLOR_ACTIVE}; }
            .spotify-subtitle-menu-item.active .check-icon { visibility: visible; }
            .spotify-subtitle-menu .hr-border { border-top: 1px solid #3d3d3d; margin: 4px 0; }
            .spotify-subtitle-button:not([data-active="true"]):hover .e-91000-button__icon-wrapper svg path { stroke: #ffffff; }
            .spotify-subtitle-button[data-active="true"] .e-91000-button__icon-wrapper svg path { stroke: ${CONSTANTS.ICON_COLOR_ACTIVE}; }
        `;
        document.head.appendChild(style);
    }

    function updateDisplay() {
        document.querySelectorAll('.original-text-wrapper').forEach(el => el.classList.toggle('hidden', displayMode === 'translation_only'));
        document.querySelectorAll('.spotify-subtitle-text').forEach(el => el.style.display = (displayMode === 'off') ? 'none' : 'block');
        updateButtonState();
        updateMenuState();
    }

    function applySubtitles() {
        if (!subtitleData) return;
        removeSubtitles();
        const lyricElements = document.querySelectorAll(CONSTANTS.LYRICS_SELECTOR);
        let seg_number = -1;
        for (const element of lyricElements) {
            const originalText = element.textContent;
            element.innerHTML = `<span class="original-text-wrapper">${originalText}<br></span>`;
            if (seg_number >= 0) {
                const subtitle = subtitleData.segments.find(s => s.segment_number === seg_number);
                if (subtitle) {
                    const subSpan = document.createElement('span');
                    subSpan.className = 'spotify-subtitle-text';
                    subSpan.innerHTML = `${subtitle.text.replace(/\r\n/g, "<br>")}`;
                    element.appendChild(subSpan);
                }
            }
            seg_number++;
        }
        updateDisplay();
    }

    function removeSubtitles() {
        document.querySelectorAll('.spotify-subtitle-text').forEach(el => el.remove());
        document.querySelectorAll('.original-text-wrapper').forEach(el => {
            const parent = el.parentElement;
            if(parent) parent.innerHTML = el.textContent;
        });
    }

    function updateButtonState() {
        if (!subtitleButtonWrapper) return;
        const button = subtitleButtonWrapper.querySelector('button');
        const iconContainer = button.querySelector('.e-91000-button__icon-wrapper');
        const isActive = displayMode !== 'off' && !!subtitleData;
        
        button.classList.toggle(CONSTANTS.ACTIVE_BUTTON_CLASS, isActive);
        button.dataset.active = isActive;
        button.setAttribute('aria-pressed', isActive);
        
        iconContainer.innerHTML = ICONS.subtitle(isActive ? CONSTANTS.ICON_COLOR_ACTIVE : CONSTANTS.ICON_COLOR_INACTIVE);
    }

    function updateMenuState() {
        if (!menuElement) return;
        menuElement.querySelector('#sub-item-combined').classList.toggle('active', displayMode === 'combined');
        menuElement.querySelector('#sub-item-translation').classList.toggle('active', displayMode === 'translation_only');
        menuElement.querySelector('#sub-item-off').classList.toggle('active', displayMode === 'off');
    }

    function closeMenu() {
        if (menuElement) {
            menuElement.remove();
            menuElement = null;
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    }

    function closeMenuOnClickOutside(event) {
        if (menuElement && !subtitleButtonWrapper.contains(event.target)) {
            closeMenu();
        }
    }

    function createMenu() {
        if (menuElement) {
            closeMenu();
            return;
        }
        menuElement = document.createElement('div');
        menuElement.className = 'spotify-subtitle-menu';
        menuElement.innerHTML = `
            <button id="sub-item-reload" class="spotify-subtitle-menu-item"><span>Reload</span></button>
            <div class="hr-border"></div>
            <button id="sub-item-combined" class="spotify-subtitle-menu-item"><span>Show Both</span><span class="check-icon">${ICONS.check}</span></button>
            <button id="sub-item-translation" class="spotify-subtitle-menu-item"><span>Translation Only</span><span class="check-icon">${ICONS.check}</span></button>
            <button id="sub-item-off" class="spotify-subtitle-menu-item"><span>Off</span></button>
        `;
        
        menuElement.querySelector('#sub-item-reload').addEventListener('click', () => {
            if (currentSongId) initializeForNewSong(currentSongId, true);
        });
        menuElement.querySelector('#sub-item-combined').addEventListener('click', () => { displayMode = 'combined'; updateDisplay(); });
        menuElement.querySelector('#sub-item-translation').addEventListener('click', () => { displayMode = 'translation_only'; updateDisplay(); });
        menuElement.querySelector('#sub-item-off').addEventListener('click', () => { displayMode = 'off'; updateDisplay(); });

        subtitleButtonWrapper.appendChild(menuElement);
        updateMenuState();
        setTimeout(() => document.addEventListener('click', closeMenuOnClickOutside), 0);
    }

    function createButton() {
        const toolbar = document.querySelector(CONSTANTS.LYRICS_TOOLBAR_SELECTOR);
        if (!toolbar || document.getElementById('spotify-subtitle-wrapper')) return;

        subtitleButtonWrapper = document.createElement('div');
        subtitleButtonWrapper.style.position = 'relative';
        subtitleButtonWrapper.id = 'spotify-subtitle-wrapper';
        
        const referenceButton = toolbar.querySelector('button');
        const newButton = document.createElement('button');
        newButton.className = referenceButton.className;
        newButton.classList.add('spotify-subtitle-button');
        newButton.title = "Subtitles";
        newButton.setAttribute('aria-label', 'Subtitles');
        newButton.innerHTML = `<span aria-hidden="true" class="e-91000-button__icon-wrapper">${ICONS.subtitle()}</span>`;
        
        newButton.addEventListener('click', (e) => {
            e.stopPropagation();
            createMenu();
        });

        newButton.classList.add(...CONSTANTS.BASE_BUTTON_CLASSES);
        subtitleButtonWrapper.appendChild(newButton);
        toolbar.prepend(subtitleButtonWrapper);
    }

    async function waitForElement(selector, timeout = 2000) {
        return new Promise((resolve) => {
            const interval = 100;
            const endTime = Date.now() + timeout;
            
            const timer = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearInterval(timer);
                    resolve(element);
                } else if (Date.now() > endTime) {
                    clearInterval(timer);
                    resolve(null);
                }
            }, interval);
        });
    }

    async function getSongIdFromDOM() {
        const npvButton = document.querySelector(CONSTANTS.NPV_BUTTON_SELECTOR);
        if (!npvButton) return null;

        const wasActive = npvButton.getAttribute('data-active') === 'true';
        
        if (wasActive) {
            const trackLink = await waitForElement(CONSTANTS.NPV_TRACK_LINK_SELECTOR);
            const href = trackLink?.getAttribute('href');
            const match = href ? href.match(/uri=spotify%3Atrack%3A([a-zA-Z0-9]+)/) : null;
            return match ? match[1] : null;
        }

        npvButton.click();
        const trackLink = await waitForElement(CONSTANTS.NPV_TRACK_LINK_SELECTOR);
        const href = trackLink?.getAttribute('href');
        const match = href ? href.match(/uri=spotify%3Atrack%3A([a-zA-Z0-9]+)/) : null;
        const songId = match ? match[1] : null;        
        npvButton.click(); 
        return songId;
    }

    async function initializeForNewSong(songId, forceReload = false) {
        if (songId === currentSongId && !forceReload) return;
        currentSongId = songId;
        subtitleData = null;
        removeSubtitles();
        createButton();

        const response = await chrome.runtime.sendMessage({ action: "fetchSubtitle", songId: currentSongId });

        if (response && !response.error && response.subtitle?.segments.length > 0) {
            subtitleData = response.subtitle;
            applySubtitles();
        }
        updateButtonState();
    }

    const observerCallback = async () => {
        if (isProcessingMutation) return;

        const nowPlayingWidget = document.querySelector(CONSTANTS.NOW_PLAYING_SELECTOR);
        const lyricsContainer = document.querySelector(CONSTANTS.LYRICS_SELECTOR);

        if (nowPlayingWidget && lyricsContainer) {
            const titleElement = nowPlayingWidget.querySelector('[data-testid="context-item-info-title"]');
            const songIdentifier = titleElement ? titleElement.textContent.trim() : '';

            if (songIdentifier && songIdentifier !== currentSongIdentifier) {
                isProcessingMutation = true;
                observer.disconnect();

                try {
                    const songId = await getSongIdFromDOM();
                    if (songId && songId !== currentSongId) {
                        currentSongIdentifier = songIdentifier;
                        injectStyles();
                        await initializeForNewSong(songId);
                    }
                } catch (e) {
                    console.warn("Error during song detection:", e);
                } finally {
                    isProcessingMutation = false;
                    observer.observe(document.body, { childList: true, subtree: true });
                }
            }
        } else {
            if (subtitleButtonWrapper) {
                subtitleButtonWrapper.remove();
                subtitleButtonWrapper = null;
                currentSongId = null;
            }
        }
    };

    const observer = new MutationObserver(observerCallback);
    observer.observe(document.body, { childList: true, subtree: true });
}