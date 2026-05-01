import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Building2, Phone, MapPin, FileText, CreditCard,
  Loader2, CheckCircle2, ArrowLeft, ChevronDown, Camera, PenTool, Type, Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/trans-logo.png'
import { uploadSingleFile } from '../../api/uploadApi'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','J&K','Ladakh','Puducherry',
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

export default function BusinessProfile() {
  const { t } = useTranslation()
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(user?.logoUrl || null)
  const [signPreview, setSignPreview] = useState(user?.signatureUrl || null)
  const [logoFile, setLogoFile] = useState(null)
  const [signFile, setSignFile] = useState(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      businessName: user?.businessName || '',
      slogan: user?.slogan || 'Move What Matters',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      gstin: user?.gstin || '',
      panNo: user?.panNo || '',
      alternatePhone: user?.alternatePhone || '',
      wishingName: user?.wishingName || '',
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        businessName: user.businessName || '',
        slogan: user.slogan || 'Move What Matters',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        gstin: user.gstin || '',
        panNo: user.panNo || '',
        alternatePhone: user.alternatePhone || '',
        wishingName: user.wishingName || '',
      })
      if (user.logoUrl) setLogoPreview(user.logoUrl)
      if (user.signatureUrl) setSignPreview(user.signatureUrl)
    }
  }, [user, reset])

  const dataUrlToFile = async (dataUrl, filename = 'image.png') => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type || 'application/octet-stream' })
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      
      // Append text fields
      // Append text fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null && key !== 'id') {
          if (typeof data[key] === 'object' && !(data[key] instanceof File) && !(data[key] instanceof FileList)) {
             formData.append(key, JSON.stringify(data[key]))
          } else {
             formData.append(key, data[key])
          }
        }
      })

      // Append files if selected
      if (logoFile) formData.append('logo', logoFile)
      if (signFile) formData.append('signature', signFile)

      const res = await updateProfile(formData)
      
      if (res.success) {
        setSaved(true)
        setTimeout(() => { 
          setSaved(false)
          navigate('/profile') 
        }, 1200)
      } else {
        alert(res.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Profile update failed:', err)
      alert('Error updating profile. Please try again.')
    }
  }

  const handleImage = (e, setter) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setter(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleLogoPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    handleImage(e, setLogoPreview)
  }

  const handleSignPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSignFile(file)
    handleImage(e, setSignPreview)
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 60 }}>

      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/profile')} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280'
        }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F0D2E', margin: 0 }}>{t('business_profile_title')}</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{t('business_profile_subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Branding Assets */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
           {/* Logo */}
           <div style={{ background: 'white', borderRadius: 24, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
                 {logoPreview ? (
                   <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'contain', background: '#F9FAFB' }} />
                 ) : (
                   <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={logo} alt="Logo Fallback" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>
                 )}
                 <label htmlFor="logo-upload" style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#7C3AED', cursor: 'pointer', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                   <ImageIcon size={14} color="white" />
                   <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoPick} />
                 </label>
              </div>
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E', margin: 0 }}>{t('business_logo')}</p>
           </div>

           {/* Signature */}
           <div style={{ background: 'white', borderRadius: 24, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
                 {signPreview ? (
                   <img src={signPreview} alt="Sign" style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'contain', background: '#F9FAFB' }} />
                 ) : (
                   <div style={{ width: '100%', height: '100%', borderRadius: 16, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <PenTool size={32} color="#DC2626" />
                   </div>
                 )}
                 <label htmlFor="sign-upload" style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#DC2626', cursor: 'pointer', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                   <ImageIcon size={14} color="white" />
                   <input id="sign-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSignPick} />
                 </label>
              </div>
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E', margin: 0 }}>{t('authorized_signature')}</p>
           </div>
        </div>

        {/* Business Details */}
        <div style={{ background: 'white', borderRadius: 24, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: 14, border: '1px solid rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="#7C3AED" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', margin: 0 }}>{t('identity_and_slogan')}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label={t('wishing_name_label')}>
               <div className="input-group">
                 <span className="input-prefix"><Type size={16} /></span>
                 <input {...register('wishingName')} placeholder={t('wishing_name_placeholder')} className="form-input" />
               </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1.5fr', gap: 12 }}>
              <Field label={t('owner_name_label')} error={errors.name} required>
                <input {...register('name', { required: t('name_required') })} placeholder={t('owner_name_label')} className="form-input" />
              </Field>
              <Field label={t('business_name_label')} error={errors.businessName} required>
                <input {...register('businessName', { required: t('business_name_required') })} placeholder={t('business_name_label')} className="form-input" />
              </Field>
            </div>
            <Field label={t('business_slogan_label')}>
               <div className="input-group">
                 <span className="input-prefix"><Type size={16} /></span>
                 <input {...register('slogan')} placeholder={t('business_slogan_placeholder')} className="form-input" />
               </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 12 }}>
              <Field label={t('phone_number')} error={errors.phone} required>
                <input type="tel" {...register('phone', { required: t('phone_required') })} placeholder="98765 43210" className="form-input" inputMode="numeric" />
              </Field>
              <Field label={t('alternate_mobile_label')} error={errors.alternatePhone}>
                <input 
                  type="tel" 
                  {...register('alternatePhone', {
                    validate: (value, formValues) => {
                      if (!value) return true;
                      return value !== formValues.phone || t('phone_alternate_same_error')
                    }
                  })} 
                  placeholder={t('alternate_mobile_label')} 
                  className="form-input" 
                  inputMode="numeric" 
                />
              </Field>
            </div>
            <Field label={t('email_address_label')} error={errors.email}>
              <input 
                type="email" 
                {...register('email', {
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: t('email_invalid')
                  }
                })} 
                placeholder="hello@company.com" 
                className="form-input" 
              />
            </Field>
          </div>
        </div>

        {/* Address & Taxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 24 }}>
           <div style={{ background: 'white', borderRadius: 24, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#2563EB" />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', margin: 0 }}>{t('location')}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                 <Field label={t('detailed_address_label')}>
                    <textarea {...register('address')} placeholder={t('detailed_address_label')} className="form-input" style={{ minHeight: 60 }} />
                 </Field>
                 <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 10 }}>
                    <Field label={t('city')} error={errors.city}>
                      <input 
                        {...register('city', {
                          pattern: { value: /^[A-Za-z\s]+$/, message: t('city_invalid') || 'Only alphabets allowed' }
                        })} 
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                        }}
                        placeholder={t('city')} 
                        className="form-input" 
                      />
                    </Field>
                    <Field label={t('pincode_label')} error={errors.pincode}>
                      <input 
                        {...register('pincode', {
                          pattern: { value: /^[0-9]{6}$/, message: 'Invalid pincode (6 digits required)' }
                        })} 
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setValue('pincode', val)
                        }}
                        placeholder="396191" 
                        className={`form-input ${errors.pincode ? 'error' : ''}`} 
                        maxLength={6} 
                        inputMode="numeric" 
                      />
                    </Field>
                 </div>
              </div>
           </div>

           <div style={{ background: 'white', borderRadius: 24, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#D97706" />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', margin: 0 }}>{t('tax_info')}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                 <Field label={t('pan_number_label')}>
                    <input {...register('panNo')} placeholder="ABCDE1234F" className="form-input" style={{ textTransform: 'uppercase' }} maxLength={10} />
                 </Field>
                 <Field label={t('gstin_optional_label')} error={errors.gstin}>
                    <input 
                      {...register('gstin', {
                        pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/i, message: t('invalid_gstin') }
                      })} 
                      onInput={(e) => {
                        e.target.value = e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 15);
                      }}
                      placeholder="24AAAAA0000A1Z5" 
                      className="form-input" 
                      maxLength={15} 
                    />
                 </Field>
              </div>
           </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: window.innerWidth < 640 ? 'column-reverse' : 'row', gap: 12 }}>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/profile')}>{t('cancel')}</button>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>
            {isSubmitting
              ? <><Loader2 size={18} className="spin" /> {t('updating')}</>
              : saved ? <><CheckCircle2 size={18} /> {t('profile_saved')}</>
              : <><CheckCircle2 size={18} /> {t('update_profile')}</>}
          </button>
        </div>
      </form>

      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
