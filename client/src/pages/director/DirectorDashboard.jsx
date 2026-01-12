import { useState, useEffect } from 'react';
import api from '../../api/http';
import {
    TrendingUp,
    TrendingDown,
    Car,
    Users,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DirectorDashboard = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get('/company/dashboard');
                setDashboardData(data);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary mx-auto mb-4"></div>
                    <p className="text-text-secondary font-medium">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-surface border border-error/20 p-6 rounded-xl text-center max-w-md">
                    <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-error" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">Erreur de chargement</h3>
                    <p className="text-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const { stats, revenueChart, vehicleStatus, paymentMethods, recentRentals, alerts } = dashboardData;

    const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }) => {
        const isPositive = change >= 0;
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">
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
                            <span className="text-slate-500 text-sm ml-1">vs période préc.</span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-lg ${isPositive ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <Icon className={`w-6 h-6 ${isPositive ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                </div>
            </div>
        );
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            reserved: 'bg-blue-100 text-blue-800',
            completed: 'bg-slate-100 text-slate-800',
            canceled: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.completed;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Tableau de bord Directeur</h1>
                            <p className="text-slate-600 mt-1">Bon retour ! Voici un aperçu de votre activité.</p>
                        </div>
                        <div className="flex gap-2">
                            {['24h', '7d', '30d', '90d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`flex items-center gap-3 p-4 rounded-lg border ${alert.type === 'warning'
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-blue-50 border-blue-200'
                                    }`}
                            >
                                <AlertCircle className={`w-5 h-5 ${alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
                                <span className="flex-1 text-slate-900 font-medium">{alert.message}</span>
                                <span className="text-slate-500 text-sm">{alert.time}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Revenu Total"
                        value={stats.revenue.current}
                        change={stats.revenue.change}
                        icon={DollarSign}
                        prefix="$"
                    />
                    <StatCard
                        title="Locations Actives"
                        value={stats.activeRentals.current}
                        change={stats.activeRentals.change}
                        icon={Calendar}
                    />
                    <StatCard
                        title="Total Véhicules"
                        value={stats.totalVehicles.current}
                        change={stats.totalVehicles.change}
                        icon={Car}
                    />
                    <StatCard
                        title="Total Clients"
                        value={stats.customers.current}
                        change={stats.customers.change}
                        icon={Users}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Tendance Revenus & Locations</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Revenu' : 'Locations']}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Revenu ($)" />
                                <Line type="monotone" dataKey="rentals" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Locations" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Vehicle Status Pie */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">État de la flotte</h3>
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
                                    {vehicleStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {vehicleStatus.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-slate-700 text-sm">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Methods */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Méthodes de paiement</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={paymentMethods}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="method" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recent Rentals */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Locations Récentes</h3>
                        <div className="space-y-3">
                            {recentRentals.map((rental) => (
                                <div key={rental.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">{rental.customer}</p>
                                        <p className="text-sm text-slate-600">{rental.vehicle}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">${rental.amount}</p>
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(rental.status)}`}>
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
};

export default DirectorDashboard;
