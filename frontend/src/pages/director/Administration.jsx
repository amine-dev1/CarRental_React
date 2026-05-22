import { useState } from 'react';
import { Settings, Users, Building2, Shield, Bell, Database, ChevronRight, Pencil, X, Check, Loader2, Mail, KeyRound, RefreshCw, Camera, Tag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/http';
import PhoneInput from '../../components/PhoneInput';

const token = {
    primary: '#6366F1', primaryLight: '#EEF2FF',
    neutral50: '#F8FAFC', neutral100: '#F1F5F9', neutral200: '#E2E8F0',
    neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
    dark800: '#1E293B', dark900: '#0F172A', dark700: '#334155',
};

function AdminCard({ icon: Icon, title, description, tag, tagColor, onClick }) {
    const { darkMode } = useTheme();
    const cardBg = darkMode ? token.dark800 : '#fff';
    const border = darkMode ? token.dark700 : token.neutral200;
    const textPrimary = darkMode ? '#F8FAFC' : token.neutral900;
    const textSecondary = darkMode ? token.neutral400 : token.neutral600;
    const Component = onClick ? 'button' : 'div';

    return (
        <Component onClick={onClick} style={{
            background: cardBg, border: `1px solid ${border}`, borderRadius: 16,
            padding: '24px', display: 'flex', alignItems: 'center', gap: 16, width: '100%',
            cursor: onClick ? 'pointer' : 'default', outline: 'none', textAlign: 'left',
            transition: 'border-color 0.2s',
        }}
            onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = token.primary)}
            onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = border)}
        >
            <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: darkMode ? token.dark700 : token.primaryLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={22} color={token.primary} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>{title}</span>
                    {tag && (
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: tagColor === 'green' ? '#DCFCE7' : tagColor === 'orange' ? '#FEF3C7' : token.primaryLight,
                            color: tagColor === 'green' ? '#16A34A' : tagColor === 'orange' ? '#D97706' : token.primary,
                        }}>{tag}</span>
                    )}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: textSecondary, lineHeight: 1.5 }}>{description}</p>
            </div>
            {onClick && <ChevronRight size={18} color={textSecondary} />}
        </Component>
    );
}

