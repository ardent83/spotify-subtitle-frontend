export function openInNewTab(url, isBalnk=false) {
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        chrome.tabs.create({ url: url });
    } else {
        if (isBalnk)
            window.open(url, '_blank');
        else
            window.location.href = url;
    }
}

export function extractSpotifyTrackId(url) {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}