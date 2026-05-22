import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, Check, Sparkles, Zap, ArrowLeft, ArrowRight, Building2, User, Crown, CreditCard, CheckCircle, Eye, EyeOff } from "lucide-react";
import PhoneInput from "../../components/PhoneInput";
import { CountrySelect, CitySelect } from "../../components/CountryCitySelect";
import { showError } from "../../components/CustomToasts";
import { api } from "../../api/http";
import "../../pages/auth/login.css";

import logo from "../../assets/logo-blue.png";
import video from "../../assets/video.mp4";

const PLANS = [
    {
        id: "Standard",
        name: "Standard",
        monthlyPrice: 0,
        yearlyPrice: 0,
        description: "Idéal pour les petites agences qui débutent.",
        features: [
            "Jusqu'à 5 véhicules",
            "Jusqu'à 2 utilisateurs",
            "Gestion des réservations de base",
            "Tableau de bord simplifié",
            "Support par email",
        ],
        icon: <Zap className="text-blue-500" size={20} />,
        color: "blue",
    },
    {
        id: "Pro",
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
        icon: <Sparkles className="text-indigo-500" size={20} />,
        color: "indigo",
        popular: true,
    },
    {
        id: "Enterprise",
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
        icon: <Crown className="text-violet-500" size={20} />,
        color: "violet",
    },
];

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useTheme();
    const [searchParams] = useSearchParams();

    // Steps: 1: Plan, 2: Enterprise, 3: Director, 4: Payment, 5: Confirmation
    const initialStep = searchParams.get("success") === "true" ? 5 : (searchParams.get("step") ? parseInt(searchParams.get("step")) : 1);
    const [step, setStep] = useState(initialStep);
    const [loading, setLoading] = useState(false);
    const [loadingMethod, setLoadingMethod] = useState(null); // 'stripe' or 'paypal'

    // Step 1 — Plan
    const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "Pro");
    const [isYearly, setIsYearly] = useState(searchParams.get("billing") === "yearly");

    // Step 2 — Enterprise
    const [enterpriseName, setEnterpriseName] = useState("");
    const [registryNumber, setRegistryNumber] = useState("");
    const [country, setCountry] = useState("");
    const [countryCode, setCountryCode] = useState(""); // ISO code for city lookup
    const [city, setCity] = useState("");
    const [enterpriseAddress, setEnterpriseAddress] = useState("");
    const [vatNumber, setVatNumber] = useState("");
    const [enterprisePhone, setEnterprisePhone] = useState("");
    const enterprisePhoneRef = useRef(null);

    // Step 3 — Director info
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const directorPhoneRef = useRef(null);

    // After Registration details
    const [directorToken, setDirectorToken] = useState("");

    // Payment verification state
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [verifyError, setVerifyError] = useState("");

    // Helpers
    const activePlan = PLANS.find(p => p.id === selectedPlan);

    // ─── Verify Stripe session on return from checkout ───
    useEffect(() => {
        const isSuccess = searchParams.get("success") === "true";
        const gateway = searchParams.get("gateway");
        const sessionId = searchParams.get("session_id");

        if (isSuccess && gateway === "stripe" && sessionId && !verified && !verifying) {
            setVerifying(true);
            setVerifyError("");
            api("/api/payments/verify-session", {
                method: "POST",
                body: { session_id: sessionId },
            })
                .then((data) => {
                    console.log("✅ Session verified:", data.message);
                    setVerified(true);
                })
                .catch((err) => {
                    console.error("❌ Session verification failed:", err);
                    setVerifyError(err.message || "La vérification du paiement a échoué.");
                })
                .finally(() => {
                    setVerifying(false);
                });
        } else if (isSuccess && gateway === "paypal") {
            // PayPal is handled by webhooks, just mark as verified for UI
            setVerified(true);
        } else if (isSuccess && !gateway) {
            // Standard plan (free) — already created via /register
            setVerified(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function getPasswordStrength() {
        if (!password) return { score: 0, label: "", color: "bg-gray-200", textColor: "text-gray-400" };
        
        const checks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;

        if (score === 0) return { score, label: "Très faible", color: "bg-red-500", textColor: "text-red-500", checks };
        if (score === 1) return { score, label: "Faible", color: "bg-red-400", textColor: "text-red-400", checks };
        if (score === 2) return { score, label: "Moyen", color: "bg-yellow-500", textColor: "text-yellow-500", checks };
        if (score === 3) return { score, label: "Fort", color: "bg-blue-500", textColor: "text-blue-500", checks };
        return { score, label: "Très Fort", color: "bg-green-500", textColor: "text-green-500", checks };
    }
    const strength = getPasswordStrength();

    function goNext() {
        if (step === 2) {
            if (!enterpriseName.trim() || !country.trim() || !city.trim()) {
                showError("Veuillez remplir les champs obligatoires (Nom, Pays, Ville).");
                return;
            }
        }
        setStep(s => Math.min(s + 1, 5));
    }

    function goBack() {
        setStep(s => Math.max(s - 1, 1));
    }

    async function handleRegister(e) {
        e.preventDefault();
        if (!fullName.trim() || !email.trim() || !password) {
            showError("Veuillez remplir tous les champs obligatoires.");
            return;
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            showError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.");
            return;
        }
        if (password !== confirmPassword) {
            showError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (selectedPlan === "Standard") {
            // For Standard plan, register directly (free, no payment)
            setLoading(true);
            const entPhoneStr = enterprisePhone
                ? `${enterprisePhoneRef.current?.dialCode || "+212"}${enterprisePhone}`
                : undefined;
            const dirPhoneStr = phone
                ? `${directorPhoneRef.current?.dialCode || "+212"}${phone}`
                : undefined;

            try {
                await register({
                    full_name: fullName,
                    email,
                    phone: dirPhoneStr,
                    password,
                    enterprise_name: enterpriseName,
                    enterprise_address: enterpriseAddress || undefined,
                    registry_number: registryNumber || undefined,
                    country: country || undefined,
                    city: city || undefined,
                    vat_number: vatNumber || undefined,
                    enterprise_phone: entPhoneStr,
                    plan: selectedPlan,
                });
                setStep(5);
            } catch (err) {
                showError(err.message || "Erreur lors de l'inscription.");
            } finally {
                setLoading(false);
            }
        } else {
            // For paid plans, go to payment step — NO account creation yet
            setStep(4);
        }
    }

    function buildPaymentPayload() {
        const entPhoneStr = enterprisePhone
            ? `${enterprisePhoneRef.current?.dialCode || "+212"}${enterprisePhone}`
            : undefined;
        const dirPhoneStr = phone
            ? `${directorPhoneRef.current?.dialCode || "+212"}${phone}`
            : undefined;
        return {
            full_name: fullName,
            email,
            phone: dirPhoneStr || undefined,
            password,
            enterprise_name: enterpriseName,
            enterprise_address: enterpriseAddress || undefined,
            registry_number: registryNumber || undefined,
            country: country || undefined,
            city: city || undefined,
            vat_number: vatNumber || undefined,
            enterprise_phone: entPhoneStr || undefined,
            plan: selectedPlan,
            billing: isYearly ? 'yearly' : 'monthly',
        };
    }

    async function handleStripeCheckout() {
        setLoading(true);
        setLoadingMethod('stripe');
        try {
            // Account is created AFTER payment via webhook
            const session = await api("/api/payments/register-checkout", {
                method: "POST",
                body: buildPaymentPayload(),
            });
            window.location.href = session.url;
        } catch (err) {
            console.error("Checkout error:", err);
            showError(err.response?.data?.error || "Erreur lors de la création de la session de paiement.");
        } finally {
            setLoading(false);
            setLoadingMethod(null);
        }
    }

    async function handlePayPalCheckout() {
        setLoading(true);
        setLoadingMethod('paypal');
        try {
            // Account is created AFTER payment via webhook
            const session = await api("/api/payments/register-paypal", {
                method: "POST",
                body: buildPaymentPayload(),
            });
            if (session.url) {
                window.location.href = session.url;
            } else {
                throw new Error("Missing approval url");
            }
        } catch (err) {
            console.error("PayPal error:", err);
            showError(err.response?.data?.error || "Erreur lors de la création de la souscription PayPal.");
        } finally {
            setLoading(false);
            setLoadingMethod(null);
        }
    }

    const inputClass = "input-focus w-full rounded-xl bg-gray-100 dark:bg-white/[0.06] dark:border dark:border-white/[0.1] px-4 py-2.5 placeholder-gray-500 dark:placeholder-gray-500 transition text-gray-900 dark:text-white text-sm";

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-[#0B1120]">
            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className="absolute top-6 right-6 z-50 p-2.5 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md hover:scale-105 cursor-pointer"
                aria-label="Toggle dark mode"
            >
                {darkMode ? (
                    <Sun size={20} className="text-orange-400" />
                ) : (
                    <Moon size={20} className="text-gray-600" />
                )}
            </button>

            <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#0F172A]/90 dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:flex-row transition-all duration-500">

                {/* LEFT — Form */}
                <div className={`form-container w-full ${step === 1 ? 'md:w-1/2' : 'md:w-7/12'} p-5 md:p-6 lg:p-8 flex flex-col justify-center overflow-x-hidden`}>

                    {/* Logo */}
                    <div className="mb-3 flex items-center cursor-pointer" onClick={() => navigate("/")}>
                        <img src={logo} alt="Logo" className="mr-2 h-9 w-9" />
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            Rental<span className="text-blue-700 dark:text-blue-400">Car</span>
                        </span>
                    </div>

                    {step !== 5 && (
                        <>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-1 leading-tight">
                                Créez votre espace de gestion en toute <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">confiance</span>.
                            </h1>

                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 leading-relaxed">
                                Configuration de votre compte B2B
                            </p>

                            {/* Step Indicator */}
                            <div className="flex items-center gap-1 mb-4 overflow-hidden h-10">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s < step ? "bg-green-500 text-white" :
                                            s === step ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" :
                                                "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                                            }`}>
                                            {s < step ? <Check size={14} strokeWidth={3} /> : s}
                                        </div>
                                        {s < 4 && (
                                            <div className={`w-6 h-0.5 mx-1 rounded-full transition-all ${s < step ? "bg-green-500" : "bg-gray-200 dark:bg-white/10"
                                                }`} />
                                        )}
                                    </div>
                                ))}
                                <span className="ml-3 text-xs text-blue-600 dark:text-blue-400 font-semibold truncate">
                                    {step === 1 && "1. Votre Plan"}
                                    {step === 2 && "2. Entreprise"}
                                    {step === 3 && "3. Directeur"}
                                    {step === 4 && "4. Paiement"}
                                </span>
                            </div>
                        </>
                    )}

                    {/* STEP 1 — Plan selection */}
                    {step === 1 && (
                        <div className="space-y-4 animate-[fadeInUp_0.3s_ease-out]">
                            {/* Billing Toggle */}
                            <div className="flex items-center justify-center gap-4 mb-4">
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {PLANS.filter(p => p.id !== "Standard").map(plan => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`relative p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedPlan === plan.id
                                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-lg shadow-blue-500/10"
                                            : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-white/20"
                                            }`}
                                    >
                                        {plan.popular && (
                                            <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                Populaire
                                            </span>
                                        )}
                                        <div className="mb-3">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.color === "indigo" ? "bg-indigo-500/10" : "bg-violet-500/10"
                                                    }`}>
                                                    {plan.icon}
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                            </div>
                                            <div className="flex items-baseline gap-1 flex-wrap">
                                                {isYearly && (
                                                    <span className="text-sm font-bold text-gray-400 line-through mr-1">
                                                        ${plan.monthlyPrice}
                                                    </span>
                                                )}
                                                <span className="text-3xl font-black text-gray-900 dark:text-white">
                                                    ${isYearly ? plan.yearlyPrice.toFixed(2) : plan.monthlyPrice}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">/mois</span>
                                                {isYearly && (
                                                    <span className="ml-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                        -20%
                                                    </span>
                                                )}
                                            </div>
                                            {isYearly && plan.yearlyTotal && (
                                                <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                                                    Facturé ${plan.yearlyTotal.toFixed(2)}/an
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Selection indicator */}
                                        {selectedPlan === plan.id && (
                                            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                <Check size={12} className="text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Option standard cachée mais dispo en texte (optionnel selon le flow) */}
                            <div className="text-center mt-2">
                                <button onClick={() => { setSelectedPlan("Standard"); goNext(); }} className="text-xs text-gray-500 dark:text-gray-400 font-semibold hover:text-blue-500 transition-colors">
                                    Ou continuer avec le plan Standard (Gratuit, limité à 5 véhicules)
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={goNext}
                                className="w-full login-btn-bg rounded-xl py-3 mt-3 font-semibold text-white shadow-lg hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Étape suivante <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2 — Enterprise Form */}
                    {step === 2 && (
                        <div className="space-y-2.5 animate-[fadeInUp_0.3s_ease-out]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nom de la société <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Ex: AutoRent SARL"
                                            required
                                            className={inputClass + " pl-12"}
                                            value={enterpriseName}
                                            onChange={(e) => setEnterpriseName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Numéro de Registre de Commerce</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: RC 12345"
                                        className={inputClass}
                                        value={registryNumber}
                                        onChange={(e) => setRegistryNumber(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Numéro de TVA</label>
                                    <input
                                        type="text"
                                        placeholder="Optionnel"
                                        className={inputClass}
                                        value={vatNumber}
                                        onChange={(e) => setVatNumber(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Adresse de l'entreprise</label>
                                    <input
                                        type="text"
                                        placeholder="Adresse complète"
                                        className={inputClass}
                                        value={enterpriseAddress}
                                        onChange={(e) => setEnterpriseAddress(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Pays <span className="text-red-500">*</span></label>
                                    <CountrySelect
                                        value={country}
                                        darkMode={darkMode}
                                        onChange={(countryName, isoCode) => {
                                            setCountry(countryName);
                                            setCountryCode(isoCode);
                                            setCity(""); // reset city when country changes
                                        }}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Ville <span className="text-red-500">*</span></label>
                                    <CitySelect
                                        countryCode={countryCode}
                                        value={city}
                                        darkMode={darkMode}
                                        onChange={(cityName) => setCity(cityName)}
                                    />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Téléphone de l'entreprise</label>
                                    <PhoneInput
                                        variant="auth"
                                        value={enterprisePhone}
                                        onChange={setEnterprisePhone}
                                        onCountryChange={(c) => { enterprisePhoneRef.current = c; }}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="flex-1 rounded-xl py-3 font-semibold border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <ArrowLeft size={18} /> Retour
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="flex-1 login-btn-bg rounded-xl py-3 font-semibold text-white shadow-lg hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    Suivant <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 — Director info */}
                    {step === 3 && (
                        <form onSubmit={handleRegister} className="space-y-3 animate-[fadeInUp_0.3s_ease-out]">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nom complet (Directeur) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Prénom Nom"
                                        required
                                        className={inputClass + " pl-12"}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Email professionnel <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    placeholder="email@entreprise.com"
                                    required
                                    className={inputClass}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Téléphone Mobile</label>
                                <PhoneInput
                                    variant="auth"
                                    value={phone}
                                    onChange={setPhone}
                                    onCountryChange={(c) => { directorPhoneRef.current = c; }}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Mot de passe <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 caractères"
                                        required
                                        className={inputClass + " pr-10"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                        aria-label={showPassword ? "Masquer" : "Afficher"}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {password && (
                                    <div className="space-y-2 mt-2 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 flex gap-1">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                                            i <= strength.score ? strength.color : "bg-gray-200 dark:bg-white/10"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className={`text-[10px] font-bold min-w-[60px] text-right ${strength.textColor}`}>
                                                {strength.label}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            <div className={`flex items-center gap-1.5 text-[9px] font-medium transition-colors ${strength.checks.length ? "text-green-500" : "text-gray-400"}`}>
                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${strength.checks.length ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-white/20"}`}>
                                                    {strength.checks.length && <Check size={8} className="text-white" strokeWidth={4} />}
                                                </div>
                                                Min. 8 caractères
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[9px] font-medium transition-colors ${strength.checks.upper ? "text-green-500" : "text-gray-400"}`}>
                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${strength.checks.upper ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-white/20"}`}>
                                                    {strength.checks.upper && <Check size={8} className="text-white" strokeWidth={4} />}
                                                </div>
                                                Majuscule
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[9px] font-medium transition-colors ${strength.checks.number ? "text-green-500" : "text-gray-400"}`}>
                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${strength.checks.number ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-white/20"}`}>
                                                    {strength.checks.number && <Check size={8} className="text-white" strokeWidth={4} />}
                                                </div>
                                                Chiffre
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[9px] font-medium transition-colors ${strength.checks.special ? "text-green-500" : "text-gray-400"}`}>
                                                <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${strength.checks.special ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-white/20"}`}>
                                                    {strength.checks.special && <Check size={8} className="text-white" strokeWidth={4} />}
                                                </div>
                                                Caractère spécial
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Confirmer le mot de passe <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Répétez le mot de passe"
                                        required
                                        className={inputClass + " pr-10" + (confirmPassword && confirmPassword !== password ? " border border-red-400 dark:border-red-500" : confirmPassword && confirmPassword === password ? " border border-green-400 dark:border-green-500" : "")}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                        aria-label={showConfirmPassword ? "Masquer" : "Afficher"}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== password && (
                                    <p className="text-[10px] text-red-500 mt-1 px-1">Les mots de passe ne correspondent pas.</p>
                                )}
                                {confirmPassword && confirmPassword === password && (
                                    <p className="text-[10px] text-green-500 mt-1 px-1">✓ Les mots de passe correspondent.</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="flex-1 rounded-xl py-2.5 font-semibold border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                                >
                                    <ArrowLeft size={16} /> Retour
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || strength.score < 4 || password !== confirmPassword}
                                    className="flex-1 login-btn-bg rounded-xl py-2.5 font-semibold text-white shadow-lg hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:scale-100 text-sm"
                                >
                                    {loading ? "Création..." : "Créer le compte"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 4 — Payment (Stripe) */}
                    {step === 4 && (
                        <div className="space-y-4 animate-[fadeInUp_0.3s_ease-out]">
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-xl flex items-start gap-4">
                                <CheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={18} />
                                <div>
                                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm">Compte créé !</h4>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-0.5">
                                        Activez votre abonnement {activePlan?.name} pour continuer.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                                    <CreditCard size={20} className="text-blue-500" />
                                    Récapitulatif de la commande
                                </h3>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Plan selectionné</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">RentalCar {activePlan?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Cycle de facturation</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{isYearly ? "Annuel (-20%)" : "Mensuel"}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Compte entreprise</span>
                                        <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{enterpriseName}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-white/10 pt-3 mb-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total à payer</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                                ${isYearly ? activePlan?.yearlyTotal?.toFixed(2) : activePlan?.monthlyPrice?.toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 block">en USD / {isYearly ? "an" : "mois"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <button
                                        onClick={handleStripeCheckout}
                                        disabled={loading}
                                        className="w-full bg-[#635BFF] hover:bg-[#524ae3] text-white rounded-xl py-3 font-bold shadow-lg hover:shadow-[#635BFF]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        {loadingMethod === 'stripe' ? "Chargement..." : `Payer via Stripe`}
                                    </button>

                                    <button
                                        onClick={handlePayPalCheckout}
                                        disabled={loading}
                                        className="w-full bg-[#FFC439] hover:bg-[#F4B938] text-[#003087] rounded-xl py-3 font-bold shadow-lg hover:shadow-[#FFC439]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        {loadingMethod === 'paypal' ? "Chargement..." : `Payer via PayPal`}
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                                    🔒 Paiements sécurisés
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 5 — Confirmation (Success) */}
                    {step === 5 && (
                        <div className="text-center space-y-4 animate-[fadeInUp_0.3s_ease-out]">
                            {/* Verifying state */}
                            {verifying && (
                                <>
                                    <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-500/30 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vérification du paiement...</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Nous vérifions votre paiement et créons votre compte. Veuillez patienter...
                                    </p>
                                </>
                            )}

                            {/* Error state */}
                            {!verifying && verifyError && (
                                <>
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-3xl">❌</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Erreur de vérification</h2>
                                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 max-w-sm mx-auto">
                                        <p className="text-red-700 dark:text-red-300 text-sm">{verifyError}</p>
                                    </div>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="login-btn-bg inline-flex px-6 rounded-xl py-3 font-bold text-white shadow-lg hover:scale-105 transition items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
                                    >
                                        Réessayer
                                    </button>
                                </>
                            )}

                            {/* Success state */}
                            {!verifying && !verifyError && (
                                <>
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                                        <Check size={32} className="text-green-600 dark:text-green-400" strokeWidth={3} />
                                    </div>
                                    
                                    {selectedPlan === "Standard" ? (
                                        <>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inscription terminée !</h2>
                                            <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-left max-w-sm mx-auto">
                                                <p className="text-gray-600 dark:text-gray-300 text-xs">
                                                    Votre compte entreprise est maintenant <span className="font-bold text-green-600 dark:text-green-400">Actif</span>. Plan gratuit activé.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => navigate("/director")}
                                                className="login-btn-bg inline-flex px-6 rounded-xl py-3 font-bold text-white shadow-lg hover:scale-105 transition items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
                                            >
                                                Accéder au tableau de bord <ArrowRight size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paiement validé ! 🎉</h2>
                                            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5 text-left max-w-sm mx-auto space-y-3">
                                                <p className="text-blue-800 dark:text-blue-300 text-sm font-semibold">✅ Votre compte a été créé avec succès</p>
                                                <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                                                    Votre abonnement est actif. Un email de confirmation avec vos identifiants de connexion a été envoyé.
                                                </p>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 border-t border-blue-200 dark:border-blue-500/20 pt-3">
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">ℹ️ Politique de grâce</p>
                                                    Accès garanti pendant 7 jours en cas d'échec de paiement futur.
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate("/login")}
                                                className="login-btn-bg inline-flex px-6 rounded-xl py-3 font-bold text-white shadow-lg hover:scale-105 transition items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
                                            >
                                                Aller à la page de connexion <ArrowRight size={16} />
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Cross-link (hide on confirm and payment) */}
                    {step < 4 && (
                        <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                            Déjà un compte ?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                            >
                                Se connecter
                            </button>
                        </p>
                    )}
                </div>

                {/* RIGHT — Video features panel */}
                <div className={`relative hidden ${step === 1 ? 'md:w-1/2' : 'md:w-5/12'} md:block transition-all duration-500`}>
                    <div className="video-container h-full">
                        <video
                            className="video-background h-full w-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src={video} type="video/mp4" />
                        </video>
                        <div className="video-overlay absolute inset-0 bg-blue-900/60 dark:bg-[#0B1120]/80 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
                            <h2 className="mb-6 text-3xl font-bold text-white leading-tight drop-shadow-md">
                                {step === 1 && "Choisissez l'offre qui correspond à votre ambition."}
                                {step === 2 && "Configurez votre espace d'entreprise B2B."}
                                {step === 3 && "Sécurisez votre compte administrateur."}
                                {step === 4 && "Finalisez votre abonnement en toute sécurité."}
                                {step === 5 && "Prêt à démarrer."}
                            </h2>
                            <ul className="text-left space-y-4 text-white/90">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Check size={14} /></div>
                                    <span>Sans engagement, annulez à tout moment</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Check size={14} /></div>
                                    <span>Paiement sécurisé via Stripe</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Check size={14} /></div>
                                    <span>Support technique prioritaire</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
