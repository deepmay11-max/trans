import { useParams, useNavigate } from 'react-router-dom'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import { usePageTranslation } from '../../hooks/usePageTranslation'
import { ArrowLeft, Printer, Trash2, Download, FileText, Pencil, CheckCircle2 } from 'lucide-react'
import dayjs from 'dayjs'
import { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import PaymentModal from '../../components/billing/PaymentModal'

// ── Transport Consolidated Invoice Layout ────────────────────────────────────
function TransportInvoice({ bill, business, getTranslatedText }) {
  const items = [...(bill.items || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
  const displayDate = bill.billingDate || bill.billDate || bill.createdAt
  const accent = '#F3811E'

  return (
    <div className="invoice-wrap" style={{ color: '#000', fontFamily: 'Inter, sans-serif', padding: '10px', minHeight: '800px', backgroundColor: '#fff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', border: '1px solid #ccc', borderRadius: '4px 4px 0 0' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 52, height: 52, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1.5px solid #F1F5F9' }}>
            {business?.logoUrl
              ? <img src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.4rem', fontWeight: 950, color: '#000' }}>{(business?.businessName || 'B')[0]}</span>
            }
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            {business?.wishingName && (
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#444', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                || {business.wishingName} ||
              </div>
            )}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.9 }}>{business?.businessName?.toUpperCase() || 'KHAN TRANSPORT'}</h1>
          </div>
        </div>
        <div style={{ borderLeft: '1px solid #ccc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', borderBottom: '1px solid #ccc' }}>
            <div style={{ padding: '8px 4px', background: '#fff', fontWeight: 600, fontSize: '0.65rem', textAlign: 'right' }}>{getTranslatedText('Bill No.')}:</div>
            <div style={{ padding: '8px 6px', fontWeight: 800, fontSize: '0.75rem', borderLeft: '1px solid #eee', textAlign: 'left' }}>{bill.billNumber || getTranslatedText('Draft')}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr' }}>
            <div style={{ padding: '8px 4px', background: '#fff', fontWeight: 600, fontSize: '0.65rem', textAlign: 'right' }}>{getTranslatedText('Date')}:</div>
            <div style={{ padding: '8px 6px', fontWeight: 800, fontSize: '0.75rem', borderLeft: '1px solid #eee', textAlign: 'left' }}>{dayjs(displayDate).format('DD/MM/YYYY')}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #ccc', borderTop: 'none' }}>
        <div style={{ padding: '8px 10px', background: '#fdf3f0', borderRight: '1px solid #ccc' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: 2 }}>{getTranslatedText('FROM')}: <span style={{ fontWeight: 900 }}>{business?.businessName}</span></div>
          <div style={{ fontSize: '0.7rem', color: '#000', lineHeight: 1.4, fontWeight: 500 }}>
            {business?.address}<br />
            {(business?.city || business?.state) && `${business?.city || ''}${business?.city && business?.state ? ', ' : ''}${business?.state || ''} ${business?.pincode || ''}`}<br />
            Mob : {business?.phone}{business?.alternatePhone ? `, ${business?.alternatePhone}` : ''}<br />
            {business?.email && <>Email: {business?.email}<br /></>}
            {business?.gstin && <>GSTIN: {business?.gstin}<br /></>}
            {business?.panNo && <>PAN: {business?.panNo}</>}
          </div>
        </div>
        <div style={{ padding: '8px 10px', background: '#fdf3f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: 2 }}>{getTranslatedText('BILLED TO')}: <span style={{ fontWeight: 950 }}>{bill.billedToName || bill.party?.name || '—'}</span></div>
          <div style={{ fontSize: '0.7rem', color: '#000', lineHeight: 1.4, fontWeight: 500 }}>
            {(bill.billedToAddress || bill.party?.address) && <>{bill.billedToAddress || bill.party?.address}<br /></>}
            {(bill.billedToCity || bill.party?.city || bill.billedToState || bill.party?.state) && (
              <>{[bill.billedToCity || bill.party?.city, bill.billedToState || bill.party?.state].filter(Boolean).join(', ')} {bill.billedToPincode || bill.party?.pincode || ''}<br /></>
            )}
            {(bill.billedToPhone || bill.party?.phone) && <><span style={{ fontWeight: 700 }}>Mob: {bill.billedToPhone || bill.party?.phone}</span><br /></>}
            {(bill.billedToEmail || bill.party?.email) && <>Email: {bill.billedToEmail || bill.party?.email}<br /></>}
            {(bill.billedToGstin || bill.party?.gstin) && <><span style={{ fontWeight: 700 }}>GSTIN:</span> {bill.billedToGstin || bill.party?.gstin}<br /></>}
            {(bill.billedToPan || bill.party?.pan) && <><span style={{ fontWeight: 700 }}>PAN:</span> {bill.billedToPan || bill.party?.pan}</>}
          </div>
        </div>
      </div>

      <div style={{ background: accent, color: 'white', textAlign: 'center', padding: '5px', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.12em', borderX: '1px solid #ccc', margin: '0 -1px' }}>
        {getTranslatedText('Billing Summary')}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc', borderTop: 'none', marginBottom: 0 }}>
        <thead>
          <tr style={{ background: '#fdf7f2' }}>
            {[getTranslatedText('No.'), getTranslatedText('Date'), getTranslatedText('Vehicle No.'), getTranslatedText('Origin'), getTranslatedText('Destination'), getTranslatedText('Chalan No.'), getTranslatedText('Hold'), getTranslatedText('Hamali/Return'), getTranslatedText('Amount')].map((h, i) => (
              <th key={i} style={{ padding: '12px 6px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #ccc', textAlign: i >= 6 ? 'right' : 'center', color: '#333' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem' }}>{i + 1}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem' }}>{dayjs(item.date).format('DD/MM/YY')}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{item.tempoNo || '—'}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{item.companyFrom || '—'}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem' }}>{item.companyTo || '—'}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontSize: '0.85rem' }}>{item.chalanNo || '—'}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'right', fontSize: '0.85rem', color: '#7C3AED', fontWeight: 700 }}>
                {(parseFloat(item.haltDays) > 0 || parseFloat(item.haltAmount) > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>{parseFloat(item.haltDays) || 0} <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>{getTranslatedText('DAYS')}</span></div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.8 }}>₹{parseFloat(item.haltAmount || 0).toLocaleString()}</div>
                  </div>
                ) : '—'}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'right', fontSize: '0.85rem' }}>
                {item.returnAmount > 0 && <div style={{ color: '#047857', fontWeight: 700 }}><span style={{ fontSize: '0.65rem' }}>{getTranslatedText('Return')}: </span>₹{parseFloat(item.returnAmount).toLocaleString()}</div>}
                {item.extraAmount > 0 && <div style={{ color: '#B45309', fontWeight: 700 }}><span style={{ fontSize: '0.65rem' }}>{getTranslatedText('Hamali')}: </span>₹{parseFloat(item.extraAmount).toLocaleString()}</div>}
                {!(item.returnAmount > 0) && !(item.extraAmount > 0) && '—'}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }}>{parseFloat(item.amount || 0) > 0 ? parseFloat(item.amount).toLocaleString() : '—'}</td>
            </tr>
          ))}
          {(parseFloat(bill.extraCharges || 0) > 0) && (
            <tr>
              <td colSpan="8" style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.8rem', border: '1px solid #ccc' }}>{getTranslatedText('Hamali Charges')} :</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '0.85rem', border: '1px solid #ccc' }}>₹{parseFloat(bill.extraCharges).toLocaleString()}</td>
            </tr>
          )}
          {items.some(it => (parseFloat(it.haltAmount) || 0) > 0) && (
            <tr>
              <td colSpan="6" style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.8rem', border: '1px solid #ccc' }}>{getTranslatedText('Total Hold')} ({items.reduce((sum, it) => sum + (parseFloat(it.haltDays) || 0), 0)} {getTranslatedText('Days')}) :</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '0.85rem', border: '1px solid #ccc', color: '#7C3AED' }}>₹{items.reduce((sum, it) => sum + (parseFloat(it.haltAmount) || 0), 0).toLocaleString()}</td>
              <td colSpan="2" style={{ border: '1px solid #ccc' }}></td>
            </tr>
          )}
          <tr>
            <td colSpan="7" style={{ background: accent, color: 'white', padding: '6px 20px', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>{getTranslatedText('Grateful for Moving What Matters to You!') || 'Grateful for Moving What Matters to You!'}</td>
            <td style={{ padding: '6px', textAlign: 'center', fontWeight: 900, fontSize: '1rem', border: '1px solid #ccc', background: '#f5f5f5' }}>{getTranslatedText('TOTAL')} :</td>
            <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 950, fontSize: '1.25rem', border: '1px solid #ccc' }}>₹{bill.grandTotal?.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', marginTop: 8, alignItems: 'start' }}>
        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ background: '#fdf3f0', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 800, borderBottom: '1px solid #ccc' }}>{getTranslatedText('BANK DETAILS')} :</div>
          <div style={{ padding: '8px 12px', backgroundColor: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div style={{ fontSize: '0.65rem' }}><span style={{ fontWeight: 600, color: '#555' }}>A/c No : </span><span style={{ fontWeight: 900 }}>{business?.bankDetails?.accountNumber || business?.bankAccNo || ''}</span></div>
              <div style={{ fontSize: '0.65rem' }}><span style={{ fontWeight: 600, color: '#555' }}>IFSC : </span><span style={{ fontWeight: 900 }}>{(business?.bankDetails?.ifsc || business?.bankIfsc || '').toUpperCase()}</span></div>
              <div style={{ fontSize: '0.65rem', marginTop: 3 }}><span style={{ fontWeight: 600, color: '#555' }}>Name : </span><span style={{ fontWeight: 900 }}>{business?.bankDetails?.accountName || business?.name || ''}</span></div>
              <div style={{ fontSize: '0.65rem', marginTop: 3 }}><span style={{ fontWeight: 600, color: '#555' }}>Bank : </span><span style={{ fontWeight: 900 }}>{business?.bankDetails?.bankName || business?.bankName || ''}</span></div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingBottom: 10 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: 5 }}>{getTranslatedText('For')} {business?.businessName || ''},</div>
          <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
            {business?.signatureUrl ? (
              <img src={business.signatureUrl} style={{ maxHeight: '100%', maxWidth: 160, objectFit: 'contain', mixBlendMode: 'multiply' }} />
            ) : (
              <div style={{ width: 170, borderBottom: '1px solid #000', marginTop: 45 }} />
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 600 }}>({getTranslatedText('Authorized Signatory')})</div>
        </div>
      </div>
    </div>
  )
}

