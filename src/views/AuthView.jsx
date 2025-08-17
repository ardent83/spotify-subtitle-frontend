import React, { useState } from 'react';
import { Login, LoginCurve } from 'iconsax-react';
import { openInNewTab } from '../utils';
import { PulseLoader } from 'react-spinners';

function AuthView() {
    const [loading, setLoading] = useState(false);

    const handleSpotifyLogin = () => {
        setLoading(true);
        const spotifyLoginUrl = 'http://localhost:8000/accounts/spotify/login/';
        openInNewTab(spotifyLoginUrl);
        
        window.close(); 
    };

    return (
        <div className="p-4 h-full flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Welcome to Subtitle Manager</h1>
            <p className="text-zinc-400 mb-8">
                Log in or sign up in one click using your Spotify account.
            </p>
            <button 
                onClick={handleSpotifyLogin} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-spotify-green text-black text-3 font-semibold rounded-full py-3 uppercase tracking-wider disabled:opacity-50"
            >
                {loading ? <PulseLoader size={6} color="var(--color-black)" /> : <LoginCurve size="24" color='var(--color-black)' />}
                {loading ? 'Redirecting...' : 'Continue with Spotify'}
            </button>
        </div>
    );
}

export default AuthView;