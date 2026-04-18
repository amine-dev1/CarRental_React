import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

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

    return (
        <div className={`rounded-2xl p-4 shadow-sm border ${
            timeLeft.expired 
                ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' 
                : isExpiringSoon 
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20'
            }`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {timeLeft.expired ? (
                        <AlertTriangle className="text-red-500" size={20} />
                    ) : isExpiringSoon ? (
                        <Clock className="text-amber-500" size={20} />
                    ) : (
                        <ShieldCheck className="text-blue-500" size={20} />
                    )}
                    <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Statut de l'abonnement : {plan}
                    </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {status}
                </span>
            </div>

            {timeLeft.expired ? (
                <div className="text-center py-2">
                    <p className="text-red-600 dark:text-red-400 font-bold text-sm">Abonnement expiré</p>
                    <p className="text-[10px] text-gray-500 mt-1">Veuillez renouveler votre abonnement pour continuer à utiliser toutes les fonctionnalités.</p>
                </div>
            ) : (
                <div className="flex items-center justify-around">
                    <div className="text-center">
                        <div className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{timeLeft.days}</div>
                        <div className="text-[9px] text-gray-500 uppercase font-semibold">Jours</div>
                    </div>
                    <div className="text-gray-300 dark:text-gray-700 text-xl font-light">:</div>
                    <div className="text-center">
                        <div className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{timeLeft.hours}</div>
                        <div className="text-[9px] text-gray-500 uppercase font-semibold">Heures</div>
                    </div>
                    <div className="text-gray-300 dark:text-gray-700 text-xl font-light">:</div>
                    <div className="text-center">
                        <div className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{timeLeft.minutes}</div>
                        <div className="text-[9px] text-gray-500 uppercase font-semibold">Min</div>
                    </div>
                    <div className="text-gray-300 dark:text-gray-700 text-xl font-light">:</div>
                    <div className="text-center">
                        <div className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{timeLeft.seconds}</div>
                        <div className="text-[9px] text-gray-500 uppercase font-semibold">Sec</div>
                    </div>
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10">
                <p className="text-[10px] text-gray-500 flex justify-between">
                    <span>Prochain renouvellement :</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                        {new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </p>
                <p className="text-[10px] text-gray-500 flex justify-between mt-1">
                    <span>Cycle de paiement :</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">
                        {billingPeriod === 'yearly' ? 'Annuel' : 'Mensuel'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SubscriptionCounter;
