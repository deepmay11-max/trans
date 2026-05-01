import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CreditCard, Loader2, CheckCircle2, ArrowLeft, Smartphone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function BankDetails() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      accountName: user?.bankDetails?.accountName || '',
      accountNumber: user?.bankDetails?.accountNumber || '',
      ifsc: user?.bankDetails?.ifsc || '',
      bankName: user?.bankDetails?.bankName || '',
      upiId: user?.bankDetails?.upiId || '',
    }
  })

  const formatName = (str) => {
    if (!str) return ''
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 500))
    updateProfile({ bankDetails: data })
    setSaved(true)
    setTimeout(() => navigate('/profile'), 1000)
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0F0D2E', margin: 0 }}>Bank Details</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Shown at bottom of invoices</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Bank account card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '20px 20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 14, border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} color="#2563EB" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>Bank Account</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Account Holder Name" error={errors.accountName} required>
              <input 
                id="field-acc-name" 
                {...register('accountName', { required: 'Required' })} 
                onBlur={e => setValue('accountName', formatName(e.target.value))}
                placeholder="Name as per passbook" 
                className={`form-input ${errors.accountName ? 'error' : ''}`} 
                style={{ textTransform: 'capitalize' }}
              />
            </Field>
            <Field label="Account Number" error={errors.accountNumber} required>
              <input id="field-acc-number" {...register('accountNumber', { required: 'Required', pattern: { value: /^\d{9,18}$/, message: '9-18 digits' } })} placeholder="000123456789" className={`form-input ${errors.accountNumber ? 'error' : ''}`} inputMode="numeric" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="IFSC Code" error={errors.ifsc} required>
                <input 
                  id="field-ifsc" 
                  {...register('ifsc', { required: 'Required', pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC' } })} 
                  onChange={e => setValue('ifsc', e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 11))}
                  placeholder="SBIN0001234" 
                  className={`form-input ${errors.ifsc ? 'error' : ''}`} 
                  style={{ textTransform: 'uppercase' }} 
                  maxLength={11} 
                />
              </Field>
              <Field label="Bank Name">
                <input id="field-bank-name" {...register('bankName')} placeholder="State Bank" className="form-input" />
              </Field>
            </div>
          </div>
        </div>

        {/* UPI card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '20px 20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={16} color="#7C3AED" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>UPI ID</h3>
          </div>
          <Field label="UPI ID" error={errors.upiId}>
            <input id="field-upi" {...register('upiId', { pattern: { value: /^[\w.-]+@[\w]+$/, message: 'e.g. name@upi' } })}
              placeholder="name@paytm / 9876543210@upi" className={`form-input ${errors.upiId ? 'error' : ''}`} />
          </Field>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 8 }}>
            💡 A QR code will be auto-generated from your UPI ID and shown on invoices
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/profile')}>Cancel</button>
          <button id="btn-save-bank" type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 size={18} className="spin" /> Saving…</> : <><CheckCircle2 size={18} /> Save Bank Details</>}
          </button>
        </div>
      </form>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
