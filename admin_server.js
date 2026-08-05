const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const XLSX = require('xlsx');

const app = express();
let PORT = process.env.PORT || 3000;

const DATA_JSON = path.join(__dirname, 'data', 'products.json');
const DATA_JS = path.join(__dirname, 'data', 'products.js');
const XLSX_FILE = path.join(__dirname, 'products.xlsx');
const IMAGES_DIR = path.join(__dirname, 'images');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dedicated Admin Panel Routes so /admin, /admin/, /admin.html all work 100%
app.get(['/admin', '/admin/', '/admin.html', '/dashboard'], (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(__dirname));

// Setup Multer for Drag & Drop image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
        cb(null, IMAGES_DIR);
    },
    filename: function (req, file, cb) {
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, cleanName);
    }
});
const upload = multer({ storage: storage });

// Helper to read products
function getProducts() {
    try {
        if (fs.existsSync(DATA_JSON)) {
            const content = fs.readFileSync(DATA_JSON, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e) {
        console.error('Error reading JSON:', e);
    }
    return [];
}

// Helper to save products to products.json, products.js, and products.xlsx
function saveProducts(products) {
    fs.writeFileSync(DATA_JSON, JSON.stringify(products, null, 2), 'utf-8');
    fs.writeFileSync(DATA_JS, `window.BOOTSTRAP_PRODUCTS = ${JSON.stringify(products, null, 2)};`, 'utf-8');

    // Update Excel file
    try {
        const excelRows = products.map(p => {
            const imgs = (Array.isArray(p.images) && p.images.length > 0) 
                ? p.images 
                : [p.image || 'images/placeholder.svg'];
            return {
                'Product Code': p.code,
                'Product Name': p.name,
                'Category': p.category,
                'Subcategory': (p.category === 'Jewellery' || p.category === 'Jewelry') ? (p.subcategory || '') : '',
                'Price': p.price,
                'Original Price': p.originalPrice || p.price,
                'Stock Status': p.stockStatus || 'In Stock',
                'Size': p.size || '',
                'Image 1': (imgs[0] || '').replace(/^images\//, ''),
                'Image 2': (imgs[1] || '').replace(/^images\//, ''),
                'Image 3': (imgs[2] || '').replace(/^images\//, ''),
                'Description': p.description || '',
                'Featured': p.featured ? 'Yes' : 'No'
            };
        });
        const ws = XLSX.utils.json_to_sheet(excelRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        XLSX.writeFile(wb, XLSX_FILE);
    } catch (e) {
        console.error('Error writing Excel file:', e);
    }
}

// API: Get products
app.get('/api/products', (req, res) => {
    res.json(getProducts());
});

// API: Upload image(s) (Drag & Drop or File Input, single or multiple)
app.post('/api/upload', upload.array('imageFiles', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
    }
    const uploadedPaths = req.files.map(f => `images/${f.filename}`);
    res.json({ 
        success: true, 
        imagePaths: uploadedPaths, 
        imagePath: uploadedPaths[0],
        filenames: req.files.map(f => f.filename) 
    });
});

// API: Save or Update Product
app.post('/api/products', (req, res) => {
    const newProd = req.body;
    let products = getProducts();

    if (!newProd.code) {
        return res.status(400).json({ error: 'Product Code is required' });
    }

    const index = products.findIndex(p => p.code.toLowerCase().trim() === newProd.code.toLowerCase().trim());
    
    // Process prices
    const price = parseFloat(newProd.price) || 0;
    const origPrice = parseFloat(newProd.originalPrice) || price;
    const discountPct = (origPrice > price && origPrice > 0) ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

    let images = Array.isArray(newProd.images) && newProd.images.length > 0 
        ? newProd.images 
        : [newProd.image || 'images/placeholder.svg'];
    
    // Filter out duplicates and empty strings
    images = Array.from(new Set(images.filter(img => Boolean(img && img.trim()))));
    if (images.length === 0) images = ['images/placeholder.svg'];

    const category = newProd.category || 'Ladies Wear';
    const isJewellery = (category === 'Jewellery' || category === 'Jewelry');

    const formattedProd = {
        code: newProd.code.trim().toUpperCase(),
        name: newProd.name || 'Untitled Product',
        category: category,
        subcategory: isJewellery ? (newProd.subcategory || '') : '',
        price: price,
        originalPrice: origPrice,
        discountPct: discountPct,
        stockStatus: newProd.stockStatus || 'In Stock',
        image: images[0],
        images: images,
        size: newProd.size || '',
        description: newProd.description || '',
        featured: Boolean(newProd.featured)
    };

    if (index >= 0) {
        products[index] = formattedProd;
    } else {
        products.push(formattedProd);
    }

    saveProducts(products);
    res.json({ success: true, product: formattedProd, total: products.length });
});

// API: Delete Product
app.delete('/api/products/:code', (req, res) => {
    const code = req.params.code;
    let products = getProducts();
    const filtered = products.filter(p => p.code.toLowerCase().trim() !== code.toLowerCase().trim());

    if (filtered.length === products.length) {
        return res.status(404).json({ error: 'Product not found' });
    }

    saveProducts(filtered);
    res.json({ success: true, remaining: filtered.length });
});

// API: Publish to GitHub with auto pull/sync & force-sync fallback to fix "fetch first / rejected" errors
app.post('/api/publish', (req, res) => {
    exec('git --version', (gitCheckErr) => {
        if (gitCheckErr) {
            return res.status(400).json({ 
                success: false, 
                error: 'Git is not installed on this laptop! Download Git from https://git-scm.com/downloads' 
            });
        }

        const repoUrl = 'https://github.com/trendypearlsjp/trendypearlsv2.git';
        const gitDir = path.join(__dirname, '.git');
        
        // Auto-initialize Git repo if .git directory is missing
        if (!fs.existsSync(gitDir)) {
            try {
                execSync(`git init && git remote add origin ${repoUrl} && git branch -M main`, { cwd: __dirname });
            } catch(e){}
        }

        // Auto-configure user identity
        try {
            execSync('git config user.email "trendypearlsjp@gmail.com" && git config user.name "Trendy Pearls Boutique"', { cwd: __dirname });
        } catch(e){}

        // Smart status check & commit
        exec('git status --porcelain', { cwd: __dirname }, (statusErr, stdout) => {
            const hasChanges = stdout && stdout.trim().length > 0;
            const msg = `Update store products via Admin Panel - ${new Date().toLocaleString()}`;

            if (hasChanges) {
                try {
                    execSync(`git add . && git commit -m "${msg}"`, { cwd: __dirname });
                } catch(e){}
            }

            // Sync with GitHub (pull latest first, then push)
            const syncCmd = `git pull --rebase origin main ; git push origin main`;

            exec(syncCmd, { cwd: __dirname }, (pushErr, pushStdout, pushStderr) => {
                if (pushErr) {
                    console.warn('Standard push warning, retrying with forced sync:', pushStderr);

                    if (pushStderr.includes('Authentication failed') || pushStderr.includes('could not read Username') || pushStderr.includes('Permission denied')) {
                        return res.status(400).json({
                            success: false,
                            error: '🔑 GitHub Login Required: Double-click update_store.bat once to complete 1-time GitHub sign-in on this laptop!'
                        });
                    }

                    // Fallback to force push if remote branch diverged ("fetch first / rejected")
                    const forceCmd = `git push -f origin main`;
                    exec(forceCmd, { cwd: __dirname }, (fErr, fOut, fStderr) => {
                        if (fErr) {
                            return res.status(500).json({ 
                                success: false, 
                                error: fStderr || fErr.message 
                            });
                        }
                        res.json({ 
                            success: true, 
                            output: 'Store catalog published live to GitHub!' 
                        });
                    });
                    return;
                }

                res.json({ 
                    success: true, 
                    output: 'Store catalog published live to GitHub!' 
                });
            });
        });
    });
});

function startServer(p) {
    const server = app.listen(p, () => {
        console.log(`===================================================`);
        console.log(` Trendy Pearls Admin Server Running!               `);
        console.log(` Admin Dashboard: http://localhost:${p}/admin   `);
        console.log(` Live Store Preview: http://localhost:${p}/      `);
        console.log(`===================================================`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`[NOTICE] Port ${p} is in use. Switching to Port ${p + 1}...`);
            startServer(p + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(PORT);
