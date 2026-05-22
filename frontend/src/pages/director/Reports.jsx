import { useTheme } from '../../context/ThemeContext';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
    const { darkMode } = useTheme();
    return (
        <div style={{ background: darkMode ? '#0F172A' : '#F8FAFC', minHeight: '100vh', padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: darkMode ? '#94A3B8' : '#475569' }}>
            <BarChart3 size={48} style={{ marginBottom: 16 }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: darkMode ? '#F8FAFC' : '#0F172A', marginBottom: 8 }}>Rapports & Finances</h1>
            <p>Ce module sera bientôt disponible.</p>
        </div>
    );
}
