import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Hash, Check, ArrowLeft, Loader2, Upload, Image as ImageIcon, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/http';
import PhoneInput from '../../components/PhoneInput';
import { CountrySelect, CitySelect, CurrencySelect } from '../../components/CountryCitySelect';
import { Country } from 'country-state-city';
import { CURRENCIES, useCurrency } from '../../context/CurrencyContext';

const token = {
    primary: '#6366F1', primaryLight: '#EEF2FF',
    neutral50: '#F8FAFC', neutral100: '#F1F5F9', neutral200: '#E2E8F0',
    neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
    dark800: '#1E293B', dark900: '#0F172A', dark700: '#334155',
};

function InputField({ icon: Icon, label, value, onChange, placeholder, type = "text", disabled = false, required = false, darkMode }) {
    const textPrimary = darkMode ? '#F8FAFC' : token.neutral900;
    const textSecondary = darkMode ? token.neutral400 : token.neutral600;
    const inputBg = darkMode ? token.dark900 : '#fff';
    const border = darkMode ? token.dark700 : token.neutral200;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: textSecondary }}>
                {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 14, color: textSecondary, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                    <Icon size={18} />
                </div>
                <input
                    type={type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    style={{
                        width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, fontSize: 14,
                        background: disabled ? (darkMode ? '#0a111e' : token.neutral50) : inputBg,
                        color: disabled ? textSecondary : textPrimary,
                        border: `1px solid ${border}`, outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.2s', cursor: disabled ? 'not-allowed' : 'text',
                    }}
                    onFocus={e => !disabled && (e.target.style.borderColor = token.primary)}
                    onBlur={e => !disabled && (e.target.style.borderColor = border)}
                />
            </div>
        </div>
    );
}

