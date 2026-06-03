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

function PartyPayRow({ group, navigate, isExpanded, onToggle }) {
  const hasOutstanding = group.totalOutstanding > 0
  const firstLetter = (group.name || 'P')[0].toUpperCase()

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    const p = group.phone.replace(/[^0-9]/g, '')
    const dialPhone = p.length === 10 ? `91${p}` : p
    const msg = [
      `*Outstanding Payment Reminder*`,
      ``,
      `Dear ${group.name},`,
      ``,
      `This is a consolidated summary of your outstanding balance.`,
      `💰 Total Billed: ₹${group.totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `✅ Total Paid: ₹${group.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `⚠️ Consolidated Outstanding: *₹${group.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*`,
      ``,
      `Please clear the outstanding amount at the earliest.`,
      `Thank you!`,
    ].join('\n')
    const url = dialPhone
      ? `https://wa.me/${dialPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handleGoToLedger = (e) => {
    e.stopPropagation()
    if (group.partyId) {
      navigate(`/parties/${group.partyId}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

        {/* WhatsApp Consolidated Reminder */}
        {hasOutstanding && (
          <button
            onClick={handleWhatsApp}
            title="Send consolidated WhatsApp reminder"
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
                />
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
