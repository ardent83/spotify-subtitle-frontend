async function fetchSubtitleFromAPI(songId) {
    const API_DOMAIN_URL = 'http://127.0.0.1:8000';
    const storageData = await chrome.storage.local.get('preferredLanguage');
    const preferredLanguage = storageData.preferredLanguage || 'en';

    const API_ENDPOINT = `${API_DOMAIN_URL}/api/subtitles/currently-playing/?songId=${encodeURIComponent(songId)}&language=${encodeURIComponent(preferredLanguage)}`;
    try {
        const cookies = await chrome.cookies.getAll({ url: API_DOMAIN_URL });

        const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

        const response = await fetch(API_ENDPOINT, {
            headers: {
                'Cookie': cookieHeader
            }
        });

        if (!response.ok) {
            console.warn(`Failed to fetch subtitle: ${response.status}`);
            return { error: `Failed with status ${response.status}` };
        }
        return await response.json();

    } catch (error) {
        console.warn('API request from background failed:', error);
        return { error: error.message };
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchSubtitle") {
        fetchSubtitleFromAPI(message.songId).then(sendResponse);
        return true;
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('open.spotify.com/lyrics')) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId, allFrames: true },
                files: ['content.js']
            });
        } catch (error) {
            console.warn(`Could not injectzare script: ${error.message}`);
        }
    }
});