import React, { useState, useRef } from 'react';
import { More } from 'iconsax-react';
import { Like } from './Like';
import useClickOutside from '../hooks/useClickOutside';

function SubtitleItem({ subtitle, isActive, onLike, onToggleActive, onEdit, onDelete, currentUser }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isOwner = currentUser?.user === subtitle.user;
    
    const menuRef = useRef(null);
    useClickOutside(menuRef, () => setMenuOpen(false));

    const handleDeleteClick = () => {
        if (window.confirm('Are you sure you want to delete this subtitle? This action cannot be undone.')) {
            onDelete(subtitle.id);
        }
        setMenuOpen(false);
    };
    
    const handleEditClick = () => {
        onEdit(subtitle);
        setMenuOpen(false);
    };

    const itemClasses = `w-full flex flex-col items-center p-2 gap-2 rounded-md bg-custom-gray-medium ${!menuOpen ? 'hover:bg-custom-gray-dark' : ''}`;

    return (
        <div className={itemClasses}>
            <div className="w-full flex justify-between items-start">
                <div>
                    <p className={`flex items-center font-normal text-custom-primary`}>{subtitle.title || 'Sub'}<span className='text-xs text-zinc-400 ml-2'>, {subtitle.language_display}</span></p>
                    <p className="text-sm text-zinc-400">{subtitle.user}</p>
                </div>
                {isOwner && (
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setMenuOpen(prev => !prev)} className="transform rotate-90 flex items-center justify-center p-1 cursor-pointer">
                            <More color='var(--color-white)' size={18} />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-1 w-32 bg-custom-gray-medium rounded-md border border-custom-gray z-10 p-1">
                                <button onClick={handleEditClick} className="block w-full text-left px-4 py-2 text-sm hover:bg-custom-gray-dark rounded-t-md cursor-pointer border-b border-custom-gray-light">Edit</button>
                                <button onClick={handleDeleteClick} className="block w-full text-left px-4 py-2 text-sm text-sttbg-stateerror hover:bg-custom-gray-dark rounded-b-md cursor-pointer">Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="w-full flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                    <Like 
                        className="w-4 h-4 flex justify-center items-center cursor-pointer" 
                        isLiked={subtitle.is_liked_by_current_user} 
                        onToggleLike={() => onLike(subtitle.id)} 
                    />
                    {subtitle.likes_count}
                </span>
                <button 
                    onClick={() => onToggleActive(subtitle)} 
                    type='button' 
                    className={`text-xs font-bold rounded-full px-4 py-1 cursor-pointer ${isActive ? 'bg-statewarning text-white border border-transparent' : 'bg-transparent text-white border border-custom-gray'}`}
                >
                    {isActive ? 'Deactivate' : 'Set Active'}
                </button>
            </div>
        </div>
    );
}
export default SubtitleItem;