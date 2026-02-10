import React, { useState } from 'react';
import { Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import logo from "../../assets/logo-blue.png";
import { api } from '../../api/http';
import toast from 'react-hot-toast';

const DemoRequest = () => {
    const [loading, setLoading] = useState(false);
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
            await api('/api/demo', {
                method: 'POST',
                body: { ...formData, type: 'demo' }
            });
            toast.success('Demande envoyée avec succès !');
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
            toast.error(error.message || "Une erreur est survenue lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
                    {/* Left Side: Text and Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Demandez votre démo</h2>
                            <p className="text-lg text-gray-600">
                                Rejoignez les agences qui ont transformé leur gestion de location avec RentalCar.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 group">
                                <div className="w-12 h-12 bg-[#2C5F8D] rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                    <Mail size={24} />
                                </div>
                                <span className="text-gray-700 font-medium">elidrissiamine74@gmail.com</span>
                            </div>

                            <div className="flex items-center space-x-4 group">
                                <div className="w-12 h-12 bg-[#2C5F8D] rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                    <MapPin size={24} />
                                </div>
                                <span className="text-gray-700 font-medium">Casablanca, Maroc</span>
                            </div>

                            <div className="flex items-center space-x-4 group">
                                <div className="w-12 h-12 bg-[#2C5F8D] rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
                                    <MessageSquare size={24} />
                                </div>
                                <span className="text-gray-700 font-medium">WhatsApp</span>
                            </div>
                        </div>

                        {/* Logo Bottom Left */}
                        <div className="pt-12 hidden lg:block">
                            <div className="flex items-center space-x-2">
                                <img src={logo} alt="logo" className="h-11 w-11" />
                                <span className="text-2xl font-bold text-gray-900">
                                    Rental<span className="text-blue-700">Car</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-2xl">
                            <p className="text-gray-700 font-medium mb-8">
                                Remplissez le formulaire et nous vous recontactons sous 24h
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Nom complet *</label>
                                        <input
                                            type="text"
                                            placeholder="Votre nom"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Société</label>
                                        <input
                                            type="text"
                                            placeholder="Nom de votre société"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all"
                                            value={formData.company}
                                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Téléphone *</label>
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-2 px-3 py-3 bg-white border border-gray-200 rounded-lg shrink-0">
                                                <span className="text-xs">🇲🇦 +212</span>
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="6 XX XX X"
                                                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all min-w-0"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email *</label>
                                        <input
                                            type="email"
                                            placeholder="votre@email.com"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Message</label>
                                    <textarea
                                        placeholder="Parlez-nous de vos besoins..."
                                        rows="4"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-[#1a472a] text-white py-4 px-6 rounded-lg hover:bg-[#133520] transition-colors font-bold flex items-center justify-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <span>{loading ? 'Envoi en cours...' : 'Envoyer'}</span>
                                    {!loading && <Send size={20} />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoRequest;
