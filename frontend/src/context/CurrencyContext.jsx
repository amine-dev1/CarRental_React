import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { api } from '../api/http';
import { useAuth } from '../auth/AuthContext';

// ─── Currency list with symbols ──────────────────────────────────────────────
export const CURRENCIES = [
    { code: 'MAD', symbol: 'DH', name: 'Dirham marocain' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar américain' },
    { code: 'GBP', symbol: '£', name: 'Livre sterling' },
    { code: 'TND', symbol: 'DT', name: 'Dinar tunisien' },
    { code: 'DZD', symbol: 'DA', name: 'Dinar algérien' },
    { code: 'SAR', symbol: 'SR', name: 'Riyal saoudien' },
    { code: 'AED', symbol: 'AED', name: 'Dirham des EAU' },
    { code: 'XOF', symbol: 'CFA', name: 'Franc CFA (UEMOA)' },
    { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (CEMAC)' },
    { code: 'CAD', symbol: 'CA$', name: 'Dollar canadien' },
    { code: 'CHF', symbol: 'CHF', name: 'Franc suisse' },
    { code: 'TRY', symbol: '₺', name: 'Livre turque' },
    { code: 'QAR', symbol: 'QR', name: 'Riyal qatari' },
    { code: 'KWD', symbol: 'KD', name: 'Dinar koweïtien' },
    { code: 'BHD', symbol: 'BD', name: 'Dinar bahreïni' },
    { code: 'OMR', symbol: 'OR', name: 'Riyal omanais' },
    { code: 'JOD', symbol: 'JD', name: 'Dinar jordanien' },
    { code: 'EGP', symbol: 'E£', name: 'Livre égyptienne' },
    { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain' },
    { code: 'NGN', symbol: '₦', name: 'Naira nigérian' },
    { code: 'KES', symbol: 'KSh', name: 'Shilling kényan' },
    { code: 'GHS', symbol: 'GH₵', name: 'Cedi ghanéen' },
    { code: 'AUD', symbol: 'AU$', name: 'Dollar australien' },
    { code: 'NZD', symbol: 'NZ$', name: 'Dollar néo-zélandais' },
    { code: 'JPY', symbol: '¥', name: 'Yen japonais' },
    { code: 'CNY', symbol: '¥', name: 'Yuan chinois' },
    { code: 'HKD', symbol: 'HK$', name: 'Dollar de Hong Kong' },
    { code: 'SGD', symbol: 'S$', name: 'Dollar de Singapour' },
    { code: 'INR', symbol: '₹', name: 'Roupie indienne' },
    { code: 'BRL', symbol: 'R$', name: 'Réal brésilien' },
    { code: 'MXN', symbol: 'Mex$', name: 'Peso mexicain' },
    { code: 'ARS', symbol: 'AR$', name: 'Peso argentin' },
    { code: 'COP', symbol: 'CO$', name: 'Peso colombien' },
    { code: 'CLP', symbol: 'CLP$', name: 'Peso chilien' },
    { code: 'PEN', symbol: 'S/', name: 'Sol péruvien' },
    { code: 'RUB', symbol: '₽', name: 'Rouble russe' },
    { code: 'PLN', symbol: 'zł', name: 'Złoty polonais' },
    { code: 'CZK', symbol: 'Kč', name: 'Couronne tchèque' },
    { code: 'HUF', symbol: 'Ft', name: 'Forint hongrois' },
    { code: 'SEK', symbol: 'kr', name: 'Couronne suédoise' },
    { code: 'NOK', symbol: 'kr', name: 'Couronne norvégienne' },
    { code: 'DKK', symbol: 'kr', name: 'Couronne danoise' },
    { code: 'ILS', symbol: '₪', name: 'Nouveau shekel israélien' },
    { code: 'MYR', symbol: 'RM', name: 'Ringgit malaisien' },
    { code: 'THB', symbol: '฿', name: 'Baht thaïlandais' },
    { code: 'IDR', symbol: 'Rp', name: 'Roupie indonésienne' },
    { code: 'VND', symbol: '₫', name: 'Dong vietnamien' },
    { code: 'PHP', symbol: '₱', name: 'Peso philippin' },
    { code: 'KRW', symbol: '₩', name: 'Won sud-coréen' },
];

export function getCurrencySymbol(code) {
    return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}

/**
 * Format a price in cents to a readable string using the given currency code.
 * @param {number} cents
 * @param {string} currencyCode
 * @param {object} options
 */
export function formatPrice(cents, currencyCode = 'MAD', options = {}) {
    if (cents == null || isNaN(cents)) return '—';
    const amount = cents / 100;
    const symbol = getCurrencySymbol(currencyCode);
    const decimals = options.decimals ?? 2;
    const formatted = amount.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return options.symbolAfter !== false
        ? `${formatted} ${symbol}`
        : `${symbol} ${formatted}`;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const CurrencyContext = createContext({ currency: 'MAD', reload: () => {} });

export function CurrencyProvider({ children }) {
    const { user } = useAuth();
    const [currency, setCurrency] = useState('MAD');

    const load = useCallback(async () => {
        if (!user?.enterprise_id) return;
        try {
            const data = await api('/api/company/me');
            if (data?.currency) setCurrency(data.currency);
        } catch (_) {
            // silently fail — default stays MAD
        }
    }, [user?.enterprise_id]);

    useEffect(() => { load(); }, [load]);

    return (
        <CurrencyContext.Provider value={{ currency, reload: load, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}