// ── Garage Specific Invoice Layout ────────────────────────────────────
function GarageInvoice({ bill, business, getTranslatedText }) {
  const items = bill.items || []
  const themeColor = '#FFB800'

  return (
    <div className="garage-invoice-wrap" style={{ color: '#000', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: themeColor, padding: '12px 30px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#111' }}>{getTranslatedText('Cash Credit Memo / Estimate')}</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>{business?.slogan || 'Restoring Vehicles, Reviving Peace of Mind'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {business?.logoUrl ? <img src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.2rem', fontWeight: 950, color: '#111' }}>{(business?.businessName || 'A')[0]}</span>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, fontSize: '1.125rem', color: '#111' }}>{business?.businessName?.toUpperCase()}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#333', marginTop: 2 }}>{getTranslatedText('Bill No')}: {bill.billNumber || getTranslatedText('Draft')}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#333', marginTop: 1 }}>Mob: {business?.phone}</div>
            {business?.gstin && <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#333' }}>GSTIN: {business.gstin}</div>}
            {business?.panNo && <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#333' }}>PAN: {business.panNo}</div>}
          </div>
        </div>
      </div>

      <div style={{ padding: '30px', border: '1px solid #eee', borderTop: 'none', borderRadius: '0 0 8px 8px', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 30 }}>
          <div>
            <div style={{ background: themeColor, padding: '4px 10px', display: 'inline-block', fontWeight: 800, fontSize: '0.7rem', marginBottom: 10 }}>{getTranslatedText('Customer Information')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8125rem' }}>
              <div><span style={{ fontWeight: 700 }}>{getTranslatedText('Name')}:</span> {bill.customerName}</div>
              <div><span style={{ fontWeight: 700 }}>{getTranslatedText('Address')}:</span> {bill.customerAddress} {bill.customerCity}</div>
              <div><span style={{ fontWeight: 700 }}>{getTranslatedText('Phone')}:</span> {bill.customerPhone}</div>
            </div>
          </div>
          <div>
            <div style={{ background: themeColor, padding: '4px 10px', display: 'inline-block', fontWeight: 800, fontSize: '0.7rem', marginBottom: 10 }}>{getTranslatedText('Vehicle Information')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8125rem' }}>
              <div><span style={{ fontWeight: 700 }}>{getTranslatedText('Make')}:</span> {bill.vehicleCompany || '—'}</div>
              <div><span style={{ fontWeight: 700 }}>{getTranslatedText('Reg No')}:</span> <span style={{ fontWeight: 800 }}>{bill.vehicleNo?.toUpperCase()}</span></div>
              <div><span style={{ fontWeight: 700 }}>{getTranslatedText('KMs')}:</span> {bill.kmReading || '—'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <div style={{ background: themeColor, padding: '4px 10px', display: 'inline-block', fontWeight: 800, fontSize: '0.75rem', marginBottom: 10 }}>{getTranslatedText('Repair Details')}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: themeColor }}>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800 }}>{getTranslatedText('Description')}</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, width: '15%' }}>{getTranslatedText('Qty')}</th>
                <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, width: '20%' }}>{getTranslatedText('Rate')}</th>
                <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, width: '20%' }}>{getTranslatedText('Total')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '0.75rem' }}>{item.description}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '0.75rem', textAlign: 'center' }}>{item.qty || 1}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '0.75rem', textAlign: 'right' }}>{parseFloat(item.rate || item.amount).toLocaleString()}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{parseFloat(item.amount).toLocaleString()}</td>
                </tr>
              ))}
              <tr><td colSpan="3" style={{ padding: '4px 10px', border: '1px solid #ddd', fontWeight: 700, fontSize: '0.7rem' }}>{getTranslatedText('Grand Total')}</td><td style={{ padding: '4px 10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 950, fontSize: '0.95rem' }}>₹{bill.grandTotal?.toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 30, borderTop: '1px solid #ddd', paddingTop: 20 }}>
          <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, background: '#fafafa' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', fontWeight: 900 }}>{getTranslatedText('Terms and Conditions')}</h4>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#555' }}>{getTranslatedText('By signing, customer authorizes garage to proceed with repairs.')}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: 5 }}>For, {business?.businessName?.toUpperCase()}</div>
            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              {business?.signatureUrl ? (
                <img src={business.signatureUrl} style={{ maxHeight: '100%', maxWidth: 180, objectFit: 'contain', mixBlendMode: 'multiply' }} />
              ) : (
                <div style={{ width: 140, borderBottom: '1.5px solid #111', marginTop: 50 }} />
              )}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>({getTranslatedText('Authorized Signatory')})</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function BillDetail() {
  const { id } = useParams()
  const { fetchBill, deleteBill, recordPayment } = useBills()
  const { user: sessionUser } = useAuth()
  const navigate = useNavigate()
  const printRef = useRef()
  const invoiceRef = useRef()
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  const { getTranslatedText } = usePageTranslation([
    'Bill No.', 'Draft', 'Date', 'FROM', 'BILLED TO', 'Billing Summary', 'No.', 'Vehicle No.', 
    'Origin', 'Destination', 'Chalan No.', 'Hold', 'Hamali/Return', 'Amount', 'DAYS', 
    'Return', 'Hamali', 'Hamali Charges', 'Total Hold', 'Days', 'TOTAL', 'BANK DETAILS', 
    'For', 'Authorized Signatory', 'Cash Credit Memo / Estimate', 'Customer Information', 
    'Vehicle Information', 'Repair Details', 'Description', 'Qty', 'Rate', 'Total', 
    'Grand Total', 'Terms and Conditions', 'By signing, customer authorizes garage to proceed with repairs.',
    'Loading bill...', 'Bill not found', 'Back to Bills', 'Mark Paid', 'Edit Draft', 'Edit Bill', 
    'Generating...', 'PDF', 'Download PDF', 'Back to all bills', 'Delete this bill?', 'Mark this bill as fully paid?',
    'Name', 'Address', 'Phone', 'Make', 'Reg No', 'KMs', 'Bill No', 'Grateful for Moving What Matters to You!'
  ])

  const business = (bill?.owner && typeof bill.owner === 'object') ? bill.owner : sessionUser;

  useEffect(() => {
    if (!id || id === 'new') return
    setLoading(true)
    fetchBill(id).then(b => {
      if (b) setBill(b)
      setLoading(false)
    })
  }, [id, fetchBill])

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}><div style={{ fontSize: '0.9rem' }}>{getTranslatedText('Loading bill...')}</div></div>
  if (!bill) return <div style={{ textAlign: 'center', padding: 40 }}><h3>{getTranslatedText('Bill not found')}</h3><button className="btn btn-primary" onClick={() => navigate('/bills')}>{getTranslatedText('Back to Bills')}</button></div>

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('\n')
    const win = window.open('', '_blank', 'width=900,height=900')
    win.document.write(`
      <html>
        <head>
          <title>Invoice #${bill.billNumber || 'Draft'}</title>
          ${styles}
          <style>
            body { padding: 20px; background: white !important; }
            .invoice-wrap, .garage-invoice-wrap { box-shadow: none !important; border: 1px solid #eee !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
            @media print {
              body { padding: 0; }
              .invoice-wrap { border: none !important; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    setTimeout(() => { 
      win.focus()
      win.print()
      // win.close() // optionally close after print
    }, 800)
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || isDownloading) return
    setIsDownloading(true)
    const element = invoiceRef.current
    const originalWidth = element.style.width
    
    try {
      // Force width for consistent capture
      element.style.width = '800px'
      
      const canvas = await html2canvas(element, { 
        scale: 3, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: true,
        allowTaint: false
      })
      
      element.style.width = originalWidth
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pageWidth = 210
      const margin = 10 // 10mm margin
      const contentWidth = pageWidth - (margin * 2)
      const contentHeight = (canvas.height * contentWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight)
      pdf.save(`Invoice_${bill.billNumber || bill._id}.pdf`)
    } catch (err) {
      if (element) element.style.width = originalWidth
      alert('Failed to generate PDF')
    } finally { setIsDownloading(false) }
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 740, margin: '0 auto', paddingBottom: 60, overflowX: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => navigate(`/${bill.billType}/bills`)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}><ArrowLeft size={18} /></button>
        <div style={{ flex: 1, minWidth: 150 }}><h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F0D2E', margin: 0 }}>#{bill.billNumber || getTranslatedText('Draft')}</h2><p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{dayjs(bill.billingDate || bill.createdAt).format('DD MMM YYYY')}</p></div>
        <div className="bill-actions" style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {bill.status !== 'paid' && (
            <button 
              onClick={() => { if (window.confirm(getTranslatedText('Mark this bill as fully paid?'))) recordPayment(bill._id, bill.grandTotal || 0).then(u => u && setBill(u)) }} 
              className="action-btn paid"
              title={getTranslatedText('Mark Paid')}
            >
              <CheckCircle2 size={16} /> <span className="btn-text">{getTranslatedText('Mark Paid')}</span>
            </button>
          )}
          {bill.status !== 'paid' && (
            <button 
              onClick={() => navigate(`/${bill.billType}/bills/edit/${bill._id}`)} 
              className="action-btn edit"
              title={bill.status === 'draft' ? getTranslatedText('Edit Draft') : getTranslatedText('Edit Bill')}
            >
              <Pencil size={16} /> <span className="btn-text">{bill.status === 'draft' ? getTranslatedText('Edit Draft') : getTranslatedText('Edit Bill')}</span>
            </button>
          )}
          <button 
            onClick={() => { if (window.confirm(getTranslatedText('Delete this bill?'))) { deleteBill(id); navigate('/bills') } }} 
            className="action-btn delete"
            title={getTranslatedText('Delete this bill?')}
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={handlePrint} 
            className="action-btn print"
            title="Print"
          >
            <Printer size={18} />
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading} 
            className="action-btn download btn-primary"
            title={getTranslatedText('Download PDF')}
          >
            <Download size={16} /> <span className="btn-text">{isDownloading ? getTranslatedText('Generating...') : getTranslatedText('Download PDF')}</span>
          </button>
        </div>
      </div>

      <div ref={printRef} style={{ background: 'white', borderRadius: 24, padding: '24px 16px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.03)', overflowX: 'auto' }}>
        <div ref={invoiceRef}>
          {bill.billType === 'transport' ? <TransportInvoice bill={bill} business={business} getTranslatedText={(t) => t} /> : <GarageInvoice bill={bill} business={business} getTranslatedText={(t) => t} />}
        </div>
      </div>

      <PaymentModal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} bill={bill} business={business} onSuccess={(amount) => recordPayment(bill._id, amount)} />

      <div style={{ marginTop: 20, textAlign: 'center' }}><button className="btn btn-ghost" onClick={() => navigate('/bills')} style={{ fontSize: '0.85rem' }}><FileText size={16} /> {getTranslatedText('Back to all bills')}</button></div>

      <style>{`
        .action-btn {
          display: flex;
          align-items: center;
          gap: 6;
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          border: none;
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn.paid { background: #DCFCE7; color: #16A34A; font-weight: 800; }
        .action-btn.edit { border: 1.5px solid #E2E8F0; background: white; color: #4F46E5; }
        .action-btn.delete { background: #FEE2E2; color: #DC2626; width: 40px; justify-content: center; padding: 0; }
        .action-btn.print { background: white; border: 1px solid #EEE; width: 40px; justify-content: center; padding: 0; }
        .action-btn.download { background: #7C3AED; color: white; border: none; }
        .action-btn:active { transform: scale(0.95); }
        
        @media (max-width: 500px) {
          .bill-actions {
            width: 100%;
            justify-content: center !important;
            margin-top: 10px;
            gap: 8px !important;
          }
          .action-btn {
            flex-direction: column;
            height: auto;
            min-width: 65px;
            padding: 8px 4px;
            gap: 4px;
            border-radius: 12px;
          }
          .action-btn .btn-text {
            display: block !important;
            font-size: 0.65rem;
            white-space: nowrap;
          }
          .action-btn.delete, .action-btn.print {
            width: auto;
            min-width: 50px;
          }
          .action-btn svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  )
}
