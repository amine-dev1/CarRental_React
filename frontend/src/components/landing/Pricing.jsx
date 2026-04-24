
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Crown, CreditCard, X, Building2, ArrowRight } from 'lucide-react';
import { api } from '../../api/http';

const Pricing = () => {
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const plans = [
        {
            name: "Standard",
            monthlyPrice: 0,
            yearlyPrice: 0,
            description: "Idéal pour les petites agences qui débutent.",
            trial: "Gratuit — aucune carte requise",
            features: [
                "Jusqu'à 5 véhicules",
                "Jusqu'à 2 utilisateurs",
                "Gestion des réservations de base",
                "Tableau de bord simplifié",
                "Support par email",
            ],
            icon: <Zap className="text-blue-500" size={24} />,
            buttonText: "Commencer gratuitement",
            popular: false,
            color: "blue",
            priceIdMonthly: null,
            priceIdYearly: null,
        },
        {
            name: "Pro",
            monthlyPrice: 49,
            yearlyPrice: 40,
            yearlyTotal: 480,
            description: "Pour les agences en pleine croissance.",
            features: [
                "Jusqu'à 50 véhicules",
                "Jusqu'à 10 utilisateurs",
                "Gestion avancée de la flotte",
                "Rapports & Statistiques détaillés",
                "Support prioritaire 24/7",
                "Personnalisation du logo",
                "Sauvegardes quotidiennes",
            ],
            icon: <Sparkles className="text-indigo-500" size={24} />,
            buttonText: "Choisir Pro",
            popular: true,
            color: "indigo",
            priceIdMonthly: "pro_monthly",
            priceIdYearly: "pro_yearly",
        },
        {
            name: "Enterprise",
            monthlyPrice: 149,
            yearlyPrice: 120,
            yearlyTotal: 1440,
            description: "Solution complète pour les grandes flottes.",
            features: [
                "Véhicules illimités",
                "Utilisateurs illimités",
                "Multi-agences & Localisations",
                "API personnalisée",
                "Support dédié & prioritaire",
                "SLA garanti 99.9%",
                "Formation de l'équipe incluse",
            ],
            icon: <Crown className="text-violet-500" size={24} />,
            buttonText: "Choisir Enterprise",
            popular: false,
            color: "violet",
            priceIdMonthly: "enterprise_monthly",
            priceIdYearly: "enterprise_yearly",
        },
    ];

    const handlePlanClick = (plan) => {
        navigate(`/register?plan=${plan.name}&billing=${isYearly ? 'yearly' : 'monthly'}`);
    };

    const handleStripeCheckout = async () => {
        if (!selectedPlan) return;

        const token = localStorage.getItem("token");
        if (!token) {
            // Not logged in — redirect to register with plan pre-selected
            setShowPaymentModal(false);
            navigate(`/register?plan=${selectedPlan.name}&billing=${isYearly ? 'yearly' : 'monthly'}`);
            return;
        }

        setLoading(true);
        try {
            // Fetch price IDs from the backend
            const plansData = await api("/api/payments/plans");
            const backendPlan = plansData.plans.find(p => p.name === selectedPlan.name);

            if (!backendPlan) {
                throw new Error("Plan not found");
            }

            const priceId = isYearly ? backendPlan.price_id_yearly : backendPlan.price_id_monthly;

            // Create checkout session
            const session = await api("/api/payments/create-checkout-session", {
                method: "POST",
                body: { price_id: priceId },
            });

            // Redirect to Stripe Checkout page
            window.location.href = session.url;
        } catch (err) {
            console.error("Checkout error:", err);
            // If not authenticated or not authorized, redirect to register/login
            if (err.message.includes("Missing token") || err.message.includes("Invalid token") || err.message.includes("Forbidden") || err.message.includes("role")) {
                setShowPaymentModal(false);
                navigate(`/register?plan=${selectedPlan.name}&billing=${isYearly ? 'yearly' : 'monthly'}`);
            } else {
                alert("Erreur lors de la création de la session de paiement. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleContactSales = () => {
        setShowPaymentModal(false);
        window.location.href = "mailto:sales@rentalcar.com?subject=Enterprise Plan Inquiry";
    };

    return (
        <section id="tarifs" className="py-14 sm:py-24 relative overflow-hidden bg-white dark:bg-[#0F172A]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 sm:mb-16 space-y-4">
                    <h2 className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-xs sm:text-sm">Tarification</h2>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        Des plans adaptés à votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-orange-500 to-amber-500">croissance</span>
                    </h3>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Choisissez la solution qui correspond le mieux à la taille de votre flotte et à vos ambitions.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                            Mensuel
                        </span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className={`relative inline-flex items-center h-7 w-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isYearly
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            aria-label="Toggle billing period"
                        >
                            <span
                                className="inline-block h-5 w-5 bg-white rounded-full shadow-md transition-transform duration-300"
                                style={{ transform: isYearly ? 'translateX(22px)' : 'translateX(4px)' }}
                            />
                        </button>
                        <span className={`text-sm font-semibold transition-colors ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                            Annuel
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`
                                relative flex flex-col p-6 sm:p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2
                                ${plan.popular
                                    ? 'bg-white dark:bg-white/[0.05] dark:backdrop-blur-xl shadow-2xl dark:shadow-[0_8px_32px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] ring-2 ring-blue-500 md:scale-105 z-10'
                                    : 'bg-gray-50 dark:bg-white/[0.03] dark:backdrop-blur-xl border border-gray-100 dark:border-white/[0.08] shadow-xl dark:shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]'
                                }
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/25">
                                    Plus populaire
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${plan.color === 'blue' ? 'bg-blue-500/10' :
                                    plan.color === 'indigo' ? 'bg-indigo-500/10' : 'bg-violet-500/10'
                                    }`}>
                                    {plan.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                                
                                {/* Pricing display */}
                                <div className="flex items-baseline gap-1 flex-wrap">
                                    {plan.monthlyPrice === 0 ? (
                                        <span className="text-4xl font-black text-gray-900 dark:text-white">Gratuit</span>
                                    ) : (
                                        <>
                                            {isYearly && (
                                                <span className="text-lg font-bold text-gray-400 line-through mr-2">
                                                    ${plan.monthlyPrice}
                                                </span>
                                            )}
                                            <span className="text-4xl font-black text-gray-900 dark:text-white">
                                                ${isYearly ? plan.yearlyPrice.toFixed(2) : plan.monthlyPrice}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">/mois</span>
                                            {isYearly && (
                                                <span className="ml-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                                                    -20%
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                
                                {/* Yearly total */}
                                {isYearly && plan.yearlyTotal && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Facturé <span className="font-semibold text-gray-700 dark:text-gray-300">${plan.yearlyTotal.toFixed(2)}</span>/an
                                    </p>
                                )}
                                
                                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {plan.description}
                                </p>
                                {plan.trial && (
                                    <p className="mt-2 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-orange-500 dark:text-orange-400" />
                                        {plan.trial}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3">
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                            }`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePlanClick(plan)}
                                className={`
                                w-full py-4 rounded-2xl font-bold transition-all duration-300
                                ${plan.popular
                                        ? 'bg-gradient-to-r from-[#4a74a5] to-[#3a5c8c] text-white shadow-lg hover:from-[#3a5c8c] hover:to-[#2d4a73] hover:shadow-xl hover:scale-[1.02]'
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

            {/* Payment Method Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false) }}>
                    <div className="relative w-full sm:max-w-md bg-white dark:bg-[#1E293B] rounded-t-3xl sm:rounded-3xl shadow-2xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 sm:p-8 animate-[fadeInUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
                        {/* Close button */}
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Modal Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <CreditCard className="text-white" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Choisissez votre méthode de paiement
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Plan <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedPlan.name}</span> — {isYearly
                                    ? `$${selectedPlan.yearlyTotal?.toFixed(2)}/an`
                                    : `$${selectedPlan.monthlyPrice}/mois`
                                }
                            </p>
                        </div>

                        {/* Payment Options */}
                        <div className="space-y-3">
                            {/* Stripe (Card Payment) */}
                            <button
                                onClick={handleStripeCheckout}
                                disabled={loading}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-white/5 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-200 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.19l-.893 5.575C4.976 22.806 7.873 24 11.422 24c2.58 0 4.711-.636 6.25-1.891 1.638-1.379 2.478-3.387 2.478-5.949 0-4.182-2.48-5.851-6.174-7.01z" fill="#635BFF"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-gray-900 dark:text-white">Payer par carte bancaire</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, Amex — via Stripe</p>
                                </div>
                                <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </button>

                            {/* Bank Transfer */}
                            <button
                                onClick={handleContactSales}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-white/5 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all duration-200 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="text-indigo-500" size={24} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-gray-900 dark:text-white">Virement bancaire</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Contactez-nous pour recevoir un RIB</p>
                                </div>
                                <ArrowRight size={18} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            </button>
                        </div>

                        {/* Security note */}
                        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
                            🔒 Paiement 100% sécurisé • Sans engagement • Annulation à tout moment
                        </p>
                    </div>
                </div>
            )}

            {/* Modal animation keyframe */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </section>
    );
};

export default Pricing;
