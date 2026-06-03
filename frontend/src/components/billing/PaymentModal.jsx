import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Landmark, CheckCircle2, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, bill, business, onSuccess }) {
  const [step, setStep] = useState('select'); // 'select', 'processing', 'success'
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setMethod(null);
      setLoading(false);
    }



  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = () => {
    if (!method) return;
    setStep('processing');
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      setLoading(false);
      if (onSuccess) onSuccess(bill.grandTotal);
    }, 2500);
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI (PhonePe, GPay, Paytm)', icon: <Smartphone size={20} />, color: '#7C3AED' },
    { id: 'card', name: 'Debit / Credit Card', icon: <CreditCard size={20} />, color: '#2563EB' },
    { id: 'netbanking', name: 'Net Banking', icon: <Landmark size={20} />, color: '#16A34A' },
    { id: 'wallet', name: 'Wallets', icon: <Wallet size={20} />, color: '#D97706' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, background: 'rgba(15, 13, 46, 0.6)', backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#FFFFFF', borderRadius: 28,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative', overflow: 'hidden',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F0D2E' }}>
              {step === 'success' ? 'Payment Success' : 'Checkout'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
              Invoice #{bill.invoiceNo}
            </p>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: 12, border: 'none',
              background: '#F3F4F6', color: '#6B7280', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <X size={20} />
            </button>
          )}
        </div>

        <div style={{ padding: '0 24px 24px' }}>

          {step === 'select' && (
            <>
              <div style={{
                background: '#F8F9FF', padding: 16, borderRadius: 18,
                border: '1px solid #E0E7FF', marginBottom: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338CA', textTransform: 'uppercase' }}>Amount to Pay</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F0D2E' }}>₹{bill.grandTotal?.toLocaleString()}</div>
                </div>
                <div style={{ padding: '6px 12px', background: '#E0E7FF', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, color: '#4338CA' }}>
                  Secure Pay
                </div>
              </div>

              <div style={{ marginBottom: 12, fontSize: '0.875rem', fontWeight: 700, color: '#4B5563' }}>Select Payment Method</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setMethod(pm.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: 16,
                      borderRadius: 16, cursor: 'pointer', border: '2px solid',
                      transition: 'all 0.2s ease',
                      background: method === pm.id ? '#F5F3FF' : '#FFFFFF',
                      borderColor: method === pm.id ? '#7C3AED' : '#F3F4F6',
                      textAlign: 'left', width: '100%'
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: method === pm.id ? '#7C3AED' : '#F3F4F6',
                      color: method === pm.id ? '#FFFFFF' : pm.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}>
                      {pm.icon}
                    </div>
                    <span style={{ flex: 1, fontWeight: 600, color: method === pm.id ? '#0F0D2E' : '#4B5563' }}>{pm.name}</span>
                    {method === pm.id && <CheckCircle2 size={20} color="#7C3AED" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePay}
                disabled={!method}
                className="btn btn-primary btn-full"
                style={{ marginTop: 24, height: 56, borderRadius: 16, fontSize: '1rem', gap: 10 }}
              >
                Pay Now <ArrowRight size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 16, color: '#9CA3AF', fontSize: '0.75rem' }}>
                <ShieldCheck size={14} /> Secured by trans-billing-gateway
              </div>
            </>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="payment-spinner" style={{
                width: 64, height: 64, border: '4px solid #F3F3F3', borderTop: '4px solid #7C3AED',
                borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite'
              }} />
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F0D2E', marginBottom: 8 }}>Processing Payment</h4>
              <p style={{ color: '#6B7280' }}>Please do not close this window or press back.</p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 80, height: 80, background: '#DCFCE7', color: '#16A34A',
                borderRadius: '50%', margin: '0 auto 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <CheckCircle2 size={40} />
              </div>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F0D2E', marginBottom: 8 }}>Thank You!</h4>
              <p style={{ color: '#6B7280', marginBottom: 24 }}>Your payment of ₹{bill.grandTotal?.toLocaleString()} has been received successfully.</p>

              <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8 }}>
                  <span style={{ color: '#6B7280' }}>Reference No</span>
                  <span style={{ fontWeight: 700, color: '#0F0D2E' }}>#TRX-{Math.floor(Math.random() * 1000000)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#6B7280' }}>Payment Mode</span>
                  <span style={{ fontWeight: 700, color: '#0F0D2E', textTransform: 'uppercase' }}>{method}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn btn-primary btn-full"
                style={{ height: 56, borderRadius: 16 }}
              >
                Done
              </button>
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
