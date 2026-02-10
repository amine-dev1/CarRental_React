import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo-blue.png";

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div 
                            className="flex items-center space-x-2 cursor-pointer"
                            onClick={() => {
                                navigate("/");
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <img src={logo} alt="logo" className="h-11 w-11" />
                            <span className="text-2xl font-bold text-white">
                                Rental<span className="text-blue-700">Car</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Votre partenaire de confiance pour la location de véhicules. Des solutions adaptées à tous vos besoins de mobilité.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/yourpage"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-colors"
                            >
                                <Facebook size={20} />
                            </a>

                            {/* Twitter / X */}
                            <a
                                href="https://twitter.com/yourprofile"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-black transition-colors"
                            >
                                <Twitter size={20} />
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/yourprofile"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                            >
                                <Instagram size={20} />
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://www.linkedin.com/company/yourcompany"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#0A66C2] transition-colors"
                            >
                                <Linkedin size={20} />
                            </a>

                            {/* WhatsApp */}
                            <a
                                href="https://wa.me/212770698980"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#25D366] transition-colors"
                            >
                                <FaWhatsapp size={20} />
                            </a>
                        </div>

                    </div>

                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Liens rapides</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">À propos</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">Notre flotte</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">Tarifs</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">Blog</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">FAQ</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">Location courte durée</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">Location longue durée</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">Location avec chauffeur</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">Location professionnelle</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-[#4A7BA7] transition-colors">Assurances</a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <MapPin size={20} className="text-[#4A7BA7] mt-1 flex-shrink-0" />
                                <span className="text-sm">123 Avenue Mohammed V, Casablanca, Maroc</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={20} className="text-[#4A7BA7] flex-shrink-0" />
                                <span className="text-sm">+212770698980</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail size={20} className="text-[#4A7BA7] flex-shrink-0" />
                                <span className="text-sm">elidrissiamine74@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-gray-400">
                            © 2024 RentalCar. Tous droits réservés.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-[#4A7BA7] transition-colors">
                                Politique de confidentialité
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#4A7BA7] transition-colors">
                                Conditions d'utilisation
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#4A7BA7] transition-colors">
                                Mentions légales
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;