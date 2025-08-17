import React, { useEffect, useState, useCallback } from 'react';
import * as api from '../services/api';
import { extractSpotifyTrackId } from '../utils';
import Header from '../components/Header';
import { inputClasses, selectStyles } from '../style';
import Select from 'react-select';
import { DocumentUpload, Edit, ProgrammingArrows, TextalignLeft } from 'iconsax-react';
import usePersistentState from '../hooks/usePersistentState';

function UploadView({ setView, subtitleToEdit, setSubtitleToEdit }) {
    const [languages, setLanguages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLTR, setIsLTR] = useState(true);

    const [songUrl, setSongUrl] = usePersistentState('upload_songUrl', '');
    const [formDataState, setFormDataState] = usePersistentState('upload_formData', { title: '', is_public: true, raw_text: '' });
    const [selectedLanguage, setSelectedLanguage] = usePersistentState('upload_language', null);

    const isEditMode = !!subtitleToEdit;

    useEffect(() => {
        const loadInitialData = async () => {
            const langData = await api.languages();
            const formattedLanguages = langData.map(([code, name]) => ({ value: code, label: name }));
            setLanguages(formattedLanguages);

            if (isEditMode) {
                setFormDataState({ title: subtitleToEdit.title, is_public: subtitleToEdit.is_public, raw_text: subtitleToEdit.segments.map(seg => seg.text).join('\n') });
                setSongUrl(`https://open.spotify.com/track/${subtitleToEdit.song_id}`);
                const initialLang = formattedLanguages.find(lang => lang.value === subtitleToEdit.language);
                setSelectedLanguage(initialLang);
            }
        };
        loadInitialData();
    }, [isEditMode, subtitleToEdit]);

    const clearFormState = () => {
        localStorage.removeItem('upload_songUrl');
        localStorage.removeItem('upload_formData');
        localStorage.removeItem('upload_language');
        setSongUrl('');
        setFormDataState({ title: '', is_public: true, raw_text: '' });
        setSelectedLanguage(null);
        setSelectedFile(null);
    };

    const handleFileChange = (file) => {
        if (file && (file.size > 3 * 1024 * 1024)) {
            alert('File size cannot exceed 3MB.');
            return;
        }
        if (file && (file.name.endsWith('.srt') || file.name.endsWith('.lrc'))) {
            setSelectedFile(file);
        } else if (file) {
            setSelectedFile(null);
            alert('Please select a valid .srt or .lrc file.');
        }
    };

    const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormDataState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile && !formDataState.raw_text && !isEditMode) {
            alert('Please provide either a file or paste text.');
            return;
        }
        const songId = extractSpotifyTrackId(songUrl);
        if (!songId) {
            alert('Invalid Spotify Song URL.');
            return;
        }
        const submissionData = new FormData();
        submissionData.append('song_id', songId);
        submissionData.append('title', formDataState.title);
        submissionData.append('is_public', formDataState.is_public);
        if (selectedLanguage) submissionData.append('language', selectedLanguage.value);

        if (isFlipped && formDataState.raw_text) {
            submissionData.append('raw_text', formDataState.raw_text);
        } else if (selectedFile) {
            submissionData.append('file', selectedFile);
        }

        try {
            if (isEditMode) {
                await api.updateSubtitle(subtitleToEdit.id, submissionData);
                alert('Subtitle updated!');
            } else {
                await api.createSubtitle(submissionData);
                alert('Subtitle uploaded!');
            }
            clearFormState();
            setSubtitleToEdit(null);
            setView('home');
        } catch (error) {
            alert(`Operation failed: ${error.message}`);
        }
    };

    const handleBack = () => {
        clearFormState();
        setSubtitleToEdit(null);
        setView('home');
    }

    const dropzoneClasses = `flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-spotify-green' : 'border-custom-gray-light'}`;

    return (
        <div className="h-full flex flex-col gap-4">
            <Header title={isEditMode ? "Edit Subtitle" : "Upload Subtitle"} onBack={handleBack} loading={false} />
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Spotify Song URL
                    <input className={inputClasses} value={songUrl} onChange={(e) => setSongUrl(e.target.value)} name="song_url" placeholder="https://open.spotify.com/track/..." type="url" required />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Title
                    <input className={inputClasses} value={formDataState.title} onChange={handleChange} name="title" placeholder="Enter a title for the subtitle" type="text" required />
                </label>
                <div className="flex flex-col gap-1 text-sm font-medium">
                    <div className="flex justify-between items-center">
                        <label htmlFor='raw_text' className="w-full items-center">Subtitle Content</label>
                        <div className="flex justify-center items-center gap-1">
                            {isFlipped && (
                                <button
                                    type="button"
                                    className={`cursor-pointer ${!isLTR ? 'transform -scale-x-100' : ''}`}
                                    onClick={() => setIsLTR((prev) => !prev)}
                                    title="Switch text direction"
                                >
                                    <TextalignLeft size="18" className="stroke-zinc-400 hover:stroke-white" />
                                </button>
                            )}
                            <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => setIsFlipped((prev) => !prev)}
                                title="Switch input mode"
                            >
                                <ProgrammingArrows size="18" className="stroke-zinc-400 hover:stroke-white" />
                            </button>
                        </div>
                    </div>
                    <div className={`flip-card ${isFlipped ? 'is-flipped' : ''}`} style={{ minHeight: '150px' }}>
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={dropzoneClasses + " w-full h-full"}>
                                    <div className="flex flex-col justify-center items-center gap-1 text-center">
                                        <DocumentUpload size="24" color="var(--color-custom-secondary)" />
                                        <div className="flex text-sm text-zinc-400">
                                            <label htmlFor="file-upload" className="relative cursor-pointer font-medium text-spotify-green hover:text-green-400">
                                                <span>{selectedFile ? 'Change file' : 'Upload a file'}</span>
                                                <input id="file-upload" type="file" className="sr-only" accept=".lrc,.srt" onChange={(e) => handleFileChange(e.target.files[0])} />
                                            </label>
                                            {!selectedFile && <p className="pl-1">or drag and drop</p>}
                                        </div>
                                        <p className="text-xs text-zinc-500">{selectedFile ? selectedFile.name : 'Max 3MB (.lrc, .srt)'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flip-card-back">
                                <textarea
                                    dir={isLTR ? 'ltr' : 'rtl'}
                                    name="raw_text"
                                    value={formDataState.raw_text}
                                    onChange={handleChange}
                                    maxLength="10000"
                                    placeholder="Paste your lyrics here, line by line..."
                                    className={inputClasses + " h-full resize-none"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Language
                    <Select
                        name="language"
                        required
                        options={languages}
                        value={selectedLanguage}
                        onChange={setSelectedLanguage}
                        styles={selectStyles}
                        placeholder="Select language"
                        classNamePrefix="react-select"
                    />
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_public" checked={formDataState.is_public} onChange={handleChange} className="w-4 h-4 accent-spotify-green" /> Make Public
                </label>
                <button type="submit" className="w-full bg-spotify-green text-black font-bold rounded-full py-3">{isEditMode ? 'Update' : 'Upload'}</button>
            </form>
        </div>
    );
}
export default UploadView;