import React from 'react';
import { ArrowLeft } from 'iconsax-react';
import { BarLoader } from 'react-spinners';

function Header({ title, onBack, loading=false }) {
    return (
        <div className="w-full flex flex-col">
            <div className="flex items-center gap-2">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-custom-gray cursor-pointer">
                    <ArrowLeft size="24" color="#ffffff" />
                </button>
                <h1 className="text-xl font-medium text-custom-primary">{title}</h1>
            </div>
            <div className={`w-full flex justify-center transition-all duration-300 ${loading ? "" : "invisible"}`}>
                <BarLoader color="#1dd75e" className='!w-full' />
            </div>
        </div>
    );
}
export default Header;