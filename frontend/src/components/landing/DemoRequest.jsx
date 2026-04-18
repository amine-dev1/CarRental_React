import React, { useState, useRef } from 'react';
import { Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import logo from "../../assets/logo-blue.png";
import { api } from '../../api/http';
import PhoneInput from '../PhoneInput';
import { showSuccess, showError } from '../CustomToasts';

const DemoRequest = () => {
    const [loading, setLoading] = useState(false);
    const selectedCountryRef = useRef(null);
    const [formData, setFormData] = useState({
        fullName: '',
        company: '',
        phone: '',
        email: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const countryCode = selectedCountryRef.current?.code || '+212';
            await api('/api/demo', {
                method: 'POST',
                body: { ...formData, phone: countryCode + formData.phone.replace(/^0+/, ''), type: 'demo' }
            });
            showSuccess('Demande envoyée avec succès !');
            setFormData({
                fullName: '',
                company: '',
                phone: '',
                email: '',
                message: ''
            });
            e.target.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            showError(error.message || "Une erreur est survenue lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-14 sm:py-20 bg-white dark:bg-[#0F172A] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 bg-gray-50 dark:bg-white/[0.04] dark:backdrop-blur-2xl border border-gray-100 dark:border-white/[0.08] shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 sm:gap-16 items-start overflow-hidden">
                        {/* Left Side: Text and Contact Info */}
                        <div className="space-y-6 sm:space-y-8">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Demandez votre démo</h2>
                                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                                    Rejoignez les agences qui ont transformé leur gestion de location avec RentalCar.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center space-x-4 group">
                                    <div className="w-12 h-12 bg-[#2C5F8D] rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                        <Mail size={24} />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">elidrissiamine74@gmail.com</span>
                                </div>

                                <div className="flex items-center space-x-4 group">
                                    <div className="w-12 h-12 bg-[#2C5F8D] rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                        <MapPin size={24} />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Casablanca, Maroc</span>
                                </div>

                                <div className="flex items-center space-x-4 group">
                                    <div className="w-12 h-12 bg-[#2C5F8D] rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                        <MessageSquare size={24} />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">WhatsApp</span>
                                </div>
                            </div>

                            {/* Logo Bottom Left */}
                            <div className="pt-12 hidden lg:block">
                                <div className="flex items-center space-x-2">
                                    <img src={logo} alt="logo" className="h-11 w-11" />
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Rental<span className="text-blue-700 dark:text-blue-400">Car</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="flex justify-center lg:justify-end w-full overflow-hidden">
                            <div className="bg-white dark:bg-white/[0.03] rounded-xl sm:rounded-2xl p-4 sm:p-8 dark:backdrop-blur-xl shadow-sm dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] border border-gray-100 dark:border-white/[0.08] w-full max-w-2xl">
                                <p className="text-gray-700 dark:text-gray-300 font-medium mb-5 sm:mb-8 text-sm sm:text-base">
                                    Remplissez le formulaire et nous vous recontactons sous 24h
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom complet *</label>
                                            <input
                                                type="text"
                                                placeholder="Votre nom"
                                                className="w-full px-4 py-3 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                                required
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Société</label>
                                            <input
                                                type="text"
                                                placeholder="Nom de votre société"
                                                className="w-full px-4 py-3 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Téléphone *</label>
                                            <PhoneInput
                                                value={formData.phone}
                                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                                onCountryChange={(c) => { selectedCountryRef.current = c; }}
                                                required
                                                placeholder="6 XX XX XX XX"
                                                variant="default"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email *</label>
                                            <input
                                                type="email"
                                                placeholder="votre@email.com"
                                                className="w-full px-4 py-3 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white text-sm"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Message</label>
                                        <textarea
                                            placeholder="Parlez-nous de vos besoins..."
                                            rows="4"
                                            className="w-full px-4 py-3 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-bold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <span>{loading ? 'Envoi en cours...' : 'Envoyer'}</span>
                                        {!loading && <Send size={20} />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoRequest;
