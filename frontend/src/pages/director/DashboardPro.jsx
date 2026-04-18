import { useState, useEffect } from 'react';
import { api } from '../../api/http';
import {
    Car, Users, DollarSign, Calendar, TrendingUp, TrendingDown,
    AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import PlanBadge from '../../components/dashboard/PlanBadge';
import SubscriptionCounter from '../../components/dashboard/SubscriptionCounter';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardPro() {
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

    const { stats, revenueChart, vehicleStatus, paymentMethods, recentRentals, alerts } = dashboardData;

    const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '', iconBg, iconColor }) => {
        const isPositive = change >= 0;
        return (
            <div className={`rounded-xl p-6 shadow-sm ${darkMode ? 'bg-[#111827]' : 'bg-white'}`}>
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
                                <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(change)}%
                            </span>
                            <span className={`text-sm ml-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                vs période préc.
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-lg ${iconBg}`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-2">
                    <div>
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Tableau de bord Professionnel
                        </h1>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Vue complète de votre activité
                        </p>
                    </div>
                    <PlanBadge plan="Pro" />
                </div>

                {/* Top Section: Alerts & Subscription */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {alerts && alerts.length > 0 ? (
                            alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`flex items-center gap-3 p-4 rounded-xl ${
                                        alert.type === 'warning'
                                            ? darkMode ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'
                                            : darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
                                    }`}
                                >
                                    <AlertCircle className={`w-5 h-5 ${alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                                    <span className={`flex-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {alert.message}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className={`p-4 rounded-xl border border-dashed ${darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-200 bg-gray-50/50'}`}>
                                <p className={`text-sm text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Aucune notification pour le moment
                                </p>
                            </div>
                        )}
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

                {/* Stats Grid - 6 KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Revenu Total"
                        value={stats?.revenue?.current || 0}
                        change={stats?.revenue?.change || 0}
                        icon={DollarSign}
                        prefix="$"
                        iconBg={darkMode ? "bg-emerald-500/12" : "bg-[#DCFCE7]"}
                        iconColor="text-[#16A34A]"
                    />
                    <StatCard
                        title="Locations Actives"
                        value={stats?.activeRentals?.current || 0}
                        change={stats?.activeRentals?.change || 0}
                        icon={Calendar}
                        iconBg={darkMode ? "bg-cyan-500/12" : "bg-[#CCFBF1]"}
                        iconColor="text-[#0D9488]"
                    />
                    <StatCard
                        title="Total Véhicules"
                        value={stats?.totalVehicles?.current || 0}
                        change={stats?.totalVehicles?.change || 0}
                        icon={Car}
                        iconBg={darkMode ? "bg-blue-500/12" : "bg-[#DBEAFE]"}
                        iconColor="text-[#2563EB]"
                    />
                    <StatCard
                        title="Total Clients"
                        value={stats?.customers?.current || 0}
                        change={stats?.customers?.change || 0}
                        icon={Users}
                        iconBg={darkMode ? "bg-indigo-500/12" : "bg-[#E0E7FF]"}
                        iconColor="text-[#4F46E5]"
                    />
                    <StatCard
                        title="Taux d'Utilisation"
                        value={76}
                        change={4}
                        icon={TrendingUp}
                        suffix="%"
                        iconBg={darkMode ? "bg-purple-500/12" : "bg-[#F3E8FF]"}
                        iconColor="text-[#9333EA]"
                    />
                    <StatCard
                        title="Revenus Moyens"
                        value={Math.round((stats?.revenue?.current || 0) / (stats?.activeRentals?.current || 1))}
                        change={2}
                        icon={DollarSign}
                        prefix="$"
                        iconBg={darkMode ? "bg-emerald-500/12" : "bg-[#DCFCE7]"}
                        iconColor="text-[#16A34A]"
                    />
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue & Rentals Chart */}
                    <div className={`lg:col-span-2 rounded-xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Tendance Revenus & Locations
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
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
                                    formatter={(value, name) => [
                                        name === 'revenue' ? `$${value}` : value,
                                        name === 'revenue' ? 'Revenu' : 'Locations'
                                    ]}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    name="Revenu ($)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rentals"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', r: 4 }}
                                    name="Locations"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Vehicle Status Pie */}
                    <div className={`rounded-xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
                        <div className="mt-4 space-y-2">
                            {vehicleStatus?.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Methods */}
                    <div className={`rounded-xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Méthodes de Paiement
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
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
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recent Rentals */}
                    <div className={`rounded-xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Locations Récentes
                        </h3>
                        <div className="space-y-3">
                            {recentRentals?.map((rental) => (
                                <div
                                    key={rental.id}
                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                                    } transition-colors`}
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
                                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            ${rental.amount}
                                        </p>
                                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                                            {rental.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
