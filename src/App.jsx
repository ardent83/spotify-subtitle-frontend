import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import { openInNewTab } from './utils';
import AuthView from './views/AuthView';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import UploadView from './views/UploadView';
import { PulseLoader } from 'react-spinners';
import usePersistentState from './hooks/usePersistentState';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = usePersistentState('lastView', 'home');
    const [subtitleToEdit, setSubtitleToEdit] = useState(null);

    useEffect(() => {
        const checkUserSession = async () => {
            setIsLoading(true);
            try {
                const sessionData = await api.checkSession();
                setIsAuthenticated(true);
                setCurrentUser(sessionData);
                if (!sessionData.has_spotify_token) {
                    const spotifyConnectUrl = 'http://localhost:8000/accounts/spotify/login/?process=connect';
                    openInNewTab(spotifyConnectUrl);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setCurrentUser(null);
                setView('home');
            } finally {
                setIsLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        await api.logout();
        localStorage.removeItem('lastView');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setView('home');
    };
    
    const startEdit = (subtitle) => {
        setSubtitleToEdit(subtitle);
        setView('upload');
        localStorage.removeItem('search_songUrl');
        localStorage.removeItem('search_songData');
        localStorage.removeItem('search_subtitles');
        localStorage.removeItem('search_currentSongId');
    };

    if (isLoading) {
        return <div className="w-full h-full flex justify-center items-center p-4 text-center"><PulseLoader size={12} color="var(--color-custom-gray)" /></div>;
    }

    if (!isAuthenticated) {
        return <AuthView onLoginSuccess={handleLoginSuccess} />;
    }

    if (currentUser && !currentUser.has_spotify_token) {
        return (
            <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                <h2 className="text-xl font-bold text-white mb-4">Connecting to Spotify...</h2>
                <p className="text-zinc-400">Please complete the authorization in the new tab.</p>
                <button onClick={() => window.location.reload()} className="mt-4">Check Again</button>
            </div>
        );
    }

    const renderView = () => {
        switch (view) {
            case 'search':
                return <SearchView setView={setView} onEdit={startEdit} currentUser={currentUser} />;
            case 'upload':
                return <UploadView setView={setView} subtitleToEdit={subtitleToEdit} setSubtitleToEdit={setSubtitleToEdit} />;
            case 'home':
            default:
                return <HomeView setView={setView} onLogout={handleLogout} user={currentUser} />;
        }
    };

    return <div className="p-3 pb-0 bg-custom-dark h-full max-h-[600px]">{renderView()}</div>;
}

export default App;