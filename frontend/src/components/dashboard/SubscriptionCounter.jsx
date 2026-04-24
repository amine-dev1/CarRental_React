import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

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

const SubscriptionCounter = ({ endDate, status, billingPeriod, plan, darkMode }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!endDate) return;

        const calculateTimeLeft = () => {
            const difference = new Date(endDate) - new Date();
            
            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                expired: false
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [endDate]);

    if (plan === 'Standard') return null;
    if (!timeLeft) return null;

    const isExpiringSoon = timeLeft.days < 7 && !timeLeft.expired;

    const bgState = timeLeft.expired 
        ? (darkMode ? '#1E293B' : token.dangerLight)
        : isExpiringSoon 
            ? (darkMode ? '#1E293B' : token.warningLight)
            : (darkMode ? '#1E293B' : '#fff');

    const borderState = timeLeft.expired 
        ? (darkMode ? '#475569' : '#FECACA')
        : isExpiringSoon 
            ? (darkMode ? '#475569' : '#FDE68A')
            : (darkMode ? '#334155' : token.neutral200);

    const iconColor = timeLeft.expired ? token.danger : isExpiringSoon ? token.warning : token.primary;
    const IconCmp = timeLeft.expired ? AlertTriangle : isExpiringSoon ? Clock : ShieldCheck;

    return (
        <div style={{
            background: bgState,
            border: `1px solid ${borderState}`,
            borderRadius: 16, padding: '24px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${iconColor}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <IconCmp size={16} color={iconColor} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#F1F5F9' : token.neutral900 }}>
                        Abonnement : {plan}
                    </span>
                </div>
                <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
                    background: status === 'active' ? (darkMode ? '#064E3B' : token.successLight) : (darkMode ? '#7F1D1D' : token.dangerLight),
                    color: status === 'active' ? (darkMode ? '#34D399' : token.success) : (darkMode ? '#FCA5A5' : token.danger),
                    border: `1px solid ${status === 'active' ? (darkMode ? '#059669' : '#A7F3D0') : (darkMode ? '#DC2626' : '#FECACA')}`
                }}>
                    {status}
                </span>
            </div>

            {timeLeft.expired ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ color: token.danger, fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Abonnement expiré</p>
                    <p style={{ fontSize: 12, color: token.neutral400, margin: 0 }}>Veuillez renouveler votre abonnement pour continuer.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                    {[
                        { label: 'Jours', value: timeLeft.days },
                        { label: 'Heures', value: timeLeft.hours },
                        { label: 'Min', value: timeLeft.minutes },
                        { label: 'Sec', value: timeLeft.seconds }
                    ].map((item, i) => (
                        <React.Fragment key={item.label}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: darkMode ? '#F1F5F9' : token.neutral900, lineHeight: 1.2 }}>
                                    {item.value}
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: token.neutral400, letterSpacing: '0.05em' }}>
                                    {item.label}
                                </div>
                            </div>
                            {i < 3 && <div style={{ fontSize: 20, fontWeight: 300, color: darkMode ? '#475569' : token.neutral200 }}>:</div>}
                        </React.Fragment>
                    ))}
                </div>
            )}

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${darkMode ? '#334155' : token.neutral100}` }}>
                <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: token.neutral400, margin: '0 0 8px' }}>
                    <span>Prochain renouvellement</span>
                    <span style={{ fontWeight: 600, color: darkMode ? '#CBD5E1' : token.neutral600 }}>
                        {new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: token.neutral400, margin: 0 }}>
                    <span>Cycle de paiement</span>
                    <span style={{ fontWeight: 600, color: darkMode ? '#CBD5E1' : token.neutral600, textTransform: 'capitalize' }}>
                        {billingPeriod === 'yearly' ? 'Annuel' : 'Mensuel'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SubscriptionCounter;
