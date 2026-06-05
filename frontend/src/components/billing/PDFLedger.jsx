import { 
  Document, Page, Text, View, StyleSheet, Image 
} from '@react-pdf/renderer';
import dayjs from 'dayjs';

// Styles matching the professional aesthetics
const styles = StyleSheet.create({
  page: { padding: '275pt 25pt 210pt 25pt', fontSize: 10, color: '#000', fontFamily: 'Helvetica' },
  
  // Header
  header: { flexDirection: 'row', borderWidth: 1, borderColor: '#ccc' },
  headerGarage: { flexDirection: 'row', backgroundColor: '#FFB800', padding: 20, borderRadius: 4, marginBottom: 15 },
  logoBox: { width: '68%', paddingTop: 12, paddingBottom: 12, paddingLeft: 10, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 65, height: 45, objectFit: 'contain', marginRight: 15 },
  brandName: { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5 },
  slogan: { fontSize: 9, color: '#444', marginTop: 5 },
  
  metaBox: { width: '32%', borderLeftWidth: 1, borderLeftColor: '#ccc' },
  metaRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', height: 36, alignItems: 'center' },
  metaLabel: { width: '45%', paddingLeft: 8, fontWeight: 'bold', fontSize: 9 },
  metaVal: { width: '55%', paddingLeft: 4, fontWeight: 'bold', fontSize: 9.5 },

  // Addressing Info Area
  addressArea: { flexDirection: 'row', borderWidth: 1, borderTopWidth: 0, borderColor: '#ccc', marginBottom: 15 },
  addressAreaGarage: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  addrCol: { width: '50%', padding: 12 },
  addrColGarage: { width: '50%' },
  addrLabel: { fontWeight: 'bold', fontSize: 10, marginBottom: 6 },
  addrLabelGarage: { backgroundColor: '#FFB800', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 2, marginBottom: 10, fontSize: 9, fontWeight: 'bold', alignSelf: 'flex-start' },
  addrText: { fontSize: 8.5, color: '#333', lineHeight: 1.4 },

  // Summary Banner
  summaryBanner: { backgroundColor: '#F3811E', color: 'white', textAlign: 'center', padding: 8, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 },
  summaryBannerGarage: { backgroundColor: '#FFB800', color: '#000', textAlign: 'left', paddingVertical: 6, paddingHorizontal: 10, fontWeight: 'bold', fontSize: 9, borderRadius: 2, marginBottom: 8 },

  // Table
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#fdf7f2', 
    borderBottomWidth: 1, 
    borderLeftWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9,
    alignItems: 'stretch'
  },
  tableHeaderGarage: { 
    flexDirection: 'row', 
    backgroundColor: '#FFB800', 
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9,
    alignItems: 'stretch'
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc', 
    alignItems: 'stretch',
    fontSize: 9,
    minHeight: 13
  },
  tableCellGarage: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    justifyContent: 'center'
  },
  
  // Ledger Specific Columns Transport
  colDate: { width: '13%', textAlign: 'center', borderRightWidth: 1, borderColor: '#ccc' },
  colParticulars: { width: '31%', paddingLeft: 4, borderRightWidth: 1, borderColor: '#ccc' },
  colRefNo: { width: '14%', textAlign: 'center', borderRightWidth: 1, borderColor: '#ccc' },
  colDebit: { width: '14%', textAlign: 'right', paddingRight: 6, borderRightWidth: 1, borderColor: '#ccc' },
  colCredit: { width: '14%', textAlign: 'right', paddingRight: 6, borderRightWidth: 1, borderColor: '#ccc' },
  colBalance: { width: '14%', textAlign: 'right', fontWeight: 'bold', paddingRight: 4, borderRightWidth: 1, borderColor: '#ccc' },

  // Ledger Specific Columns Garage
  colDateGarage: { width: '13%', textAlign: 'center' },
  colParticularsGarage: { width: '31%', paddingLeft: 8 },
  colRefNoGarage: { width: '14%', textAlign: 'center' },
  colDebitGarage: { width: '14%', textAlign: 'right', paddingRight: 6 },
  colCreditGarage: { width: '14%', textAlign: 'right', paddingRight: 6 },
  colBalanceGarage: { width: '14%', textAlign: 'right', fontWeight: 'bold', paddingRight: 4 },

  // Footer Total Row
  totalRowArea: { flexDirection: 'row', borderWidth: 1, borderTopWidth: 0, borderColor: '#ccc' },
  gratitudeBanner: { width: '70%', backgroundColor: '#F3811E', color: 'white', padding: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 10 },
  totalLabelBox: { width: '15%', backgroundColor: '#f9f9f9', padding: 12, textAlign: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ccc', fontWeight: 'bold' },
  totalValBox: { width: '15%', padding: 12, textAlign: 'right', fontWeight: 'bold', fontSize: 12 },
  
  totalRowGarage: { flexDirection: 'row', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#ccc', marginTop: -1 },
  totalLabelGarage: { width: '80%', padding: 8, fontWeight: 'bold', textAlign: 'left', borderRightWidth: 1, borderColor: '#ccc' },
  totalValueGarage: { width: '20%', padding: 8, textAlign: 'right', fontWeight: 'bold', fontSize: 10, backgroundColor: '#f9f9f9', borderRightWidth: 1, borderColor: '#ccc' },

  // Bank Section
  bankSection: { marginTop: 15, borderWidth: 1, borderColor: '#ccc' },
  bankHeader: { backgroundColor: '#fdf3f0', paddingVertical: 4, paddingHorizontal: 10, fontSize: 8, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  bankContent: { padding: 10 },
  bankGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  bankItem: { width: '48%', flexDirection: 'row' },
  bankKey: { width: 80, fontSize: 8.5, color: '#555' },
  bankValue: { fontWeight: 'bold', fontSize: 9 },

  // Signature
  footerSection: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  footerBrand: { fontSize: 12, fontWeight: 'bold' },
  signBox: { width: 180, textAlign: 'center' },
  signLine: { borderTopWidth: 1, borderTopColor: '#000', marginTop: 35, marginBottom: 5 },
  signLabel: { fontSize: 8.5, fontWeight: 'bold' },
  
  termsBoxGarage: { width: '60%', borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 4, backgroundColor: '#fafafa' },
});

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export const PDFLedger = ({ ledgerEntries, party, business, isTransport }) => {
  const entries = ledgerEntries || [];
  const themeColor = isTransport ? '#F3811E' : '#FFB800';

  // Maximum 10 rows per page for Ledger
  const itemChunks = entries.length > 0 ? chunkArray(entries, 10) : [[]];

  const finalBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
  const balanceText = `${Math.abs(finalBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})} ${finalBalance > 0 ? 'Dr' : (finalBalance < 0 ? 'Cr' : '')}`;

  return (
    <Document>
      {itemChunks.map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View fixed style={{ position: 'absolute', top: 25, left: 25, right: 25 }}>
            {isTransport ? (
              <View style={styles.header}>
                <View style={styles.logoBox}>
                  <View style={{ width: 64, height: 64, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden', borderWidth: 1, borderStyle: 'solid', borderColor: '#eee' }}>
                    {business.logoUrl ? (
                      <Image src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{(business.businessName || 'B')[0]}</Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.brandName}>{business.businessName?.toUpperCase() || 'BUSINESS'}</Text>
                    <Text style={styles.slogan}>{business.slogan || 'Move What Matters'}</Text>
                  </View>
                </View>
                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Document:</Text>
                    <Text style={styles.metaVal}>Statement of Account</Text>
                  </View>
                  <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.metaLabel}>Date :</Text>
                    <Text style={styles.metaVal}>{dayjs().format('DD/MM/YYYY')}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.headerGarage}>
                <View style={{ width: '60%' }}>
                  <Text style={{ fontSize: 22, fontWeight: 'heavy', marginBottom: 2 }}>Statement of Account</Text>
                  <Text style={{ fontSize: 8.5, opacity: 0.9 }}>{business.slogan || 'Restoring Vehicles, Reviving Peace of Mind'}</Text>
                </View>
                <View style={{ width: '40%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                   <View style={{ width: 44, height: 44, backgroundColor: '#fff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                     {business.logoUrl ? (
                       <Image src={business.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                     ) : (
                       <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{(business.businessName || 'B')[0]}</Text>
                     )}
                   </View>
                   <View style={{ textAlign: 'right' }}>
                     <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{business.businessName?.toUpperCase()}</Text>
                     <Text style={{ fontSize: 7, marginTop: 4 }}>Date: {dayjs().format('DD/MM/YYYY')}</Text>
                   </View>
                </View>
              </View>
            )}

            <View style={isTransport ? styles.addressArea : styles.addressAreaGarage}>
              <View style={isTransport ? [styles.addrCol, { borderRightWidth: 1, borderColor: '#ccc', width: '100%' }] : [styles.addrColGarage, { width: '100%' }]}>
                <Text style={isTransport ? styles.addrLabel : styles.addrLabelGarage}>Party Details</Text>
                <Text style={[styles.addrText, { fontWeight: 'bold', fontSize: 10 }]}>{party.name}</Text>
                <Text style={styles.addrText}>{party.address}</Text>
                {(party.city || party.state || party.pincode) && (
                  <Text style={styles.addrText}>{[party.city, party.state, party.pincode].filter(Boolean).join(', ')}</Text>
                )}
                {party.phone && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Mob :</Text> {party.phone}</Text>}
                {party.email && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>Email :</Text> {party.email}</Text>}
                {party.gstin && <Text style={styles.addrText}><Text style={{ fontWeight: 'bold' }}>GSTIN :</Text> {party.gstin}</Text>}
              </View>
            </View>

            {isTransport ? (
              <View style={styles.summaryBanner}><Text>Ledger Details</Text></View>
            ) : (
              <View style={styles.summaryBannerGarage}><Text>Account Statement</Text></View>
            )}

            <View style={isTransport ? styles.tableHeader : styles.tableHeaderGarage}>
              {isTransport ? (
                <>
                  <Text style={[styles.colDate, { paddingVertical: 8 }]}>Date</Text>
                  <Text style={[styles.colParticulars, { paddingVertical: 8 }]}>Particulars</Text>
                  <Text style={[styles.colRefNo, { paddingVertical: 8 }]}>Ref No</Text>
                  <Text style={[styles.colDebit, { paddingVertical: 8 }]}>Bill Amt (Rs)</Text>
                  <Text style={[styles.colCredit, { paddingVertical: 8 }]}>Received (Rs)</Text>
                  <Text style={[styles.colBalance, { paddingVertical: 8 }]}>Balance (Rs)</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.tableCellGarage, styles.colDateGarage, { fontWeight: 'bold' }]}>Date</Text>
                  <Text style={[styles.tableCellGarage, styles.colParticularsGarage, { fontWeight: 'bold' }]}>Particulars</Text>
                  <Text style={[styles.tableCellGarage, styles.colRefNoGarage, { fontWeight: 'bold' }]}>Ref No</Text>
                  <Text style={[styles.tableCellGarage, styles.colDebitGarage, { fontWeight: 'bold' }]}>Bill Amt (Rs)</Text>
                  <Text style={[styles.tableCellGarage, styles.colCreditGarage, { fontWeight: 'bold' }]}>Received (Rs)</Text>
                  <Text style={[styles.tableCellGarage, styles.colBalanceGarage, { borderRightWidth: 0, fontWeight: 'bold' }]}>Balance (Rs)</Text>
                </>
              )}
            </View>
          </View>

          <View style={{ borderLeftWidth: 1, borderColor: '#ccc' }}>
            {chunk.map((item, idx) => (
              <View key={idx} style={styles.tableRow} wrap={false}>
                {isTransport ? (
                  <>
                    <Text style={[styles.colDate, { paddingVertical: 6 }]}>{dayjs(item.date).format('DD/MM/YY')}</Text>
                    <Text style={[styles.colParticulars, { paddingVertical: 6 }]}>{item.particulars}</Text>
                    <Text style={[styles.colRefNo, { paddingVertical: 6 }]}>{item.refNo}</Text>
                    <Text style={[styles.colDebit, { paddingVertical: 6 }]}>{item.debit > 0 ? item.debit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}</Text>
                    <Text style={[styles.colCredit, { paddingVertical: 6 }]}>{item.credit > 0 ? item.credit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}</Text>
                    <Text style={[styles.colBalance, { paddingVertical: 6 }]}>{Math.abs(item.balance).toLocaleString('en-IN', {minimumFractionDigits: 2})} {item.balance > 0 ? 'Dr' : (item.balance < 0 ? 'Cr' : '')}</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.tableCellGarage, styles.colDateGarage]}>{dayjs(item.date).format('DD/MM/YY')}</Text>
                    <Text style={[styles.tableCellGarage, styles.colParticularsGarage]}>{item.particulars}</Text>
                    <Text style={[styles.tableCellGarage, styles.colRefNoGarage]}>{item.refNo}</Text>
                    <Text style={[styles.tableCellGarage, styles.colDebitGarage]}>{item.debit > 0 ? item.debit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}</Text>
                    <Text style={[styles.tableCellGarage, styles.colCreditGarage]}>{item.credit > 0 ? item.credit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}</Text>
                    <Text style={[styles.tableCellGarage, styles.colBalanceGarage, { borderRightWidth: 0 }]}>{Math.abs(item.balance).toLocaleString('en-IN', {minimumFractionDigits: 2})} {item.balance > 0 ? 'Dr' : (item.balance < 0 ? 'Cr' : '')}</Text>
                  </>
                )}
              </View>
            ))}
            {entries.length === 0 && (
              <View style={styles.tableRow} wrap={false}>
                 <Text style={{ width: '100%', padding: 20, textAlign: 'center', fontSize: 10 }}>No transactions found.</Text>
              </View>
            )}

            {!isTransport && pageIndex === itemChunks.length - 1 && (
              <View style={{ marginTop: -1 }}>
                 <View style={styles.totalRowGarage}>
                   <Text style={[styles.totalLabelGarage, { fontWeight: 'bold', fontSize: 10 }]}>Final Balance</Text>
                   <Text style={[styles.totalValueGarage, { fontWeight: 'bold', fontSize: 11, backgroundColor: '#f2f2f2' }]}>{balanceText}</Text>
                 </View>
              </View>
            )}
          </View>

          {isTransport && pageIndex === itemChunks.length - 1 && (
            <View wrap={false} style={{ borderRightWidth: 1, borderColor: '#ccc', marginTop: -1 }}>
               <View style={styles.totalRowArea}>
                 <View style={[styles.gratitudeBanner, { backgroundColor: themeColor }]}><Text>{business.notes && business.notes !== 'Grateful for Moving What Matters to You!' ? business.notes : ' '}</Text></View>
                 <View style={styles.totalLabelBox}><Text>BALANCE :</Text></View>
                 <View style={styles.totalValBox}><Text>{balanceText}</Text></View>
               </View>
            </View>
          )}

          <View fixed style={{ position: 'absolute', bottom: 25, left: 25, right: 25 }}>
            <View style={styles.bankSection}>
              <View style={[styles.bankHeader, { backgroundColor: isTransport ? '#f3f3f3' : '#fdf3f0', flexDirection: 'row', justifyContent: 'space-between' }]}>
                <Text>BANK DETAILS :</Text>
              </View>
              <View style={styles.bankContent}>
                <View style={styles.bankGrid}>
                  <View style={styles.bankItem}>
                    <Text style={styles.bankKey}>Bank Name:</Text>
                    <Text style={styles.bankValue}>{(business.bankDetails?.bankName || 'NOT PROVIDED').toUpperCase()}</Text>
                  </View>
                  <View style={styles.bankItem}>
                    <Text style={styles.bankKey}>IFSC Code:</Text>
                    <Text style={styles.bankValue}>{(business.bankDetails?.ifsc || 'NOT PROVIDED').toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.bankGrid}>
                  <View style={styles.bankItem}>
                    <Text style={styles.bankKey}>Account No.:</Text>
                    <Text style={styles.bankValue}>{business.bankDetails?.accountNumber || 'NOT PROVIDED'}</Text>
                  </View>
                  <View style={styles.bankItem}>
                    <Text style={styles.bankKey}>Account Name:</Text>
                    <Text style={styles.bankValue}>{business.bankDetails?.accountName || 'NOT PROVIDED'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {!isTransport ? (
                <View style={styles.termsBoxGarage}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>Terms and Conditions</Text>
                  <Text style={{ fontSize: 7, color: '#555', lineHeight: 1.4 }}>
                    This is a computer generated statement of account. Please report any discrepancies immediately.
                  </Text>
                </View>
              ) : (
                <View style={{ width: '60%' }}>
                  <Text style={styles.footerBrand}>{business.businessName?.toUpperCase()}</Text>
                  <Text style={{ fontSize: 7, color: '#666', marginTop: 2 }}>{business.slogan}</Text>
                </View>
              )}

              <View style={styles.signBox}>
                <Text style={styles.signLabel}>{isTransport ? `For ${business.businessName},` : 'Authorized Signatory'}</Text>
                {business.signatureUrl ? (
                  <Image src={business.signatureUrl} style={{ width: 100, height: 40, marginTop: 5, marginBottom: 2, alignSelf: 'center', objectFit: 'contain' }} />
                ) : (
                  <View style={styles.signLine} />
                )}
              </View>
            </View>
            
            <View style={{ textAlign: 'center', marginTop: 10 }}>
              <Text style={{ fontSize: 7, color: '#555', marginBottom: 2, fontWeight: 'bold' }}>Generated by transbilling.in</Text>
              <Text style={{ fontSize: 7, color: '#999' }} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};
