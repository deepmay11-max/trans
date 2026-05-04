const XLSX = require('xlsx');
const fs = require('fs');

try {
    const workbook = XLSX.readFile('455077859-India.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    let currentBrand = '';
    const cleanedData = data.map(row => {
        if (row.BRAND) {
            currentBrand = row.BRAND.trim();
        }
        return {
            brand: currentBrand,
            model: String(row.MODEL || '').trim()
        };
    }).filter(row => row.model);
    
    fs.writeFileSync('car_models.json', JSON.stringify(cleanedData, null, 2));
    console.log('Successfully converted Excel to JSON. First 5 records:');
    console.log(cleanedData.slice(0, 5));
} catch (error) {
    console.error('Error reading Excel file:', error);
}
