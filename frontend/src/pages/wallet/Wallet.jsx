import { useState, useEffect } from 'react'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle } from 'lucide-react'
import { getWallet } from '../../api/walletApi'

export default function Wallet() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await getWallet()
        if (res.success) {
          setBalance(res.walletBalance)
          setTransactions(res.transactions)
        } else {
          setError('Failed to load wallet data')
        }
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchWallet()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="spin" size={32} color="#7C3AED" />
        <style>{`
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#DC2626' }}>
        <AlertCircle size={40} style={{ marginBottom: 10 }} />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px' }}>
      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        color: 'white',
        borderRadius: 24,
        padding: '36px 24px',
        boxShadow: '0 20px 30px rgba(124, 58, 237, 0.3)',
        marginBottom: 30,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background glow */}
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.15 }}>
          <WalletIcon size={160} />
        </div>
        
        <span style={{ fontSize: '0.75rem', fontWeight: 850, opacity: 0.9, letterSpacing: '0.1em' }}>
          WALLET BALANCE
        </span>
        <h2 style={{ fontSize: '2.75rem', fontWeight: 950, marginTop: 8, marginBottom: 0, letterSpacing: '-0.02em' }}>
          ₹{balance.toLocaleString('en-IN')}
        </h2>
      </div>

      {/* Transactions Section */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: 16, letterSpacing: '-0.02em' }}>
          Recent Transactions
        </h3>

        {transactions.length === 0 ? (
          <div style={{
            background: '#F8FAFC',
            borderRadius: 20,
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748B',
            border: '1px dashed #E2E8F0'
          }}>
            <WalletIcon size={40} style={{ marginBottom: 12, opacity: 0.3, color: '#4F46E5' }} />
            <p style={{ margin: 0, fontWeight: 750, fontSize: '0.9rem' }}>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transactions.map((tx) => {
              const isCredit = tx.amount > 0
              return (
                <div key={tx._id} style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.01)',
                  border: '1px solid #F1F5F9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: isCredit ? '#ECFDF5' : '#FEF2F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCredit ? '#10B981' : '#EF4444'
                    }}>
                      {isCredit ? <ArrowUpRight size={22} strokeWidth={2.5} /> : <ArrowDownLeft size={22} strokeWidth={2.5} />}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                        {tx.description || (isCredit ? 'Credit' : 'Debit')}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginTop: 2 }}>
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: isCredit ? '#10B981' : '#EF4444'
                  }}>
                    {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
