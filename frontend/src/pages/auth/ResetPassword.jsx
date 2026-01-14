import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/http";
import "../../pages/auth/login.css";

import logo from "../../assets/logo-blue.png";
import video from "../../assets/video.mp4";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [linkToken, setLinkToken] = useState(""); // Token du lien
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Password
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [tokenVerifying, setTokenVerifying] = useState(false);

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
            await api("/api/auth/forgot-password", {
                method: "POST",
                body: { email },
            });
            setStep(2);
        } catch (err) {
            setError(err.message || "Une erreur est survenue.");
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
            await api("/api/auth/verify-code", {
                method: "POST",
                body: { email, code },
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
            await api("/api/auth/reset-password", {
                method: "POST",
                body: { email, code, token: linkToken, password },
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
                                    <p className="text-gray-500 text-sm mb-8">
                                        Entrez votre e-mail pour recevoir un code de vérification à 6 chiffres.
                                    </p>

                                    <form onSubmit={handleRequestCode}>
                                        <div className="mb-6">
                                            <input
                                                type="email"
                                                placeholder="Adresse e-mail"
                                                required
                                                className="input-focus w-full rounded-xl bg-gray-100 px-5 py-3 placeholder-gray-500 transition text-gray-900"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
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
                                        Saisissez le code à 6 chiffres envoyé à <strong>{email}</strong>.
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
                                        <div className="mt-4 text-center">
                                            <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-blue-600 transition">
                                                Changer d'adresse email
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
