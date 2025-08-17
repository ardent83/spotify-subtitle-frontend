import React from 'react';
import { DocumentUpload, SearchNormal1, LogoutCurve } from 'iconsax-react';

function HomeView({ setView, onLogout, user }) {
    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-medium text-custom-primary">{user?.user}</h1>
                <span className='flex items-center justify-center rounded-sm bg-custom-gray-medium p-1' title='Log Out'>
                    <LogoutCurve size="24" color="var(--color-stateerror)" className="cursor-pointer" onClick={onLogout} />
                </span>
            </div>
            <div className="flex-grow space-y-2">
                <button onClick={() => setView('upload')} className="w-full text-left text-4 text-custom-primary font-normal py-3 px-2 rounded-md hover:bg-custom-gray-light flex items-center gap-2">
                    <DocumentUpload size="18" color='var(--color-custom-primary)' variant='Bold' /> Upload Subtitle
                </button>
                <button onClick={() => setView('search')} className="w-full text-left text-4 text-custom-primary font-normal py-3 px-2 rounded-md hover:bg-custom-gray-light flex items-center gap-2">
                    <SearchNormal1 size="18" color='var(--color-custom-primary)' variant='Bold' /> Find Subtitles
                </button>
            </div>
            <img src="/img_3.png" alt="Description of image" className='w-50/100 h-auto object-cover self-end' />
        </div>
    );
}
export default HomeView;