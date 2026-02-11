import React, { useState } from 'react';
import { Calendar, MapPin, Search, TrendingUp, Users, Car, BarChart3, Loader2 } from 'lucide-react';
import { scrollToSection } from '../../utils/scroll';
import { api } from '../../api/http';
import { showSuccess, showError } from '../CustomToasts';
import heroBg from "../../assets/hero-bg.jpg";
import heroCar from "../../assets/hero-car.jpg";

const Hero = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        companyName: '',
        fleet: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api('/api/demo', {
                method: 'POST',
                body: { ...formData, type: 'trial' }
            });
            showSuccess('demande de essai gratuit est envoyée nous vous reponderons des que possible');
            setFormData({
                email: '',
                companyName: '',
                fleet: ''
            });
        } catch (error) {
            console.error('Error trial request:', error);
            showError(error.message || "Une erreur est survenue lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="accueil" className="relative bg-gradient-to-br from-[#2C5F8D] via-[#1E3A5F] to-[#2C5F8D] overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img 
                    src={heroBg} 
                    alt="Car Rental Business" 
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2C5F8D]/90 via-[#1E3A5F]/85 to-[#2C5F8D]/90"></div>
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating Gradient Orbs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl animate-float-slow"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl animate-float-slow-delay"></div>
                
                {/* Animated Grid Lines */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(to right, white 1px, transparent 1px),
                            linear-gradient(to bottom, white 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>

                {/* Floating Particles */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-float-particle"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/30 rounded-full animate-float-particle-delay-1"></div>
                <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white/40 rounded-full animate-float-particle-delay-2"></div>
                <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-white/30 rounded-full animate-float-particle-delay-3"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-white space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Solution SaaS N°1 pour agences de location</span>
                            </div>
                            
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                                Gérez votre activité de location de voitures en toute simplicité
                            </h1>
                            <p className="text-lg lg:text-xl text-blue-100 leading-relaxed">
                                Accédez à votre tableau de bord pour gérer les véhicules, les locations, les clients et votre équipe — tout depuis une seule plateforme.
                            </p>
                        </div>

                        {/* Demo Request Form */}
                        <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Commencez gratuitement</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email professionnel
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            placeholder="votre@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all text-gray-900"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom de l'agence
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Mon Agence"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all text-gray-900"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Taille de flotte
                                        </label>
                                        <select
                                            value={formData.fleet}
                                            onChange={(e) => setFormData({...formData, fleet: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all text-gray-900"
                                            required
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="1-10">1-10 véhicules</option>
                                            <option value="11-50">11-50 véhicules</option>
                                            <option value="51-100">51-100 véhicules</option>
                                            <option value="100+">100+ véhicules</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-[#2C5F8D] text-white py-3.5 px-6 rounded-lg hover:bg-[#1E3A5F] transition-colors font-semibold flex items-center justify-center space-x-2 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <span>{loading ? 'Envoi en cours...' : "Démarrer l'essai gratuit"}</span>
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin text-white" />
                                    ) : (
                                        <Search size={20} />
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 text-center">
                                    Aucune carte bancaire requise • 14 jours d'essai gratuit
                                </p>
                            </form>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap gap-8 pt-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Users className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">500+</p>
                                    <p className="text-sm text-blue-100">Agences clientes</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Car className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">10K+</p>
                                    <p className="text-sm text-blue-100">Véhicules gérés</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <TrendingUp className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">+35%</p>
                                    <p className="text-sm text-blue-100">Revenus en moyenne</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Dashboard Preview */}
                    <div className="hidden lg:block relative z-10 w-full max-w-lg mx-auto transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-2">
                            <div className="relative">
                                {/* Glow effect behind */}
                                <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-3xl animate-pulse"></div>
                                
                                {/* Main Image Container */}
                                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5">
                                    <img 
                                        src={heroCar} 
                                        alt="Car Rental Dashboard Preview" 
                                        className="relative w-full h-auto object-cover z-10"
                                    />
                                    {/* Subtle sheen */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20"></div>
                                </div>
                                
                                {/* Floating Stats - Revenue */}
                                <div className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg animate-float-slow z-30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                                            <TrendingUp className="text-emerald-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-200">Revenus Mensuels</p>
                                            <p className="text-lg font-bold text-white">+12,450€</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Stats - Vehicles */}
                                <div className="absolute -top-6 -left-6 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg animate-float-slow-delay z-30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Car className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-200">Véhicules Actifs</p>
                                            <p className="text-lg font-bold text-white">45/52</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, -30px); }
                }
                @keyframes float-slow-delay {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-30px, 30px); }
                }
                @keyframes float-particle {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
                }
                @keyframes tilt {
                    0%, 100% { transform: rotate(6deg); }
                    50% { transform: rotate(8deg); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                @keyframes shimmer {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-float-slow-delay { animation: float-slow-delay 8s ease-in-out infinite; }
                .animate-float-particle { animation: float-particle 15s linear infinite; }
                .animate-float-particle-delay-1 { animation: float-particle 12s linear infinite; animation-delay: 3s; }
                .animate-float-particle-delay-2 { animation: float-particle 18s linear infinite; animation-delay: 6s; }
                .animate-float-particle-delay-3 { animation: float-particle 14s linear infinite; animation-delay: 9s; }
                .animate-tilt { animation: tilt 4s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
                .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
                .animate-shimmer-delay { animation: shimmer 2s ease-in-out infinite; animation-delay: 0.5s; }
            `}</style>
        </section>
    );
};

export default Hero;