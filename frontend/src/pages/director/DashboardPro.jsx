import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/http';
import {
    TrendingUp, Car, Users, DollarSign, Calendar,
    ChevronRight, Plus, Settings, AlertCircle,
    ArrowUpRight, ArrowDownRight, Compass, BarChart2,
    Building2, Clock
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import SubscriptionCounter from '../../components/dashboard/SubscriptionCounter';
import { useTheme } from '../../context/ThemeContext';

// ── Design tokens ───────────────────────────────────────
const token = {
    primary: '#6366F1',
    primaryLight: '#EEF2FF',
    primaryBorder: '#C7D2FE',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
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

// ── Components ───────────────────────────────────────────

function InsightCard({ alerts, darkMode }) {
    // For Pro plan, we show an operational insight instead of AI
    const defaultInsight = {
        title: "Suivi Opérationnel",
        text: "Votre flotte est prête pour la semaine. Aucun entretien urgent n'est requis aujourd'hui.",
        actionText: "Voir le planning complet"
    };

    const hasAlerts = alerts && alerts.length > 0;

    return (
        <div style={{
            background: hasAlerts ? (darkMode ? '#1E293B' : token.warningLight) : (darkMode ? '#1E293B' : token.neutral50),
            border: `1px solid ${hasAlerts ? (darkMode ? '#475569' : '#FDE68A') : (darkMode ? '#334155' : token.neutral200)}`,
            borderRadius: 16, padding: 24,
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: darkMode ? '#334155' : '#fff',
                        border: `1px solid ${darkMode ? '#475569' : (hasAlerts ? '#FDE68A' : token.neutral200)}`,
                        borderRadius: 8, padding: '4px 10px', marginBottom: 12,
                    }}>
                        <Compass size={12} color={hasAlerts ? token.warning : token.primary} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: hasAlerts ? token.warning : token.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {hasAlerts ? 'Alertes actives' : 'Point de situation'}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 18, fontWeight: 700, margin: '0 0 8px',
                        color: darkMode ? '#F1F5F9' : token.neutral900,
                        lineHeight: 1.3,
                    }}>
                        {hasAlerts ? 'Attention requise sur votre flotte' : defaultInsight.title}
                    </h2>
                    
                    {hasAlerts ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                            {alerts.map(a => (
                                <p key={a.id} style={{ fontSize: 14, color: darkMode ? '#94A3B8' : token.neutral600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertCircle size={14} color={token.warning} />
                                    {a.message}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p style={{
                            fontSize: 14, color: darkMode ? '#94A3B8' : token.neutral600,
                            margin: '0 0 20px', lineHeight: 1.6,
                        }}>
                            {defaultInsight.text}
                        </p>
                    )}

                    <button style={{
                        fontSize: 13, fontWeight: 600, color: token.primary,
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0,
                    }}>
                        {hasAlerts ? "Gérer les alertes" : defaultInsight.actionText} <ChevronRight size={14} />
                    </button>
                </div>
            </div>
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
            ) : (
                <DeltaBadge change={change} />
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

function ActionLayer({ darkMode, navigate }) {
    const actions = [
        { icon: Plus, label: 'Ajouter un véhicule', sub: 'Élargissez votre flotte', color: token.primary, path: '/director/fleet/new' },
        { icon: BarChart2, label: 'Analyses rapides', sub: 'Consultez les rapports', color: token.success, path: '/director/dashboard' },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.map(({ icon: Icon, label, sub, color, path }) => (
                <button key={label} onClick={() => navigate(path)} style={{
                    background: darkMode ? '#1E293B' : '#fff',
                    border: `1px solid ${darkMode ? '#334155' : token.neutral200}`,
                    borderRadius: 12, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'background 150ms ease, box-shadow 150ms ease',
                }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Icon size={16} color={color} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#F1F5F9' : token.neutral900, marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 12, color: token.neutral400 }}>{sub}</div>
                    </div>
                    <ChevronRight size={16} color={token.neutral400} />
                </button>
            ))}
        </div>
    );
}

function CustomTooltip({ active, payload, label, darkMode }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: darkMode ? '#1E293B' : '#fff',
            border: `1px solid ${darkMode ? '#334155' : token.neutral200}`,
            borderRadius: 10, padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
            <p style={{ fontSize: 12, color: token.neutral400, marginBottom: 4 }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ fontSize: 14, fontWeight: 600, color: p.color, margin: 0 }}>
                    {p.name === 'revenue' ? `$${p.value}` : p.value}
                </p>
            ))}
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────
export default function DashboardPro() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        api('/api/company/dashboard')
            .then(d => setData(d))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
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

    if (!data) return null;

    const { stats, revenueChart, vehicleStatus, recentRentals, alerts, enterprise } = data;
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
                                color: token.success, background: token.successLight, border: `1px solid ${token.success}`,
                                borderRadius: 6, padding: '2px 8px',
                            }}>
                                Pro
                            </span>
                        </div>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>

                {/* ── ZONE 1: INSIGHT + ACTIONS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, marginBottom: 32 }}>
                    <InsightCard alerts={alerts} darkMode={darkMode} />
                    <div>
                        <SectionTitle darkMode={darkMode}>Actions rapides</SectionTitle>
                        <ActionLayer darkMode={darkMode} navigate={navigate} />
                    </div>
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
                            emptyMsg="Aucune location active"
                            darkMode={darkMode}
                        />
                        <KpiBlock
                            label="Agences" icon={Building2}
                            value={stats?.agencies?.current || 0} change={stats?.agencies?.change || 0}
                            emptyMsg="Aucune agence créée"
                            darkMode={darkMode}
                        />
                        <KpiBlock
                            label="Réservations en attente" icon={Clock}
                            value={stats?.reservations?.current || 0} change={stats?.reservations?.change || 0}
                            emptyMsg="Aucune réservation"
                            darkMode={darkMode}
                        />
                    </div>
                </div>

                {/* ── ZONE 3: CHARTS ROW ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>

                    {/* Revenue Trend */}
                    <div style={{
                        background: cardBg, border: `1px solid ${cardBorder}`,
                        borderRadius: 16, padding: '24px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 2px' }}>Tendance des revenus</h3>
                                <p style={{ fontSize: 12, color: textSecondary, margin: 0 }}>Données de la semaine</p>
                            </div>
                        </div>
                        {revenueChart?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={token.primary} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={token.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#F1F5F9'} vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: textSecondary }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: textSecondary }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                                    <Area type="monotone" dataKey="revenue" stroke={token.primary} strokeWidth={2.5}
                                        fill="url(#colorRev)" dot={false} activeDot={{ r: 5, fill: token.primary }} name="revenue" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState
                                message="Aucune donnée de revenu disponible pour le moment."
                                cta="Créer une location"
                                onCta={() => navigate('/director/rentals')}
                            />
                        )}
                    </div>

                    {/* Fleet Status */}
                    <div style={{
                        background: cardBg, border: `1px solid ${cardBorder}`,
                        borderRadius: 16, padding: '24px',
                    }}>
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 2px' }}>Statut Flotte</h3>
                            <p style={{ fontSize: 12, color: textSecondary, margin: 0 }}>Répartition en temps réel</p>
                        </div>
                        {vehicleStatus?.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={vehicleStatus} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#F1F5F9'} vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: textSecondary }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: textSecondary }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                                        <Bar dataKey="value" fill={token.primary} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        ) : (
                            <EmptyState
                                message="Ajoutez votre premier véhicule pour voir les statistiques de flotte."
                                cta="Ajouter un véhicule"
                                onCta={() => navigate('/director/fleet/new')}
                            />
                        )}
                    </div>
                </div>

                {/* ── ZONE 4: OPERATIONS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

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

                    {/* Subscription logic */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <SubscriptionCounter
                            endDate={enterprise?.subscription_end}
                            status={enterprise?.subscription_status}
                            billingPeriod={enterprise?.billing_period}
                            plan={enterprise?.plan}
                            darkMode={darkMode}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
