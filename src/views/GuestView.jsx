import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import Select from 'react-select';
import { selectStyles } from '../style';

function GuestView({ setView }) {
    const [languages, setLanguages] = useState([]);
    const [preferredLanguage, setPreferredLanguage] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const langData = await api.languages();
                const formatted = langData.map(([code, name]) => ({ value: code, label: name }));
                setLanguages(formatted);

                chrome.storage.local.get(['preferredLanguage'], (result) => {
                    if (result.preferredLanguage) {
                        const savedLang = formatted.find(l => l.value === result.preferredLanguage);
                        if (savedLang) {
                            setPreferredLanguage(savedLang);
                        }
                    } else {
                        const english = formatted.find(l => l.value === 'EN');
                        if (english) setPreferredLanguage(english);
                    }
                });
            } catch (error) {
                console.error("Failed to load initial data for GuestView:", error);
            }
        };
        loadData();
    }, []);

    const handleLanguageChange = (selectedOption) => {
        setPreferredLanguage(selectedOption);
        if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ preferredLanguage: selectedOption.value });
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-medium text-custom-primary">Welcome!</h1>
                <button onClick={() => setView('auth')} className="text-sm font-bold bg-spotify-green text-black rounded-full py-2 px-4">
                    Login / Sign Up
                </button>
            </div>
            <div className="flex-grow space-y-4 text-center">
                <p className="text-sm text-zinc-400">
                    Log in to upload your own subtitles, like your favorites, and set a specific subtitle as your active choice for any song.
                </p>
                <div className="flex flex-col gap-1 text-sm font-medium text-left">
                    <label>Your Preferred Language</label>
                    <Select
                        name="language"
                        options={languages}
                        value={preferredLanguage}
                        onChange={handleLanguageChange}
                        styles={selectStyles}
                        placeholder="Select language..."
                        classNamePrefix="react-select"
                    />
                </div>
                <p className="text-xs text-zinc-500">
                    Subtitles in this language will be automatically selected for you.
                </p>
            </div>
            <img src="/img_3.png" alt="Decorative" className='w-50/100 h-auto object-cover self-end' />
        </div>
    );
}

export default GuestView;