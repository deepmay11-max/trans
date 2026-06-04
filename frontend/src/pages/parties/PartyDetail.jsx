import { useState, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Phone, MapPin, Globe, CreditCard, 
  Receipt, TrendingUp, History, User, Mail, 
  ExternalLink, Calendar, Truck, CheckCircle2, Clock, Edit2, Download, Share2
} from 'lucide-react'
import { useParties } from '../../context/PartyContext'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import { usePageTranslation } from '../../hooks/usePageTranslation'
import dayjs from 'dayjs'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F0D2E', marginTop: 1 }}>{value}</div>
      </div>
    </div>
  )
}

function BillItem({ bill, onClick, getTranslatedText }) {
  const statusLabels = {
    paid:    { label: 'Paid',    color: '#16A34A', bg: '#DCFCE7' },
    unpaid:  { label: 'Unpaid',  color: '#DC2626', bg: '#FEE2E2' },
    partial: { label: 'Partial', color: '#D97706', bg: '#FEF3C7' },
    topay:   { label: 'To Pay',  color: '#D97706', bg: '#FEF3C7' },
    tbb:     { label: 'TBB',     color: '#2563EB', bg: '#DBEAFE' },
    draft:   { label: 'Draft',   color: '#6B7280', bg: '#F3F4F6' },
  }
  const status = statusLabels[bill.status] || statusLabels.unpaid
  const itemCount = bill.items?.length || 0
  
  return (
    <div 
      onClick={() => onClick(bill._id || bill.id)}
      style={{ background: 'white', borderRadius: 18, padding: '14px 16px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: '0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#7C3AED'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#F1F5F9'}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F8FAFC', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Receipt size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F0D2E' }}>{bill.billNumber || getTranslatedText('DRAFT')}</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 6, background: status.bg, color: status.color }}>
            {getTranslatedText(bill.status) || getTranslatedText(status.label)}
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500 }}>
          {dayjs(bill.billDate || bill.createdAt).format('DD MMM, YYYY')} • {itemCount} {getTranslatedText('Items')}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F0D2E' }}>₹{(bill.grandTotal || 0).toLocaleString()}</div>
        <div style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 600 }}>{getTranslatedText('View Detail')}</div>
      </div>
    </div>
  )
}

