import { useState, useEffect } from 'react';
import { api } from '../../api/http';
import {
    Car, Users, DollarSign, Calendar, TrendingUp, Sparkles,
    AlertCircle, ArrowUpRight, Building2, Zap
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import PlanBadge from '../../components/dashboard/PlanBadge';
import SubscriptionCounter from '../../components/dashboard/SubscriptionCounter';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardEnterprise() {
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
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500"></div>
            </div>
        );
    }

    const { stats, revenueChart, vehicleStatus, paymentMethods, recentRentals, alerts } = dashboardData;

    const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '', gradient }) => {
        const isPositive = change >= 0;
        return (
            <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {title}
                        </p>
                        <h3 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                        </h3>
                        <div className="flex items-center gap-1">
                            {isPositive ? (
                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-600 rotate-90" />
                            )}
                            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(change)}%
                            </span>
                            <span className={`text-sm ml-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                vs période préc.
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Premium Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className={`text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent`}>
                                Tableau de bord Enterprise
                            </h1>
                            <Sparkles className="w-6 h-6 text-yellow-500" />
                        </div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            Vue complète avec analytics avancées et prédictions IA
                        </p>
                    </div>
                    <PlanBadge plan="Enterprise" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        {/* AI Insights Banner */}
                        <div className={`rounded-xl p-5 border-2 h-full ${
                            darkMode ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                        }`}>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        🤖 Intelligence Artificielle
                                    </h3>
                                    <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <li>• Prédiction: +15% de locations ce weekend (Recommande +2 véhicules)</li>
                                        <li>• Tarification optimale suggérée: $85/jour pour SUV</li>
                                        <li>• Meilleure performance: {stats?.totalVehicles?.current > 0 ? 'Toyota RAV4' : 'Véhicule le plus populaire'} (95% d'utilisation)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <SubscriptionCounter 
                            endDate={dashboardData.enterprise?.subscription_end}
                            status={dashboardData.enterprise?.subscription_status}
                            billingPeriod={dashboardData.enterprise?.billing_period}
                            plan={dashboardData.enterprise?.plan}
                            darkMode={darkMode}
                        />
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Revenu Total"
                        value={stats?.revenue?.current || 0}
                        change={stats?.revenue?.change || 0}
                        icon={DollarSign}
                        prefix="$"
                        gradient="from-green-500 to-emerald-600"
                    />
                    <StatCard
                        title="Locations Actives"
                        value={stats?.activeRentals?.current || 0}
                        change={stats?.activeRentals?.change || 0}
                        icon={Calendar}
                        gradient="from-blue-500 to-indigo-600"
                    />
                    <StatCard
                        title="Total Véhicules"
                        value={stats?.totalVehicles?.current || 0}
                        change={stats?.totalVehicles?.change || 0}
                        icon={Car}
                        gradient="from-cyan-500 to-blue-600"
                    />
                    <StatCard
                        title="Total Clients"
                        value={stats?.customers?.current || 0}
                        change={stats?.customers?.change || 0}
                        icon={Users}
                        gradient="from-purple-500 to-pink-600"
                    />
                </div>

                {/* Advanced Widgets Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Overview */}
                    <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Performance Globale
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Taux d'Utilisation
                                    </span>
                                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        78%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Satisfaction Client
                                    </span>
                                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        92%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Paiements à Jour
                                    </span>
                                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        95%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className={`lg:col-span-2 rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Évolution des Revenus
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={revenueChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e2e8f0'} />
                                <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#64748b'} />
                                <YAxis stroke={darkMode ? '#9ca3af' : '#64748b'} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#1f2937' : '#fff',
                                        border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`,
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="url(#colorRevenue)"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', r: 5 }}
                                    name="Revenu ($)"
                                />
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vehicle Status */}
                    <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            État de la Flotte
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={vehicleStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {vehicleStatus?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Payment Methods */}
                    <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Méthodes de Paiement
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={paymentMethods}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e2e8f0'} />
                                <XAxis dataKey="method" stroke={darkMode ? '#9ca3af' : '#64748b'} />
                                <YAxis stroke={darkMode ? '#9ca3af' : '#64748b'} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#1f2937' : '#fff',
                                        border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`,
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="amount" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#1e40af" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Activité Récente
                    </h3>
                    <div className="space-y-3">
                        {recentRentals?.map((rental) => (
                            <div
                                key={rental.id}
                                className={`flex items-center justify-between p-4 rounded-lg ${
                                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                }`}
                            >
                                <div className="flex-1">
                                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {rental.customer}
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {rental.vehicle}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        ${rental.amount}
                                    </p>
                                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                        {rental.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
