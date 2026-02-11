
import React from 'react';
import { Check, Sparkles, Building2, Zap, Crown } from 'lucide-react';

const Pricing = () => {
    const plans = [
        {
            name: "Free",
            price: "0",
            description: "Idéal pour les petites agences qui débutent.",
            features: [
                "Jusqu'à 5 véhicules",
                "1 utilisateur (Administrateur)",
                "Gestion des réservations de base",
                "Tableau de bord simplifié",
                "Support par email",
                "Hébergement partagé"
            ],
            icon: <Zap className="text-blue-500" size={24} />,
            buttonText: "Démarrer gratuitement",
            popular: false,
            color: "blue"
        },
        {
            name: "Pro",
            price: "49",
            description: "Pour les agences en pleine croissance.",
            features: [
                "Jusqu'à 50 véhicules",
                "Utilisateurs illimités",
                "Gestion avancée de la flotte",
                "Rapports & Statistiques détaillés",
                "Support prioritaire 24/7",
                "Personnalisation du logo",
                "Sauvegardes quotidiennes"
            ],
            icon: <Sparkles className="text-indigo-500" size={24} />,
            buttonText: "Essayer Pro",
            popular: true,
            color: "indigo"
        },
        {
            name: "Enterprise",
            price: "Sur mesure",
            description: "Solution complète pour les grandes flottes.",
            features: [
                "Véhicules illimités",
                "Multi-agences & Localisations",
                "API personnalisée",
                "Gestionnaire de compte dédié",
                "Installation sur site possible",
                "SLA garanti 99.9%",
                "Formation de l'équipe incluse"
            ],
            icon: <Crown className="text-violet-500" size={24} />,
            buttonText: "Contacter la vente",
            popular: false,
            color: "violet"
        }
    ];

    return (
        <section id="tarifs" className="py-24 relative overflow-hidden bg-white dark:bg-[#0F172A]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm">Tarification</h2>
                    <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        Des plans adaptés à votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">croissance</span>
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Choisissez la solution qui correspond le mieux à la taille de votre flotte et à vos ambitions.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, idx) => (
                        <div 
                            key={idx}
                            className={`
                                relative flex flex-col p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2
                                ${plan.popular 
                                    ? 'bg-white dark:bg-[#1E293B] shadow-2xl ring-2 ring-blue-500 scale-105 z-10' 
                                    : 'bg-gray-50 dark:bg-[#1E293B]/50 border border-gray-100 dark:border-white/5 shadow-xl'
                                }
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    Plus populaire
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${
                                    plan.color === 'blue' ? 'bg-blue-500/10' : 
                                    plan.color === 'indigo' ? 'bg-indigo-500/10' : 'bg-violet-500/10'
                                }`}>
                                    {plan.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900 dark:text-white">
                                        {plan.price !== "Sur mesure" ? `${plan.price}€` : plan.price}
                                    </span>
                                    {plan.price !== "Sur mesure" && (
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">/mois</span>
                                    )}
                                </div>
                                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3">
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                            plan.popular ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                        }`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`
                                w-full py-4 rounded-2xl font-bold transition-all duration-300
                                ${plan.popular 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]' 
                                    : 'bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                                }
                            `}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Vous avez des besoins spécifiques ? <a href="#contact" className="text-blue-600 font-bold hover:underline">Contactez notre équipe</a> pour un devis personnalisé.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
