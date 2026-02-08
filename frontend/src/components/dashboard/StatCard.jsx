export default function StatCard({ label, value, icon: Icon, gradient, isDark }) {
    const textClass = isDark ? "text-white" : "text-gray-900";
    const labelClass = isDark ? "text-white/80" : "text-gray-700/80";
    const iconClass = isDark ? "bg-white/20 text-white border-white/20" : "bg-white/30 text-gray-900 border-white/40";

    return (
        <div
            className={`
                group relative
                rounded-3xl p-6
                transition-all duration-300 ease-out
                cursor-default
                hover:-translate-y-1
                overflow-hidden
                ${gradient || 'bg-white/40'}
                backdrop-blur-md
                border border-white/20
                shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
                hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.12)]
            `}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10">
                {/* Icon */}
                {Icon && (
                    <div
                        className={`
                            mb-4 w-12 h-12 rounded-2xl flex items-center justify-center
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
