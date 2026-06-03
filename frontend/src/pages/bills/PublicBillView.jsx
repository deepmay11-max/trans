import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicBill } from '../../api/billApi'
import { Download, Loader2, FileText, Share2, Printer, CheckCircle2 } from 'lucide-react'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import { TransportInvoice, GarageInvoice } from '../../components/billing/InvoiceTemplates'

export default function PublicBillView() {
  const { id } = useParams()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const invoiceRef = useRef()

  useEffect(() => {
    getPublicBill(id)
      .then(res => {
        if (res.success) setBill(res.bill)
        else setError(res.message || 'Invoice not found')
      })
      .catch(err => setError('Connection failed'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = async () => {
    if (!invoiceRef.current) return
    const pages = invoiceRef.current.querySelectorAll('.invoice-wrap, .garage-invoice-wrap')
    const pdf = new jsPDF('p', 'mm', 'a4')

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      if (i > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    }
    pdf.save(`Invoice_${bill.billNumber || 'Downloaded'}.pdf`)
  }

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 size={40} className="spin" color="#6366F1" />
      <p style={{ marginTop: 15, fontWeight: 700, color: '#64748B' }}>Fetching your invoice...</p>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
      <FileText size={64} color="#CBD5E1" style={{ marginBottom: 20 }} />
      <h2 style={{ fontWeight: 900, color: '#0F172A' }}>Oops! Link Expired</h2>
      <p style={{ color: '#64748B', maxWidth: 400 }}>{error}</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: 60 }}>
      {/* Public Header */}
      <nav style={{ background: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>TR</div>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>TRANS<span style={{ color: '#6366F1' }}>BILLING</span></span>
        </div>
        <button
          onClick={handleDownload}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: '#6366F1', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}
        >
          <Download size={18} /> Download PDF
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 16px' }}>
        <div style={{ background: '#D1FAE5', padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: '#065F46', fontSize: '0.875rem', fontWeight: 600, maxWidth: 840, margin: '0 auto 20px' }}>
          <CheckCircle2 size={18} /> Verified Invoice from {bill.owner?.businessName || bill.owner?.name}
        </div>

        <div style={{ overflowX: 'auto', padding: '10px 0' }}>
          <div ref={invoiceRef} style={{ width: 'fit-content', margin: '0 auto' }}>
            {bill.billType === 'garage' ? <GarageInvoice bill={bill} business={bill.owner} /> : <TransportInvoice bill={bill} business={bill.owner} />}
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>
          <p>This is a computer generated invoice. No signature required.</p>
          <p>© {new Date().getFullYear()} TransBilling Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
