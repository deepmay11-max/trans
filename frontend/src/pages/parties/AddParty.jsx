import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  User, Phone, MapPin, FileText, CreditCard,
  Building2, Loader2, CheckCircle2, ArrowLeft, ChevronDown, PenLine, Truck, Wrench, Trash2
} from 'lucide-react'
import { useParties } from '../../context/PartyContext'
import { useAuth } from '../../context/AuthContext'
import { usePageTranslation } from '../../hooks/usePageTranslation'
import { uploadSingleFile } from '../../api/uploadApi'

const formatName = (str) => {
  if (!str) return ''
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','J&K','Ladakh','Puducherry',
  'Daman, Diu, and Dadra',
]

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function AddParty() {
  const { id } = useParams()
  const { addParty, updateParty, getParty, parties } = useParties()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState('')
  const [sigPreview, setSigPreview] = useState('')
  const isEdit = Boolean(id)

  const { getTranslatedText } = usePageTranslation([
    'Edit Party', 'Add New Party', 'Party details used for billing', 'Basic Info', 
    'Party Name', 'Phone', 'Email', 'Address', 'Street Address', 'City', 'Pincode', 
    'State', 'Select state...', 'Tax Info', 'GSTIN', 'PAN', 'Customer Signature', 
    'Upload the customer\'s signature image — it will appear on the garage bill.',
    'Upload Signature', 'Change Signature', 'Preview', 'Remove', 'Cancel', 'Saving...',
    'Update Party', 'Add Party', 'Delete this Party permanent', 'Party updated!', 
    'Party added!', 'Redirecting to party list...', 'Building, Street, Area', 
    'e.g. Ramesh Traders', 'Enter valid 10-digit number', 'Invalid email address',
    'City is required', 'State is required', 'Party name is required',
    'Daman, Diu, and Dadra'
  ])

  const derivedPartyType = user?.role === 'garage' ? 'garage' : 'transport'

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '',
      gstin: '', pan: '',
      partyType: derivedPartyType,
    }
  })

  const partyType = watch('partyType')

  useEffect(() => {
    if (isEdit && id) {
      const p = getParty(id)
      if (p) {
        reset({
          name: p.name || '',
          phone: p.phone || '',
          email: p.email || '',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          gstin: p.gstin || '',
          pan: p.pan || '',
          partyType: p.partyType || derivedPartyType,
        })
        if (p.signatureUrl) { setSignatureUrl(p.signatureUrl); setSigPreview(p.signatureUrl) }
      }
    }
  }, [id, isEdit, getParty, reset, parties])

  const handleSigUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setSigPreview(ev.target.result)
      setSignatureUrl(file)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    let uploadedSigUrl = ''
    if (data.partyType === 'garage' && signatureUrl instanceof File) {
      const folder = `trans/users/${user?.phone || 'unknown'}/parties`
      const up = await uploadSingleFile(signatureUrl, { folder })
      uploadedSigUrl = up?.url || ''
    } else if (data.partyType === 'garage' && typeof signatureUrl === 'string') {
      uploadedSigUrl = signatureUrl
    }

    const payload = {
      ...data,
      signatureUrl: data.partyType === 'garage' ? uploadedSigUrl : '',
    }
    if (isEdit) await updateParty(id, payload)
    else await addParty(payload)
    setSaved(true)
    setTimeout(() => navigate(`/${data.partyType}/parties`), 800)
  }

  if (saved) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInUp 0.3s ease both' }}>
        <CheckCircle2 size={32} color="#16A34A" />
      </div>
      <h3 style={{ fontWeight: 800, color: '#0F0D2E' }}>
        {isEdit ? getTranslatedText('Party updated!') : getTranslatedText('Party added!')}
      </h3>
      <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{getTranslatedText('Redirecting to party list...')}</p>
    </div>
  )

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 620, margin: '0 auto', paddingBottom: 40 }}>
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate(`/${derivedPartyType}/parties`)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0F0D2E', margin: 0 }}>
            {isEdit ? getTranslatedText('Edit Party') : getTranslatedText('Add New Party')}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{getTranslatedText('Party details used for billing')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('partyType')} value={derivedPartyType} />

        {/* Basic Info */}
        <div style={{ background: 'white', borderRadius: 20, padding: '20px 20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 14, border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="#7C3AED" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>{getTranslatedText('Basic Info')}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label={getTranslatedText('Party Name')} error={errors.name} required>
              <input
                {...register('name', { required: getTranslatedText('Party name is required') })}
                onBlur={e => setValue('name', formatName(e.target.value))}
                placeholder={getTranslatedText('e.g. Ramesh Traders')}
                className="form-input"
                style={{ textTransform: 'capitalize' }}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={getTranslatedText('Phone')} error={errors.phone} required>
                <input
                  type="tel"
                  {...register('phone', {
                    required: true,
                    pattern: { value: /^[6-9]\d{9}$/, message: getTranslatedText('Enter valid 10-digit number') }
                  })}
                  placeholder="98765 43210"
                  className="form-input"
                  inputMode="numeric"
                  maxLength={10}
                />
              </Field>
              <Field label={getTranslatedText('Email')} error={errors.email}>
                <input
                  type="email"
                  {...register('email', {
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: getTranslatedText('Invalid email address') }
                  })}
                  placeholder="email@example.com"
                  className="form-input"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={{ background: 'white', borderRadius: 20, padding: '20px 20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 14, border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} color="#2563EB" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>{getTranslatedText('Address')}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label={getTranslatedText('Street Address')} error={errors.address}>
              <input
                {...register('address')}
                onBlur={e => setValue('address', formatName(e.target.value))}
                placeholder={getTranslatedText('Building, Street, Area')}
                className="form-input"
                style={{ textTransform: 'capitalize' }}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={getTranslatedText('City')} error={errors.city} required>
                <input
                  {...register('city', { required: getTranslatedText('City is required') })}
                  onBlur={e => setValue('city', formatName(e.target.value))}
                  placeholder="Ahmedabad"
                  className="form-input"
                  style={{ textTransform: 'capitalize' }}
                />
              </Field>
              <Field label={getTranslatedText('Pincode')} error={errors.pincode}>
                <input
                  {...register('pincode', {
                    pattern: { value: /^\d{6}$/, message: '6-digit pincode' }
                  })}
                  placeholder="380001"
                  className="form-input"
                  inputMode="numeric"
                  maxLength={6}
                />
              </Field>
            </div>

            <Field label={getTranslatedText('State')} error={errors.state} required>
              <div style={{ position: 'relative' }}>
                <select
                  {...register('state', { required: getTranslatedText('State is required') })}
                  className="form-input"
                  style={{ appearance: 'none', paddingRight: 36 }}
                >
                  <option value="">{getTranslatedText('Select state...')}</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </Field>
          </div>
        </div>

        {/* Tax Info */}
        <div style={{ background: 'white', borderRadius: 20, padding: '20px 20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 14, border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} color="#D97706" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>{getTranslatedText('Tax Info')}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={getTranslatedText('GSTIN')} error={errors.gstin}>
              <input
                {...register('gstin')}
                onChange={e => setValue('gstin', e.target.value.toUpperCase())}
                placeholder="29ABCDE1234F1Z5"
                className="form-input"
                maxLength={15}
              />
            </Field>
            <Field label={getTranslatedText('PAN')} error={errors.pan}>
              <input
                {...register('pan')}
                onChange={e => setValue('pan', e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="form-input"
                maxLength={10}
              />
            </Field>
          </div>
        </div>

        {/* Signature */}
        {partyType === 'garage' && (
          <div style={{ background: 'white', borderRadius: 20, padding: '20px 20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 14, border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PenLine size={16} color="#D97706" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F0D2E', margin: 0 }}>{getTranslatedText('Customer Signature')}</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: 12 }}>{getTranslatedText('Upload the customer\'s signature image — it will appear on the garage bill.')}</p>

            <label htmlFor="sig-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: '1.5px dashed #D97706', background: '#FFFBEB', color: '#D97706', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
              <PenLine size={15} /> {sigPreview ? getTranslatedText('Change Signature') : getTranslatedText('Upload Signature')}
            </label>
            <input id="sig-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSigUpload} />

            {sigPreview && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>{getTranslatedText('Preview')}:</div>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: 10, background: '#fafafa', display: 'inline-block' }}>
                  <img src={sigPreview} alt="Signature preview" style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain' }} />
                </div>
                <button type="button" onClick={() => { setSignatureUrl(''); setSigPreview('') }} style={{ alignSelf: 'flex-start', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>{getTranslatedText('Remove')}</button>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate(`/${derivedPartyType}/parties`)}>{getTranslatedText('Cancel')}</button>
          <button id="btn-save-party" type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting} style={{ flex: 2 }}>
            {isSubmitting
              ? <><Loader2 size={18} className="spin" /> {getTranslatedText('Saving...')}</>
              : <><CheckCircle2 size={18} /> {isEdit ? getTranslatedText('Update Party') : getTranslatedText('Add Party')}</>}
          </button>
        </div>

        {isEdit && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed #E5E7EB', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm(getTranslatedText('Are you sure you want to delete'))) {
                  const deleted = await deleteParty(id)
                  if (deleted) navigate('/parties')
                }
              }}
              style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={16} /> {getTranslatedText('Delete this Party permanent')}
            </button>
          </div>
        )}
      </form>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
