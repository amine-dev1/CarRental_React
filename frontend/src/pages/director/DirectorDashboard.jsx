import { useState, useEffect } from 'react';
import { api } from '../../api/http';
import DashboardFree from './DashboardFree';
import DashboardPro from './DashboardPro';
import DashboardEnterprise from './DashboardEnterprise';

export default function DirectorDashboard() {
    const [enterprisePlan, setEnterprisePlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnterprisePlan = async () => {
            try {
                const data = await api('/api/company/dashboard');
                // Assuming the API returns enterprise info including plan
                setEnterprisePlan(data.enterprise?.plan || 'Free');
            } catch (err) {
                console.error("Failed to fetch enterprise plan:", err);
                setEnterprisePlan('Free'); // Default to Free on error
            } finally {
                setLoading(false);
            }
        };
        fetchEnterprisePlan();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500"></div>
            </div>
        );
    }

    // Render the appropriate dashboard based on the enterprise plan
    switch (enterprisePlan) {
        case 'Enterprise':
            return <DashboardEnterprise />;
        case 'Pro':
            return <DashboardPro />;
        case 'Free':
        default:
            return <DashboardFree />;
    }
}
