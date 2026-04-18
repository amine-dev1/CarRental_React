import React, { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/logo-blue.png";
import { scrollToSection } from '../../utils/scroll';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();

    const handleNavClick = (e, id) => {
        e.preventDefault();
        scrollToSection(id, 800);
        setIsMenuOpen(false);
    };

    const handleAuthAction = () => {
        if (user) {
            // Redirect based on role
            if (user.role === 'superadmin') {
                navigate('/superadmin');
            } else if (user.role === 'director' || user.role === 'agent') {
                navigate('/director');
            } else {
                // Default fallback if role is unknown or 'customer' (though customer dashboard isn't defined yet)
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    };

    return (
        <header className="bg-white dark:bg-[#0F172A]/80 dark:backdrop-blur-xl shadow-sm dark:shadow-[0_1px_0_rgba(255,255,255,0.05)] sticky top-0 z-50 dark:border-b dark:border-white/[0.06]">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <div className="flex items-center space-x-2">
                            <img src={logo} alt="logo" className="h-11 w-11" />
                            <span className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">
                                Rental<span className="text-blue-700 dark:text-blue-400">Car</span>
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#accueil" onClick={(e) => handleNavClick(e, '#accueil')} className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">
                            Accueil
                        </a>
                        <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">
                            Services
                        </a>
                        <a href="#tarifs" onClick={(e) => handleNavClick(e, '#tarifs')} className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">
                            Tarifs
                        </a>
                        <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">
                            Contact
                        </a>
                    </div>

                    {/* CTA Button + Dark Mode Toggle */}
                    <div className="hidden md:flex items-center space-x-3">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="relative w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
                            aria-label="Toggle dark mode"
                        >
                            <Sun
                                size={18}
                                className={`absolute text-amber-500 transition-all duration-300 ${darkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                                    }`}
                            />
                            <Moon
                                size={18}
                                className={`absolute text-blue-400 transition-all duration-300 ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                                    }`}
                            />
                        </button>

                        {user ? (
                            <button
                                onClick={handleAuthAction}
                                className="bg-[#2C5F8D] text-white px-6 py-2.5 rounded-lg hover:bg-[#1E3A5F] transition-colors font-medium shadow-sm"
                            >
                                Mon tableau de bord
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2.5 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20"
                                >
                                    Se connecter
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-gradient-to-r from-[#4a74a5] to-[#3a5c8c] text-white px-5 py-2.5 rounded-lg hover:from-[#3a5c8c] hover:to-[#2d4a73] transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                                >
                                    S'enregistrer
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        {/* Mobile Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                            aria-label="Toggle dark mode"
                        >
                            <Sun
                                size={16}
                                className={`absolute text-amber-500 transition-all duration-300 ${darkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                                    }`}
                            />
                            <Moon
                                size={16}
                                className={`absolute text-blue-400 transition-all duration-300 ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                                    }`}
                            />
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 dark:text-gray-300 hover:text-[#2C5F8D] transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 dark:border-white/10">
                        <div className="flex flex-col space-y-4">
                            <a href="#accueil" onClick={(e) => handleNavClick(e, '#accueil')} className="text-gray-700 dark:text-gray-300 hover:text-[#2C5F8D] dark:hover:text-blue-400 transition-colors font-medium">
                                Accueil
                            </a>
                            <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="text-gray-700 dark:text-gray-300 hover:text-[#2C5F8D] dark:hover:text-blue-400 transition-colors font-medium">
                                Services
                            </a>
                            <a href="#tarifs" onClick={(e) => handleNavClick(e, '#tarifs')} className="text-gray-700 dark:text-gray-300 hover:text-[#2C5F8D] dark:hover:text-blue-400 transition-colors font-medium">
                                Tarifs
                            </a>
                            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-gray-700 dark:text-gray-300 hover:text-[#2C5F8D] dark:hover:text-blue-400 transition-colors font-medium">
                                Contact
                            </a>
                            {user ? (
                                <button
                                    onClick={handleAuthAction}
                                    className="bg-[#2C5F8D] text-white px-6 py-2.5 rounded-lg hover:bg-[#1E3A5F] transition-colors font-medium text-left w-full"
                                >
                                    Mon tableau de bord
                                </button>
                            ) : (
                                <div className="flex flex-col space-y-3 pt-2">
                                    <button
                                        onClick={() => {
                                            navigate('/login');
                                            setIsMenuOpen(false);
                                        }}
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-medium text-left px-4 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20"
                                    >
                                        Se connecter
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/register');
                                            setIsMenuOpen(false);
                                        }}
                                        className="bg-gradient-to-r from-[#4a74a5] to-[#3a5c8c] text-white px-6 py-2.5 rounded-lg hover:from-[#3a5c8c] hover:to-[#2d4a73] transition-all duration-300 font-medium text-left w-full shadow-md hover:shadow-lg"
                                    >
                                        S'enregistrer
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;