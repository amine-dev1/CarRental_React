import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/logo-blue.png";
import { scrollToSection } from '../../utils/scroll';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavClick = (e, id) => {
        e.preventDefault();
        scrollToSection(id, 800);
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <div className="flex items-center space-x-2">
                            <img src={logo} alt="logo" className="h-11 w-11" />
                            <span className="text-2xl font-bold text-slate-900">
                                Rental<span className="text-blue-700">Car</span>
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#accueil" onClick={(e) => handleNavClick(e, '#accueil')} className="text-gray-700 hover:text-[#2C5F8D] transition-colors font-medium">
                            Accueil
                        </a>
                        <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="text-gray-700 hover:text-[#2C5F8D] transition-colors font-medium">
                            Services
                        </a>
                        <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-gray-700 hover:text-[#2C5F8D] transition-colors font-medium">
                            Contact
                        </a>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:flex items-center">
                        <button 
                            onClick={() => navigate("/login")}
                            className="bg-[#2C5F8D] text-white px-6 py-2.5 rounded-lg hover:bg-[#1E3A5F] transition-colors font-medium shadow-sm"
                        >
                            Se connecter
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-[#2C5F8D] transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col space-y-4">
                            <a href="#accueil" onClick={(e) => handleNavClick(e, '#accueil')} className="text-gray-700 hover:text-[#2C5F8D] transition-colors font-medium">
                                Accueil
                            </a>
                            <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="text-gray-700 hover:text-[#2C5F8D] transition-colors font-medium">
                                Services
                            </a>
                            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-gray-700 hover:text-[#2C5F8D] transition-colors font-medium">
                                Contact
                            </a>
                            <button 
                                onClick={() => navigate("/login")}
                                className="bg-[#2C5F8D] text-white px-6 py-2.5 rounded-lg hover:bg-[#1E3A5F] transition-colors font-medium text-left"
                            >
                                Se connecter
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;