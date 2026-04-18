import React from 'react';
import {
    LayoutDashboard,
    Car,
    Calendar,
    Users,
    CreditCard,
    FileText,
    Smartphone,
    BarChart3,
    Bell,
    Shield,
    Clock,
    Headphones
} from 'lucide-react';
import { scrollToSection } from '../../utils/scroll';

/* ─────────────────────────────────────────────
   PayPal SVG (unchanged logo, just extracted)
───────────────────────────────────────────── */
const PayPalLogo = () => (
    <svg xmlSpace="preserve" viewBox="0 0 124 33" height="26px" style={{ width: "auto" }}
        xmlns="http://www.w3.org/2000/svg">
        <path d="M46.211,6.749h-6.839c-0.468,0-0.866,0.34-0.939,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.564,0.658h3.265c0.468,0,0.866-0.34,0.939-0.803l0.746-4.73c0.072-0.463,0.471-0.803,0.938-0.803h2.165c4.505,0,7.105-2.18,7.784-6.5c0.306-1.89,0.013-3.375-0.872-4.415C50.224,7.353,48.5,6.749,46.211,6.749z M47,13.154c-0.374,2.454-2.249,2.454-4.062,2.454h-1.032l0.724-4.583c0.043-0.277,0.283-0.481,0.563-0.481h0.473c1.235,0,2.4,0,3.002,0.704C47.027,11.668,47.137,12.292,47,13.154z" fill="#253B80" />
        <path d="M66.654,13.075h-3.275c-0.279,0-0.52,0.204-0.563,0.481l-0.145,0.916l-0.229-0.332c-0.709-1.029-2.29-1.373-3.868-1.373c-3.619,0-6.71,2.741-7.312,6.586c-0.313,1.918,0.132,3.752,1.22,5.031c0.998,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.562,0.66h2.95c0.469,0,0.865-0.34,0.939-0.803l1.77-11.209C67.271,13.388,67.004,13.075,66.654,13.075z M62.089,19.449c-0.316,1.871-1.801,3.127-3.695,3.127c-0.951,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.668-1.391-0.514-2.301c0.295-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C62.034,17.721,62.232,18.543,62.089,19.449z" fill="#253B80" />
        <path d="M84.096,13.075h-3.291c-0.314,0-0.609,0.156-0.787,0.417l-4.539,6.686l-1.924-6.425c-0.121-0.402-0.492-0.678-0.912-0.678h-3.234c-0.393,0-0.666,0.384-0.541,0.754l3.625,10.638l-3.408,4.811c-0.268,0.379,0.002,0.9,0.465,0.9h3.287c0.312,0,0.604-0.152,0.781-0.408L84.564,13.97C84.826,13.592,84.557,13.075,84.096,13.075z" fill="#253B80" />
        <path d="M94.992,6.749h-6.84c-0.467,0-0.865,0.34-0.938,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.562,0.658h3.51c0.326,0,0.605-0.238,0.656-0.562l0.785-4.971c0.072-0.463,0.471-0.803,0.938-0.803h2.164c4.506,0,7.105-2.18,7.785-6.5c0.307-1.89,0.012-3.375-0.873-4.415C99.004,7.353,97.281,6.749,94.992,6.749z M95.781,13.154c-0.373,2.454-2.248,2.454-4.062,2.454h-1.031l0.725-4.583c0.043-0.277,0.281-0.481,0.562-0.481h0.473c1.234,0,2.4,0,3.002,0.704C95.809,11.668,95.918,12.292,95.781,13.154z" fill="#179BD7" />
        <path d="M115.434,13.075h-3.273c-0.281,0-0.52,0.204-0.562,0.481l-0.145,0.916l-0.23-0.332c-0.709-1.029-2.289-1.373-3.867-1.373c-3.619,0-6.709,2.741-7.311,6.586c-0.312,1.918,0.131,3.752,1.219,5.031c1,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.564,0.66h2.949c0.467,0,0.865-0.34,0.938-0.803l1.771-11.209C116.053,13.388,115.785,13.075,115.434,13.075z M110.869,19.449c-0.314,1.871-1.801,3.127-3.695,3.127c-0.949,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.666-1.391-0.514-2.301c0.297-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C110.816,17.721,111.014,18.543,110.869,19.449z" fill="#179BD7" />
        <path d="M119.295,7.23l-2.807,17.858c-0.055,0.346,0.213,0.658,0.562,0.658h2.822c0.469,0,0.867-0.34,0.939-0.803l2.768-17.536c0.055-0.346-0.213-0.659-0.562-0.659h-3.16C119.578,6.749,119.338,6.953,119.295,7.23z" fill="#179BD7" />
        <path d="M7.266,29.154l0.523-3.322l-1.165-0.027H1.061L4.927,1.292C4.939,1.218,4.978,1.149,5.035,1.1c0.057-0.049,0.13-0.076,0.206-0.076h9.38c3.114,0,5.263,0.648,6.385,1.927c0.526,0.6,0.861,1.227,1.023,1.917c0.17,0.724,0.173,1.589,0.007,2.644l-0.012,0.077v0.676l0.526,0.298c0.443,0.235,0.795,0.504,1.065,0.812c0.45,0.513,0.741,1.165,0.864,1.938c0.127,0.795,0.085,1.741-0.123,2.812c-0.24,1.232-0.628,2.305-1.152,3.183c-0.482,0.809-1.096,1.48-1.825,2c-0.696,0.494-1.523,0.869-2.458,1.109c-0.906,0.236-1.939,0.355-3.072,0.355h-0.73c-0.522,0-1.029,0.188-1.427,0.525c-0.399,0.344-0.663,0.814-0.744,1.328l-0.055,0.299l-0.924,5.855l-0.042,0.215c-0.011,0.068-0.03,0.102-0.058,0.125c-0.025,0.021-0.061,0.035-0.096,0.035H7.266z" fill="#253B80" />
        <path d="M23.048,7.667c-0.028,0.179-0.06,0.362-0.096,0.55c-1.237,6.351-5.469,8.545-10.874,8.545H9.326c-0.661,0-1.218,0.48-1.321,1.132L6.596,26.83l-0.399,2.533c-0.067,0.428,0.263,0.814,0.695,0.814h4.881c0.578,0,1.069-0.42,1.16-0.99l0.048-0.248l0.919-5.832l0.059-0.32c0.09-0.572,0.582-0.992,1.16-0.992h0.73c4.729,0,8.431-1.92,9.513-7.476c0.452-2.321,0.218-4.259-0.978-5.622C24.022,8.286,23.573,7.945,23.048,7.667z" fill="#179BD7" />
        <path d="M21.754,7.151c-0.189-0.055-0.384-0.105-0.584-0.15c-0.201-0.044-0.407-0.083-0.619-0.117c-0.742-0.12-1.555-0.177-2.426-0.177h-7.352c-0.181,0-0.353,0.041-0.507,0.115C9.927,6.985,9.675,7.306,9.614,7.699L8.05,17.605l-0.045,0.289c0.103-0.652,0.66-1.132,1.321-1.132h2.752c5.405,0,9.637-2.195,10.874-8.545c0.037-0.188,0.068-0.371,0.096-0.55c-0.313-0.166-0.652-0.308-1.017-0.429C21.941,7.208,21.848,7.179,21.754,7.151z" fill="#222D65" />
        <path d="M9.614,7.699c0.061-0.393,0.313-0.714,0.652-0.876c0.155-0.074,0.326-0.115,0.507-0.115h7.352c0.871,0,1.684,0.057,2.426,0.177c0.212,0.034,0.418,0.073,0.619,0.117c0.2,0.045,0.395,0.095,0.584,0.15c0.094,0.028,0.187,0.057,0.278,0.086c0.365,0.121,0.704,0.264,1.017,0.429c0.368-2.347-0.003-3.945-1.272-5.392C20.378,0.682,17.853,0,14.622,0h-9.38c-0.66,0-1.223,0.48-1.325,1.133L0.01,25.898c-0.077,0.49,0.301,0.932,0.795,0.932h5.791l1.454-9.225L9.614,7.699z" fill="#253B80" />
    </svg>
);

