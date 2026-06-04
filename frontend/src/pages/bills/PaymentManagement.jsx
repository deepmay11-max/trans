import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, MessageCircle, ChevronRight, Search, Wallet, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const STATUS_CFG = {
  paid:    { label: 'Paid',    color: '#16A34A', bg: '#DCFCE7', icon: CheckCircle2 },
  partial: { label: 'Partial', color: '#D97706', bg: '#FEF3C7', icon: Clock },
  unpaid:  { label: 'Unpaid',  color: '#DC2626', bg: '#FEE2E2', icon: AlertCircle },
  draft:   { label: 'Draft',   color: '#6B7280', bg: '#F3F4F6', icon: Clock },
}

const getStatusKey = (bill) => {
  if (bill.status === 'paid') return 'paid'
  if (bill.status === 'partial') return 'partial'
  if (bill.status === 'draft') return 'draft'
  return 'unpaid'
}

function BillPayRow({ bill, navigate }) {
  const paidAmt   = bill.paidAmount || 0
  const total     = bill.grandTotal || 0
  const balance   = Math.max(0, total - paidAmt)
  const sk        = getStatusKey(bill)
  const cfg       = STATUS_CFG[sk]
  const Icon      = cfg.icon
  const partyName = bill.billedToName || bill.customerName || bill.party?.name || '—'

  return (
    <div
      onClick={() => navigate(`/bills/${bill._id}`)}
      style={{
        background: 'white', borderRadius: 18, padding: '14px 16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer',
        border: '1px solid #F3F4F6', transition: '0.18s',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#F3F4F6'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Status dot */}
      <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={cfg.color} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E', whiteSpace: 'nowrap' }}>
            #{bill.billNumber || 'Draft'}
          </span>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 6, background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {partyName}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: 1 }}>
          {dayjs(bill.billingDate || bill.createdAt).format('DD MMM YYYY')}
        </div>
      </div>

      {/* Amounts */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0F0D2E' }}>
          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {balance > 0 && (
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#DC2626', background: '#FEF2F2', padding: '1px 7px', borderRadius: 6, marginTop: 2, display: 'inline-block' }}>
            Due: ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
        {balance === 0 && paidAmt > 0 && (
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16A34A' }}>✓ Cleared</div>
        )}
      </div>

      <ChevronRight size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
    </div>
  )
}

function PartyPayRow({ group, navigate, isExpanded, onToggle, user }) {
  const [isSharing, setIsSharing] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const hasOutstanding = group.totalOutstanding > 0
  const firstLetter = (group.name || 'P')[0].toUpperCase()

  const printRef = useRef(null)
  const ledgerPrintRef = useRef(null)

  const ledgerEntries = useMemo(() => {
    const entries = [];
    [...group.bills].sort((a,b) => new Date(a.billingDate || a.createdAt) - new Date(b.billingDate || b.createdAt)).forEach(b => {
      entries.push({
        date: dayjs(b.billingDate || b.createdAt).toDate(),
        particulars: `Service Bill - ${b.vehicleNo || b.vehicle?.vehicleNumber || 'Items'}`,
        refNo: b.billNumber || 'DRAFT',
        debit: b.grandTotal || 0,
        credit: 0
      });
      const paidAmt = b.paidAmount || b.paymentReceived || (b.status === 'paid' ? b.grandTotal : 0) || 0;
      if (paidAmt > 0) {
        entries.push({
          date: b.paymentDate ? dayjs(b.paymentDate).toDate() : dayjs(b.billingDate || b.createdAt).toDate(),
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
  }, [group.bills]);
  
  const handleWhatsApp = async (e, type) => {
    e.stopPropagation()
    const targetRef = type === 'ledger' ? ledgerPrintRef : printRef;
    if (!targetRef.current || isSharing) return;
    
    setIsSharing(true);
    try {
      const canvas = await html2canvas(targetRef.current, { scale: 2, useCORS: true });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      
      const fileName = type === 'ledger' 
        ? `Statement_of_Account_${group.name.replace(/\s+/g, '_')}.pdf`
        : `Pending_Bills_${group.name.replace(/\s+/g, '_')}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const title = type === 'ledger' ? 'Party Ledger Statement' : 'Pending Bills Summary';
      const text = type === 'ledger' 
        ? `Dear ${group.name}, please find your statement of account attached.`
        : `Dear ${group.name}, please find your outstanding pending bills summary attached.`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
      } else {
        const p = group.phone ? group.phone.replace(/[^0-9]/g, '') : '';
        const dialPhone = p.length === 10 ? `91${p}` : p;
        const msg = `Dear ${group.name},\nPlease find your ${title} in the downloaded PDF.`;
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
      console.error('Error generating PDF', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsSharing(false);
      setShowShareMenu(false);
    }
  }

  const handleGoToLedger = (e) => {
    e.stopPropagation()
    if (group.partyId) {
      navigate(`/parties/${group.partyId}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: showShareMenu ? 50 : 1 }}>
      <div
        onClick={onToggle}
        style={{
          background: 'white', borderRadius: 18, padding: '14px 16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer',
          border: '1px solid #F3F4F6', transition: '0.18s',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#F3F4F6'; e.currentTarget.style.transform = 'none' }}
      >
        {/* Letter Box */}
        <div style={{ width: 42, height: 42, borderRadius: 12, background: hasOutstanding ? '#FEE2E2' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: hasOutstanding ? '#DC2626' : '#16A34A' }}>
            {firstLetter}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {group.name}
            </span>
            {group.partyId && (
              <span 
                onClick={handleGoToLedger}
                style={{ fontSize: '0.6rem', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '2px 6px', borderRadius: 5, cursor: 'pointer' }}
              >
                Ledger
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>
            {group.bills.length} {group.bills.length === 1 ? 'bill' : 'bills'}
          </div>
        </div>

        {/* Balance & Totals */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {hasOutstanding ? (
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#DC2626' }}>
              ₹{group.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16A34A' }}>✓ Cleared</div>
          )}
          <div style={{ fontSize: '0.62rem', color: '#9CA3AF', marginTop: 2, fontWeight: 500 }}>
            Billed: ₹{group.totalInvoiced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* WhatsApp Share Options Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu) }}
            title="Share Options"
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(37,211,102,0.3)',
            }}
          >
            <MessageCircle size={16} />
          </button>
          
          {showShareMenu && (
            <>
              {/* Invisible overlay to close menu */}
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 9 }} 
                onClick={(e) => { e.stopPropagation(); setShowShareMenu(false) }}
              />
              <div 
                style={{
                  position: 'absolute', right: 0, top: 44, background: 'white', 
                  borderRadius: 12, padding: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  zIndex: 10, minWidth: 160, border: '1px solid #F3F4F6',
                  display: 'flex', flexDirection: 'column', gap: 4
                }}
              >
                {hasOutstanding && (
                  <div 
                    onClick={(e) => handleWhatsApp(e, 'pending')}
                    style={{ padding: '10px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', borderRadius: 8, color: '#0F0D2E', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <MessageCircle size={14} color="#25D366" /> Pending Bills
                  </div>
                )}
                <div 
                  onClick={(e) => handleWhatsApp(e, 'ledger')}
                  style={{ padding: '10px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', borderRadius: 8, color: '#0F0D2E', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FileText size={14} color="#4F46E5" /> Party Ledger
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chevron icon */}
        <div style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
        </div>
      </div>

      {/* Expanded Bills List */}
      {isExpanded && (
        <div style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {group.bills.map(bill => (
            <BillPayRow key={bill._id} bill={bill} navigate={navigate} />
          ))}
        </div>
      )}

      {/* Hidden Print Template */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <div ref={printRef} style={{ padding: 40, width: '210mm', background: 'white', color: 'black', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
          <h1 style={{ textAlign: 'center', marginBottom: 5, color: '#111', fontSize: '24px', textTransform: 'uppercase' }}>
            {user?.businessName || 'Business Name'}
          </h1>
          <p style={{ textAlign: 'center', marginBottom: 20, color: '#555', fontSize: '12px' }}>
            {user?.phone && `Phone: ${user.phone}`} {user?.city && ` | City: ${user.city}`}
          </p>
          <hr style={{ border: '0.5px solid #ddd', marginBottom: 20 }} />
          <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#333', fontSize: '18px' }}>Outstanding Pending Bills Summary</h2>
          <div style={{ marginBottom: 20, fontSize: '14px', color: '#333', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>To Party:</strong> {group.name}<br/>
              <strong>Phone:</strong> {group.phone || 'N/A'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>Date:</strong> {dayjs().format('DD-MM-YYYY')}
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ border: '1px solid black', padding: 8 }}>Sr No</th>
                <th style={{ border: '1px solid black', padding: 8 }}>Bill No</th>
                <th style={{ border: '1px solid black', padding: 8 }}>Bill Date</th>
                <th style={{ border: '1px solid black', padding: 8 }}>Vehicle No</th>
                <th style={{ border: '1px solid black', padding: 8 }}>Pending Amt</th>
                <th style={{ border: '1px solid black', padding: 8 }}>Overdue Days</th>
              </tr>
            </thead>
            <tbody>
              {group.bills.filter(b => (b.grandTotal - (b.paidAmount || b.paymentReceived || 0)) > 0).map((b, idx) => {
                const pending = b.grandTotal - (b.paidAmount || b.paymentReceived || 0);
                let overdue = dayjs().diff(dayjs(b.billingDate || b.createdAt), 'day');
                if (overdue < 0) overdue = 0;
                const vNum = b.vehicleNo || b.vehicle?.vehicleNumber || (b.items && b.items.length > 0 ? b.items[0].tempoNo || b.items[0].description : '') || '—';
                return (
                  <tr key={b._id}>
                    <td style={{ border: '1px solid black', padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid black', padding: 8 }}>{b.billNumber || 'N/A'}</td>
                    <td style={{ border: '1px solid black', padding: 8 }}>{dayjs(b.billingDate).format('DD-MM-YYYY')}</td>
                    <td style={{ border: '1px solid black', padding: 8 }}>{vNum}</td>
                    <td style={{ border: '1px solid black', padding: 8, textAlign: 'right' }}>₹{pending.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td style={{ border: '1px solid black', padding: 8, textAlign: 'center' }}>{overdue}</td>
                  </tr>
                )
              })}
              <tr>
                <td colSpan={4} style={{ border: '1px solid black', padding: 8, textAlign: 'right', fontWeight: 'bold' }}>Total Outstanding</td>
                <td style={{ border: '1px solid black', padding: 8, textAlign: 'right', fontWeight: 'bold' }}>₹{group.totalOutstanding.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                <td colSpan={1} style={{ border: '1px solid black', padding: 8 }}></td>
              </tr>
            </tbody>
          </table>
        </div>
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
              <strong>Party:</strong> {group.name}<br/>
              <strong>Phone:</strong> {group.phone || 'N/A'}
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

export default function PaymentManagement({ type }) {
  const { bills, loaded } = useBills()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('outstanding') // 'outstanding' | 'partial' | 'paid' | 'all'
  const [viewTab, setViewTab] = useState('bills') // 'bills' | 'parties'
  const [expandedParties, setExpandedParties] = useState({})

  const moduleType = type || user?.role || 'transport'

  const relevant = useMemo(() => {
    return bills.filter(b => b.billType === moduleType && b.status !== 'draft')
  }, [bills, moduleType])

  const filtered = useMemo(() => {
    let list = [...relevant]
    if (filter === 'outstanding') list = list.filter(b => b.status !== 'paid')
    else if (filter === 'partial') list = list.filter(b => b.status === 'partial')
    else if (filter === 'paid') list = list.filter(b => b.status === 'paid')

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.billNumber?.toLowerCase().includes(q) ||
        b.billedToName?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.party?.name?.toLowerCase().includes(q) ||
        b.billedToPhone?.toLowerCase().includes(q) ||
        b.customerPhone?.toLowerCase().includes(q)
      )
    }

    return list.sort((a, b) => new Date(b.billingDate || b.createdAt) - new Date(a.billingDate || a.createdAt))
  }, [relevant, filter, search])

  const partyGroups = useMemo(() => {
    const groups = {}
    relevant.forEach(bill => {
      const name = bill.billedToName || bill.customerName || bill.party?.name || 'Counter Sale / Guest'
      const phone = bill.billedToPhone || bill.customerPhone || bill.party?.phone || ''
      const email = bill.billedToEmail || bill.customerEmail || bill.party?.email || ''
      
      const key = name.toLowerCase().trim()
      if (!groups[key]) {
        groups[key] = {
          name,
          phone,
          email,
          partyId: bill.party?._id || bill.party?.id || null,
          bills: [],
          totalInvoiced: 0,
          totalPaid: 0,
          totalOutstanding: 0,
        }
      }
      groups[key].bills.push(bill)
      groups[key].totalInvoiced += bill.grandTotal || 0
      groups[key].totalPaid += bill.paidAmount || (bill.status === 'paid' ? bill.grandTotal : 0) || 0
    })

    const list = Object.values(groups).map(g => {
      g.totalOutstanding = Math.max(0, g.totalInvoiced - g.totalPaid)
      return g
    })

    let filteredList = list
    if (search.trim()) {
      const q = search.toLowerCase()
      filteredList = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.email.toLowerCase().includes(q)
      )
    }

    // Sort by outstanding balance first, then name
    return filteredList.sort((a, b) => b.totalOutstanding - a.totalOutstanding || a.name.localeCompare(b.name))
  }, [relevant, search])

  // Summary totals
  const summary = useMemo(() => {
    const totalInvoiced = relevant.reduce((s, b) => s + (b.grandTotal || 0), 0)
    const totalPaid     = relevant.reduce((s, b) => s + (b.paidAmount || (b.status === 'paid' ? b.grandTotal : 0) || 0), 0)
    const totalOutstanding = Math.max(0, totalInvoiced - totalPaid)
    const partialCount = relevant.filter(b => b.status === 'partial').length
    const unpaidCount  = relevant.filter(b => b.status === 'unpaid').length
    return { totalInvoiced, totalPaid, totalOutstanding, partialCount, unpaidCount }
  }, [relevant])

  const FILTERS = [
    { val: 'outstanding', label: '⚠️ Outstanding' },
    { val: 'partial', label: '🕐 Partial' },
    { val: 'paid', label: '✅ Paid' },
    { val: 'all', label: 'All' },
  ]

  const togglePartyExpand = (key) => {
    setExpandedParties(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="page-wrapper animate-fadeIn" style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0F0D2E', margin: '0 0 4px' }}>
          Payment Management
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0 }}>
          Track outstanding balances & partial payments
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Invoiced', value: summary.totalInvoiced, color: '#4338CA', bg: '#EEF2FF' },
          { label: 'Total Collected', value: summary.totalPaid, color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Outstanding', value: summary.totalOutstanding, color: summary.totalOutstanding > 0 ? '#DC2626' : '#16A34A', bg: summary.totalOutstanding > 0 ? '#FEF2F2' : '#F0FDF4' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: s.color }}>₹{s.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        ))}
      </div>

      {/* Sub-stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Unpaid Bills', value: summary.unpaidCount, color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Partial Bills', value: summary.partialCount, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Total Bills', value: relevant.length, color: '#4338CA', bg: '#EEF2FF' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: s.color, opacity: 0.8 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* View Toggle Tab */}
      <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 3, marginBottom: 20 }}>
        <button
          onClick={() => setViewTab('bills')}
          style={{
            flex: 1, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 800, fontSize: '0.75rem', transition: '0.2s',
            background: viewTab === 'bills' ? 'white' : 'transparent',
            color: viewTab === 'bills' ? '#7C3AED' : '#64748B',
            boxShadow: viewTab === 'bills' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          Bills
        </button>
        <button
          onClick={() => setViewTab('parties')}
          style={{
            flex: 1, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 800, fontSize: '0.75rem', transition: '0.2s',
            background: viewTab === 'parties' ? 'white' : 'transparent',
            color: viewTab === 'parties' ? '#7C3AED' : '#64748B',
            boxShadow: viewTab === 'parties' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          Parties
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder={viewTab === 'bills' ? "Search by party, bill no, phone..." : "Search by party name, phone..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', height: 42, borderRadius: 12, border: '1.5px solid #F3F4F6',
              background: '#F9FAFB', paddingLeft: 36, paddingRight: 12,
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = '#7C3AED'}
            onBlur={e => e.target.style.borderColor = '#F3F4F6'}
          />
        </div>
        {viewTab === 'bills' && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {FILTERS.map(f => (
              <button
                key={f.val}
                onClick={() => setFilter(f.val)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  whiteSpace: 'nowrap', fontWeight: 800, fontSize: '0.65rem', transition: '0.15s',
                  background: filter === f.val ? '#7C3AED' : '#F1F5F9',
                  color: filter === f.val ? 'white' : '#64748B',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {!loaded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 18 }} />)}
        </div>
      ) : viewTab === 'bills' ? (
        filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 24 }}>
            <Wallet size={48} color="#E5E7EB" style={{ marginBottom: 16 }} />
            <h3 style={{ margin: '0 0 8px', color: '#111827', fontSize: '1rem' }}>
              {filter === 'paid' ? 'No paid bills yet' : filter === 'outstanding' ? 'No outstanding bills 🎉' : 'No bills found'}
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: 0 }}>
              {filter === 'outstanding' ? 'All bills are cleared!' : 'Try a different filter or search.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(bill => (
              <BillPayRow key={bill._id} bill={bill} navigate={navigate} />
            ))}
          </div>
        )
      ) : (
        partyGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 24 }}>
            <Wallet size={48} color="#E5E7EB" style={{ marginBottom: 16 }} />
            <h3 style={{ margin: '0 0 8px', color: '#111827', fontSize: '1rem' }}>
              No parties found
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: 0 }}>
              Try a different search query.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {partyGroups.map(group => {
              const key = group.name.toLowerCase().trim()
              return (
                <PartyPayRow 
                  key={key} 
                  group={group} 
                  navigate={navigate} 
                  isExpanded={!!expandedParties[key]} 
                  onToggle={() => togglePartyExpand(key)}
                  user={user}
                />
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
