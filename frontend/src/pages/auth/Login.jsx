import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../pages/auth/login.css";

import logo from "../../assets/logo-blue.png";
import video from "../../assets/video.mp4";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);

            // redirection par rôle
            const payload = JSON.parse(
                atob(localStorage.getItem("token").split(".")[1])
            );

            if (payload.role === "superadmin") navigate("/superadmin");
            else if (payload.role === "director") navigate("/director");
            else navigate("/agent");
        } catch (err) {
            setError("Identifiants ou mot de passe incorrects");
            // Auto-hide after 5 seconds
            setTimeout(() => {
                setError("");
            }, 5000);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
            <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl md:flex-row">

                {/* LEFT */}
                <div className="form-container w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">

                    {/* Logo */}
                    <div className="mb-8 flex items-center">
                        <img src={logo} alt="Logo" className="mr-2 h-11 w-11" />
                        <span className="text-2xl font-bold text-slate-900">
                            Rental<span className="text-blue-700">Car</span>
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                        Gérez votre activité de location de voitures en toute simplicité.
                    </h1>

                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        Accédez à votre tableau de bord pour gérer les véhicules, les locations, les clients et votre équipe — tout depuis une seule plateforme.
                    </p>

                    {/* FORM */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Adresse e-mail"
                                required
                                className="input-focus w-full rounded-xl bg-gray-100 px-5 py-3 placeholder-gray-500 transition text-gray-900"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                required
                                className="input-focus w-full rounded-xl bg-gray-100 px-5 py-3 placeholder-gray-500 transition text-gray-900"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-6 text-right">
                            <button
                                type="button"
                                onClick={() => navigate("/reset-password")}
                                className="text-sm text-blue-600 hover:underline font-medium focus:outline-none cursor-pointer"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl bg-red-100 px-4 py-2 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="mx-auto w-full max-w-sm">
                            <button
                                type="submit"
                                disabled={loading}
                                className="login-btn-bg w-full rounded-xl py-3 font-semibold text-white shadow-lg transition hover:scale-105 disabled:opacity-50"
                            >
                                {loading ? "Connexion en cours..." : "Se connecter"}
                            </button>

                            <p className="mt-4 text-center text-xs text-gray-400">
                                🔒 Accès sécurisé réservé aux utilisateurs autorisés
                            </p>
                        </div>
                    </form>
                </div>

                {/* RIGHT */}
                <div className="relative hidden w-1/2 md:block">
                    <div className="video-container">
                        <video
                            className="video-background h-full w-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src={video} type="video/mp4" />
                        </video>
                        <div className="video-overlay absolute inset-0 bg-blue-900/40" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
                            <h1 className="mb-4 text-4xl font-bold text-white leading-tight">
                                Pilotez efficacement vos opérations de location.
                            </h1>
                            <p className="text-lg text-white/90">
                                Suivez les réservations, gérez votre flotte et développez votre activité grâce à une solution professionnelle de gestion locative.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
