import { useState, useEffect, useMemo } from 'react';
import { Users, Search, RefreshCw, Mail, Phone, MapPin, CreditCard, Calendar } from 'lucide-react';
import { api } from '../../api/http';
import { useTheme } from '../../context/ThemeContext';
import { showError } from '../../components/CustomToasts';

function CustomerCard({ customer, darkMode }) {
    const getAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = getAge(customer.date_of_birth);
    const hasLicense = !!customer.driver_license_number;
    const borderColor = hasLicense ? '#8B5CF6' : '#64748B';

    return (
        <div className={`
            relative transition-all duration-200 group
            ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}
        `}>
            {/* Left Border */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5" 
                style={{ backgroundColor: borderColor }}
            />

            {/* Main Content */}
            <div className="p-5 pl-7 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Customer Info */}
                <div className="lg:col-span-5 flex items-center gap-4">
                    <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105
                        ${hasLicense ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-500/10 text-slate-500'}
                    `}>
                        <Users size={22} />
                    </div>
                    <div className="min-w-0">
                        <h3 className={`font-bold truncate text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {customer.full_name}
                        </h3>
                        <p className="text-xs truncate flex items-center gap-1.5 text-gray-500 mt-0.5">
                            {customer.city && (
                                <>
                                    <MapPin size={12} />
                                    {customer.city}
                                </>
                            )}
                            {age && (
                                <>
                                    {customer.city && ' • '}
                                    {age} ans
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="lg:col-span-4 flex items-center gap-6">
                    {customer.phone && (
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                                <Phone size={14} className="text-blue-500" />
                            </div>
                            <div>
                                <div className={`font-bold text-sm leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {customer.phone}
                                </div>
                                <span className="text-[10px] uppercase text-gray-500 font-semibold">Téléphone</span>
                            </div>
                        </div>
                    )}
                    {customer.email && (
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-50'}`}>
                                <Mail size={14} className="text-green-500" />
                            </div>
                            <div>
                                <div className={`font-bold text-xs leading-none truncate max-w-[150px] ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {customer.email}
                                </div>
                                <span className="text-[10px] uppercase text-gray-500 font-semibold">Email</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* License Info */}
                <div className="lg:col-span-3 flex justify-end">
                    {customer.driver_license_number ? (
                        <div className="text-right">
                            <div className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {customer.driver_license_number}
                            </div>
                            <div className="text-xs text-gray-500">Permis</div>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400">Pas de permis</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Customers() {
    const { darkMode } = useTheme();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        setLoading(true);
        try {
            const data = await api('/api/customers');
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers:', error);
            showError('Erreur lors du chargement des clients');
        } finally {
            setLoading(false);
        }
    }

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers;
        
        const query = searchQuery.toLowerCase();
        return customers.filter(c => 
            (c.full_name || '').toLowerCase().includes(query) ||
            (c.email || '').toLowerCase().includes(query) ||
            (c.phone || '').toLowerCase().includes(query) ||
            (c.city || '').toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Gestion des clients
                </h1>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gérez votre portefeuille de clients
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Clients */}
                <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-[#111827]' : 'bg-white'} border ${darkMode ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                    <div className="relative p-6 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-purple-500/12' : 'bg-[#F3E8FF]'}`}>
                                <Users size={24} className="text-[#8B5CF6]" />
                            </div>
                        </div>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {customers.length}
                        </div>
                        <div className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                            Total Clients
                        </div>
                    </div>
                </div>

                {/* With License */}
                <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-[#111827]' : 'bg-white'} border ${darkMode ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                    <div className="relative p-6 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/12' : 'bg-[#DBEAFE]'}`}>
                                <CreditCard size={24} className="text-[#2563EB]" />
                            </div>
                        </div>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {customers.filter(c => c.driver_license_number).length}
                        </div>
                        <div className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                            Avec Permis
                        </div>
                    </div>
                </div>

                {/* Cities */}
                <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-[#111827]' : 'bg-white'} border ${darkMode ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                    <div className="relative p-6 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-500/12' : 'bg-[#DCFCE7]'}`}>
                                <MapPin size={24} className="text-[#16A34A]" />
                            </div>
                        </div>
                        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {new Set(customers.map(c => c.city).filter(Boolean)).size}
                        </div>
                        <div className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                            Villes
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
                            placeholder="Rechercher un client..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all placeholder:text-[#94A3B8] ${
                                darkMode ? 'bg-white/5 border-white/10 text-[#F1F5F9]' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                            }`}
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={loadCustomers}
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

            {/* Customers Grid */}
            <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${darkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <RefreshCw size={32} className="text-purple-500 animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">Chargement des clients...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <Users size={32} className="text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {customers.length === 0 ? 'Aucun client trouvé' : 'Aucun résultat'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {customers.length === 0 ? 'Commencez par ajouter votre premier client' : 'Essayez de modifier votre recherche'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {filteredCustomers.map((customer) => (
                                <CustomerCard key={customer.id} customer={customer} darkMode={darkMode} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
