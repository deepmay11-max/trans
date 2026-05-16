import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useBills } from '../../context/BillContext'
import { useAuth } from '../../context/AuthContext'
import { usePageTranslation } from '../../hooks/usePageTranslation'
import { ArrowLeft, Trash2, Download, FileText, Pencil, CheckCircle2, Share2 } from 'lucide-react'

import dayjs from 'dayjs'
import { useRef, useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PDFInvoice } from '../../components/billing/PDFInvoice'
import PaymentModal from '../../components/billing/PaymentModal'

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
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const numberToWords = (num) => {
  try {
    return amountToWords(Math.floor(num || 0))
  } catch (e) {
    return ''
  }
}

import { TransportInvoice, GarageInvoice } from '../../components/billing/InvoiceTemplates'

// ── Main Page ────────────────────────────────────────────────────────────────
export default function BillDetail() {
  const { id } = useParams()
  const { search } = useLocation()
  const viewOnly = new URLSearchParams(search).get('viewOnly') === 'true'
  const { fetchBill, deleteBill, recordPayment, markAsDownloaded } = useBills()
  const { user: sessionUser } = useAuth()
  const navigate = useNavigate()
  const printRef = useRef()
  const invoiceRef = useRef()
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

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
    'Name', 'Address', 'Phone', 'Make', 'Reg No', 'KMs', 'Bill No', 'Grateful for Moving What Matters to You!',
    'Parts Total', 'Labor Charges', 'GST', 'Discount'
  ])

  const business = (bill?.owner && typeof bill.owner === 'object') ? bill.owner : sessionUser;

  const handleDownloadPDF = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const iosWindow = isIOS ? window.open('', '_blank') : null;
    if (isIOS && iosWindow) {
      iosWindow.document.write('<p style="font-family:sans-serif; text-align:center; margin-top:20px;">Generating your PDF, please wait...</p>');
    }

    try {
      const pdfDoc = new jsPDF('p', 'mm', 'a4')
      const pages = document.querySelectorAll('.invoice-wrap, .garage-invoice-wrap')
      
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.75)
        const pdfWidth = pdfDoc.internal.pageSize.getWidth()
        const pdfHeight = pdfDoc.internal.pageSize.getHeight()
        
        if (i > 0) pdfDoc.addPage()
        pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
      }
      
      const fileName = `Invoice_${bill.billNumber || bill._id}.pdf`;
      
      if (isIOS && iosWindow) {
        const blob = pdfDoc.output('blob');
        const url = URL.createObjectURL(blob);
        iosWindow.location.href = url;
      } else {
        pdfDoc.save(fileName)
      }
      
      const updated = await markAsDownloaded(bill._id)
      if (updated) setBill(updated)
    } catch (err) {
      console.error('PDF Generation Error:', err)
      if (iosWindow) iosWindow.close();
      alert('Failed to generate PDF')
    } finally { setIsDownloading(false) }
  }

  const handleSharePDF = async (targetBill = bill) => {
    if (isSharing || !targetBill) return
    setIsSharing(true)

    try {
      const pdfDoc = new jsPDF('p', 'mm', 'a4')
      const pages = document.querySelectorAll('.invoice-wrap, .garage-invoice-wrap')
      
      if (pages.length === 0) {
        throw new Error('No invoice content found to share')
      }

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.75)
        const pdfWidth = pdfDoc.internal.pageSize.getWidth()
        const pdfHeight = pdfDoc.internal.pageSize.getHeight()
        
        if (i > 0) pdfDoc.addPage()
        pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
      }
      
      const fileName = `Invoice_${(targetBill.billNumber || targetBill._id).replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`
      const pdfBlob = pdfDoc.output('blob')
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })

      const shareUrl = `${window.location.origin}/view-bill/${targetBill._id}`

      if (navigator.share) {
        const shareData = {
          title: 'Invoice',
          text: `Invoice #${targetBill.billNumber || ''}\nView/Download here: ${shareUrl}`,
        }
        
        // Try sharing file + text if supported
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          try {
            await navigator.share({ ...shareData, files: [pdfFile] })
          } catch (shareErr) {
            // Fallback to text-only share if file share fails
            await navigator.share(shareData)
          }
        } else {
          // Text-only share
          await navigator.share(shareData)
        }
      } else {
        pdfDoc.save(fileName)
        alert('Sharing not supported on this browser. File has been downloaded.')
      }
      
      markAsDownloaded(targetBill._id)
    } catch (err) {
      console.error('PDF Share Error:', err)
      alert('Failed to share PDF')
    } finally { setIsSharing(false) }
  }

  useEffect(() => {
    if (!id || id === 'new') return
    setLoading(true)
    fetchBill(id).then(b => {
      if (b) {
        setBill(b)
        const autoShare = new URLSearchParams(search).get('autoShare') === 'true'
        if (autoShare) {
          setTimeout(() => handleSharePDF(b), 1000)
        }
      }
      setLoading(false)
    })
  }, [id, fetchBill, search])

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}><div style={{ fontSize: '0.9rem' }}>{getTranslatedText('Loading bill...')}</div></div>
  if (!bill) return <div style={{ textAlign: 'center', padding: 40 }}><h3>{getTranslatedText('Bill not found')}</h3><button className="btn btn-primary" onClick={() => navigate(`/${sessionUser?.role || 'transport'}/bills`)}>{getTranslatedText('Back to Bills')}</button></div>



  return (
    <div className="page-wrapper animate-fadeIn" style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12, padding: '0 8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <button onClick={() => navigate(`/${bill.billType}/bills`)} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}><ArrowLeft size={18} /></button>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F0D2E', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#{bill.billNumber || getTranslatedText('Draft')}</h2>
            <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>{dayjs(bill.billingDate || bill.createdAt).format('DD MMM YYYY')}</p>
          </div>
        </div>
        <div className="bill-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
          {!viewOnly && bill.status !== 'paid' && (
            <button 
              onClick={() => { if (window.confirm(getTranslatedText('Mark this bill as fully paid?'))) recordPayment(bill._id, bill.grandTotal || 0).then(u => u && setBill(u)) }} 
              className="action-btn paid"
              title={getTranslatedText('Mark Paid')}
            >
              <CheckCircle2 size={16} /> <span className="btn-text">{getTranslatedText('Mark Paid')}</span>
            </button>
          )}
          {!viewOnly && bill.status !== 'paid' && (
            <button 
              onClick={() => navigate(`/${bill.billType}/bills/edit/${bill._id}`)} 
              className="action-btn edit"
              title={bill.status === 'draft' ? getTranslatedText('Edit Draft') : getTranslatedText('Edit Bill')}
            >
              <Pencil size={16} /> <span className="btn-text">{bill.status === 'draft' ? getTranslatedText('Edit Draft') : getTranslatedText('Edit Bill')}</span>
            </button>
          )}
          {!viewOnly && (
            <button 
              onClick={() => { if (window.confirm(getTranslatedText('Delete this bill?'))) { deleteBill(id); navigate(`/${bill.billType}/bills`) } }} 
              className="action-btn delete"
              title={getTranslatedText('Delete this bill?')}
            >
              <Trash2 size={16} />
            </button>
          )}

          <button 
            onClick={() => handleSharePDF()} 
            disabled={isSharing} 
            className="action-btn share"
            title={getTranslatedText('Share PDF')}
            style={{ background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #DCFCE7' }}
          >
            <Share2 size={18} /> 
            <span className="btn-text">
              {isSharing ? getTranslatedText('Sharing...') : getTranslatedText('Share')}
            </span>
          </button>

          <button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading} 
            className={`action-btn download btn-primary ${viewOnly ? 'view-only-download' : ''}`}
            title={getTranslatedText('Download PDF')}
          >
            <Download size={18} /> 
            <span className="btn-text">
              {isDownloading ? getTranslatedText('Generating...') : getTranslatedText('Download PDF')}
            </span>
          </button>

        </div>
      </div>

      <div ref={printRef} className="bill-preview-scroll" style={{ background: '#f3f4f6', borderRadius: 20, padding: '40px 12px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)', overflowX: 'auto', margin: '0 8px' }}>
        <div ref={invoiceRef} style={{ minWidth: 800 }}>
          {bill.billType === 'garage' ? <GarageInvoice bill={bill} business={business} getTranslatedText={(t) => t} /> : <TransportInvoice bill={bill} business={business} getTranslatedText={(t) => t} />}
        </div>
      </div>

      <PaymentModal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} bill={bill} business={business} onSuccess={(amount) => recordPayment(bill._id, amount)} />

      <div style={{ marginTop: 20, textAlign: 'center' }}><button className="btn btn-ghost" onClick={() => navigate(`/${bill?.billType || 'transport'}/bills`)} style={{ fontSize: '0.85rem' }}><FileText size={16} /> {getTranslatedText('Back to all bills')}</button></div>

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

        .action-btn.download { 
          background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); 
          color: white; 
          border: none;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .action-btn.download.view-only-download {
          height: 38px;
          padding: 0 16px;
          font-size: 0.8125rem;
          box-shadow: 0 6px 15px -4px rgba(124, 58, 237, 0.4);
        }
        .action-btn.download.view-only-download .btn-text {
          font-weight: 800;
        }
        .action-btn:active { transform: scale(0.95); }
        
        @media (max-width: 500px) {
          .bill-actions {
            width: 100%;
            justify-content: flex-end !important;
            gap: 10px !important;
            justify-content: flex-start !important;
            flex-wrap: wrap !important;
            margin-top: 12px !important;
            z-index: 10;
          }
          .action-btn {
            flex-direction: row;
            height: 40px;
            padding: 0 16px;
            gap: 8px;
            border-radius: 10px;
          }
          .action-btn .btn-text {
            display: block !important;
            font-size: 0.75rem;
          }
          .action-btn.delete, .action-btn.print {
            width: auto;
            min-width: 50px;
          }
          .action-btn svg {
            width: 16px;
            height: 16px;
          }
          .action-btn.download.view-only-download {
            height: 36px !important;
            padding: 0 12px !important;
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </div>
  )
}
