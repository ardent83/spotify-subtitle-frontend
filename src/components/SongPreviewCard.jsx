import React from 'react';

function SongPreviewCard({ songData }) {
    if (!songData) return null;
    const artistName = songData.artists.map(artist => artist.name).join(', ');
    return (
        <div className="bg-custom-gray-medium rounded-lg p-2">
            <div className="flex items-center gap-2">
                <img alt={songData.album.name} className="w-12 h-12 rounded-sm" src={songData.album.images[1]?.url} />
                <div>
                    <p className="font-normal text-custom-primary">{songData.name}</p>
                    <p className="text-sm">{artistName}</p>
                </div>
            </div>
        </div>
    );
}
export default SongPreviewCard;