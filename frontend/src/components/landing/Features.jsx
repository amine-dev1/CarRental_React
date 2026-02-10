import React from 'react';
import { 
    LayoutDashboard, 
    Car, 
    Users, 
    Calendar, 
    CreditCard, 
    BarChart3, 
    Headphones, 
    Shield,
    Clock,
    FileText,
    Bell,
    Smartphone
} from 'lucide-react';

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
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center space-x-2 bg-[#2C5F8D]/10 rounded-full px-4 py-2 mb-4">
                        <div className="w-2 h-2 bg-[#2C5F8D] rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-[#2C5F8D]">Fonctionnalités complètes</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Tout ce dont vous avez besoin pour gérer votre agence
                    </h2>
                    <p className="text-lg text-gray-600">
                        Une plateforme tout-en-un conçue spécialement pour les professionnels de la location de véhicules.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#2C5F8D] group"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-[#2C5F8D] to-[#4A7BA7] rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-16 bg-gradient-to-br from-[#2C5F8D] to-[#1E3A5F] rounded-2xl p-12 text-center text-white relative overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-4">
                            Prêt à transformer votre agence ?
                        </h3>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                            Rejoignez plus de 500 agences qui ont déjà fait confiance à RentalCar pour digitaliser et développer leur activité.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-white text-[#2C5F8D] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg">
                                Essai gratuit 14 jours
                            </button>
                            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-semibold text-lg">
                                Demander une démo
                            </button>
                        </div>
                        <p className="text-sm text-blue-100 mt-4">
                            Sans engagement • Configuration en 5 minutes
                        </p>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm mb-6">Ils nous font confiance</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
                        <div className="w-32 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="w-32 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="w-32 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="w-32 h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;