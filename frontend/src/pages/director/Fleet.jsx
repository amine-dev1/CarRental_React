import { useState, useEffect, useMemo } from 'react';
import { Car, Search, RefreshCw, Plus, Filter } from 'lucide-react';
import { api } from '../../api/http';
import { useTheme } from '../../context/ThemeContext';
import { showError } from '../../components/CustomToasts';

function StatusBadge({ status }) {
    const isAvailable = status === 'available';
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide ${
            isAvailable 
                ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' 
                : 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'
        }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
            {isAvailable ? 'Disponible' : 'Maintenance'}
        </span>
    );
}

function VehicleCard({ vehicle, darkMode }) {
    const price = (vehicle.daily_price_cents / 100).toFixed(0);
    const isAvailable = vehicle.status === 'available';
    const borderColor = isAvailable ? '#10B981' : '#F59E0B';
    
    return (
        <div className={`
            relative transition-all duration-200 group
            ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}
        `}>
            {/* Left Border by Status */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5" 
                style={{ backgroundColor: borderColor }}
            />

            {/* Main Content */}
            <div className="p-5 pl-7 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Vehicle Info */}
                <div className="lg:col-span-4 flex items-center gap-4">
                    <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105
                        ${isAvailable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}
                    `}>
                        <Car size={22} />
                    </div>
                    <div className="min-w-0">
                        <h3 className={`font-bold truncate text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {vehicle.name}
                        </h3>
                        <p className="text-xs truncate text-gray-500 mt-0.5">
                            {vehicle.plate}
                        </p>
                    </div>
                </div>

                {/* Status */}
                <div className="lg:col-span-2">
                    <StatusBadge status={vehicle.status} />
                </div>

                {/* Details */}
                <div className="lg:col-span-4 flex items-center gap-4">
                    {vehicle.year && (
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                                <span className="text-xs font-bold text-blue-500">{vehicle.year}</span>
                            </div>
                            <span className="text-[10px] uppercase text-gray-500 font-semibold">Année</span>
                        </div>
                    )}
                    {vehicle.model && (
                        <div>
                            <div className={`font-bold text-sm leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {vehicle.model}
                            </div>
                            <span className="text-[10px] uppercase text-gray-500 font-semibold">Modèle</span>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="lg:col-span-2 flex justify-end">
                    <div className="text-right">
                        <div className={`text-lg font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                            {price} MAD
                        </div>
                        <div className="text-xs text-gray-500">par jour</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Fleet() {
    const { darkMode } = useTheme();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, available, maintenance

    useEffect(() => {
        loadVehicles();
    }, []);

    async function loadVehicles() {
        setLoading(true);
        try {
            const data = await api('/api/vehicles');
            setVehicles(data);
        } catch (error) {
            console.error('Failed to load vehicles:', error);
            showError('Erreur lors du chargement des véhicules');
        } finally {
            setLoading(false);
        }
    }

    const filteredVehicles = useMemo(() => {
        let result = vehicles;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(v => 
                (v.name || '').toLowerCase().includes(query) ||
                (v.plate || '').toLowerCase().includes(query) ||
                (v.model || '').toLowerCase().includes(query)
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(v => v.status === statusFilter);
        }

        return result;
    }, [vehicles, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: vehicles.length,
            available: vehicles.filter(v => v.status === 'available').length,
            maintenance: vehicles.filter(v => v.status === 'maintenance').length,
        };
    }, [vehicles]);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Gestion de la flotte
                </h1>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gérez tous vos véhicules en un seul endroit
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Vehicles */}
                <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-[#111827]' : 'bg-white'} border ${darkMode ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                    <div className="relative p-6 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-cyan-500/12' : 'bg-[#CCFBF1]'}`}>
                                <Car size={24} className="text-[#0D9488]" />
                            </div>
                        </div>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {stats.total}
                        </div>
                        <div className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                            Total Véhicules
                        </div>
                    </div>
                </div>

                {/* Available Vehicles */}
                <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-[#111827]' : 'bg-white'} border ${darkMode ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                    <div className="relative p-6 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-500/12' : 'bg-[#DCFCE7]'}`}>
                                <Car size={24} className="text-[#16A34A]" />
                            </div>
                        </div>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {stats.available}
                        </div>
                        <div className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                            Disponibles
                        </div>
                    </div>
                </div>

                {/* Maintenance */}
                <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-[#111827]' : 'bg-white'} border ${darkMode ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                    <div className="relative p-6 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-amber-500/12' : 'bg-[#FEF3C7]'}`}>
                                <Car size={24} className="text-[#F59E0B]" />
                            </div>
                        </div>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {stats.maintenance}
                        </div>
                        <div className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                            En Maintenance
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className={`p-4 rounded-2xl shadow-sm border backdrop-blur-sm transition-colors duration-200 ${darkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un véhicule..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7BDE]/20 focus:border-[#4A7BDE] transition-all placeholder:text-[#94A3B8] ${
                                darkMode ? 'bg-white/5 border-white/10 text-[#F1F5F9]' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                            }`}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-[#94A3B8]" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7BDE]/20 focus:border-[#4A7BDE] transition-all ${
                                darkMode ? 'bg-white/5 border-white/10 text-[#F1F5F9]' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                            }`}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="available">Disponible</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={loadVehicles}
                        className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                            darkMode 
                                ? 'text-[#94A3B8] border-white/5 hover:bg-white/5 hover:text-[#F1F5F9]' 
                                : 'text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#94A3B8]'
                        }`}
                    >
                        <RefreshCw size={16} className={`${darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'} group-hover:rotate-180 transition-transform duration-500`} />
                        <span className="hidden sm:inline">Rafraîchir</span>
                    </button>
                </div>
            </div>

            {/* Vehicles Grid */}
            <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${darkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <RefreshCw size={32} className="text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">Chargement des véhicules...</p>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <Car size={32} className="text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {vehicles.length === 0 ? 'Aucun véhicule trouvé' : 'Aucun résultat'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {vehicles.length === 0 ? 'Commencez par ajouter votre premier véhicule' : 'Essayez de modifier vos filtres'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {filteredVehicles.map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} darkMode={darkMode} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
