import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, IndianRupee, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

const PAYMENT_MODES = [
  { id: 'Cash', label: 'Cash', color: '#16A34A' },
  { id: 'UPI', label: 'UPI', color: '#7C3AED' },
  { id: 'Bank Transfer', label: 'Bank Transfer', color: '#2563EB' },
  { id: 'Cheque', label: 'Cheque', color: '#D97706' },
  { id: 'Card', label: 'Card', color: '#DC2626' },
  { id: 'Online', label: 'Online', color: '#0891B2' },
];

export default function PaymentModal({ isOpen, onClose, bill, onSuccess }) {
  const [step, setStep] = useState('entry'); // 'entry' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paidAmount = bill?.paidAmount || 0;
  const grandTotal = bill?.grandTotal || 0;
  const balanceDue = Math.max(0, grandTotal - paidAmount);

  const [form, setForm] = useState({
    amount: '',
    date: dayjs().format('YYYY-MM-DD'),
    mode: 'Cash',
    notes: '',
  });
  const [lastPayment, setLastPayment] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep('entry');
      setError('');
      setLoading(false);
      setLastPayment(null);
      setForm({
        amount: balanceDue > 0 ? balanceDue.toFixed(2) : '',
        date: dayjs().format('YYYY-MM-DD'),
        mode: 'Cash',
        notes: '',
      });
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      document.body.removeAttribute('data-modal-open');
    }
    return () => document.body.removeAttribute('data-modal-open');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || !bill) return null;

  const handleSubmit = async () => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }
    if (amt > balanceDue + 0.01) {
      setError(`Amount cannot exceed the balance due (₹${balanceDue.toLocaleString('en-IN')}).`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        amount: amt,
        date: form.date,
        mode: form.mode,
        notes: form.notes.trim(),
      };
      if (onSuccess) await onSuccess(payload);
      setLastPayment(payload);
      setStep('success');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  const partyName = bill.party?.name || bill.billedToName || bill.customerName || 'Party';
  const billNo = bill.billNumber || 'Draft';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(15, 13, 46, 0.65)', backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 460,
        background: '#FFFFFF', borderRadius: 28,
        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)',
        position: 'relative', overflow: 'hidden',
        animation: 'pmSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* Header */}
        <div style={{ padding: '22px 24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0F0D2E' }}>
              {step === 'success' ? 'Payment Recorded ✓' : 'Record Payment'}
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
              #{billNo} · {partyName}
            </p>
          </div>
          {step !== 'entry' || !loading ? (
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: 10, border: 'none',
              background: '#F3F4F6', color: '#6B7280', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={18} />
            </button>
          ) : null}
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {step === 'entry' && (
            <>
              {/* Summary Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'Invoice Total', value: grandTotal, color: '#4338CA', bg: '#F0F0FF' },
                  { label: 'Paid So Far', value: paidAmount, color: '#16A34A', bg: '#F0FDF4' },
                  { label: 'Balance Due', value: balanceDue, color: balanceDue > 0 ? '#DC2626' : '#16A34A', bg: balanceDue > 0 ? '#FEF2F2' : '#F0FDF4' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '10px 10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: s.color }}>₹{s.value.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  <IndianRupee size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Amount Received
                </label>
                <input
                  type="number"
                  min="1"
                  max={balanceDue}
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder={`Max ₹${balanceDue.toLocaleString('en-IN')}`}
                  style={{
                    width: '100%', height: 48, borderRadius: 12, border: '2px solid #E5E7EB',
                    padding: '0 14px', fontSize: '1.1rem', fontWeight: 700, color: '#0F0D2E',
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#4F46E5'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Date Input */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Payment Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  max={dayjs().format('YYYY-MM-DD')}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={{
                    width: '100%', height: 44, borderRadius: 12, border: '2px solid #E5E7EB',
                    padding: '0 14px', fontSize: '0.95rem', color: '#0F0D2E',
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#4F46E5'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Payment Mode */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                  <CreditCard size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Payment Mode
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PAYMENT_MODES.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setForm(f => ({ ...f, mode: pm.id }))}
                      style={{
                        padding: '7px 14px', borderRadius: 20, border: '2px solid',
                        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        background: form.mode === pm.id ? pm.color : '#F9FAFB',
                        borderColor: form.mode === pm.id ? pm.color : '#E5E7EB',
                        color: form.mode === pm.id ? '#fff' : '#4B5563',
                      }}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>


              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#DC2626', fontSize: '0.83rem', fontWeight: 600 }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !form.amount}
                style={{
                  width: '100%', height: 52, borderRadius: 14, border: 'none',
                  background: loading || !form.amount ? '#E5E7EB' : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  color: loading || !form.amount ? '#9CA3AF' : '#fff',
                  fontSize: '1rem', fontWeight: 800, cursor: loading || !form.amount ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: loading || !form.amount ? 'none' : '0 6px 20px rgba(79, 70, 229, 0.35)',
                }}
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </>
          )}

          {step === 'success' && lastPayment && (
            <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
              <div style={{
                width: 72, height: 72, background: '#DCFCE7', color: '#16A34A',
                borderRadius: '50%', margin: '0 auto 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pmScaleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F0D2E', marginBottom: 6 }}>Payment Saved!</h4>
              <p style={{ color: '#6B7280', marginBottom: 20, fontSize: '0.9rem' }}>
                ₹{parseFloat(lastPayment.amount).toLocaleString('en-IN')} via {lastPayment.mode} recorded for #{billNo}
              </p>
              <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '14px 16px', marginBottom: 22, textAlign: 'left' }}>
                {[
                  { label: 'Amount', value: `₹${parseFloat(lastPayment.amount).toLocaleString('en-IN')}` },
                  { label: 'Date', value: dayjs(lastPayment.date).format('DD MMM YYYY') },
                  { label: 'Mode', value: lastPayment.mode },
                  ...(lastPayment.notes ? [{ label: 'Notes', value: lastPayment.notes }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 8 }}>
                    <span style={{ color: '#6B7280' }}>{label}</span>
                    <span style={{ fontWeight: 700, color: '#0F0D2E' }}>{value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '100%', height: 50, borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  color: '#fff', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)',
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>

        <style>{`
          @keyframes pmSlideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes pmScaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    </div>
  );
}