export default function PartyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getParty, loaded: partiesLoaded } = useParties()
  const { bills, loaded: billsLoaded } = useBills()

  const { user } = useAuth()
  const ledgerPrintRef = useRef(null)
  const [isSharing, setIsSharing] = useState(false)

  const party = useMemo(() => getParty(id), [id, getParty, partiesLoaded])
  
  const partyBills = useMemo(() => {
    return bills.filter(b => 
      (b.partyId === id || b.party?._id === id || b.party?.id === id) ||
      (b.billedToName && party && b.billedToName.toLowerCase().trim() === party.name.toLowerCase().trim())
    ).sort((a,b) => new Date(b.billDate || b.createdAt) - new Date(a.billDate || a.createdAt))
  }, [id, bills, party])

  // Calculate Ledger Timeline Data
  const ledgerEntries = useMemo(() => {
    const entries = [];
    partyBills.forEach(b => {
      entries.push({
        date: dayjs(b.billDate || b.createdAt).toDate(),
        particulars: `Service Bill - ${b.vehicleNo || b.vehicle?.vehicleNumber || 'Items'}`,
        refNo: b.billNumber || 'DRAFT',
        debit: b.grandTotal || 0,
        credit: 0
      });
      const paidAmt = b.paidAmount || b.paymentReceived || (b.status === 'paid' ? b.grandTotal : 0) || 0;
      if (paidAmt > 0) {
        entries.push({
          date: b.paymentDate ? dayjs(b.paymentDate).toDate() : dayjs(b.billDate || b.createdAt).toDate(),
          particulars: `Payment Received`,
          refNo: b.billNumber || 'DRAFT',
          debit: 0,
          credit: paidAmt
        });
      }
    });
    entries.sort((a, b) => a.date - b.date);
    let currentBalance = 0;
    return entries.map(entry => {
      currentBalance += (entry.debit - entry.credit);
      return { ...entry, balance: currentBalance };
    });
  }, [partyBills]);

  const handleShareLedger = async () => {
    if (!ledgerPrintRef.current || isSharing) return;
    
    setIsSharing(true);
    try {
      const canvas = await html2canvas(ledgerPrintRef.current, { scale: 2, useCORS: true });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      const fileName = `Statement_of_Account_${party.name.replace(/\s+/g, '_')}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Party Ledger Statement',
          text: `Dear ${party.name}, please find your statement of account attached.`
        });
      } else {
        const p = party.phone ? party.phone.replace(/[^0-9]/g, '') : '';
        const dialPhone = p.length === 10 ? `91${p}` : p;
        const msg = `Dear ${party.name},\nPlease find your Statement of Account in the downloaded PDF.`;
        const url = dialPhone
          ? `https://wa.me/${dialPhone}?text=${encodeURIComponent(msg)}`
          : `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        
        const downloadUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      console.error('Error generating Ledger PDF', err);
      alert('Failed to generate Ledger PDF. Please try again.');
    } finally {
      setIsSharing(false);
    }
  }
  
  const { getTranslatedText } = usePageTranslation([
    'Party Ledgers', 'Total Billed', 'Amount Paid', 'Pending', 'Contact Details',
    'Phone Number', 'Email', 'GSTIN', 'Address Info', 'Transaction History',
    'No Invoices Found', 'Party Not Found', 'Go Back', 'Paid', 'Unpaid', 'Partial',
    'To Pay', 'TBB', 'Draft', 'Items', 'View Detail', 'No Phone', 'No City', 'No GST',
    'No Address Details', 'DRAFT', 'paid', 'unpaid', 'partial', 'topay', 'tbb', 'draft',
    party?.name, party?.city, party?.address, party?.state, party?.pincode,
    ...partyBills.map(b => b.billNumber)
  ])

  const stats = useMemo(() => {
    const validBills = partyBills.filter(b => b.status !== 'draft')
    const total = validBills.reduce((s, b) => s + (b.grandTotal || 0), 0)
    const paid = validBills.reduce((s, b) => s + (b.paidAmount || (b.status === 'paid' ? b.grandTotal : 0) || 0), 0)
    const pending = Math.max(0, total - paid)
    return { total, paid, pending, count: validBills.length }
  }, [partyBills])

  if (!partiesLoaded || !billsLoaded) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="skeleton" style={{ width: '100%', maxWidth: 500, height: 400, borderRadius: 28 }} />
      </div>
    )
  }

  if (!party) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ color: '#0F0D2E', fontWeight: 800 }}>{getTranslatedText('Party Not Found')}</h3>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>{getTranslatedText('Go Back')}</button>
      </div>
    )
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ paddingBottom: 40 }}>
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: 'white', color: '#0F0D2E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F0D2E', margin: 0 }}>{getTranslatedText('Party Ledgers')}</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={handleShareLedger}
            style={{ padding: '0 12px', height: 36, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: 'white', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Share2 size={16} /> Share Ledger
          </button>
          <button 
            onClick={() => navigate(`/${window.location.pathname.includes('garage') ? 'garage' : 'transport'}/parties/edit/${party._id || party.id}`)} 
            style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: '#F3F4F6', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Edit2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div style={{ background: 'white', borderRadius: 28, padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ width: 70, height: 70, borderRadius: 22, background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)' }}>
            {party.name[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F0D2E', margin: '0 0 4px 0' }}>{getTranslatedText(party.name)}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <Phone size={14} /> {party.phone || getTranslatedText('No Phone')}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <MapPin size={14} /> {party.city ? getTranslatedText(party.city) : getTranslatedText('No City')}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <StatCard icon={TrendingUp} label={getTranslatedText('Total Billed')} value={`₹${stats.total.toLocaleString()}`} color="#7C3AED" bg="#F5F3FF" />
          <StatCard icon={CheckCircle2} label={getTranslatedText('Amount Paid')} value={`₹${stats.paid.toLocaleString()}`} color="#16A34A" bg="#DCFCE7" />
          <StatCard icon={Clock} label={getTranslatedText('Pending')} value={`₹${stats.pending.toLocaleString()}`} color="#DC2626" bg="#FEE2E2" />
        </div>
      </div>

      {/* Details Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '20px', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <User size={16} /> {getTranslatedText('Contact Details')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowWrap: 'break-word', wordBreak: 'break-all' }}>
            <div style={{ fontSize: '0.8rem' }}><span style={{ color: '#94A3B8', fontWeight: 600 }}>{getTranslatedText('Phone Number')}: </span> <span style={{ color: '#1E293B', fontWeight: 700 }}>{party.phone || '—'}</span></div>
            <div style={{ fontSize: '0.8rem' }}><span style={{ color: '#94A3B8', fontWeight: 600 }}>{getTranslatedText('Email')}: </span> <span style={{ color: '#1E293B', fontWeight: 700 }}>{party.email || '—'}</span></div>
            <div style={{ fontSize: '0.8rem' }}><span style={{ color: '#94A3B8', fontWeight: 600 }}>{getTranslatedText('GSTIN')}: </span> <span style={{ color: '#1E293B', fontWeight: 700 }}>{party.gstin || getTranslatedText('No GST')}</span></div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 24, padding: '20px', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MapPin size={16} /> {getTranslatedText('Address Info')}
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 700, lineHeight: 1.6, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {party.address ? (
              <>
                <div>{getTranslatedText(party.address)}</div>
                {(party.city || party.state || party.pincode) && (
                  <div style={{ marginTop: 4, color: '#475569', fontWeight: 600 }}>
                    {[party.city ? getTranslatedText(party.city) : null, party.state ? getTranslatedText(party.state) : null, party.pincode].filter(Boolean).join(', ')}
                  </div>
                )}
              </>
            ) : party.city ? (
               getTranslatedText(party.city)
            ) : (
               getTranslatedText('No Address Details')
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <History size={18} color="#0F0D2E" />
        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F0D2E', margin: 0 }}>{getTranslatedText('Transaction History')}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {partyBills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 24, border: '1px dashed #E2E8F0' }}>
            <Receipt size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>{getTranslatedText('No Invoices Found')}</div>
          </div>
        ) : (
          partyBills.map(bill => (
            <BillItem key={bill._id} bill={bill} onClick={(id) => navigate(`/bills/${id}`)} getTranslatedText={getTranslatedText} />
          ))
        )}
      </div>
      
      {/* Hidden Print Template for Ledger */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <div ref={ledgerPrintRef} style={{ padding: 40, width: '210mm', background: 'white', color: 'black', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
          <h1 style={{ textAlign: 'center', marginBottom: 5, color: '#111', fontSize: '24px', textTransform: 'uppercase' }}>
            {user?.businessName || 'Business Name'}
          </h1>
          <p style={{ textAlign: 'center', marginBottom: 20, color: '#555', fontSize: '12px' }}>
            {user?.phone && `Phone: ${user.phone}`} {user?.city && ` | City: ${user.city}`}
          </p>
          <hr style={{ border: '0.5px solid #ddd', marginBottom: 20 }} />
          
          <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#333', fontSize: '18px' }}>Statement of Account (Party Ledger)</h2>
          <div style={{ marginBottom: 20, fontSize: '14px', color: '#333', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>Party:</strong> {party.name}<br/>
              <strong>Phone:</strong> {party.phone || 'N/A'}<br/>
              <strong>Address:</strong> {party.address ? `${party.address}, ${party.city}` : 'N/A'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>Date Generated:</strong> {dayjs().format('DD-MM-YYYY')}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ border: '1px solid black', padding: 8, textAlign: 'left' }}>Date</th>
                <th style={{ border: '1px solid black', padding: 8, textAlign: 'left' }}>Particulars</th>
                <th style={{ border: '1px solid black', padding: 8, textAlign: 'left' }}>Ref No</th>
                <th style={{ border: '1px solid black', padding: 8, textAlign: 'right' }}>Debit (₹)</th>
                <th style={{ border: '1px solid black', padding: 8, textAlign: 'right' }}>Credit (₹)</th>
                <th style={{ border: '1px solid black', padding: 8, textAlign: 'right' }}>Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid black', padding: 8 }}>{dayjs(row.date).format('DD-MM-YYYY')}</td>
                  <td style={{ border: '1px solid black', padding: 8 }}>{row.particulars}</td>
                  <td style={{ border: '1px solid black', padding: 8 }}>{row.refNo}</td>
                  <td style={{ border: '1px solid black', padding: 8, textAlign: 'right' }}>{row.debit > 0 ? row.debit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : ''}</td>
                  <td style={{ border: '1px solid black', padding: 8, textAlign: 'right' }}>{row.credit > 0 ? row.credit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : ''}</td>
                  <td style={{ border: '1px solid black', padding: 8, textAlign: 'right', fontWeight: 'bold' }}>{row.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})} {row.balance > 0 ? 'Dr' : (row.balance < 0 ? 'Cr' : '')}</td>
                </tr>
              ))}
              {ledgerEntries.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ border: '1px solid black', padding: 20, textAlign: 'center' }}>No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: 40, textAlign: 'right', fontSize: '14px' }}>
            <p style={{ marginBottom: 40 }}><strong>For {user?.businessName || 'Business'}</strong></p>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  )
}