function EditProfileModal({ user, onClose, onSaved }) {
    const { darkMode } = useTheme();
    const [form, setForm] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        profile_photo: user?.profile_photo || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Email change states
    const [currentEmail, setCurrentEmail] = useState(user?.email || '');
    const [newEmail, setNewEmail] = useState('');
    const [emailEditing, setEmailEditing] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [verifying, setVerifying] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState('');
    const [emailError, setEmailError] = useState('');

    const cardBg = darkMode ? token.dark800 : '#fff';
    const border = darkMode ? token.dark700 : token.neutral200;
    const inputBg = darkMode ? token.dark900 : '#fff';
    const textPrimary = darkMode ? '#F8FAFC' : token.neutral900;
    const textSecondary = darkMode ? token.neutral400 : token.neutral600;
    const labelStyle = { fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 6, display: 'block' };
    const inputStyle = {
        width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
        background: inputBg, color: textPrimary, border: `1px solid ${border}`,
        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    };

    async function handleSave(e) {
        e.preventDefault();
        setError('');
        if (!form.full_name.trim()) { setError('Le nom complet est requis.'); return; }
        setLoading(true);
        try {
            const updated = await api('/api/profile/me', { method: 'PATCH', body: form });
            onSaved(updated);
        } catch (err) {
            setError(err.message || 'Erreur lors de la sauvegarde.');
        } finally {
            setLoading(false);
        }
    }

    async function handlePhotoUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('photo', file);
            const authToken = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/upload/user-photo`, {
                method: 'POST',
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setForm(f => ({ ...f, profile_photo: data.url }));
        } catch (err) {
            setError(err.message || "Erreur lors de l'upload de la photo");
        } finally {
            setUploadingPhoto(false);
        }
    }

    async function handleSendCode() {
        setEmailError('');
        setEmailSuccess('');
        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setEmailError('Saisissez une adresse email valide.');
            return;
        }
        if (newEmail === currentEmail) {
            setEmailError("C'est déjà votre adresse email actuelle.");
            return;
        }
        setSendingCode(true);
        try {
            await api('/api/profile/request-email-change', { method: 'POST', body: { newEmail } });
            setCodeSent(true);
            setCode(['', '', '', '', '', '']);
            setEmailSuccess(`Code envoyé à ${newEmail}. Vérifiez votre boîte email.`);
        } catch (err) {
            setEmailError(err.message || "Erreur d'envoi. Réessayez.");
        } finally {
            setSendingCode(false);
        }
    }

    function handleCodeInput(val, idx) {
        const digit = val.replace(/\D/, '');
        const next = [...code];
        next[idx] = digit;
        setCode(next);
        if (digit && idx < 5) {
            document.getElementById(`ecc-${idx + 1}`)?.focus();
        }
    }

    function handleCodeKeyDown(e, idx) {
        if (e.key === 'Backspace' && !code[idx] && idx > 0) {
            document.getElementById(`ecc-${idx - 1}`)?.focus();
        }
    }

    async function handleVerifyCode() {
        setEmailError('');
        const fullCode = code.join('');
        if (fullCode.length !== 6) { setEmailError('Saisissez le code complet (6 chiffres).'); return; }
        setVerifying(true);
        try {
            const res = await api('/api/profile/confirm-email-change', { method: 'POST', body: { code: fullCode } });
            setCurrentEmail(res.user.email);
            setEmailEditing(false);
            setCodeSent(false);
            setNewEmail('');
            setCode(['', '', '', '', '', '']);
            setEmailSuccess('✅ Email mis à jour avec succès !');
            onSaved(res.user);
        } catch (err) {
            setEmailError(err.message || 'Code incorrect ou expiré.');
        } finally {
            setVerifying(false);
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
            <div style={{
                background: cardBg, borderRadius: 20, padding: 32,
                width: '95%', maxWidth: 500, border: `1px solid ${border}`,
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease-out',
                maxHeight: '92vh', overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: textPrimary }}>Modifier mon profil</h2>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: textSecondary }}>Mettez à jour vos coordonnées</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary, padding: 6, borderRadius: 8 }}>
                        <X size={22} />
                    </button>
                </div>

                {/* ─── PHOTO SECTION ─── */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: token.primaryLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                            border: `2px solid ${border}`
                        }}>
                            {form.profile_photo ? (
                                <img src={form.profile_photo} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: 28, fontWeight: 800, color: token.primary }}>
                                    {(form.full_name || 'D').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <label style={{
                            position: 'absolute', bottom: -4, right: -4, background: token.primary, color: '#fff',
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: uploadingPhoto ? 'wait' : 'pointer', border: `2px solid ${cardBg}`, transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => !uploadingPhoto && (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={e => !uploadingPhoto && (e.currentTarget.style.transform = 'none')}
                        >
                            {uploadingPhoto ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={14} />}
                            <input type="file" accept="image/*" disabled={uploadingPhoto} style={{ display: 'none' }} onChange={handlePhotoUpload} />
                        </label>
                    </div>
                </div>

                {/* ─── EMAIL SECTION ─── */}
                <div style={{ marginBottom: 24, padding: 18, borderRadius: 14, border: `1px solid ${border}`, background: darkMode ? '#0d1520' : token.neutral50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Mail size={15} color={token.primary} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>Adresse email</span>
                        </div>
                        {!emailEditing && !codeSent && (
                            <button onClick={() => { setEmailEditing(true); setEmailError(''); setEmailSuccess(''); }}
                                style={{ fontSize: 12, fontWeight: 700, color: token.primary, background: token.primaryLight, border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>
                                Changer
                            </button>
                        )}
                    </div>

                    {/* Current email */}
                    <div style={{ fontSize: 13, color: textSecondary, wordBreak: 'break-all', marginBottom: (emailEditing || codeSent) ? 14 : 0 }}>
                        {currentEmail}
                    </div>

                    {/* New email input */}
                    {emailEditing && !codeSent && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: textSecondary }}>Nouvelle adresse email</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                                    placeholder="nouveau@email.com"
                                    style={{ ...inputStyle, flex: 1 }}
                                    onFocus={e => e.target.style.borderColor = token.primary}
                                    onBlur={e => e.target.style.borderColor = border}
                                />
                                <button onClick={handleSendCode} disabled={sendingCode} style={{
                                    padding: '0 16px', background: token.primary, color: '#fff', border: 'none',
                                    borderRadius: 10, cursor: sendingCode ? 'not-allowed' : 'pointer',
                                    fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                                    opacity: sendingCode ? 0.7 : 1, flexShrink: 0,
                                }}>
                                    {sendingCode ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Mail size={14} />}
                                    {sendingCode ? '...' : 'Envoyer'}
                                </button>
                            </div>
                            <button onClick={() => { setEmailEditing(false); setEmailError(''); }}
                                style={{ alignSelf: 'flex-start', fontSize: 12, color: textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                Annuler
                            </button>
                        </div>
                    )}

                    {/* 6-digit code verification */}
                    {codeSent && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ fontSize: 13, color: textSecondary, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <KeyRound size={14} color={token.primary} />
                                Code envoyé à&nbsp;<strong style={{ color: textPrimary }}>{newEmail}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                {code.map((digit, i) => (
                                    <input
                                        key={i} id={`ecc-${i}`}
                                        type="text" inputMode="numeric" maxLength={1} value={digit}
                                        onChange={e => handleCodeInput(e.target.value, i)}
                                        onKeyDown={e => handleCodeKeyDown(e, i)}
                                        style={{
                                            width: 46, height: 54, textAlign: 'center', fontSize: 24, fontWeight: 800,
                                            borderRadius: 10, border: `2px solid ${digit ? token.primary : border}`,
                                            background: inputBg, color: textPrimary, outline: 'none',
                                            transition: 'border-color 0.15s',
                                        }}
                                        onFocus={e => e.target.style.borderColor = token.primary}
                                        onBlur={e => e.target.style.borderColor = digit ? token.primary : border}
                                    />
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={handleVerifyCode} disabled={verifying || code.join('').length !== 6}
                                    style={{
                                        flex: 1, padding: '11px 0', background: token.primary, color: '#fff', border: 'none',
                                        borderRadius: 10, cursor: verifying ? 'not-allowed' : 'pointer',
                                        fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        opacity: (verifying || code.join('').length !== 6) ? 0.6 : 1,
                                    }}>
                                    {verifying ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={15} />}
                                    {verifying ? 'Vérification...' : 'Confirmer'}
                                </button>
                                <button onClick={handleSendCode} disabled={sendingCode} title="Renvoyer le code"
                                    style={{ padding: '0 14px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 10, cursor: 'pointer', color: textSecondary, display: 'flex', alignItems: 'center' }}>
                                    <RefreshCw size={15} />
                                </button>
                                <button onClick={() => { setCodeSent(false); setEmailEditing(false); setEmailError(''); }}
                                    style={{ padding: '0 14px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 10, cursor: 'pointer', color: textSecondary, display: 'flex', alignItems: 'center' }}>
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                    )}

                    {emailError && (
                        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 600, border: '1px solid #FECACA' }}>
                            {emailError}
                        </div>
                    )}
                    {emailSuccess && (
                        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: '#DCFCE7', color: '#16A34A', fontSize: 12, fontWeight: 600, border: '1px solid #BBF7D0' }}>
                            {emailSuccess}
                        </div>
                    )}
                </div>

                {/* ─── PROFILE FORM ─── */}
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={labelStyle}>Nom complet *</label>
                        <input
                            value={form.full_name}
                            onChange={e => setForm({ ...form, full_name: e.target.value })}
                            placeholder="John Doe"
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = token.primary}
                            onBlur={e => e.target.style.borderColor = border}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Téléphone</label>
                        <PhoneInput value={form.phone} onChange={val => setForm({ ...form, phone: val })} darkMode={darkMode} />
                    </div>
                    {error && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, border: '1px solid #FECACA' }}>
                            {error}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <button type="submit" disabled={loading} style={{
                            flex: 1, padding: '13px 0', background: token.primary, color: '#fff',
                            border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
                        }}>
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button type="button" onClick={onClose} style={{
                            padding: '0 20px', background: 'transparent', border: `1px solid ${border}`,
                            borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        }}>
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Administration() {
    const { darkMode } = useTheme();
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    const [localUser, setLocalUser] = useState(null);

    const displayUser = localUser || user;

    const bg = darkMode ? token.dark900 : token.neutral50;
    const textPrimary = darkMode ? '#F8FAFC' : token.neutral900;
    const textSecondary = darkMode ? token.neutral400 : token.neutral600;
    const cardBg = darkMode ? token.dark800 : '#fff';
    const border = darkMode ? token.dark700 : token.neutral200;

    function handleSaved(updated) {
        setLocalUser(updated);
        if (typeof setUser === 'function') setUser(prev => ({ ...prev, ...updated }));
        setShowEditModal(false);
    }

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '36px 28px' }}>
            {showEditModal && (
                <EditProfileModal
                    user={displayUser}
                    onClose={() => setShowEditModal(false)}
                    onSaved={handleSaved}
                />
            )}

            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>

                {/* Header */}
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', color: textPrimary }}>Administration</h1>
                    <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>
                        Gestion des paramètres, des utilisateurs et de la configuration de votre espace.
                    </p>
                </div>

                {/* Profile Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    borderRadius: 20, padding: '28px 32px',
                    display: 'flex', alignItems: 'center', gap: 20, color: '#fff',
                    position: 'relative',
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 26, fontWeight: 800, overflow: 'hidden',
                    }}>
                        {displayUser?.profile_photo ? (
                            <img src={displayUser.profile_photo} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            displayUser?.full_name?.charAt(0)?.toUpperCase() || 'D'
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{displayUser?.full_name || 'Directeur'}</div>
                        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{displayUser?.email}</div>
                        {displayUser?.phone && (
                            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>📞 {displayUser.phone}</div>
                        )}
                        <div style={{
                            fontSize: 12, marginTop: 8, padding: '3px 12px',
                            background: 'rgba(255,255,255,0.2)', borderRadius: 20,
                            display: 'inline-block', fontWeight: 700, letterSpacing: '0.03em',
                        }}>
                            Rôle : Directeur
                        </div>
                    </div>
                    <button
                        onClick={() => setShowEditModal(true)}
                        title="Modifier mes coordonnées"
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)',
                            borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#fff',
                            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13,
                            backdropFilter: 'blur(4px)', transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                    >
                        <Pencil size={15} />
                        Modifier
                    </button>
                </div>

                {/* Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: textSecondary, margin: '0 0 8px' }}>
                        Gestion des comptes
                    </h2>
                    <AdminCard onClick={() => navigate('/director/admin/team')} icon={Users} title="Utilisateurs & Équipe" description="Gérez les agents et managers rattachés à votre entreprise." tag="Actif" tagColor="green" />
                    <AdminCard onClick={() => navigate('/director/admin/roles')} icon={Shield} title="Rôles & Permissions" description="Définissez les niveaux d'accès pour chaque membre de l'équipe." tag="Actif" tagColor="green" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: textSecondary, margin: '0 0 8px' }}>
                        Configuration
                    </h2>
                    <AdminCard onClick={() => navigate('/director/admin/enterprise')} icon={Building2} title="Profil de l'entreprise" description="Modifiez le nom, l'adresse et les informations légales de votre société." tag="Actif" tagColor="green" />
                    <AdminCard onClick={() => navigate('/director/admin/categories')} icon={Tag} title="Catégories de véhicules" description="Créez et gérez les catégories pour organiser votre flotte (SUV, Citadine, Luxe…)." tag="Actif" tagColor="green" />
                    <AdminCard onClick={() => navigate('/director/admin/pricing')} icon={Settings} title="Tarification" description="Gérez les règles tarifaires : remises saisonnières, week-end, long terme…" tag="Actif" tagColor="green" />
                    <AdminCard icon={Bell} title="Notifications" description="Configurez les alertes email pour les réservations, retours et maintenance." tag="Bientôt disponible" tagColor="orange" />
                    <AdminCard icon={Database} title="Données & Export" description="Exportez vos données (véhicules, clients, locations) au format CSV ou PDF." tag="Bientôt disponible" tagColor="orange" />
                </div>

                {/* Info footer */}
                <div style={{
                    background: cardBg, border: `1px solid ${border}`, borderRadius: 14,
                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12
                }}>
                    <Settings size={18} color={token.neutral400} />
                    <span style={{ fontSize: 13, color: textSecondary }}>
                        Les fonctionnalités marquées <strong style={{ color: '#D97706' }}>Bientôt disponible</strong> seront ajoutées dans une prochaine mise à jour.
                    </span>
                </div>
            </div>
        </div>
    );
}
