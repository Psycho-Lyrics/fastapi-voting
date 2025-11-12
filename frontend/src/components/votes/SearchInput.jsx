import React from 'react';
import { CiSearch } from "react-icons/ci";



const SearchInput = ({value, onChange, onSearch}) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };
    
    return (
        <div className="px-3 py-2 rounded-lg border border-[#CCCCCC] flex items-center gap-2 w-full hover:ring hover:ring-[#CCCCCC] hover:ring-offset-0 focus-within:ring focus-within:ring-[#CCCCCC] transition-shadow duration-150">
            <CiSearch size={24} />
            <input
                type="text"
                placeholder="Поиск по таблице"
                className="outline-none text-black text-sm sm:text-base font-normal w-full"
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

export default SearchInput;