export default function EnterpriseProfile() {
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const { reload: reloadCurrency } = useCurrency();

    const bg = darkMode ? token.dark900 : token.neutral50;
    const cardBg = darkMode ? token.dark800 : '#fff';
    const border = darkMode ? token.dark700 : token.neutral200;
    const textPrimary = darkMode ? '#F8FAFC' : token.neutral900;
    const textSecondary = darkMode ? token.neutral400 : token.neutral600;

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const data = await api('/api/company/me');
            setForm(data);
            if (data.country) {
                const c = Country.getAllCountries().find(c => c.name === data.country);
                if (c) setCountryCode(c.isoCode);
            }
        } catch (err) {
            setError("Impossible de charger les données de l'entreprise.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const updated = await api('/api/company/me', {
                method: 'PATCH',
                body: form
            });
            setForm(updated);
            reloadCurrency(); // Refresh currency across the app
            setSuccess('Profil entreprise mis à jour avec succès.');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg }}>
                <Loader2 size={32} color={token.primary} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!form) return null;

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '36px 28px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <button 
                        onClick={() => navigate('/director/admin')}
                        style={{ 
                            background: cardBg, border: `1px solid ${border}`, borderRadius: '50%', 
                            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: textSecondary, transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = token.primary; e.currentTarget.style.color = token.primary; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textSecondary; }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: textPrimary }}>
                            Profil de l'entreprise
                        </h1>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>
                            Modifiez les informations légales et de contact de votre société.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div style={{
                    background: cardBg, border: `1px solid ${border}`, borderRadius: 20,
                    padding: 36, boxShadow: darkMode ? 'none' : '0 10px 30px rgba(0,0,0,0.02)'
                }}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* Section: Logo Entreprise */}
                        <div>
                            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: token.primary, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ImageIcon size={16} /> Logo de l'entreprise
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                <div style={{
                                    width: 100, height: 100, borderRadius: 20, flexShrink: 0,
                                    background: darkMode ? token.dark900 : token.neutral50,
                                    border: `1px dashed ${border}`, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                }}>
                                    {form.logo_url ? (
                                        <img src={form.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Building2 size={32} color={token.neutral400} />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                                        background: darkMode ? token.dark900 : token.neutral50, color: textPrimary,
                                        border: `1px solid ${border}`, borderRadius: 10, cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                                        fontSize: 14, fontWeight: 600, transition: 'all 0.2s', opacity: uploadingLogo ? 0.7 : 1
                                    }}
                                        onMouseEnter={e => !uploadingLogo && (e.currentTarget.style.borderColor = token.primary)}
                                        onMouseLeave={e => !uploadingLogo && (e.currentTarget.style.borderColor = border)}
                                    >
                                        {uploadingLogo ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={18} />}
                                        {uploadingLogo ? 'Envoi en cours...' : 'Changer le logo'}
                                        <input
                                            type="file" accept="image/*" disabled={uploadingLogo}
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setUploadingLogo(true);
                                                try {
                                                    const fd = new FormData();
                                                    fd.append('logo', file);
                                                    const authToken = localStorage.getItem('token');
                                                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
                                                    const res = await fetch(`${apiUrl}/api/upload/enterprise-logo`, {
                                                        method: 'POST',
                                                        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                                                        body: fd,
                                                    });
                                                    const data = await res.json();
                                                    if (!res.ok) throw new Error(data.error || 'Upload failed');
                                                    setForm(f => ({ ...f, logo_url: data.url }));
                                                    setSuccess('Logo importé avec succès. (Cliquez sur Enregistrer pour valider)');
                                                    setTimeout(() => setSuccess(''), 4000);
                                                } catch (err) {
                                                    setError(err.message || 'Erreur lors de l\'upload');
                                                } finally {
                                                    setUploadingLogo(false);
                                                }
                                            }}
                                        />
                                    </label>
                                    <p style={{ margin: '8px 0 0', fontSize: 13, color: textSecondary }}>
                                        Format recommandé : PNG ou JPG (max 5Mo). Le logo sera affiché sur vos factures et contrats.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Informations Générales */}
                        <div>
                            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: token.primary, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Building2 size={16} /> Informations Générales
                            </h2>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                <InputField darkMode={darkMode} icon={Building2} label="Nom de l'entreprise" value={form.name} onChange={val => setForm({...form, name: val})} placeholder="Mon Auto" required />
                                <InputField darkMode={darkMode} icon={Building2} label="Raison sociale (Nom légal)" value={form.legal_name} onChange={val => setForm({...form, legal_name: val})} placeholder="Mon Auto SAS" />
                            </div>
                        </div>

                        {/* Section: Contact */}
                        <div>
                            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: token.primary, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Mail size={16} /> Coordonnées de contact
                            </h2>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                                <InputField darkMode={darkMode} icon={Mail} type="email" label="Email de l'entreprise" value={form.email} onChange={val => setForm({...form, email: val})} placeholder="contact@monauto.fr" />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: textSecondary }}>Téléphone principal</label>
                                    <PhoneInput darkMode={darkMode} value={form.phone || form.enterprise_phone || ''} onChange={val => setForm({...form, phone: val, enterprise_phone: val})} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                <div style={{ flex: 2, minWidth: 250 }}>
                                    <InputField darkMode={darkMode} icon={MapPin} label="Adresse" value={form.address} onChange={val => setForm({...form, address: val})} placeholder="123 Rue de la République" />
                                </div>
                                <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: textSecondary }}>Pays</label>
                                    <CountrySelect 
                                        darkMode={darkMode}
                                        value={form.country}
                                        onChange={(name, isoCode) => {
                                            setForm({...form, country: name, city: ''});
                                            setCountryCode(isoCode);
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: textSecondary }}>Ville</label>
                                    <CitySelect 
                                        darkMode={darkMode}
                                        countryCode={countryCode}
                                        value={form.city}
                                        onChange={val => setForm({...form, city: val})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Légal et Fiscal */}
                        <div>
                            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: token.primary, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Hash size={16} /> Identifiants Légaux
                            </h2>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                                <InputField darkMode={darkMode} icon={Hash} label="Numéro SIRET / Registre" value={form.registry_number} onChange={val => setForm({...form, registry_number: val})} placeholder="123 456 789 00012" />
                                <InputField darkMode={darkMode} icon={Hash} label="Numéro de TVA" value={form.vat_number} onChange={val => setForm({...form, vat_number: val})} placeholder="FR12345678901" />
                            </div>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                <InputField darkMode={darkMode} icon={Hash} label="Numéro fiscal / NIF" value={form.tax_number} onChange={val => setForm({...form, tax_number: val})} placeholder="..." />
                                <InputField darkMode={darkMode} icon={Hash} label="IBAN (pour facturation)" value={form.iban} onChange={val => setForm({...form, iban: val})} placeholder="FR76..." />
                            </div>
                        </div>

                        {/* Section: Devise */}
                        <div>
                            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: token.primary, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <DollarSign size={16} /> Devise & Tarification
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: textSecondary }}>
                                    Devise de l'entreprise
                                </label>
                                <CurrencySelect
                                    darkMode={darkMode}
                                    value={form.currency || 'MAD'}
                                    onChange={val => setForm({ ...form, currency: val })}
                                />
                                <p style={{ margin: '6px 0 0', fontSize: 12, color: textSecondary }}>
                                    💡 Cette devise sera utilisée pour tous les tarifs, factures et tableaux de bord de votre entreprise.
                                </p>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {error && (
                            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#FEF2F2', color: '#DC2626', fontSize: 14, fontWeight: 600, border: '1px solid #FECACA' }}>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#DCFCE7', color: '#16A34A', fontSize: 14, fontWeight: 600, border: '1px solid #BBF7D0' }}>
                                {success}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                type="submit" 
                                disabled={saving}
                                style={{
                                    padding: '14px 28px', background: token.primary, color: '#fff',
                                    border: 'none', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer',
                                    fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8,
                                    opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                }}
                                onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'translateY(-1px)')}
                                onMouseLeave={e => !saving && (e.currentTarget.style.transform = 'none')}
                            >
                                {saving ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={18} />}
                                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}