/* ─────────────────────────────────────────────
   Logo chip definition (logos untouched)
───────────────────────────────────────────── */
const logoChips = [
    {
        id: 'stripe',
        label: 'Stripe',
        logo: (
            <svg viewBox="0 0 60 25" height="20" style={{ width: "auto" }} xmlns="http://www.w3.org/2000/svg">
                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.03 6.26c.43.48 1.01.83 1.99.83 1.53 0 2.57-1.71 2.57-3.94C42.62 10.63 41.53 8.95 40 8.95zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 2.98-1.49 3.6-1.22v3.79c-.28-.06-1.32-.2-2.3.06zm-9.55 4.56c0 2.18 2.3 1.51 2.3 1.51v3.51s-.77.28-1.8.28c-1.95 0-4.11-1.09-4.11-4.7V9.12H8.56V5.57h2.2V2.4l4.11-.88v4.05h2.3v3.55h-2.3v4.81zM4.07 11.5c0 1.1.79 1.5 2.13 2.06 2.1.87 4.59 1.96 4.6 5.29C10.8 21.91 8.3 23 5.65 23c-1.49 0-3.09-.39-4.34-1.06V18.1c1.25.74 2.93 1.26 4.3 1.26.91 0 1.64-.22 1.64-.96 0-1.24-.98-1.67-2.4-2.27C2.7 15.23.27 14.15.27 11.1.27 7.86 2.83 6.3 5.7 6.3c1.4 0 2.8.33 3.89.86v3.8c-.97-.57-2.46-1.01-3.72-1.01-.8 0-1.8.18-1.8.55z" fill="#635BFF" />
            </svg>
        ),
    },
    {
        id: 'visa',
        label: 'Visa',
        logo: (
            <svg viewBox="0 0 780 500" height="26" style={{ width: "auto" }} xmlns="http://www.w3.org/2000/svg">
                <rect width="780" height="500" rx="40" fill="#1434CB" />
                <path d="M293.2 348.73l33.359-195.76h53.358l-33.384 195.76H293.2zm246.11-191.54c-10.57-3.966-27.136-8.222-47.822-8.222-52.725 0-89.863 26.55-90.18 64.603-.299 28.13 26.514 43.822 46.752 53.186 20.771 9.595 27.752 15.714 27.652 24.283-.133 13.123-16.586 19.116-31.924 19.116-21.355 0-32.701-2.967-50.225-10.274l-6.877-3.112-7.488 43.823c12.463 5.466 35.508 10.199 59.438 10.445 56.09 0 92.501-26.248 92.916-66.883.199-22.269-13.986-39.216-44.695-53.188-18.627-9.055-30.032-15.099-29.932-24.268 0-8.137 9.664-16.838 30.561-16.838 17.425-.27 30.058 3.535 39.896 7.5l4.781 2.259 7.147-41.431zm137.83-4.223h-41.23c-12.772 0-22.332 3.486-27.94 16.234l-79.245 179.6h56.031s9.159-24.121 11.231-29.418c6.123 0 60.555.084 68.336.084 1.596 6.853 6.494 29.334 6.494 29.334h49.513l-43.19-195.83zm-65.417 126.41c4.414-11.279 21.26-54.724 21.26-54.724-.314.521 4.381-11.334 7.074-18.684l3.606 16.878s10.217 46.729 12.353 56.527h-44.293v.003zm-363.48-126.41l-52.232 133.5-5.557-27.028c-9.715-31.174-39.95-64.908-73.764-81.803l47.815 171.2 56.487-.063 84.004-195.8-56.753-.009z" fill="white" />
            </svg>
        ),
    },
    {
        id: 'mastercard',
        label: 'Mastercard',
        logo: (
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="Mastercard"
                style={{ height: '34px', width: 'auto' }}
            />
        ),
    },
    {
        id: 'paypal',
        label: 'PayPal',
        logo: <PayPalLogo />,
    },
    {
        id: 'amex',
        label: 'Amex',
        logo: (
            <svg viewBox="0 0 750 471" height="26" style={{ width: "auto" }} xmlns="http://www.w3.org/2000/svg">
                <rect width="750" height="471" rx="40" fill="#006FCF" />
                <path d="M0 332l37.5-166h53.1L127.1 332H91.3l-7.7-30.9H50.5L42.8 332H0zm62.7-62.4h18.4l-9.2-40.7-9.2 40.7zM137.4 332l44.1-166h50.3L256.5 236l24.7-70h50.5l44.1 166h-43.9l-24.1-98.2-27.5 98.2H256l-27.4-98.2L204.7 332h-67.3zM391.7 332l37.5-166h112l-7.4 34h-68.5v28.9h65.5v33.6h-65.5v35.3h69.1l-7.4 34.2H391.7zM567.2 332l-42.9-81.4L567.4 166h47.8l-25.1 42.4L613.9 166h47.3l-43.9 83.1L661.3 332h-48.5l-24.1-46.5L564.5 332h-47.3z" fill="white" />
            </svg>
        ),
    },
];

