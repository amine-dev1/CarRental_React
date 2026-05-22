import { useState, useEffect } from 'react';
import { FileText, Edit, PenTool, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { contractsApi } from '../../../api/contracts';
import { showSuccess, showError } from '../../../components/CustomToasts';
import ContractPreview from '../../../components/contracts/ContractPreview';
import SignaturePad from '../../../components/contracts/SignaturePad';

const tokens = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export default function ContractTab({ rental, darkMode, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [step, setStep] = useState('view'); // view | generate | sign
  const [form, setForm] = useState({
    mileage_start: rental.mileage_start || '',
    fuel_level_start: rental.fuel_level_start || 'Plein',
    deposit_amount_cents: rental.deposit_amount_cents || 0,
    notes: rental.notes || ''
  });

  const isSigned = rental.contract_status === 'signed';
  const isPending = rental.contract_status === 'pending_signature';

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contractsApi.generate({
        rental_id: rental.id,
        ...form,
        deposit_amount_cents: parseInt(form.deposit_amount_cents)
      });
      setPreviewHtml(res.html_preview);
      setContractId(res.contract_id);
      setStep('sign');
      showSuccess("Brouillon de contrat généré !");
      if (onUpdate) onUpdate();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (signatureData) => {
    setLoading(true);
    try {
      const res = await contractsApi.sign(contractId, {
        signature_data: signatureData,
        signed_by_name: rental.full_name
      });
      showSuccess("Contrat signé et PDF généré !");
      setStep('view');
      if (onUpdate) onUpdate();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Use contract_id if we have it from the current session, otherwise look up by rental
    const url = contractId 
      ? contractsApi.getDownloadUrl(contractId)
      : contractsApi.getDownloadByRentalUrl(rental.id);
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header Info */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', borderRadius: 12, background: darkMode ? '#1E293B' : '#F8FAFC',
        border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: 10, background: tokens.primary + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={24} color={tokens.primary} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: darkMode ? '#94A3B8' : '#64748B' }}>Statut du contrat</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: darkMode ? '#F8FAFC' : '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              {isSigned ? (
                <>
                  <CheckCircle2 size={20} color={tokens.success} /> 
                  Signé le {new Date(rental.signed_at).toLocaleDateString()}
                </>
              ) : isPending ? (
                <>
                  <PenTool size={20} color={tokens.warning} />
                  En attente de signature
                </>
              ) : (
                <>
                  <Edit size={20} color={tokens.primary} />
                  Non généré (Brouillon)
                </>
              )}
            </div>
          </div>
        </div>

        {isSigned && (
          <button 
            onClick={handleDownload}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: tokens.primary, color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Download size={18} /> Télécharger PDF
          </button>
        )}
      </div>

      {step === 'view' && !isSigned && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <button 
            onClick={() => setStep('generate')}
            style={{
              padding: '12px 24px', background: tokens.primary, color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Générer le contrat
          </button>
        </div>
      )}

      {step === 'generate' && (
        <form onSubmit={handleGenerate} style={{ 
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
          padding: '24px', borderRadius: 16, background: darkMode ? '#1E293B' : '#fff',
          border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`
        }}>
          <h3 style={{ gridColumn: '1 / -1', margin: '0 0 10px', color: darkMode ? '#fff' : '#000' }}>Détails pour le contrat</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? '#94A3B8' : '#64748B' }}>Kilométrage départ</label>
            <input 
              type="number" value={form.mileage_start} onChange={e => setForm({...form, mileage_start: e.target.value})}
              style={{ padding: '10px', borderRadius: 8, border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`, background: darkMode ? '#0F172A' : '#fff', color: darkMode ? '#fff' : '#000' }}
              placeholder="ex: 12500" required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? '#94A3B8' : '#64748B' }}>Niveau carburant</label>
            <select 
              value={form.fuel_level_start} onChange={e => setForm({...form, fuel_level_start: e.target.value})}
              style={{ padding: '10px', borderRadius: 8, border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`, background: darkMode ? '#0F172A' : '#fff', color: darkMode ? '#fff' : '#000' }}
            >
              <option value="Plein">Plein</option>
              <option value="3/4">3/4</option>
              <option value="1/2">1/2</option>
              <option value="1/4">1/4</option>
              <option value="Réserve">Réserve</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? '#94A3B8' : '#64748B' }}>Montant caution (Cents)</label>
            <input 
              type="number" value={form.deposit_amount_cents} onChange={e => setForm({...form, deposit_amount_cents: e.target.value})}
              style={{ padding: '10px', borderRadius: 8, border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`, background: darkMode ? '#0F172A' : '#fff', color: darkMode ? '#fff' : '#000' }}
              placeholder="ex: 500000 for 5000.00"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? '#94A3B8' : '#64748B' }}>Notes / Observations</label>
            <textarea 
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              style={{ padding: '10px', borderRadius: 8, border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`, background: darkMode ? '#0F172A' : '#fff', color: darkMode ? '#fff' : '#000', minHeight: '80px' }}
              placeholder="ex: Petite rayure porte arrière gauche..."
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" onClick={() => setStep('view')} style={{ padding: '10px 20px', background: 'transparent', border: 'none', color: tokens.danger, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: tokens.primary, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              Continuer vers signature
            </button>
          </div>
        </form>
      )}

      {step === 'sign' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: darkMode ? '#fff' : '#000' }}>Prévisualisation & Signature</h3>
            <button onClick={() => setStep('generate')} style={{ fontSize: 13, color: tokens.primary, background: 'none', border: 'none', cursor: 'pointer' }}>Modifier les infos</button>
          </div>

          <ContractPreview html={previewHtml} darkMode={darkMode} />

          <div style={{ 
            padding: '24px', borderRadius: 16, background: darkMode ? '#1E293B' : '#fff',
            border: `2px solid ${tokens.primary}40`
          }}>
            <h4 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, color: darkMode ? '#fff' : '#000' }}>
              <PenTool size={18} color={tokens.primary} />
              Signature Électronique du Client
            </h4>
            <SignaturePad onSign={handleSign} darkMode={darkMode} />
            <p style={{ margin: '12px 0 0', fontSize: 12, color: darkMode ? '#475569' : '#94A3B8', textAlign: 'center' }}>
              En signant ce document, le client accepte les conditions générales de location.
            </p>
          </div>
        </div>
      )}

      {isSigned && (
        <div style={{ 
          padding: '40px', borderRadius: 16, background: darkMode ? '#1E293B' : '#F0FDF4',
          border: `1px dashed ${tokens.success}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: tokens.success + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={32} color={tokens.success} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', color: darkMode ? '#F8FAFC' : '#166534' }}>Contrat Complété</h3>
            <p style={{ margin: 0, fontSize: 14, color: darkMode ? '#94A3B8' : '#15803D' }}>
              Le contrat a été généré, signé et archivé avec succès.
            </p>
          </div>
          <button 
            onClick={handleDownload}
            style={{ marginTop: 8, padding: '10px 20px', background: tokens.success, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
          >
            Voir le document final
          </button>
        </div>
      )}

    </div>
  );
}
