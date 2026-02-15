import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/http";
import PageHeader from "../../components/landing/dashboard/PageHeader";
import { Briefcase, Users, CalendarRange, Euro } from "lucide-react";
import StatCard from "../../components/landing/dashboard/StatCard";
import RevenueChart from "../../components/landing/dashboard/RevenueChart";
import { useTheme } from "../../context/ThemeContext";

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('monthly');

    async function fetchStats() {
        try {
            const data = await api(`/api/superadmin/stats?period=${period}`);
            setStatsData(data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, [period]);

    const stats = [
        { 
            label: "Entreprises", 
            value: statsData?.enterprises ?? "—", 
            icon: Briefcase,
            gradient: darkMode ? "bg-[#111827]" : "bg-white",
            iconBg: darkMode ? "bg-blue-500/12" : "bg-[#DBEAFE]",
            iconColor: "text-[#2563EB]"
        },
        { 
            label: "Utilisateurs", 
            value: statsData?.users ?? "—", 
            icon: Users,
            gradient: darkMode ? "bg-[#111827]" : "bg-white",
            iconBg: darkMode ? "bg-indigo-500/12" : "bg-[#E0E7FF]",
            iconColor: "text-[#4F46E5]"
        },
        { 
            label: "Abonnements Actifs", 
            value: statsData?.activeSubscriptions ?? "—", 
            icon: CalendarRange,
            gradient: darkMode ? "bg-[#111827]" : "bg-white",
            iconBg: darkMode ? "bg-cyan-500/12" : "bg-[#CCFBF1]",
            iconColor: "text-[#0D9488]"
        },
        {
            label: "Revenus",
            value: `${statsData?.revenue ?? 0} MAD`,
            icon: Euro,
            gradient: darkMode ? "bg-[#111827]" : "bg-white",
            iconBg: darkMode ? "bg-emerald-500/12" : "bg-[#DCFCE7]",
            iconColor: "text-[#16A34A]"
        },
    ];

    return (
        <div className="space-y-10">
            {/* HEADER */}
            <PageHeader
                title={`Bonjour, ${user?.full_name || "Super Admin"}`}
                subtitle="Voici l'aperçu global de la plateforme"
            />

            {/* KPI GRID */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* REVENUE CHART */}
            <RevenueChart
                data={statsData?.chartData || []}
                totalRevenue={statsData?.revenue || 0}
                period={period}
                onPeriodChange={setPeriod}
            />
        </div>
    );
}
