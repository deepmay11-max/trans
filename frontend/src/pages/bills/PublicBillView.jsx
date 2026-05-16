import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicBill } from '../../api/billApi'
import { Download, Loader2, FileText, Share2, Printer, CheckCircle2 } from 'lucide-react'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// --- REUSED HELPERS ---
const amountToWords = (num) => {
  if (num === 0) return 'ZERO'
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN']
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY']
  const convert = (n) => {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
    if (n < 1000) return ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 !== 0 ? ' AND ' + convert(n % 100) : '')
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '')
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '')
    return convert(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '')
  }
  return convert(num) + ' ONLY'
}

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size));
  return result;
};

// --- REUSED LAYOUTS (Simplified for Public View) ---
function TransportInvoice({ bill, business }) {
  const items = [...(bill.items || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
  const itemChunks = items.length > 0 ? chunkArray(items, 15) : [[]]
  
  return (
    <div className="invoice-container" style={{ background: '#fff', width: '210mm', minHeight: '297mm', padding: '20mm', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 15, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          {business?.logoUrl ? <img src={business.logoUrl} alt="logo" style={{ maxHeight: 60, marginBottom: 10 }} /> : <h2 style={{ margin: 0, fontWeight: 900 }}>{business?.businessName || business?.name || 'TAX INVOICE'}</h2>}
          <p style={{ margin: 0, fontSize: 12 }}>{business?.address}, {business?.city}</p>
          <p style={{ margin: 0, fontSize: 12 }}>Phone: {business?.phone} | GSTIN: {business?.gstin || 'N/A'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#000' }}>INVOICE</h1>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>#{bill.billNumber}</p>
          <p style={{ margin: 0, fontSize: 12 }}>Date: {dayjs(bill.billingDate).format('DD/MM/YYYY')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 30 }}>
        <div>
          <h4 style={{ margin: '0 0 5px', fontSize: 11, color: '#666' }}>BILLED TO:</h4>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{bill.party?.name || bill.billedToName}</h3>
          <p style={{ margin: 0, fontSize: 12 }}>{bill.party?.address || bill.billedToAddress}</p>
          <p style={{ margin: 0, fontSize: 12 }}>GSTIN: {bill.party?.gstin || bill.billedToGstin || 'N/A'}</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ border: '1px solid #000', padding: 8, fontSize: 11, textAlign: 'left' }}>DATE</th>
            <th style={{ border: '1px solid #000', padding: 8, fontSize: 11, textAlign: 'left' }}>TEMPO / VEHICLE</th>
            <th style={{ border: '1px solid #000', padding: 8, fontSize: 11, textAlign: 'left' }}>FROM / TO</th>
            <th style={{ border: '1px solid #000', padding: 8, fontSize: 11, textAlign: 'right' }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #000', padding: 8, fontSize: 11 }}>{dayjs(it.date).format('DD/MM/YY')}</td>
              <td style={{ border: '1px solid #000', padding: 8, fontSize: 11 }}>{it.tempoNo}</td>
              <td style={{ border: '1px solid #000', padding: 8, fontSize: 11 }}>{it.companyFrom} → {it.companyTo}</td>
              <td style={{ border: '1px solid #000', padding: 8, fontSize: 11, textAlign: 'right' }}>₹{Number(it.amount).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" style={{ border: '1px solid #000', padding: 8, textAlign: 'right', fontWeight: 900 }}>SUBTOTAL</td>
            <td style={{ border: '1px solid #000', padding: 8, textAlign: 'right', fontWeight: 900 }}>₹{Number(bill.subTotal).toLocaleString()}</td>
          </tr>
          <tr>
            <td colSpan="3" style={{ border: '1px solid #000', padding: 8, textAlign: 'right', fontWeight: 900 }}>GST ({bill.gstPercent}%)</td>
            <td style={{ border: '1px solid #000', padding: 8, textAlign: 'right', fontWeight: 900 }}>₹{Number(bill.gstAmount).toLocaleString()}</td>
          </tr>
          <tr style={{ background: '#f3f4f6' }}>
            <td colSpan="3" style={{ border: '1px solid #000', padding: 8, textAlign: 'right', fontSize: 14, fontWeight: 900 }}>GRAND TOTAL</td>
            <td style={{ border: '1px solid #000', padding: 8, textAlign: 'right', fontSize: 14, fontWeight: 900 }}>₹{Number(bill.grandTotal).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      
      <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
        <div>
           <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>AMOUNT IN WORDS:</p>
           <p style={{ fontSize: 11, margin: 0, textTransform: 'uppercase' }}>{amountToWords(bill.grandTotal)}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
           <div style={{ height: 60 }}>{business?.signatureUrl && <img src={business.signatureUrl} style={{ maxHeight: 60 }} />}</div>
           <p style={{ borderTop: '1px solid #000', paddingTop: 5, fontSize: 11, fontWeight: 900 }}>AUTHORIZED SIGNATORY</p>
        </div>
      </div>
    </div>
  )
}

function GarageInvoice({ bill, business }) {
  return (
    <div style={{ background: '#fff', width: '210mm', minHeight: '297mm', padding: '20mm', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
       {/* Minimalist Garage Template */}
       <div style={{ textAlign: 'center', marginBottom: 30 }}>
         <h1 style={{ margin: 0, fontWeight: 900, color: '#7C3AED' }}>{business?.businessName || 'JOB CARD'}</h1>
         <p style={{ margin: 0, fontSize: 12 }}>{business?.address} | {business?.phone}</p>
       </div>
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: '#f9fafb', padding: 15, borderRadius: 10 }}>
            <h4 style={{ margin: '0 0 5px', fontSize: 10 }}>CUSTOMER:</h4>
            <p style={{ margin: 0, fontWeight: 800 }}>{bill.customerName}</p>
            <p style={{ margin: 0, fontSize: 11 }}>{bill.customerPhone}</p>
            <p style={{ margin: 0, fontSize: 11 }}>{bill.vehicleNo} ({bill.vehicleCompany} {bill.vehicleModel})</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0 }}>INVOICE #{bill.billNumber}</h2>
            <p>Date: {dayjs(bill.billingDate).format('DD MMM YYYY')}</p>
          </div>
       </div>
       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
         <thead style={{ background: '#7C3AED', color: '#fff' }}>
           <tr>
             <th style={{ padding: 12, textAlign: 'left' }}>SERVICE DESCRIPTION</th>
             <th style={{ padding: 12, textAlign: 'right' }}>AMOUNT</th>
           </tr>
         </thead>
         <tbody>
           {bill.items?.map((it, idx) => (
             <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
               <td style={{ padding: 12 }}>{it.description}</td>
               <td style={{ padding: 12, textAlign: 'right' }}>₹{Number(it.amount).toLocaleString()}</td>
             </tr>
           ))}
         </tbody>
         <tfoot>
            <tr style={{ fontWeight: 900 }}>
              <td style={{ padding: 12, textAlign: 'right' }}>TOTAL</td>
              <td style={{ padding: 12, textAlign: 'right' }}>₹{Number(bill.grandTotal).toLocaleString()}</td>
            </tr>
         </tfoot>
       </table>
    </div>
  )
}

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
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Invoice_${bill.billNumber}.pdf`)
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
      <nav style={{ background: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', sticky: 'top', top: 0, zIndex: 10 }}>
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

      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ background: '#D1FAE5', padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: '#065F46', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} /> Verified Invoice from {bill.owner?.businessName || bill.owner?.name}
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
          <div ref={invoiceRef}>
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
