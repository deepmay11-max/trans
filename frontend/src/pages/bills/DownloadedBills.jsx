import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, ArrowLeft, Calendar, User, Truck } from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { usePageTranslation } from '../../hooks/usePageTranslation'
import TranslatedText from '../../components/TranslatedText'
import dayjs from 'dayjs'

export default function DownloadedBills() {
  const { bills, loaded } = useBills()
  const navigate = useNavigate()

  const { getTranslatedText } = usePageTranslation([
    'Downloaded Bills', 'History of invoices exported as PDF', 'No downloaded bills',
    'Bills you download will appear here', 'Date', 'Party', 'Amount', 'Bill No.',
    'View Invoice', 'Download History', 'Transport', 'Garage'
  ])

  const downloadedBills = useMemo(() => {
    return bills
      .filter(b => b.isDownloaded)
      .sort((a, b) => new Date(b.downloadedAt || b.updatedAt) - new Date(a.downloadedAt || a.updatedAt))
  }, [bills])

  if (!loaded) {
    return (
      <div className="page-wrapper animate-fadeIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="skeleton" style={{ width: '100%', maxWidth: 600, height: 400, borderRadius: 24 }} />
      </div>
    )
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0F0D2E', margin: 0 }}>
            {getTranslatedText('Downloaded Bills')}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>
            {getTranslatedText('History of invoices exported as PDF')}
          </p>
        </div>
      </div>

      {downloadedBills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Download size={32} color="#94A3B8" />
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1E293B' }}>{getTranslatedText('No downloaded bills')}</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>{getTranslatedText('Bills you download will appear here')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {downloadedBills.map(bill => (
            <div 
              key={bill._id} 
              onClick={() => navigate(`/bills/${bill._id}?viewOnly=true`)}
              style={{ 
                background: 'white', borderRadius: 24, padding: '16px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: '0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ 
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: bill.billType === 'garage' ? '#FFF7ED' : '#F5F3FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileText size={22} color={bill.billType === 'garage' ? '#F3811E' : '#7C3AED'} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{bill.billNumber || 'Draft'}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                    {bill.billType === 'garage' ? getTranslatedText('Garage') : getTranslatedText('Transport')}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={12} /> <TranslatedText>{bill.billedToName || bill.customerName || bill.party?.name || '—'}</TranslatedText>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} /> {getTranslatedText('Downloaded on')}: {dayjs(bill.downloadedAt).format('DD MMM YYYY, hh:mm A')}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0F172A' }}>₹{(bill.grandTotal || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16A34A', marginTop: 2 }}>{getTranslatedText('Bill Date')}: {dayjs(bill.billingDate || bill.createdAt).format('DD MMM')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
