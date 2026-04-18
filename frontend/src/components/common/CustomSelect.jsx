import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function CustomSelect({ 
    options, 
    value, 
    onChange, 
    className = "", 
    dropdownClassName = "",
    variant = "compact" // "compact" | "form"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { darkMode } = useTheme();
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const variantStyles = variant === "compact" 
        ? "px-3 py-1.5 text-sm font-semibold rounded-xl"
        : "w-full px-4 py-3.5 text-[15px] rounded-xl";

    const themeStyles = darkMode 
        ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 shadow-sm' 
        : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300 shadow-sm';

    return (
        <div className={`relative inline-block text-left ${variant === 'form' ? 'w-full' : ''}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-between gap-2 border transition-all duration-200 cursor-pointer focus:outline-none 
                    ${variantStyles}
                    ${themeStyles}
                    ${isOpen && (darkMode ? 'ring-2 ring-blue-500/50 border-transparent' : 'ring-2 ring-blue-500/10 border-blue-400')}
                    ${className}
                `}
            >
                <span className="truncate">{selectedOption?.label}</span>
                <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className={`
                        absolute z-50 mt-2 w-full min-w-[120px] left-0 rounded-xl shadow-lg border overflow-hidden
                        animate-[fadeIn_0.15s_ease-out]
                        ${darkMode 
                            ? 'bg-[#1E293B] border-white/10 shadow-black/40' 
                            : 'bg-white border-gray-100 shadow-xl/10'
                        }
                        ${dropdownClassName}
                    `}
                >
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-4 py-2 text-sm font-medium transition-colors
                                    ${value === option.value 
                                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-[#0078D4] text-white') 
                                        : (darkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100')
                                    }
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
