import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const token = {
    primary: '#6366F1',
    primaryLight: '#EEF2FF',
    neutral50: '#F8FAFC',
    neutral100: '#F1F5F9',
    neutral200: '#E2E8F0',
    neutral400: '#94A3B8',
    neutral600: '#475569',
    neutral900: '#0F172A',
    dark800: '#1E293B',
    dark900: '#0F172A',
};

export default function CustomSelect({ 
    options, 
    value, 
    onChange, 
    className = "", 
    dropdownStyle = {},
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

    const isCompact = variant === "compact";

    return (
        <div style={{ position: 'relative', display: 'inline-block', minWidth: isCompact ? '120px' : '100%', ...dropdownStyle }} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                    width: '100%',
                    padding: isCompact ? '10px 14px' : '12px 16px',
                    background: darkMode ? '#0F172A' : token.neutral100,
                    border: `1px solid ${isOpen ? token.primary : (darkMode ? '#334155' : token.neutral200)}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: darkMode ? '#F8FAFC' : token.neutral900,
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: isOpen ? `0 0 0 2px ${darkMode ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.1)'}` : 'none',
                    transition: 'all 0.2s ease'
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOption?.label}
                </span>
                <ChevronDown 
                    size={16} 
                    style={{ 
                        color: darkMode ? token.neutral400 : token.neutral600,
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease'
                    }} 
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    style={{
                        position: 'absolute', zIndex: 50, marginTop: '8px', width: '100%', minWidth: '160px',
                        right: 0, // align right usually better for action bars
                        backgroundColor: darkMode ? '#1E293B' : '#ffffff',
                        border: `1px solid ${darkMode ? '#334155' : token.neutral200}`,
                        borderRadius: '12px',
                        boxShadow: darkMode ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        padding: '6px'
                    }}
                >
                    {options.map((option) => {
                        const isSelected = value === option.value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.05)' : token.neutral50;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                                style={{
                                    display: 'block', width: '100%', textAlign: 'left',
                                    padding: '8px 12px',
                                    fontSize: '13px', fontWeight: isSelected ? 600 : 500,
                                    borderRadius: '6px',
                                    color: isSelected ? token.primary : (darkMode ? '#F8FAFC' : token.neutral600),
                                    backgroundColor: isSelected ? (darkMode ? 'rgba(99, 102, 241, 0.15)' : token.primaryLight) : 'transparent',
                                    border: 'none', outline: 'none', cursor: 'pointer',
                                    transition: 'all 0.1s ease',
                                    marginBottom: '2px'
                                }}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
