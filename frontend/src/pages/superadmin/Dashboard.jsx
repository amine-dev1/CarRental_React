import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/http";
import PageHeader from "../../components/dashboard/PageHeader";
import { Briefcase, Users, CalendarRange, Euro } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import RevenueChart from "../../components/dashboard/RevenueChart";

export default function SuperAdminDashboard() {
    const { user } = useAuth();
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
            label: "Enterprises", 
            value: statsData?.enterprises ?? "—", 
            icon: Briefcase,
            gradient: "bg-gradient-to-br from-[#1c398e] to-[#2851c5]",
            isDark: true
        },
        { 
            label: "Users", 
            value: statsData?.users ?? "—", 
            icon: Users,
            gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20" 
        },
        { 
            label: "Active Rentals", 
            value: statsData?.rentals ?? "—", 
            icon: CalendarRange,
            gradient: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
        },
        {
            label: "Revenue",
            value: `${statsData?.revenue ?? 0} MAD`,
            icon: Euro,
            gradient: "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
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
