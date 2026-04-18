import React, { useState } from 'react';
import { Search, TrendingUp, Users, Car, Loader2, MapPin } from 'lucide-react';
import { api } from '../../api/http';
import { showSuccess, showError } from '../CustomToasts';
import CustomSelect from '../common/CustomSelect';
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
            setFormData({ email: '', companyName: '', fleet: '' });
        } catch (error) {
            console.error('Error trial request:', error);
            showError(error.message || "Une erreur est survenue lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="accueil" className="relative bg-gradient-to-br from-[#2C5F8D] via-[#1E3A5F] to-[#2C5F8D] dark:from-[#0B1120] dark:via-[#111827] dark:to-[#0B1120] overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src={heroBg}
                    alt="Car Rental Business"
                    className="w-full h-full object-cover opacity-30 dark:opacity-15"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2C5F8D]/90 via-[#1E3A5F]/85 to-[#2C5F8D]/90 dark:from-[#0B1120]/95 dark:via-[#111827]/90 dark:to-[#0B1120]/95"></div>
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 dark:bg-blue-500/10 rounded-full filter blur-3xl animate-float-slow"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 dark:bg-indigo-500/10 rounded-full filter blur-3xl animate-float-slow-delay"></div>
                <div className="absolute inset-0 opacity-10 dark:opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 dark:bg-blue-400/40 rounded-full animate-float-particle"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/30 dark:bg-blue-400/30 rounded-full animate-float-particle-delay-1"></div>
                <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white/40 dark:bg-blue-400/40 rounded-full animate-float-particle-delay-2"></div>
                <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-white/30 dark:bg-blue-400/30 rounded-full animate-float-particle-delay-3"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-white space-y-6 sm:space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse flex-shrink-0"></div>
                                <span className="text-xs sm:text-sm font-medium">Solution SaaS N°1 pour agences de location</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                                Gérez votre activité de location de voitures en toute simplicité
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-blue-100 dark:text-blue-200/70 leading-relaxed">
                                Accédez à votre tableau de bord pour gérer les véhicules, les locations, les clients et votre équipe — tout depuis une seule plateforme.
                            </p>
                        </div>

                        {/* Demo Request Form */}
                        <div className="relative z-20 bg-white dark:bg-white/[0.05] rounded-2xl shadow-2xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 sm:p-6 lg:p-8 backdrop-blur-sm dark:backdrop-blur-2xl dark:border dark:border-white/[0.08]">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Commencez gratuitement</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email professionnel
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                        <input
                                            type="email"
                                            placeholder="votre@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nom de l'agence
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Mon Agence"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent outline-none transition-all text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Taille de flotte
                                        </label>
                                        <CustomSelect
                                            value={formData.fleet || ""}
                                            onChange={(val) => setFormData({ ...formData, fleet: val })}
                                            variant="form"
                                            options={[
                                                { value: "", label: "Sélectionner" },
                                                { value: "1-10", label: "1-10 véhicules" },
                                                { value: "11-50", label: "11-50 véhicules" },
                                                { value: "51-100", label: "51-100 véhicules" },
                                                { value: "100+", label: "100+ véhicules" }
                                            ]}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 text-sm sm:text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <span>{loading ? 'Envoi en cours...' : "Démarrer l'essai gratuit"}</span>
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin text-white" />
                                    ) : (
                                        <Search size={18} />
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Aucune carte bancaire requise • 1 mois d'essai gratuit
                                </p>
                            </form>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap gap-4 sm:gap-6 pt-2">
                            {[
                                { icon: <Users className="text-white" size={20} />, value: '500+', label: 'Agences clientes' },
                                { icon: <Car className="text-white" size={20} />, value: '10K+', label: 'Véhicules gérés' },
                                { icon: <TrendingUp className="text-white" size={20} />, value: '+35%', label: 'Revenus en moyenne' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
                                        <p className="text-xs sm:text-sm text-blue-100 dark:text-blue-200/60">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Dashboard Preview (desktop only) */}
                    <div className="hidden lg:block relative z-10 w-full max-w-lg mx-auto transform hover:scale-[1.02] transition-all duration-500 hover:-translate-y-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-3xl blur-3xl animate-pulse"></div>
                            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5">
                                <img
                                    src={heroCar}
                                    alt="Car Rental Dashboard Preview"
                                    className="relative w-full h-auto object-cover z-10"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20"></div>
                            </div>

                            <div className="absolute -bottom-6 -right-6 bg-white/10 dark:bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-white/10 shadow-lg animate-float-slow z-30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                                        <TrendingUp className="text-emerald-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-200 dark:text-blue-300/60">Revenus Mensuels</p>
                                        <p className="text-lg font-bold text-white">+12,450€</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -top-6 -left-6 bg-white/10 dark:bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-white/10 shadow-lg animate-float-slow-delay z-30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Car className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-200 dark:text-blue-300/60">Véhicules Actifs</p>
                                        <p className="text-lg font-bold text-white">45/52</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-float-slow-delay { animation: float-slow-delay 8s ease-in-out infinite; }
                .animate-float-particle { animation: float-particle 15s linear infinite; }
                .animate-float-particle-delay-1 { animation: float-particle 12s linear infinite; animation-delay: 3s; }
                .animate-float-particle-delay-2 { animation: float-particle 18s linear infinite; animation-delay: 6s; }
                .animate-float-particle-delay-3 { animation: float-particle 14s linear infinite; animation-delay: 9s; }
            `}</style>
        </section>
    );
};

export default Hero;