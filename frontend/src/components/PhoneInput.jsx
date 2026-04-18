import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

// Pre-sorted popular countries (shown first in dropdown)
const POPULAR_CODES = ['MA', 'FR', 'US', 'GB', 'DE', 'ES', 'IT', 'BE', 'CA', 'SA', 'AE', 'TN', 'DZ'];

export default function PhoneInput({
    value,
    onChange,
    required = false,
    placeholder = "6 XX XX XX XX",
    className = "",
    variant = "default", // "default" | "auth"
    onCountryChange,
}) {
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // Fetch countries on mount
    useEffect(() => {
        async function fetchCountries() {
            try {
                const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags');
                const data = await res.json();

                const formatted = data
                    .filter(c => c.idd?.root && (c.idd.suffixes?.length > 0 || c.idd.suffixes === undefined))
                    .map(c => ({
                        name: c.name.common,
                        cca2: c.cca2,
                        code: c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : ''),
                        flag: c.flags?.svg || c.flags?.png || '',
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCountries(formatted);

                // Default to Morocco
                const morocco = formatted.find(c => c.cca2 === 'MA');
                if (morocco) {
                    setSelectedCountry(morocco);
                    onCountryChange?.(morocco);
                }
            } catch (err) {
                console.error('Failed to fetch countries', err);
                const fallback = { name: 'Morocco', cca2: 'MA', code: '+212', flag: '' };
                setSelectedCountry(fallback);
                setCountries([fallback]);
            }
        }
        fetchCountries();
    }, []);

    // Calculate dropdown position from button
    const updatePosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4,
                left: rect.left,
            });
        }
    }, []);

    // Update position when open changes or on scroll/resize
    useEffect(() => {
        if (open) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [open, updatePosition]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e) {
            if (
                buttonRef.current && !buttonRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    // Focus search when dropdown opens
    useEffect(() => {
        if (open && searchRef.current) {
            setTimeout(() => searchRef.current?.focus(), 0);
        }
    }, [open]);

    function handleSelect(country) {
        setSelectedCountry(country);
        onCountryChange?.(country);
        setOpen(false);
        setSearch('');
    }

    // Split countries into popular and rest
    const popularCountries = countries.filter(c => POPULAR_CODES.includes(c.cca2));
    const otherCountries = countries.filter(c => !POPULAR_CODES.includes(c.cca2));

    const filteredPopular = search
        ? popularCountries.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.includes(search) ||
            c.cca2.toLowerCase().includes(search.toLowerCase())
        )
        : popularCountries;

    const filteredOther = search
        ? otherCountries.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.includes(search) ||
            c.cca2.toLowerCase().includes(search.toLowerCase())
        )
        : otherCountries;

    // Styling based on variant
    const isAuth = variant === 'auth';

    const selectorClasses = isAuth
        ? 'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-3 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-white/[0.1] shrink-0'
        : 'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-3 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.08] shrink-0';

    const inputClasses = isAuth
        ? 'input-focus flex-1 rounded-xl bg-gray-100 dark:bg-white/[0.06] dark:border dark:border-white/[0.1] px-3 sm:px-4 py-3 placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-white min-w-0 text-sm'
        : 'flex-1 px-3 sm:px-4 py-3 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none min-w-0 text-gray-900 dark:text-white text-sm';

    // Dropdown rendered via portal so it escapes overflow-hidden
    const dropdown = open ? createPortal(
        <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
            className="w-72 max-h-72 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/[0.1] rounded-xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
        >
            {/* Search */}
            <div className="p-2 border-b border-gray-100 dark:border-white/[0.08]">
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Rechercher un pays..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                />
            </div>

            {/* Country List */}
            <div className="overflow-y-auto max-h-56">
                {/* Popular */}
                {filteredPopular.length > 0 && (
                    <>
                        {!search && (
                            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                Populaires
                            </div>
                        )}
                        {filteredPopular.map(c => (
                            <button
                                key={c.cca2}
                                type="button"
                                onClick={() => handleSelect(c)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-white/[0.06] cursor-pointer ${selectedCountry?.cca2 === c.cca2 ? 'bg-blue-50 dark:bg-white/[0.08]' : ''}`}
                            >
                                <img src={c.flag} alt={c.cca2} className="w-6 h-4 object-cover rounded-[2px] shadow-sm" />
                                <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{c.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{c.code}</span>
                            </button>
                        ))}
                    </>
                )}

                {/* Separator */}
                {filteredPopular.length > 0 && filteredOther.length > 0 && !search && (
                    <div className="border-t border-gray-100 dark:border-white/[0.06] my-1" />
                )}

                {/* All Others */}
                {!search && filteredOther.length > 0 && (
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                        Tous les pays
                    </div>
                )}
                {filteredOther.map(c => (
                    <button
                        key={c.cca2}
                        type="button"
                        onClick={() => handleSelect(c)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-white/[0.06] cursor-pointer ${selectedCountry?.cca2 === c.cca2 ? 'bg-blue-50 dark:bg-white/[0.08]' : ''}`}
                    >
                        <img src={c.flag} alt={c.cca2} className="w-6 h-4 object-cover rounded-[2px] shadow-sm" />
                        <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{c.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{c.code}</span>
                    </button>
                ))}

                {filteredPopular.length === 0 && filteredOther.length === 0 && (
                    <div className="px-3 py-4 text-center text-sm text-gray-400">
                        Aucun pays trouvé
                    </div>
                )}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className={`flex gap-2 ${className}`}>
            {/* Country Selector Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen(!open)}
                className={selectorClasses}
            >
                {selectedCountry?.flag ? (
                    <img
                        src={selectedCountry.flag}
                        alt={selectedCountry.cca2}
                        className="w-5 h-3.5 object-cover rounded-[2px]"
                    />
                ) : (
                    <span className="text-sm">🌐</span>
                )}
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {selectedCountry?.code || '+212'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown rendered in portal */}
            {dropdown}

            {/* Phone Number Input */}
            <input
                type="tel"
                placeholder={placeholder}
                required={required}
                className={inputClasses}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