/* ─────────────────────────────────────────────
   Single logo chip
───────────────────────────────────────────── */
const LogoChip = ({ logo, label }) => (
    <div
        title={label}
        className="group flex-shrink-0 flex items-center justify-center
                   px-6 py-3 rounded-xl bg-white dark:bg-white/[0.05]
                   border border-gray-100 dark:border-white/[0.08]
                   dark:backdrop-blur-xl
                   shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                   hover:shadow-[0_4px_16px_rgba(44,95,141,0.12)] dark:hover:shadow-[0_4px_20px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]
                   hover:border-[#2C5F8D]/20 dark:hover:border-blue-400/20
                   hover:-translate-y-0.5
                   transition-all duration-200 cursor-default"
        style={{ minWidth: '110px' }}
    >
        {logo}
    </div>
);

/* ─────────────────────────────────────────────
   Integration strip (drop-in replacement)
───────────────────────────────────────────── */
const IntegrationsStrip = () => (
    <div className="mt-14">
        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600" />
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
                Intégrations
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600" />
        </div>

        {/* Track wrapper */}
        <div className="relative overflow-hidden rounded-2xl
                        border border-gray-100/80 dark:border-white/[0.08]
                        bg-gradient-to-b from-[#f8fafc] to-white dark:from-white/[0.03] dark:to-white/[0.01]
                        dark:backdrop-blur-xl
                        shadow-[0_2px_24px_rgba(44,95,141,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                        py-6">

            {/* Left fade mask */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10
                            bg-gradient-to-r from-[#f8fafc] dark:from-[#111827] to-transparent" />
            {/* Right fade mask */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10
                            bg-gradient-to-l from-white dark:from-[#0F172A] to-transparent" />

            {/* Scrolling row */}
            <div
                className="flex gap-4 px-6 animate-integrations-scroll w-max"
                style={{ willChange: 'transform' }}
                onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
                onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
            >
                {[...logoChips, ...logoChips].map((chip, i) => (
                    <LogoChip key={`${chip.id}-${i}`} logo={chip.logo} label={chip.label} />
                ))}
            </div>
        </div>

        <style>{`
            @keyframes integrations-scroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-integrations-scroll {
                animation: integrations-scroll 22s linear infinite;
            }
        `}</style>
    </div>
);

/* ─────────────────────────────────────────────
   Main Features component (body unchanged)
───────────────────────────────────────────── */
const Features = () => {
    const features = [
        {
            icon: <LayoutDashboard size={32} />,
            title: "Tableau de bord intuitif",
            description: "Visualisez toutes vos données clés en un coup d'œil : locations actives, revenus, disponibilités et bien plus."
        },
        {
            icon: <Car size={32} />,
            title: "Gestion de flotte",
            description: "Gérez votre parc automobile facilement : ajout de véhicules, maintenance, disponibilité en temps réel."
        },
        {
            icon: <Calendar size={32} />,
            title: "Réservations optimisées",
            description: "Système de réservation intelligent avec calendrier visuel, évitez les doublons et maximisez vos revenus."
        },
        {
            icon: <Users size={32} />,
            title: "Gestion clients",
            description: "Base de données clients complète avec historique, documents et communications centralisés."
        },
        {
            icon: <CreditCard size={32} />,
            title: "Paiements intégrés",
            description: "Acceptez les paiements en ligne, gérez les dépôts, les factures et suivez votre trésorerie."
        },
        {
            icon: <BarChart3 size={32} />,
            title: "Rapports & Analytics",
            description: "Analyses détaillées de performance, rapports financiers et statistiques pour piloter votre activité."
        },
        {
            icon: <FileText size={32} />,
            title: "Contrats digitaux",
            description: "Créez, signez et archivez vos contrats de location électroniquement en toute sécurité."
        },
        {
            icon: <Bell size={32} />,
            title: "Notifications automatiques",
            description: "Alertes pour les retours, maintenances, paiements et communications automatisées avec les clients."
        },
        {
            icon: <Smartphone size={32} />,
            title: "Application mobile",
            description: "Gérez votre activité en déplacement avec nos applications iOS et Android dédiées."
        },
        {
            icon: <Shield size={32} />,
            title: "Sécurité renforcée",
            description: "Vos données sont cryptées et sauvegardées quotidiennement. Conformité RGPD garantie."
        },
        {
            icon: <Clock size={32} />,
            title: "Support 24/7",
            description: "Une équipe d'experts disponible à tout moment pour vous accompagner et résoudre vos problèmes."
        },
        {
            icon: <Headphones size={32} />,
            title: "Formation incluse",
            description: "Accédez à nos tutoriels vidéo, webinaires et bénéficiez d'un accompagnement personnalisé."
        }
    ];

    return (
        <section id="services" className="py-14 sm:py-20 bg-gray-50 dark:bg-[#0B1120]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
                    <div className="inline-flex items-center space-x-2 bg-orange-500/10 dark:bg-orange-500/10 rounded-full px-4 py-2 mb-4">
                        <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">Fonctionnalités complètes</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Tout ce dont vous avez besoin pour gérer votre agence
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                        Une plateforme tout-en-un conçue spécialement pour les professionnels de la location de véhicules.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-white/[0.03] rounded-xl p-5 sm:p-8 dark:backdrop-blur-xl shadow-sm dark:shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-xl dark:hover:shadow-[0_8px_32px_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 border border-gray-100 dark:border-white/[0.08] hover:border-[#2C5F8D] dark:hover:border-blue-400/25 group"
                        >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#2C5F8D] to-[#4A7BA7] rounded-xl flex items-center justify-center text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-10 sm:mt-16 bg-gradient-to-br from-[#2C5F8D] to-[#1E3A5F] rounded-2xl p-7 sm:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">
                            Prêt à transformer votre agence ?
                        </h3>
                        <p className="text-sm sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
                            Rejoignez plus de 500 agences qui ont déjà fait confiance à RentalCar pour digitaliser et développer leur activité.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <a
                                href="#tarifs"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#tarifs', 1000); }}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold text-base sm:text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 text-center"
                            >
                                Essai gratuit 1 mois
                            </a>
                            <a
                                href="#contact"
                                onClick={(e) => { e.preventDefault(); scrollToSection('#contact', 1000); }}
                                className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-white/10 transition-colors font-semibold text-base sm:text-lg text-center"
                            >
                                Demander une démo
                            </a>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-100 mt-4">
                            Sans engagement • Configuration en 5 minutes
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export { IntegrationsStrip };
export default Features;