import { useTheme } from "../../context/ThemeContext";

export default function PlanBadge({ plan }) {
    const { darkMode } = useTheme();

    const planStyles = {
        Standard: {
            bg: darkMode ? 'bg-gray-700' : 'bg-gray-200',
            text: darkMode ? 'text-gray-300' : 'text-gray-700',
            icon: ''
        },
        Pro: {
            bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            text: 'text-white',
            icon: '⭐'
        },
        Enterprise: {
            bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
            text: 'text-white',
            icon: '👑'
        }
    };

    const style = planStyles[plan] || planStyles.Standard;

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.icon} {plan.toUpperCase()}
        </span>
    );
}
