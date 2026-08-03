/**
 * Trendy Pearls Store Auto-Sync Engine
 * Reads products.xlsx (or products.csv) directly with SheetJS!
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const BASE_DIR = __dirname;
const XLSX_FILE = path.join(BASE_DIR, 'products.xlsx');
const CSV_FILE = path.join(BASE_DIR, 'products.csv');
const RAW_IMG_DIR = path.join(BASE_DIR, 'raw_images');
const OUTPUT_IMG_DIR = path.join(BASE_DIR, 'images');
const DATA_DIR = path.join(BASE_DIR, 'data');
const JSON_FILE = path.join(DATA_DIR, 'products.json');
const JS_FILE = path.join(DATA_DIR, 'products.js');

function ensureDirectories() {
    if (!fs.existsSync(RAW_IMG_DIR)) fs.mkdirSync(RAW_IMG_DIR, { recursive: true });
    if (!fs.existsSync(OUTPUT_IMG_DIR)) fs.mkdirSync(OUTPUT_IMG_DIR, { recursive: true });
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function resolveImagePath(rawName) {
    if (!rawName) return null;
    const strName = String(rawName).trim();
    if (!strName) return null;
    
    const nameNoExt = path.parse(strName).name;
    
    if (fs.existsSync(OUTPUT_IMG_DIR)) {
        const allFiles = fs.readdirSync(OUTPUT_IMG_DIR);
        // Match exact filename or matching base name ignoring extension and case
        const matchedFile = allFiles.find(f => {
            const fNameNoExt = path.parse(f).name;
            return f.toLowerCase() === strName.toLowerCase() || fNameNoExt.toLowerCase() === nameNoExt.toLowerCase();
        });

        if (matchedFile) {
            return `images/${matchedFile}`;
        }
    }

    return `images/${strName}`;
}

const catCounters = {
    'bags': 100,
    'jewelry': 200,
    'ladies wear': 300,
    'kids wear': 400,
    'accessories': 500,
    'general': 600
};

const catPrefixes = {
    'bags': 'BG',
    'jewelry': 'JW',
    'ladies wear': 'LW',
    'kids wear': 'KD',
    'accessories': 'AC',
    'general': 'PR'
};

function generateNextProductCode(category) {
    const catKey = (category || 'general').toLowerCase();
    const prefix = catPrefixes[catKey] || 'PR';
    if (!catCounters[catKey]) catCounters[catKey] = 600;
    catCounters[catKey]++;
    return `${prefix}-${catCounters[catKey]}`;
}

function readStoreCatalog() {
    let rows = [];

    if (fs.existsSync(XLSX_FILE)) {
        console.log(`Reading Excel file: ${XLSX_FILE}...`);
        const workbook = XLSX.readFile(XLSX_FILE);
        const sheetName = workbook.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (fs.existsSync(CSV_FILE)) {
        console.log(`Reading CSV file: ${CSV_FILE}...`);
        const workbook = XLSX.readFile(CSV_FILE);
        const sheetName = workbook.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
        console.error("Error: Neither products.xlsx nor products.csv found!");
        return [];
    }

    const products = [];

    rows.forEach((row, i) => {
        const category = String(row['Category'] || 'General').trim();

        // Auto-generate Product Code if blank
        let code = row['Product Code'];
        if (!code || String(code).trim() === '') {
            code = generateNextProductCode(category);
        } else {
            code = String(code).trim();
        }

        const price = parseFloat(row['Price']) || 0;
        const origPrice = parseFloat(row['Original Price']) || price;
        const discountPct = (origPrice > price && origPrice > 0) ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
        
        // Multi-Image Resolution (Image 1, Image 2, Image 3 or legacy Image File Name)
        const rawImg1 = row['Image 1'] || row['Image File Name'] || '';
        const rawImg2 = row['Image 2'] || '';
        const rawImg3 = row['Image 3'] || '';

        const images = [];
        const resolved1 = resolveImagePath(rawImg1);
        if (resolved1) images.push(resolved1);

        const resolved2 = resolveImagePath(rawImg2);
        if (resolved2) images.push(resolved2);

        const resolved3 = resolveImagePath(rawImg3);
        if (resolved3) images.push(resolved3);

        if (images.length === 0) {
            images.push('images/placeholder.svg');
        }

        const isJewellery = (category.toLowerCase() === 'jewellery' || category.toLowerCase() === 'jewelry');
        const subcategory = isJewellery ? String(row['Subcategory'] || '').trim() : '';

        products.push({
            code: code,
            name: String(row['Product Name'] || 'Untitled Product').trim(),
            category: category,
            subcategory: subcategory,
            price: price,
            originalPrice: origPrice,
            discountPct: discountPct,
            stockStatus: String(row['Stock Status'] || 'In Stock').trim(),
            image: images[0],
            images: images,
            size: String(row['Size'] || '').trim(),
            description: String(row['Description'] || '').trim(),
            featured: (String(row['Featured']).toLowerCase() === 'yes' || String(row['Featured']).toLowerCase() === 'true')
        });
    });

    return products;
}

function main() {
    console.log('=========================================');
    console.log('   Trendy Pearls Auto-Sync Engine       ');
    console.log('=========================================');
    ensureDirectories();
    
    const products = readStoreCatalog();
    fs.writeFileSync(JSON_FILE, JSON.stringify(products, null, 2), 'utf-8');
    fs.writeFileSync(JS_FILE, `window.BOOTSTRAP_PRODUCTS = ${JSON.stringify(products, null, 2)};`, 'utf-8');
    
    console.log(`SUCCESS: Synced ${products.length} products to data/products.json and data/products.js`);
    console.log('=========================================');
}

main();
