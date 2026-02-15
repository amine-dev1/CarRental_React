import { Lock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function LockedFeature({ feature, requiredPlan, children, className = "" }) {
    const { darkMode } = useTheme();

    return (
        <div className={`relative ${className}`}>
            {/* Blurred content */}
            <div className="pointer-events-none select-none opacity-50 blur-sm">
                {children}
            </div>

            {/* Upgrade overlay */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${
                darkMode ? 'bg-gray-900/80' : 'bg-white/80'
            } backdrop-blur-sm rounded-lg border-2 border-dashed ${
                darkMode ? 'border-cyan-500/50' : 'border-cyan-500'
            }`}>
                <div className="text-center p-6 max-w-md">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                        darkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'
                    }`}>
                        <Lock className="w-8 h-8 text-cyan-500" />
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        🔒 {feature} (Plan {requiredPlan})
                    </h3>
                    
                    <p className={`text-sm mb-4 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Passez au plan {requiredPlan} pour débloquer cette fonctionnalité
                    </p>

                    <button className="btn-primary bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all">
                        Passer à {requiredPlan} →
                    </button>
                </div>
            </div>
        </div>
    );
}
