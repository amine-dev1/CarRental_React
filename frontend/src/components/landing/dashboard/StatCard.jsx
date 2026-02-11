import { useTheme } from "../../../context/ThemeContext";

export default function StatCard({ label, value, icon: Icon, gradient, isDark, iconBg, iconColor }) {
    const { darkMode } = useTheme();
    const textClass = isDark || darkMode ? "text-[#F1F5F9]" : "text-gray-900";
    const labelClass = isDark || darkMode ? "text-[#64748B]" : "text-gray-600 font-medium";
    const iconClass = isDark || darkMode 
        ? `${iconBg || 'bg-white/10'} ${iconColor || 'text-white'} border-transparent` 
        : `${iconBg || 'bg-white/30'} ${iconColor || 'text-gray-900'} border-transparent`;

    return (
        <div
            className={`
                group relative
                rounded-2xl p-8
                transition-all duration-[250ms] ease-out
                cursor-default
                hover:-translate-y-1
                overflow-hidden
                ${gradient || (darkMode ? 'bg-[#111827]' : 'bg-white')}
                border border-gray-100/50 dark:border-white/5
                shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]
                hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]
            `}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10">
                {/* Icon */}
                {Icon && (
                    <div
                        className={`
                            mb-4 w-12 h-12 rounded-xl flex items-center justify-center
                            backdrop-blur-sm border shadow-sm
                            transition-all duration-300
                            group-hover:scale-110
                            ${iconClass}
                        `}
                    >
                        <Icon size={22} />
                    </div>
                )}

                {/* Value */}
                <div className={`text-3xl font-bold tracking-tight ${textClass}`}>
                    {value}
                </div>

                {/* Label */}
                <div className={`mt-1 text-sm font-semibold uppercase tracking-wider ${labelClass}`}>
                    {label}
                </div>
            </div>
        </div>
    );
}
