import { useState, useEffect } from 'react';
import { api } from '../../api/http';
import { Car, Calendar, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingUp, Building2, Clock } from 'lucide-react';
import UpgradeBanner from '../../components/dashboard/UpgradeBanner';
import LockedFeature from '../../components/dashboard/LockedFeature';
import PlanBadge from '../../components/dashboard/PlanBadge';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

// ── Design tokens ───────────────────────────────────────
const token = {
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    neutral50: '#F8FAFC',
    neutral100: '#F1F5F9',
    neutral200: '#E2E8F0',
    neutral400: '#94A3B8',
    neutral600: '#475569',
    neutral900: '#0F172A',
    dark800: '#1E293B',
    dark900: '#0F172A',
};

// ── Helpers ──────────────────────────────────────────────
function DeltaBadge({ change }) {
    const isPositive = change >= 0;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            fontSize: '12px', fontWeight: 600,
            color: isPositive ? token.success : token.danger,
        }}>
            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change)}%
            <span style={{ fontWeight: 400, color: token.neutral400, marginLeft: 2 }}>vs sem. préc.</span>
        </span>
    );
}

function EmptyState({ message, cta, onCta }) {
    return (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ fontSize: '13px', color: token.neutral400, marginBottom: 12 }}>{message}</p>
            {cta && (
                <button onClick={onCta} style={{
                    fontSize: '13px', fontWeight: 600, color: token.primary,
                    background: 'none', border: 'none', cursor: 'pointer'
                }}>
                    {cta} →
                </button>
            )}
        </div>
    );
}

function KpiBlock({ label, value, change, prefix = '', suffix = '', emptyMsg, icon: Icon, darkMode }) {
    const isEmpty = value === 0 || value === null || value === undefined;
    return (
        <div style={{
            background: darkMode ? '#1E293B' : '#fff',
            border: `1px solid ${darkMode ? '#334155' : token.neutral200}`,
            borderRadius: 16, padding: '20px 24px',
            transition: 'box-shadow 150ms ease, transform 150ms ease',
            cursor: 'default',
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: darkMode ? token.neutral400 : token.neutral600 }}>
                    {label}
                </span>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: darkMode ? '#334155' : token.neutral100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={16} color={darkMode ? token.neutral400 : token.neutral600} />
                </div>
            </div>

            <div style={{
                fontSize: 28, fontWeight: 700, marginBottom: 8,
                color: darkMode ? '#F1F5F9' : token.neutral900,
                lineHeight: 1,
            }}>
                {isEmpty ? '—' : `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`}
            </div>

            {isEmpty && emptyMsg ? (
                <p style={{ fontSize: 12, color: token.neutral400, lineHeight: 1.5, margin: 0 }}>
                    {emptyMsg}
                </p>
            ) : change !== undefined ? (
                <DeltaBadge change={change} />
            ) : (
                <p style={{ fontSize: 12, color: token.neutral400, margin: 0 }}>Limite Plan Standard: 5</p>
            )}
        </div>
    );
}

function SectionTitle({ children, darkMode }) {
    return (
        <h3 style={{
            fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: token.neutral400,
            margin: '0 0 16px',
        }}>
            {children}
        </h3>
    );
}

