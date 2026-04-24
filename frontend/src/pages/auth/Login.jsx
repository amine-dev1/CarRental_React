import { useState } from "react";
import { showError } from "../../components/CustomToasts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, Eye, EyeOff } from "lucide-react";
import "../../pages/auth/login.css";

import logo from "../../assets/logo-blue.png";
import video from "../../assets/video.mp4";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
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
            const errorMessage = err.response?.data?.error || "Identifiants ou mot de passe incorrects";
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-[#0B1120]">

            {/* Dark Mode Toggle — Top Right */}
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

            <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#0F172A]/90 dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:flex-row">

                {/* LEFT */}
                <div className="form-container w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">

                    {/* Logo */}
                    <div
                        className="mb-8 flex items-center cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <img src={logo} alt="Logo" className="mr-2 h-11 w-11" />
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            Rental<span className="text-blue-700 dark:text-blue-400">Car</span>
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 leading-tight">
                        Gérez votre activité de location de voitures en toute <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">simplicité</span>.
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                        Accédez à votre tableau de bord pour gérer les véhicules, les locations, les clients et votre équipe — tout depuis une seule plateforme.
                    </p>

                    {/* FORM */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Adresse e-mail"
                                required
                                className="input-focus w-full rounded-xl bg-gray-100 dark:bg-white/[0.06] dark:border dark:border-white/[0.1] px-5 py-3 placeholder-gray-500 dark:placeholder-gray-500 transition text-gray-900 dark:text-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe"
                                required
                                className="input-focus w-full rounded-xl bg-gray-100 dark:bg-white/[0.06] dark:border dark:border-white/[0.1] px-5 py-3 pr-12 placeholder-gray-500 dark:placeholder-gray-500 transition text-gray-900 dark:text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="mb-6 text-right">
                            <button
                                type="button"
                                onClick={() => navigate("/reset-password")}
                                className="text-sm text-orange-500 dark:text-orange-400 hover:underline font-medium focus:outline-none cursor-pointer"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>

                        <div className="mx-auto w-full max-w-sm">
                            <button
                                type="submit"
                                disabled={loading}
                                className="login-btn-bg w-full rounded-xl py-3 font-semibold text-white shadow-lg transition hover:scale-105 disabled:opacity-50"
                            >
                                {loading ? "Connexion en cours..." : "Se connecter"}
                            </button>

                            <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
                                🔒 Accès sécurisé réservé aux utilisateurs autorisés
                            </p>

                            <div className="mt-8 border-t border-gray-100 dark:border-white/5 pt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Nouveau utilisateur ?{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/register")}
                                        className="text-orange-500 dark:text-orange-400 hover:underline font-semibold cursor-pointer"
                                    >
                                        S&apos;enregistrer
                                    </button>
                                </p>
                            </div>
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
                        <div className="video-overlay absolute inset-0 bg-blue-900/40 dark:bg-[#0B1120]/60" />
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
