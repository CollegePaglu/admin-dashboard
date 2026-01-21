import { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import './SearchBar.css';

export default function SearchBar({
    placeholder = 'Search...',
    onSearch,
    delay = 500,
    className = ''
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, delay);

    // Call onSearch when debounced value changes
    useState(() => {
        if (onSearch) {
            onSearch(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    const handleClear = () => {
        setSearchTerm('');
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <div className={`search-bar ${className}`}>
            <span className="search-icon">🔍</span>
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            {searchTerm && (
                <button className="search-clear" onClick={handleClear}>
                    ✕
                </button>
            )}
        </div>
    );
}
