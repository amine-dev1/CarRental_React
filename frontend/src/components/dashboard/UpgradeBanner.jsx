import { ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function UpgradeBanner({ currentPlan, targetPlan = "Pro", message, features = [] }) {
    const { darkMode } = useTheme();

    const planColors = {
        Pro: {
            gradient: "from-blue-500 to-indigo-600",
            icon: "⭐"
        },
        Enterprise: {
            gradient: "from-yellow-500 to-amber-600",
            icon: "👑"
        }
    };

    const config = planColors[targetPlan] || planColors.Pro;

    return (
        <div className={`rounded-lg border-2 p-6 mb-6 ${
            darkMode 
                ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-cyan-500/30' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-cyan-500" />
                        <h3 className={`text-lg font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            {config.icon} Débloquez plus de fonctionnalités avec {targetPlan}
                        </h3>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                        {message || `Passez au plan ${targetPlan} pour accéder à des outils professionnels.`}
                    </p>

                    {features.length > 0 && (
                        <ul className={`text-sm space-y-1 mb-4 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-all whitespace-nowrap`}>
                    Passer à {targetPlan}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
