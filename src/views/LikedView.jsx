import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import Header from '../components/Header';
import SubtitleItem from '../components/SubtitleItem';

function LikedView({ setView }) {
    const [likedSubtitles, setLikedSubtitles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLiked = useCallback(async () => {
        setLoading(true);
        try {
            const subs = await api.getLikedSubtitles();
            setLikedSubtitles(subs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLiked();
    }, [fetchLiked]);

    return (
        <div className="h-full flex flex-col">
            <Header title="Liked Subtitles" onBack={() => setView('home')} loading={loading} />
            <div className="flex-grow overflow-y-auto">
                {loading ? <p>Loading...</p> : (
                    <div className="space-y-2">
                        {likedSubtitles.length > 0 ? likedSubtitles.map(sub => (
                            <SubtitleItem key={sub.id} subtitle={sub} onLike={fetchLiked} onSetActive={fetchLiked} />
                        )) : <p className="text-center text-custom-secondary">No liked subtitles found.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
export default LikedView;