// ── Main Dashboard ────────────────────────────────────────
export default function DashboardStandard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { darkMode } = useTheme();
    const navigate = useNavigate();

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 32, maxWidth: 1200, margin: '0 auto' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        background: darkMode ? '#1E293B' : token.neutral100,
                        borderRadius: 16, height: i === 1 ? 140 : 100,
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                ))}
            </div>
        );
    }

    if (!dashboardData) return null;

    const { stats, recentRentals } = dashboardData;
    const bg = darkMode ? token.dark900 : token.neutral50;
    const cardBg = darkMode ? '#1E293B' : '#fff';
    const cardBorder = darkMode ? '#334155' : token.neutral200;
    const textPrimary = darkMode ? '#F1F5F9' : token.neutral900;
    const textSecondary = darkMode ? token.neutral400 : token.neutral600;

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '32px 28px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0 }}>
                                Vue d'ensemble
                            </h1>
                            <span style={{
                                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                                color: token.neutral600, background: token.neutral100, border: `1px solid ${token.neutral200}`,
                                borderRadius: 6, padding: '2px 8px',
                            }}>
                                Standard
                            </span>
                        </div>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>

                {/* Upgrade Banner */}
                <div style={{ marginBottom: 32 }}>
                    <UpgradeBanner
                        currentPlan="Standard"
                        targetPlan="Pro"
                        message="Votre activité grandit ? Passez au plan Pro pour gérer plus de 5 véhicules, débloquer les analyses poussées et automatisées."
                        features={[
                            "Véhicules et clients illimités",
                            "Analytique avancée et graphiques",
                            "Vue calendrier interactive",
                            "Support prioritaire"
                        ]}
                    />
                </div>

                {/* ── ZONE 2: BUSINESS HEALTH ── */}
                <div style={{ marginBottom: 32 }}>
                    <SectionTitle darkMode={darkMode}>Santé Business</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <KpiBlock
                            label="Revenu total" icon={DollarSign} prefix="$"
                            value={stats?.revenue?.current || 0} change={stats?.revenue?.change || 0}
                            emptyMsg="Aucune transaction — créez votre première location"
                            darkMode={darkMode}
                        />
                        <KpiBlock
                            label="Locations actives" icon={Calendar}
                            value={stats?.activeRentals?.current || 0} change={stats?.activeRentals?.change || 0}
                            emptyMsg="Aucune location active en ce moment"
                            darkMode={darkMode}
                        />
                        <KpiBlock
                            label="Véhicules" icon={Car}
                            value={stats?.totalVehicles?.current || 0}
                            emptyMsg="Ajoutez votre premier véhicule (max 5)"
                            darkMode={darkMode}
                        />
                        <KpiBlock
                            label="Agences" icon={Building2}
                            value={stats?.agencies?.current || 0}
                            emptyMsg="Aucune agence"
                            darkMode={darkMode}
                        />
                        <KpiBlock
                            label="Réser. en attente" icon={Clock}
                            value={stats?.reservations?.current || 0}
                            emptyMsg="Aucune réservation"
                            darkMode={darkMode}
                        />
                    </div>
                </div>

                {/* ── ZONE 3: BLOCKED FEATURES & RECENT ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                    
                    {/* Locked Analytics */}
                    <LockedFeature feature="Analyses & Tendances" requiredPlan="Pro" className="h-full">
                        <div style={{
                            background: cardBg, border: `1px solid ${cardBorder}`,
                            borderRadius: 16, padding: '24px', height: '100%',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 16px' }}>Performance Globale</h3>
                            <div style={{ flex: 1, background: darkMode ? '#0F172A' : token.neutral50, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={48} color={darkMode ? '#334155' : token.neutral200} />
                            </div>
                        </div>
                    </LockedFeature>

                    {/* Operations - Recent Activity */}
                    <div style={{
                        background: cardBg, border: `1px solid ${cardBorder}`,
                        borderRadius: 16, padding: '24px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 2px' }}>Activité récente</h3>
                                <p style={{ fontSize: 12, color: textSecondary, margin: 0 }}>Dernières locations</p>
                            </div>
                            <button onClick={() => navigate('/director/rentals')} style={{
                                fontSize: 12, fontWeight: 600, color: token.primary,
                                background: 'none', border: 'none', cursor: 'pointer',
                            }}>
                                Voir tout →
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {recentRentals?.length > 0 ? recentRentals.slice(0, 5).map(rental => (
                                <div key={rental.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 12px', borderRadius: 10,
                                    background: darkMode ? '#0F172A' : token.neutral50,
                                }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10,
                                            background: `${token.primary}18`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Car size={15} color={token.primary} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: 0 }}>{rental.customer}</p>
                                            <p style={{ fontSize: 11, color: textSecondary, margin: 0 }}>{rental.vehicle}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: textPrimary, margin: 0 }}>${rental.amount}</p>
                                    </div>
                                </div>
                            )) : (
                                <EmptyState
                                    message="Aucune location récente."
                                />
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
