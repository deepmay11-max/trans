import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, MessageCircle, ChevronRight, Search, Wallet, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import dayjs from 'dayjs'

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
  const phone     = bill.billedToPhone || bill.customerPhone || bill.party?.phone || ''

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    const p = phone.replace(/[^0-9]/g, '')
    const dialPhone = p.length === 10 ? `91${p}` : p
    const msg = [
      `*Outstanding Payment Reminder*`,
      ``,
      `Dear ${partyName},`,
      ``,
      `📄 Bill No: #${bill.billNumber || 'N/A'}`,
      `💰 Invoice Total: ₹${total.toLocaleString('en-IN')}`,
      `✅ Paid: ₹${paidAmt.toLocaleString('en-IN')}`,
      `⚠️ Balance Due: *₹${balance.toLocaleString('en-IN')}*`,
      ``,
      `Please clear the outstanding amount at the earliest.`,
      `Thank you!`,
    ].join('\n')
    const url = dialPhone
      ? `https://wa.me/${dialPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

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

      {/* WhatsApp button — only if balance > 0 */}
      {balance > 0 && (
        <button
          onClick={handleWhatsApp}
          title="Send WhatsApp reminder"
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', flexShrink: 0,
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(37,211,102,0.3)',
          }}
        >
          <MessageCircle size={16} />
        </button>
      )}

      <ChevronRight size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
    </div>
  )
}

export default function PaymentManagement({ type }) {
  const { bills, loaded } = useBills()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('outstanding') // 'outstanding' | 'partial' | 'paid' | 'all'

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

      {/* Search + Filter */}
      <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by party, bill no, phone..."
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
      </div>

      {/* List */}
      {!loaded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 18 }} />)}
        </div>
      ) : filtered.length === 0 ? (
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
      )}
    </div>
  )
}
