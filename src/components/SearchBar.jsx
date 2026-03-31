import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function SearchBar({
    placeholder = 'Search...',
    onSearch,
    delay = 500,
    className = ''
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, delay);

    // Call onSearch when debounced value changes
    useEffect(() => {
        if (onSearch) {
            onSearch(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, onSearch]);

    const handleClear = () => {
        setSearchTerm('');
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <div className={`flex items-center gap-2 bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 w-full max-w-md transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 shadow-sm ${className}`}>
            <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[0.9375rem] font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
            />
            {searchTerm && (
                <button 
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0" 
                    onClick={handleClear}
                >
                    <FaTimes className="text-[10px]" />
                </button>
            )}
        </div>
    );
}
