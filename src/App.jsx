import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import AuthView from './views/AuthView';
import HomeView from './views/HomeView';
import GuestView from './views/GuestView';
import SearchView from './views/SearchView';
import UploadView from './views/UploadView';
import { PulseLoader } from 'react-spinners';
import usePersistentState from './hooks/usePersistentState';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = usePersistentState('lastView', 'guest');
    const [subtitleToEdit, setSubtitleToEdit] = useState(null);

    useEffect(() => {
        const checkUserSession = async () => {
            setIsLoading(true);
            try {
                const sessionData = await api.checkSession();
                setIsAuthenticated(true);
                setCurrentUser(sessionData);
                if (view === 'guest' || view === 'auth') {
                    setView('home');
                }
            } catch (error) {
                setIsAuthenticated(false);
                setCurrentUser(null);
                if (view !== 'auth') {
                    setView('guest');
                }
            } finally {
                setIsLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const handleLoginSuccess = async () => {
        const sessionData = await api.checkSession();
        setCurrentUser(sessionData);
        setIsAuthenticated(true);
        setView('home');
    };

    const handleLogout = async () => {
        await api.logout();
        localStorage.clear();
        setIsAuthenticated(false);
        setCurrentUser(null);
        setView('guest');
    };
    
    const startEdit = (subtitle) => {
        setSubtitleToEdit(subtitle);
        setView('upload');
        // localStorage.removeItem('search_songUrl');
        // localStorage.removeItem('search_songData');
        // localStorage.removeItem('search_subtitles');
        // localStorage.removeItem('search_currentSongId');
    };

    if (isLoading) {
        return <div className="w-full h-full flex justify-center items-center p-4 text-center"><PulseLoader size={12} color="var(--color-custom-gray)" /></div>;
    }

    const renderContent = () => {
        if (!isAuthenticated) {
            switch (view) {
                case 'auth':
                    return <AuthView onLoginSuccess={handleLoginSuccess} setView={setView} />;
                case 'guest':
                default:
                    return <GuestView setView={setView} />;
            }
        }
        
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

    return <div className="p-3 pb-0 bg-custom-dark h-full max-h-[600px]">{renderContent()}</div>;
}

export default App;