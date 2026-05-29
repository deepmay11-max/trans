import React, { useState, useMemo, useEffect } from 'react'
import { 
  ArrowLeft, Droplets, Wrench, LayoutDashboard, 
  TrendingDown, Calendar, CheckCircle2, Loader2, 
  Plus, Clock, Search as SearchIcon, Trash2, ChevronDown, Receipt, X as CloseIcon
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFinance } from '../../context/FinanceContext'
import dayjs from 'dayjs'
import { usePageTranslation } from '../../hooks/usePageTranslation'

const EXPENSE_CATEGORIES = [
  { id: 'fuel', label: 'Fuel', icon: Droplets, color: '#F59E0B', bg: '#FFF7ED' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'other', label: 'Other', icon: LayoutDashboard, color: '#64748B', bg: '#F8FAFC' }
]

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}</label>
      {children}
      {error && <span className="form-error">{error.message}</span>}
    </div>
  )
}

export default function DailyExpense() {
  const { getTranslatedText } = usePageTranslation([
    'Search expenses...', 'Cancel', 'Expense History', 'Expense Management',
    'View and filter your expense records', 'Log your daily fleet expenses (Fuel, Maintenance, etc.)',
    'Add New', 'History', 'Fuel', 'Maintenance', 'Other', 'Logging', 'Amount (₹)', 'Enter amount',
    'Date', 'Payment Mode', 'Cash', 'Online', 'Bank', 'Notes / Description', 'Expense notes (optional)',
    'Saved Successfully', 'Record Expense', 'From Date', 'To Date', 'Report', 'items'
  ])
  const navigate = useNavigate()
  const location = useLocation()
  const { transactions, addTransaction, loaded } = useFinance()
  const [activeTab, setActiveTab] = useState('fuel')
  const [showHistory, setShowHistory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [rangeFrom, setRangeFrom] = useState(dayjs().subtract(1, 'month').format('YYYY-MM-DD'))
  const [rangeTo, setRangeTo] = useState(dayjs().format('YYYY-MM-DD'))
  const [searchTerm, setSearchTerm] = useState('')
  const [historyCategory, setHistoryCategory] = useState('All')
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = React.useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('search') === 'true') {
      setShowSearch(true)
      // Auto-switch to history if searching? Maybe.
      // setShowHistory(true)
    }
  }, [location.search])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    amount: '',
    paymentMode: 'cash',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || parseFloat(formData.amount) < 1) {
      setErrors({ amount: { message: getTranslatedText('Enter amount') } })
      return
    }

    if (saving) return;
    setSaving(true)
    try {
      const payload = {
        ...formData,
        type: 'expense',
        category: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
        amount: parseFloat(formData.amount)
      }
      await addTransaction(payload)
      setSuccess(true)
      setFormData({
        date: dayjs().format('YYYY-MM-DD'),
        amount: '',
        paymentMode: 'cash',
        notes: ''
      })
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      alert('Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  const expenseHistory = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && ['Fuel', 'Maintenance', 'Other'].includes(t.category))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions])

  const monthlyTotals = useMemo(() => {
    const totals = {}
    expenseHistory.forEach(tx => {
      const m = dayjs(tx.date).format('YYYY-MM')
      totals[m] = (totals[m] || 0) + (tx.amount || 0)
    })
    return totals
  }, [expenseHistory])

  // Group by month
  const monthlyGroups = useMemo(() => {
    const groups = {}
    expenseHistory.forEach(tx => {
      const m = dayjs(tx.date).format('YYYY-MM')
      if (!groups[m]) groups[m] = []
      groups[m].push(tx)
    })
    return groups
  }, [expenseHistory])

  const filteredHistory = useMemo(() => {
    let list = expenseHistory.filter(t => {
      const tDate = dayjs(t.date).format('YYYY-MM-DD')
      return (tDate >= rangeFrom && tDate <= rangeTo)
    })

    if (historyCategory !== 'All') {
      list = list.filter(t => t.category === historyCategory)
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(t => 
        t.category?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q) ||
        t.amount?.toString().includes(q)
      )
    }
    return list
  }, [expenseHistory, rangeFrom, rangeTo, searchTerm, historyCategory])

  const categoryTotals = useMemo(() => {
    const base = { Fuel: 0, Maintenance: 0, Other: 0 }
    expenseHistory.filter(t => {
      const tDate = dayjs(t.date).format('YYYY-MM-DD')
      return (tDate >= rangeFrom && tDate <= rangeTo)
    }).forEach(t => {
      if (base[t.category] !== undefined) base[t.category] += (t.amount || 0)
    })
    return base
  }, [expenseHistory, rangeFrom, rangeTo])

  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 80 }}>

      {/* Search Bar */}
      {showSearch && (
        <div className="animate-slideDown" style={{ marginBottom: 16, padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'white', borderRadius: 16, border: '1.5px solid var(--primary)', height: 48, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <SearchIcon size={18} color="var(--primary)" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder={getTranslatedText('Search expenses...')} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
            />
            {searchTerm && (
              <CloseIcon 
                size={18} 
                onClick={() => setSearchTerm('')} 
                style={{ cursor: 'pointer', color: '#94A3B8' }} 
              />
            )}
            <button 
              onClick={() => { setShowSearch(false); setSearchTerm(''); navigate(location.pathname, { replace: true }) }}
              style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
            >
              {getTranslatedText('Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showHistory && (
            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#64748B' }}>
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0F0D2E', letterSpacing: '-0.01em' }}>
              {showHistory ? getTranslatedText('Expense History') : getTranslatedText('Expense Management')}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, margin: 0 }}>
              {showHistory ? getTranslatedText('View and filter your expense records') : getTranslatedText('Log your daily fleet expenses (Fuel, Maintenance, etc.)')}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', 
            borderRadius: 16, border: 'none', background: '#0F0D2E', 
            color: 'white', fontWeight: 800, fontSize: '0.85rem', 
            cursor: 'pointer', transition: '0.2s',
            boxShadow: '0 4px 12px rgba(15, 13, 46, 0.2)'
          }}
        >
          {showHistory ? <Plus size={16} /> : <Clock size={16} />}
          {showHistory ? getTranslatedText('Add New') : getTranslatedText('History')}
        </button>
      </div>

      {!showHistory ? (
        <div className="animate-scaleIn">
          {/* Category Selector */}
          <div className="expense-category-grid" style={{ marginBottom: 24 }}>
            {EXPENSE_CATEGORIES.map(cat => {
              const active = activeTab === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  style={{
                    background: active ? cat.bg : 'white',
                    border: active ? `2px solid ${cat.color}` : '2px solid transparent',
                    borderRadius: 16, padding: '12px 6px', textAlign: 'center',
                    cursor: 'pointer', transition: '0.2s',
                    boxShadow: active ? '0 8px 16px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ 
                    width: 38, height: 38, borderRadius: 12, background: active ? 'white' : cat.bg, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
                    color: cat.color, boxShadow: active ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
                  }}>
                    {cat.icon && <cat.icon size={18} />}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: active ? '#0F0D2E' : '#64748B' }}>
                    {cat.id === 'fuel' ? getTranslatedText('Fuel') : cat.id === 'maintenance' ? getTranslatedText('Maintenance') : getTranslatedText('Other')}
                  </span>
                </button>
              )
            })}
          </div>

          <form onSubmit={onSubmit} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               {/* Logging Indicator */}
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: EXPENSE_CATEGORIES.find(c => c.id === activeTab)?.color }}>
                  {(() => {
                    const CatIcon = EXPENSE_CATEGORIES.find(c => c.id === activeTab)?.icon
                    return CatIcon ? <CatIcon size={16} /> : null
                  })()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                  {getTranslatedText('Logging')} {activeTab === 'fuel' ? getTranslatedText('Fuel') : activeTab === 'maintenance' ? getTranslatedText('Maintenance') : getTranslatedText('Other')}
                </span>
              </div>

              <Field label={getTranslatedText('Amount (₹)')} error={errors.amount} required>
                <div className="input-group">
                  <span className="input-prefix" style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹</span>
                  <input 
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    type="number" 
                    placeholder="0.00" 
                    className="form-input" 
                    style={{ fontSize: '1.5rem', fontWeight: 900 }}
                  />
                </div>
              </Field>

              <div className="grid-2-col" style={{ gap: 16 }}>
                <Field label={getTranslatedText('Date')} required>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input name="date" value={formData.date} onChange={handleChange} type="date" max={dayjs().format('YYYY-MM-DD')} className="form-input" style={{ paddingLeft: 38 }} />
                  </div>
                </Field>
                <Field label={getTranslatedText('Payment Mode')}>
                  <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="form-input">
                    <option value="cash">{getTranslatedText('Cash')}</option>
                    <option value="online">{getTranslatedText('Online')}</option>
                    <option value="bank">{getTranslatedText('Bank')}</option>
                  </select>
                </Field>
              </div>

              <Field label={getTranslatedText('Notes / Description')}>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={getTranslatedText('Expense notes (optional)')} 
                  className="form-input" 
                  style={{ minHeight: 100, resize: 'none' }}
                />
              </Field>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving || success}
                style={{ 
                  height: 54, borderRadius: 18, fontSize: '1rem', fontWeight: 800,
                  background: success ? '#16A34A' : '#7C3AED',
                  boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)'
                }}
              >
                {saving ? <Loader2 size={20} className="spin" /> : 
                 success ? <><CheckCircle2 size={20} /> {getTranslatedText('Saved Successfully')}</> : 
                 getTranslatedText('Record Expense')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-fadeIn">
          {/* Filter Bar */}
          <div style={{ background: 'white', padding: '18px', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 20, border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: 4, marginLeft: 4 }}>{getTranslatedText('From Date')}</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="date" 
                    value={rangeFrom} 
                    max={dayjs().format('YYYY-MM-DD')}
                    onChange={e => setRangeFrom(e.target.value)} 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 34px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: 700, background: 'white' }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: 4, marginLeft: 4 }}>{getTranslatedText('To Date')}</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="date" 
                    value={rangeTo} 
                    max={dayjs().format('YYYY-MM-DD')}
                    onChange={e => setRangeTo(e.target.value)} 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 34px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: 700, background: 'white' }} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {['All', 'Fuel', 'Maintenance', 'Other'].map(cat => {
                const active = historyCategory === cat
                const config = EXPENSE_CATEGORIES.find(c => c.label === cat) || { color: '#64748B', bg: '#F8FAFC' }
                return (
                  <button
                    key={cat}
                    onClick={() => setHistoryCategory(cat)}
                    style={{
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      boxSizing: 'border-box',
                      padding: '8px 16px',
                      borderRadius: 12,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      border: active ? `2px solid ${config.color}` : '2px solid transparent',
                      background: active ? config.bg : '#F1F5F9',
                      color: active ? config.color : '#64748B',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    {cat === 'All' ? 'All Records' : getTranslatedText(cat)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {EXPENSE_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ background: 'white', padding: '12px 10px', borderRadius: 18, border: '1px solid #F1F5F9', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  <cat.icon size={14} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F0D2E' }}>₹{categoryTotals[cat.label]?.toLocaleString() || 0}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{getTranslatedText(cat.label)}</div>
              </div>
            ))}
          </div>

          {/* Expense Detail List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: 4 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F0D2E' }}>
                {getTranslatedText('Report')}: {dayjs(rangeFrom).format('MMM YY')} - {dayjs(rangeTo).format('MMM YY')}
                <span style={{ marginLeft: 8, color: '#DC2626' }}>
                  ₹{filteredHistory.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>{filteredHistory.length} {getTranslatedText('items')}</div>
            </div>

              {filteredHistory.map((tx, idx) => {
                const config = EXPENSE_CATEGORIES.find(c => c.label === tx.category) || EXPENSE_CATEGORIES[2]
                return (
                  <div key={tx._id || idx} className="card animate-fadeIn" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: config.bg, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {config.icon && <config.icon size={20} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#1E293B' }}>
                          {tx.category === 'Fuel' ? getTranslatedText('Fuel') : tx.category === 'Maintenance' ? getTranslatedText('Maintenance') : getTranslatedText('Other')}
                        </p>
                        <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: '#DC2626' }}>-₹{tx.amount?.toLocaleString()}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{dayjs(tx.date).format('DD MMM YYYY')}</span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'capitalize' }}>
                          {tx.paymentMode === 'cash' ? getTranslatedText('Cash') : tx.paymentMode === 'online' ? getTranslatedText('Online') : tx.paymentMode === 'bank' ? getTranslatedText('Bank') : tx.paymentMode}
                        </span>
                      </div>
                      {tx.notes && <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#94A3B8', fontStyle: 'italic', paddingLeft: 4, borderLeft: '2px solid #F1F5F9' }}>{tx.notes}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      <style>{`
        .spin { animation: spin 0.8s linear infinite; } 
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .expense-category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .expense-filter-grid, .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 480px) {
          .expense-category-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .expense-filter-grid, .grid-2-col {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
        
        /* Smooth scrolling for iOS */
        * { -webkit-overflow-scrolling: touch; }
      `}</style>
    </div>
  )
}
