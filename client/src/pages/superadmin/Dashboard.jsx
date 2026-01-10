import { useEffect, useState } from "react";
import { api } from "../../api/http";
import PageHeader from "../../components/dashboard/PageHeader";
import StatGrid from "../../components/dashboard/StatGrid";
import Card from "../../components/Card";

export default function SuperAdminDashboard() {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchStats() {
        try {
            const data = await api("/api/superadmin/stats");
            setStatsData(data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    const stats = [
        { label: "Enterprises", value: statsData?.enterprises ?? "—", trend: "Global" },
        { label: "Users", value: statsData?.users ?? "—", trend: "Global" },
        { label: "Active Rentals", value: statsData?.rentals ?? "—", trend: "Live" },
        { label: "Revenue", value: `€ ${statsData?.revenue ?? 0}`, trend: "Est." },
    ];

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <PageHeader
                title="SuperAdmin Dashboard"
                subtitle="Global overview of the platform"
            />

            {/* KPI */}
            <StatGrid stats={stats} />

            {/* SYSTEM OVERVIEW */}
            <div className="grid gap-6 lg:grid-cols-3">

                <Card title="System Status">
                    <ul className="space-y-2 text-sm text-slate-500">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                            API online
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                            Authentication stable
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                            Multi-tenant isolation active
                        </li>
                    </ul>
                </Card>

                <Card title="Platform Insights">
                    <p className="text-sm text-slate-500 leading-relaxed">
                        The platform is operating normally.
                        All enterprises are active and no incidents
                        have been reported in the last 24 hours.
                    </p>
                </Card>

                <Card title="Next Actions">
                    <ul className="space-y-2 text-sm text-slate-500">
                        <li>• Review new enterprises</li>
                        <li>• Monitor usage growth</li>
                        <li>• Prepare monthly report</li>
                    </ul>
                </Card>

            </div>
        </div>
    );
}
