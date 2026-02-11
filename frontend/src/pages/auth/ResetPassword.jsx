import { useState, useEffect } from "react";
import { showSuccess, showError } from "../../components/CustomToasts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/http";
import "../../pages/auth/login.css";

import logo from "../../assets/logo-blue.png";
import video from "../../assets/video.mp4";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [method, setMethod] = useState("email"); // 'email' | 'sms'
    const [code, setCode] = useState("");
    const [linkToken, setLinkToken] = useState(""); // Token du lien
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email/Phone, 2: Code, 3: Password
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [tokenVerifying, setTokenVerifying] = useState(false);

    // Country Code state
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState({ code: "+212", cca2: "MA", flag: "🇲🇦" });
    const [loadingCountries, setLoadingCountries] = useState(false);

    // Resend Code Logic
    const [canResend, setCanResend] = useState(false);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        let timer;
        if (step === 2 && !canResend && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [step, canResend, countdown]);

    // Fetch countries
    useEffect(() => {
        async function fetchCountries() {
            setLoadingCountries(true);
            try {
                const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags");
                const data = await res.json();

                const formatted = data
                    .filter(c => c.idd?.root && (c.idd.suffixes?.length > 0 || c.idd.suffixes === undefined))
                    .map(c => ({
                        name: c.name.common,
                        cca2: c.cca2,
                        // Fix for root+suffix combination
                        code: c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : ""),
                        flag: c.flags.svg
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCountries(formatted);

                // Try to find Morocco
                const morocco = formatted.find(c => c.cca2 === "MA");
                if (morocco) setSelectedCountry(morocco);
            } catch (err) {
                console.error("Failed to fetch countries", err);
            } finally {
                setLoadingCountries(false);
            }
        }
        fetchCountries();
    }, []);

    async function handleResendCode() {
        if (!canResend) return;
        setLoading(true);
        try {
            const payload = method === "email"
                ? { email }
                : { phone: selectedCountry.code + phone.replace(/^0+/, "") }; // Handle phone format

            await api("/api/auth/forgot-password", {
                method: "POST",
                body: payload,
            });
            showSuccess("Nouveau code envoyé !");
            setCanResend(false);
            setCountdown(30);
        } catch (err) {
            showError(err.message || "Erreur lors de l'envoi.");
        } finally {
            setLoading(false);
        }
    }

    // Vérifier si un token est présent dans l'URL
    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");
        const emailFromUrl = searchParams.get("email");

        if (tokenFromUrl && emailFromUrl) {
            setEmail(emailFromUrl);
            setLinkToken(tokenFromUrl);
            setTokenVerifying(true);

            // Vérifier automatiquement le token
            api("/api/auth/verify-code", {
                method: "POST",
                body: { email: emailFromUrl, token: tokenFromUrl },
            })
                .then((data) => {
                    setCode(data.code); // Stocker le code retourné
                    setStep(3); // Aller directement à l'étape de réinitialisation
                })
                .catch((err) => {
                    setError(err.message || "Lien invalide ou expiré. Veuillez demander un nouveau code.");
                    setStep(1);
                })
                .finally(() => {
                    setTokenVerifying(false);
                });
        }
    }, [searchParams]);

    // Step 1: Request Code
    async function handleRequestCode(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = method === "email"
                ? { email }
                : { phone: selectedCountry.code + phone.replace(/^0+/, "") };

            await api("/api/auth/forgot-password", {
                method: "POST",
                body: payload,
            });
            setStep(2);
        } catch (err) {
            const message = err.message || "Une erreur est survenue.";
            setError(message);
            showError(message);
        } finally {
            setLoading(false);
        }
    }

    // Step 2: Verify Code
    async function handleVerifyCode(e) {
        e.preventDefault();
        setError("");
        if (code.length !== 6) return setError("Le code doit comporter 6 chiffres.");

        setLoading(true);
        try {
            // Reconstruct phone if using SMS
            const finalPhone = selectedCountry.code + phone.replace(/^0+/, "");

            await api("/api/auth/verify-code", {
                method: "POST",
                body: method === "email"
                    ? { email: email, code }
                    : { phone: finalPhone, code },
            });
            setStep(3);
        } catch (err) {
            setError(err.message || "Code invalide ou expiré.");
        } finally {
            setLoading(false);
        }
    }

    // Step 3: Reset Password
    async function handleResetSubmit(e) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            return setError("Les mots de passe ne correspondent pas.");
        }

        setLoading(true);

        try {
            const finalPhone = selectedCountry.code + phone.replace(/^0+/, "");

            await api("/api/auth/reset-password", {
                method: "POST",
                body: method === "email"
                    ? { email, code, token: linkToken, password }
                    : { phone: finalPhone, code, token: linkToken, password },
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
            <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl md:flex-row">

                {/* LEFT */}
                <div className="form-container w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">

                    <div className="mb-8 flex items-center">
                        <img src={logo} alt="Logo" className="mr-2 h-11 w-11" />
                        <span className="text-2xl font-bold text-slate-900">
                            Rental<span className="text-blue-700">Car</span>
                        </span>
                    </div>

                    {tokenVerifying ? (
                        <div className="text-center py-12">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="text-gray-600">Vérification du lien...</p>
                        </div>
                    ) : !success ? (
                        <>
                            {step === 1 && (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                                        Mot de passe oublié ?
                                    </h1>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Choisissez comment recevoir votre code de vérification.
                                    </p>

                                    {/* Toggle Method */}
                                    <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                                        <button
                                            className={`flex-1 rounded-md py-2 text-sm font-medium transition cursor-pointer ${method === "email" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                            onClick={() => setMethod("email")}
                                        >
                                            Email
                                        </button>
                                        <button
                                            className={`flex-1 rounded-md py-2 text-sm font-medium transition cursor-pointer ${method === "sms" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                            onClick={() => setMethod("sms")}
                                        >
                                            SMS
                                        </button>
                                    </div>

                                    <form onSubmit={handleRequestCode}>
                                        <div className="mb-6">
                                            {method === "email" ? (
                                                <input
                                                    key="email-input"
                                                    type="email"
                                                    placeholder="Adresse e-mail"
                                                    required
                                                    className="input-focus w-full rounded-xl bg-gray-100 px-5 py-3 placeholder-gray-500 transition text-gray-900"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            ) : (
                                                <div className="flex gap-2">
                                                    {/* Country Selector */}
                                                    <div className="relative w-1/3">
                                                        <select
                                                            className="appearance-none input-focus w-full rounded-xl bg-gray-100 pl-3 pr-8 py-3 transition text-gray-900 cursor-pointer"
                                                            value={selectedCountry.cca2}
                                                            onChange={(e) => {
                                                                const c = countries.find(c => c.cca2 === e.target.value);
                                                                if (c) setSelectedCountry(c);
                                                            }}
                                                        >
                                                            {countries.map((c) => (
                                                                <option key={c.cca2} value={c.cca2}>
                                                                    {c.cca2} ({c.code})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                            <span className="text-xs">▼</span>
                                                        </div>
                                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                            {/* Optional flag display if needed, but select usually handles native text nicely */}
                                                        </div>
                                                    </div>

                                                    {/* Phone Input */}
                                                    <input
                                                        key="phone-input"
                                                        type="tel"
                                                        placeholder="Numéro de téléphone"
                                                        required
                                                        className="input-focus flex-1 rounded-xl bg-gray-100 px-5 py-3 placeholder-gray-500 transition text-gray-900"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="login-btn-bg w-full rounded-xl py-3 font-semibold text-white shadow-lg transition disabled:opacity-50"
                                        >
                                            {loading ? "Envoi..." : "Envoyer le code"}
                                        </button>
                                    </form>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                                        Vérification
                                    </h1>
                                    <p className="text-gray-500 text-sm mb-8">
                                        Saisissez le code à 6 chiffres envoyé à <strong>{method === "email" ? email : `${selectedCountry.code} ${phone}`}</strong>.
                                    </p>

                                    <form onSubmit={handleVerifyCode}>
                                        <div className="mb-6">
                                            <input
                                                type="text"
                                                placeholder="Code à 6 chiffres"
                                                maxLength={6}
                                                required
                                                autoFocus
                                                className="input-focus w-full rounded-xl bg-gray-100 px-5 py-3 placeholder-gray-500 transition text-gray-900 text-center text-3xl tracking-[0.5em] font-bold"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                            />
                                        </div>
                                        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="login-btn-bg w-full rounded-xl py-3 font-semibold text-white shadow-lg transition disabled:opacity-50"
                                        >
                                            {loading ? "Vérification..." : "Vérifier le code"}
                                        </button>
                                        <div className="mt-4 flex flex-col items-center gap-3 text-center">
                                            <button
                                                type="button"
                                                onClick={handleResendCode}
                                                disabled={!canResend || loading}
                                                className={`text-sm font-medium transition ${canResend
                                                    ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                                                    : "text-gray-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                {canResend
                                                    ? "Renvoyer le code"
                                                    : `Renvoyer le code (${countdown}s)`}
                                            </button>

                                            <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-blue-600 transition">
                                                Changer de méthode / d'adresse
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                                        Nouveau mot de passe
                                    </h1>
                                    <p className="text-gray-500 text-sm mb-8">
                                        Votre code est validé. Choisissez maintenant votre nouveau mot de passe.
                                    </p>

                                    <form onSubmit={handleResetSubmit}>
                                        <div className="mb-4">
                                            <input
                                                type="password"
                                                placeholder="Nouveau mot de passe"
                                                required
                                                autoFocus
                                                className="input-focus w-full rounded-xl bg-gray-100 px-5 py-3 placeholder-gray-500 transition text-gray-900"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <input
                                                type="password"
                                                placeholder="Confirmer le mot de passe"
                                                required
                                                className="input-focus w-full rounded-xl bg-gray-100 px-5 py-3 placeholder-gray-500 transition text-gray-900"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="login-btn-bg w-full rounded-xl py-3 font-semibold text-white shadow-lg transition disabled:opacity-50"
                                        >
                                            {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
                                        </button>
                                    </form>
                                </>
                            )}

                            {step === 1 && (
                                <div className="mt-6 text-center">
                                    <button onClick={() => navigate("/login")} className="text-sm text-blue-600 hover:underline cursor-pointer">
                                        ← Retour à la connexion
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">C'est fait !</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Votre mot de passe a été mis à jour avec succès. Redirection vers la connexion...
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div className="relative hidden w-1/2 md:block">
                    <div className="video-container">
                        <video className="video-background h-full w-full object-cover" autoPlay loop muted playsInline>
                            <source src={video} type="video/mp4" />
                        </video>
                        <div className="video-overlay absolute inset-0 bg-blue-900/40" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
                            <h1 className="mb-4 text-4xl font-bold text-white leading-tight">
                                Sécurité & Continuité
                            </h1>
                            <p className="text-lg text-white/90">
                                Protégez l’accès à votre plateforme de gestion de location.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
