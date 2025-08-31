const API_BASE_URL = 'http://localhost:8000/api';

async function getCsrfToken() {
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        try {
            const cookie = await chrome.cookies.get({ url: 'http://localhost:8000', name: 'csrftoken' });
            return cookie ? cookie.value : null;
        } catch (e) { return null; }
    } else {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('csrftoken=')) {
                    cookieValue = decodeURIComponent(cookie.substring('csrftoken='.length));
                    break;
                }
            }
        }
        return cookieValue;
    }
}

async function apiFetch(endpoint, options = {}) {
    options.credentials = 'include';
    options.headers = options.headers || {};
    const method = options.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const csrfToken = await getCsrfToken();
        if (csrfToken) options.headers['X-CSRFToken'] = csrfToken;
    }
    if (!(options.body instanceof FormData) && options.body) {
        options.headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || JSON.stringify(errorData));
    }
    return response.status === 204 ? null : response.json();
}

export const checkSession = () => apiFetch('/auth/user/');
export const login = (credentials) => apiFetch('/auth/login/', { method: 'POST', body: JSON.stringify(credentials) });
export const register = (userData) => apiFetch('/auth/registration/', { method: 'POST', body: JSON.stringify(userData) });
export const logout = () => apiFetch('/auth/logout/', { method: 'POST' });
export const passwordReset = (email) => apiFetch('/auth/password/reset/', { method: 'POST', body: JSON.stringify({ email }) });
export const passwordResetConfirm = (data) => apiFetch('/auth/password/reset/confirm/', { method: 'POST', body: JSON.stringify(data) });
export const resendVerificationEmail = (email) => apiFetch('/auth/registration/resend-email/', { method: 'POST', body: JSON.stringify({ email }) });

export const getSpotifyTrackInfo = (songId) => apiFetch(`/spotify/track/${songId}/`);
export const getLikedSubtitles = () => apiFetch('/subtitles/liked/');
export const toggleLike = (subtitleId) => apiFetch(`/subtitles/${subtitleId}/like/`, { method: 'POST' });

export const setActiveSubtitle = (subtitleId) => apiFetch(`/subtitles/${subtitleId}/set-active/`, { method: 'POST' });
export const unsetActiveSubtitle = (songId) => apiFetch(`/songs/${songId}/active-subtitle/`, { method: 'DELETE' });
export const getActiveSubtitleForSpecificSong = (songId) => apiFetch(`/songs/${songId}/active-subtitle/`);

export const languages = () => apiFetch('/enums/languages/');

export const createSubtitle = (formData) => apiFetch('/subtitles/', { method: 'POST', body: formData });
export const getSubtitleDetail = (subtitleId) => apiFetch(`/subtitles/${subtitleId}/`);
export const updateSubtitle = (subtitleId, formData) => apiFetch(`/subtitles/${subtitleId}/`, { method: 'PUT', body: formData });
export const deleteSubtitle = (subtitleId) => apiFetch(`/subtitles/${subtitleId}/`, { method: 'DELETE' });

export const getSubtitlesForSong = (songId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString();
    return apiFetch(`/songs/${songId}/subtitles/?${queryString}`);
};

export const getNextPage = (nextUrl) => {
    return apiFetch(nextUrl.substring(nextUrl.indexOf('/songs')));
};