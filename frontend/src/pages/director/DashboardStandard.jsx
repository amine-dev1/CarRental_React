import { useState, useEffect } from 'react';
import { api } from '../../api/http';
import { Car, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import UpgradeBanner from '../../components/dashboard/UpgradeBanner';
import LockedFeature from '../../components/dashboard/LockedFeature';
import PlanBadge from '../../components/dashboard/PlanBadge';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardStandard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { darkMode } = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api('/api/company/dashboard');
                setDashboardData(data);
            } catch (err) {
                console.error("Failed to fetch dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500"></div>
            </div>
        );
    }

    const { stats, recentRentals } = dashboardData;

    return (
        <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Tableau de bord
                        </h1>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Plan Standard
                        </p>
                    </div>
                    <PlanBadge plan="Standard" />
                </div>

                {/* Upgrade Banner */}
                <UpgradeBanner
                    currentPlan="Standard"
                    targetPlan="Pro"
                    message="Passez au plan Pro pour débloquer des analytics avancées, un calendrier visuel, et plus encore !"
                    features={[
                        "Graphiques et analytics détaillés",
                        "Vue calendrier interactive",
                        "Exports PDF et Excel",
                        "Automatisation des emails",
                        "Jusqu'à 50 véhicules"
                    ]}
                />

                {/* Limit Warning */}
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                    }`}>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <div>
                        <p className={`font-medium ${darkMode ? 'text-amber-300' : 'text-amber-900'}`}>
                            Limites du Plan Standard
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                            Vous pouvez gérer jusqu'à 5 véhicules et 2 utilisateurs
                        </p>
                    </div>
                </div>

                {/* Basic KPIs (3 cards only) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Véhicules
                            </span>
                            <Car className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {stats?.totalVehicles?.current || 0} / 5
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Limite Standard</div>
                    </div>

                    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Locations Actives
                            </span>
                            <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {stats?.activeRentals?.current || 0}
                        </div>
                    </div>

                    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Revenus ce mois
                            </span>
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ${stats?.revenue?.current || 0}
                        </div>
                    </div>
                </div>

                {/* Locked Analytics */}
                <LockedFeature feature="Analytics" requiredPlan="Pro" className="h-64">
                    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} h-full`}>
                        <h3 className="text-lg font-semibold mb-4">Graphiques de revenus</h3>
                        <div className="w-full h-48 bg-gradient-to-r from-cyan-100 to-blue-100 rounded"></div>
                    </div>
                </LockedFeature>

                {/* Recent Rentals Table */}
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Locations Récentes
                    </h3>
                    <div className="space-y-2">
                        {recentRentals?.slice(0, 5).map((rental) => (
                            <div
                                key={rental.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}
                            >
                                <div>
                                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {rental.customer}
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {rental.vehicle}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        ${rental.amount}
                                    </p>
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                        {rental.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Locked Calendar */}
                <LockedFeature feature="Calendrier" requiredPlan="Pro" className="h-96">
                    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} h-full`}>
                        <h3 className="text-lg font-semibold mb-4">Calendrier des locations</h3>
                        <div className="grid grid-cols-7 gap-2">
                            {[...Array(35)].map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </LockedFeature>
            </div>
        </div>
    );
}
