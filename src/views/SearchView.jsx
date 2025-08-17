import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as api from '../services/api';
import { extractSpotifyTrackId } from '../utils';
import Header from '../components/Header';
import SongPreviewCard from '../components/SongPreviewCard';
import SubtitleItem from '../components/SubtitleItem';
import { SearchNormal1 } from 'iconsax-react';
import Select from 'react-select';
import { inputClasses, selectStyles } from '../style';
import { PulseLoader } from 'react-spinners';
import usePersistentState from '../hooks/usePersistentState';

function SearchView({ setView, onEdit, currentUser }) {
    const [songUrl, setSongUrl] = usePersistentState('search_songUrl', '');
    const [songData, setSongData] = usePersistentState('search_songData', null);
    const [subtitles, setSubtitles] = usePersistentState('search_subtitles', []);
    const [currentSongId, setCurrentSongId] = usePersistentState('search_currentSongId', null);

    const [activeSubId, setActiveSubId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [languages, setLanguages] = useState([]);
    
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const listRef = useRef(null);

    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem('searchFilters');
        return savedFilters ? JSON.parse(savedFilters) : { language: '', by_user: '', sort_by: 'likes_desc' };
    });

    useEffect(() => {
        localStorage.setItem('searchFilters', JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        api.languages().then(langData => {
            const formatted = langData.map(([code, name]) => ({ value: code, label: name }));
            setLanguages([{ value: '', label: 'All Languages' }, ...formatted]);
        });
    }, []);

    const fetchSubtitles = useCallback(async (songId, isNewSearch = false) => {
        if (!songId) return;
        setLoadingMore(true);
        setError('');
        try {
            const subsData = await api.getSubtitlesForSong(songId, filters);
            setSubtitles(isNewSearch ? subsData.results : prev => [...prev, ...subsData.results]);
            setNextPageUrl(subsData.next);
            if (isNewSearch) {
                const activeSub = await api.getActiveSubtitleForSpecificSong(songId).catch(() => null);
                setActiveSubId(activeSub?.id || null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingMore(false);
        }
    }, [filters]);
    
    useEffect(() => {
        if (currentSongId) {
            fetchSubtitles(currentSongId, true);
        }
    }, [filters, currentSongId, fetchSubtitles]);

    const handleInitialSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const songId = extractSpotifyTrackId(songUrl);
        if (!songId) {
            setError('Invalid Spotify URL');
            setLoading(false);
            return;
        }
        try {
            const sData = await api.getSpotifyTrackInfo(songId);
            setSongData(sData);
            setCurrentSongId(songId);
            fetchSubtitles(currentSongId, true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const loadMoreSubtitles = async () => {
        if (!nextPageUrl || loadingMore) return;
        setLoadingMore(true);
        try {
            const data = await api.getNextPage(nextPageUrl);
            setSubtitles(prev => [...prev, ...data.results]);
            setNextPageUrl(data.next);
        } catch (err) {
            if (err.message.includes("404")) {
                setNextPageUrl(null);
            } else {
                setError("Could not load more subtitles.");
            }
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = () => {
        const element = listRef.current;
        if (element && element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
            loadMoreSubtitles();
        }
    };
    
    const handleLike = async (subtitleId) => {
        const response = await api.toggleLike(subtitleId);
        setSubtitles(p => p.map(s => s.id === subtitleId ? { ...s, is_liked_by_current_user: response.is_liked, likes_count: response.likes_count } : s));
    };
    const handleSetActive = async (subtitleId) => {
        await api.setActiveSubtitle(subtitleId);
        setActiveSubId(subtitleId);
    };
    const handleDelete = async (subtitleId) => {
        await api.deleteSubtitle(subtitleId);
        setSubtitles(p => p.filter(s => s.id !== subtitleId));
    };
    const handleFilterChange = (name, value) => setFilters(p => ({ ...p, [name]: value }));
    const handleCheckboxChange = (e) => setFilters(p => ({ ...p, [e.target.name]: e.target.checked ? 'me' : '' }));

    const handleBack = () => {
        localStorage.removeItem('search_songUrl');
        localStorage.removeItem('search_songData');
        localStorage.removeItem('search_subtitles');
        localStorage.removeItem('search_currentSongId');
        setView('home');
    };

    const sortOptions = [{ value: 'likes_desc', label: 'Most Liked' }, { value: 'newest', label: 'Newest' }];

    return (
        <div className="h-full flex flex-col gap-2">
            <Header title="Find Subtitles" onBack={handleBack} loading={loading} />
            <form onSubmit={handleInitialSearch} className="flex justify-between items-center gap-2">
                <input name='search' value={songUrl} onChange={e => setSongUrl(e.target.value)} placeholder="https://open.spotify.com/track/..." className={inputClasses} required />
                <button type="submit" className="bg-spotify-green text-white font-bold p-2 rounded-md hover:bg-spotify-green-dark cursor-pointer">
                    <SearchNormal1 size="24" color="var(--color-custom-primary)" variant="Outline" />
                </button>
            </form>
            <div className="flex flex-wrap items-center gap-2 text-xs justify-between">
                <Select name="language" options={languages} value={languages.find(l => l.value === filters.language)} onChange={(o) => handleFilterChange('language', o.value)} styles={selectStyles} className="w-full" classNamePrefix="react-select" />
                <label className="flex items-center gap-1 p-1 rounded-md">
                    <input type="checkbox" name="by_user" checked={filters.by_user === 'me'} onChange={handleCheckboxChange} className="accent-spotify-green" />
                    My Subtitles
                </label>
                <Select name="sort_by" options={sortOptions} value={sortOptions.find(o => o.value === filters.sort_by)} onChange={(o) => handleFilterChange('sort_by', o.value)} styles={selectStyles} className="flex-grow max-w-50" classNamePrefix="react-select" />
            </div>
            <div ref={listRef} onScroll={handleScroll} className="flex flex-col gap-2 flex-grow overflow-y-auto h-full p-1">
                {error && <p className="text-red-500 text-center">{error}</p>}
                {songData && <SongPreviewCard songData={songData} />}
                <div className="w-full flex flex-col items-center gap-2">
                    {subtitles.map(sub => (
                        <SubtitleItem key={sub.id} subtitle={sub} isActive={sub.id === activeSubId} onLike={handleLike} onSetActive={handleSetActive} onEdit={onEdit} onDelete={handleDelete} currentUser={currentUser} />
                    ))}
                </div>
                {loadingMore && <div className="flex justify-center py-4"><PulseLoader size={8} color="var(--color-custom-gray)" /></div>}
            </div>
        </div>
    );
}

export default SearchView;