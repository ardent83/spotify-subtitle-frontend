import React, { useEffect, useState } from 'react';
import { DocumentUpload, SearchNormal1, LogoutCurve } from 'iconsax-react';
import * as api from '../services/api';
import Select from 'react-select';
import { selectStyles } from '../style';
import usePersistentState from '../hooks/usePersistentState';

function HomeView({ setView, onLogout, user }) {
    const [languages, setLanguages] = useState([]);
    const [preferredLanguage, setPreferredLanguage] = usePersistentState('preferredLanguage', null);

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
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-medium text-custom-primary">{user?.username}</h1>
                <span className='flex items-center justify-center rounded-sm bg-custom-gray-medium p-1' title='Log Out'>
                    <LogoutCurve size="24" color="var(--color-stateerror)" className="cursor-pointer" onClick={onLogout} />
                </span>
            </div>
            <div className="flex-grow space-y-1">
                <button onClick={() => setView('upload')} className="w-full text-left text-4 text-custom-primary font-normal py-3 px-2 rounded-md hover:bg-custom-gray-light flex items-center gap-2">
                    <DocumentUpload size="18" color='var(--color-custom-primary)' variant='Bold' /> Upload Subtitle
                </button>
                <button onClick={() => setView('search')} className="w-full text-left text-4 text-custom-primary font-normal py-3 px-2 rounded-md hover:bg-custom-gray-light flex items-center gap-2">
                    <SearchNormal1 size="18" color='var(--color-custom-primary)' variant='Bold' /> Find Subtitles
                </button>
                <div className='w-full pt-2 flex flex-col items-center gap-2'>
                    <div className="w-full flex flex-col gap-1 text-sm font-medium text-left">
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
            </div>
            <img src="/img_3.png" alt="Description of image" className='w-50/100 h-auto object-cover self-end' />
        </div>
    );
}
export default HomeView;