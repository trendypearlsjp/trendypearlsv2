// Clean URL Bar: Automatically strips .html and index.html from browser address bar
(function cleanUrlBar() {
    try {
        if (typeof window === "undefined" || !window.history || !window.history.replaceState) return;
        const path = window.location.pathname;
        let cleanPath = null;

        if (path.endsWith('/index.html')) {
            cleanPath = path.replace(/\/index\.html$/, '/');
        } else if (path.endsWith('/ladies-wear.html')) {
            cleanPath = path.replace(/\/ladies-wear\.html$/, '/ladieswear');
        } else if (path.endsWith('/jewellery.html')) {
            cleanPath = path.replace(/\/jewellery\.html$/, '/jewellery');
        } else if (path.endsWith('/kids-wear.html')) {
            cleanPath = path.replace(/\/kids-wear\.html$/, '/kidswear');
        } else if (path.endsWith('/mens-wear.html')) {
            cleanPath = path.replace(/\/mens-wear\.html$/, '/menswear');
        }

        if (cleanPath && cleanPath !== path) {
            window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
        }
    } catch (e) {}
})();

const CONFIG = {
    // Replace with your shop owner's WhatsApp number (country code + phone number)
    whatsappNumber: "61461522439",
    currency: "A$",
    itemsPerPage: 24,
    // Silent Google Form Auto-Sync Endpoint (Captures orders even if client doesn't send WhatsApp message)
    googleFormUrl: "https://docs.google.com/forms/u/0/d/e/YOUR_GOOGLE_FORM_ID/formResponse",
    googleFormEntries: {
        customerName: "entry.1000001",
        customerPhone: "entry.1000002",
        customerAddress: "entry.1000003",
        orderDetails: "entry.1000004",
        totalAmount: "entry.1000005"
    }
};

// Global Application State
let catalog = [];
let cart = JSON.parse(localStorage.getItem("tp_cart") || "[]");
let currentCheckoutItems = [];
let selectedSizeForModal = "";
let filteredCatalog = [];
let currentCategory = (typeof window !== "undefined" && window.PAGE_CATEGORY) ? window.PAGE_CATEGORY : "All";
let searchQuery = "";
let inStockOnly = false;
let currentSort = "featured";
let currentPage = 1;
let selectedModalProduct = null;

// DOM Element Selectors
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const instockCheckbox = document.getElementById("instock-only-checkbox");
const sortSelect = document.getElementById("sort-select");
const resultsCountEl = document.getElementById("results-count");
const activeFilterBadge = document.getElementById("active-filter-badge");
const noResultsEl = document.getElementById("no-results");
const paginationWrapper = document.getElementById("pagination-wrapper");
const pageNumbersEl = document.getElementById("page-numbers");
const prevPageBtn = document.getElementById("prev-page-btn");
const nextPageBtn = document.getElementById("next-page-btn");

// Modal Selectors
const productModal = document.getElementById("product-modal");
const modalImg = document.getElementById("modal-img");
const modalDiscountBadge = document.getElementById("modal-discount-badge");
const modalCat = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalCode = document.getElementById("modal-code");
const modalStockBadge = document.getElementById("modal-stock-badge");
const modalPrice = document.getElementById("modal-price");
const modalOrigPrice = document.getElementById("modal-orig-price");
const modalSavings = document.getElementById("modal-savings");
const modalDesc = document.getElementById("modal-desc");

const DEFAULT_CATALOG = [
    {
        code: "BG-101",
        name: "Embroidered Floral Velvet Tote Bag",
        category: "Bags",
        price: 1299,
        originalPrice: 1999,
        discountPct: 35,
        stockStatus: "In Stock",
        image: "images/3d_luxury_bag.jpg",
        description: "Luxurious 3D designer tote bag with intricate embroidery, dual shoulder handles, and gold hardware.",
        featured: true
    },
    {
        code: "BG-102",
        name: "Classic Leatherette Crossbody Sling",
        category: "Bags",
        price: 899,
        originalPrice: 1499,
        discountPct: 40,
        stockStatus: "In Stock",
        image: "images/bag_sling_02.svg",
        description: "Sleek premium leatherette crossbody sling bag with adjustable chain strap.",
        featured: false
    },
    {
        code: "JW-201",
        name: "Royal Choker Jewelry Set",
        category: "Jewelry",
        price: 1899,
        originalPrice: 2999,
        discountPct: 37,
        stockStatus: "In Stock",
        image: "images/3d_kundan_jewelry.jpg",
        description: "Handcrafted antique gold choker necklace set with matching earrings.",
        featured: true
    },
    {
        code: "JW-202",
        name: "Rose Gold Crystal Drop Earrings",
        category: "Jewelry",
        price: 499,
        originalPrice: 999,
        discountPct: 50,
        stockStatus: "In Stock",
        image: "images/jewelry_earrings_02.svg",
        description: "Elegant rose gold plated teardrop crystal earrings with sparkling zircon stones.",
        featured: false
    },
    {
        code: "JW-203",
        name: "Traditional Temple Work Gold Bangles (Set of 4)",
        category: "Jewelry",
        price: 799,
        originalPrice: 1299,
        discountPct: 38,
        stockStatus: "In Stock",
        image: "images/jewelry_bangles_03.svg",
        description: "Traditional temple design gold-toned bangles with intricate goddess motif carving.",
        featured: false
    },
    {
        code: "LW-301",
        name: "Designer Anarkali Kurti with Dupatta",
        category: "Ladies Wear",
        price: 2499,
        originalPrice: 3999,
        discountPct: 38,
        stockStatus: "In Stock",
        image: "images/ladies_anarkali_01.svg",
        description: "Premium georgette flared Anarkali suit with heavy thread work and matching chiffon dupatta.",
        featured: true
    },
    {
        code: "LW-302",
        name: "Handcrafted Silk Saree with Zari Border",
        category: "Ladies Wear",
        price: 3299,
        originalPrice: 4999,
        discountPct: 34,
        stockStatus: "In Stock",
        image: "images/ladies_saree_02.svg",
        description: "Pure Banarasi soft silk saree featuring golden zari weaves and rich pallu design.",
        featured: true
    },
    {
        code: "LW-303",
        name: "Floral Print Cotton Dailywear Kurti",
        category: "Ladies Wear",
        price: 699,
        originalPrice: 1199,
        discountPct: 42,
        stockStatus: "Out of Stock",
        image: "images/ladies_kurti_03.svg",
        description: "Breathable pure cotton straight kurti with vibrant floral prints and side slits.",
        featured: false
    },
    {
        code: "KD-401",
        name: "Kids Floral Princess Frock",
        category: "Kids Wear",
        price: 1199,
        originalPrice: 1799,
        discountPct: 33,
        stockStatus: "In Stock",
        image: "images/kids_frock_01.svg",
        description: "Adorable layered tulle princess gown for little girls with satin sash and floral appliqué.",
        featured: true
    },
    {
        code: "KD-402",
        name: "Boys Ethnic Silk Kurta Pyjama Set",
        category: "Kids Wear",
        price: 999,
        originalPrice: 1499,
        discountPct: 33,
        stockStatus: "In Stock",
        image: "images/kids_kurta_02.svg",
        description: "Comfortable jacquard silk ethnic kurta pyjama set for boys. Traditional festival wear.",
        featured: false
    },
    {
        code: "AC-501",
        name: "Embroidered Silk Potli Bag",
        category: "Accessories",
        price: 599,
        originalPrice: 999,
        discountPct: 40,
        stockStatus: "In Stock",
        image: "images/acc_potli_01.svg",
        description: "Vibrant ethnic potli bag with bead tassels and drawstring closure.",
        featured: false
    },
    {
        code: "AC-502",
        name: "Designer Pearl Hair Clip Set (Pack of 3)",
        category: "Accessories",
        price: 299,
        originalPrice: 599,
        discountPct: 50,
        stockStatus: "In Stock",
        image: "images/acc_hairclip_02.svg",
        description: "Trendy Korean style pearl hair pins and clips set for daily styling.",
        featured: false
    }
];

// Reliable Instant App Initialization
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
} else {
    startApp();
}

function startApp() {
    initApp();
    setupEventListeners();
}

async function initApp() {
    if (typeof window !== "undefined" && window.PAGE_CATEGORY) {
        currentCategory = window.PAGE_CATEGORY;
    }

    if (instockCheckbox) {
        inStockOnly = instockCheckbox.checked;
    }

    if (resultsCountEl) resultsCountEl.innerText = "Loading product catalog...";
    
    // Priority 1: Check window.BOOTSTRAP_PRODUCTS
    if (window.BOOTSTRAP_PRODUCTS && Array.isArray(window.BOOTSTRAP_PRODUCTS) && window.BOOTSTRAP_PRODUCTS.length > 0) {
        catalog = window.BOOTSTRAP_PRODUCTS;
    } else {
        catalog = DEFAULT_CATALOG;
    }

    applyFiltersAndSort();

    // Priority 2: Async fetch fresh JSON if available (bypassing browser cache)
    try {
        const response = await fetch("data/products.json?v=" + Date.now());
        if (response.ok) {
            const freshData = await response.json();
            if (freshData && freshData.length > 0) {
                catalog = freshData;
                applyFiltersAndSort();
            }
        }
    } catch (e) {
        // Safe fallback already loaded
    }
}

// Directly parse CSV in browser using XLSX/SheetJS if JSON is not built yet
async function loadFallbackCSV() {
    try {
        const res = await fetch("products.csv");
        if (!res.ok) return [];
        const text = await res.text();
        
        if (typeof XLSX === "undefined") {
            console.error("SheetJS library not available");
            return [];
        }

        const workbook = XLSX.read(text, { type: "string" });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        return rows.map((row, idx) => {
            const price = parseFloat(row["Price"] || 0);
            const origPrice = parseFloat(row["Original Price"] || price);
            const discountPct = (origPrice > price && origPrice > 0) ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
            const imgRaw = row["Image File Name"] || "";
            const image = imgRaw ? `images/${imgRaw}` : "images/placeholder.svg";

            return {
                code: row["Product Code"] || ('PROD-' + String(idx + 1).padStart(3, '0')),
                name: row["Product Name"] || "Untitled Product",
                category: row["Category"] || "General",
                price: price,
                originalPrice: origPrice,
                discountPct: discountPct,
                stockStatus: row["Stock Status"] || "In Stock",
                image: image,
                description: row["Description"] || "",
                featured: (String(row["Featured"]).toLowerCase() === "yes")
            };
        });
    } catch (e) {
        console.error("Error reading CSV:", e);
        return [];
    }
}

function setupEventListeners() {
    // Universal Search Listeners (Header, Nav, Catalog Grid)
    const searchInputs = document.querySelectorAll("#search-input, #nav-search-input, #mobile-nav-search-input, .product-search-input");
    searchInputs.forEach(input => {
        input.addEventListener("input", (e) => {
            const val = e.target.value;
            searchQuery = val.trim().toLowerCase();
            
            // Sync all search inputs across the page
            searchInputs.forEach(other => {
                if (other !== e.target) other.value = val;
            });

            if (clearSearchBtn) clearSearchBtn.classList.toggle("show", searchQuery.length > 0);
            currentPage = 1;
            applyFiltersAndSort();

            // Smooth scroll to catalog when typing from top navigation bar
            if (e.target.id.includes("nav") && searchQuery.length > 0) {
                const catEl = document.getElementById("catalog");
                if (catEl) {
                    const topPos = catEl.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({ top: topPos, behavior: "smooth" });
                }
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const val = e.target.value.trim().toUpperCase();
                const exactMatch = catalog.find(p => p.code && p.code.toUpperCase() === val);
                if (exactMatch) {
                    openModal(exactMatch.code);
                } else {
                    const catEl = document.getElementById("catalog");
                    if (catEl) {
                        const topPos = catEl.getBoundingClientRect().top + window.pageYOffset - 80;
                        window.scrollTo({ top: topPos, behavior: "smooth" });
                    }
                }
            }
        });
    });

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            searchInputs.forEach(inp => inp.value = "");
            searchQuery = "";
            clearSearchBtn.classList.remove("show");
            currentPage = 1;
            applyFiltersAndSort();
        });
    }

    // Stock checkbox listener
    if (instockCheckbox) {
        instockCheckbox.addEventListener("change", (e) => {
            inStockOnly = e.target.checked;
            currentPage = 1;
            applyFiltersAndSort();
        });
    }

    // Sort select listener
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            applyFiltersAndSort();
        });
    }

    // Pagination buttons
    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderGrid();
                const catEl = document.getElementById("catalog"); if (catEl) window.scrollTo({ top: catEl.offsetTop - 80, behavior: "smooth" });
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(filteredCatalog.length / CONFIG.itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderGrid();
                const catEl = document.getElementById("catalog"); if (catEl) window.scrollTo({ top: catEl.offsetTop - 80, behavior: "smooth" });
            }
        });
    }
}

let currentJewellerySubcat = "All";

function getJewellerySubcatPriority(item) {
    const sub = (item.subcategory || "").toLowerCase().trim();
    const name = (item.name || "").toLowerCase().trim();

    if (sub.includes("earring") || sub.includes("jimukka") || name.includes("jimukka") || name.includes("jhumka") || name.includes("earring") || name.includes("stud")) return 1;
    if (sub.includes("necklace") || sub.includes("choker") || name.includes("necklace") || name.includes("choker") || name.includes("haram")) return 2;
    if (sub.includes("ring") || name.includes("ring")) return 3;
    if (sub.includes("pendant") || name.includes("pendant")) return 4;
    if (sub.includes("bangle") || sub.includes("bracelet") || name.includes("bangle") || name.includes("bracelet")) return 5;
    if (sub.includes("waist") || sub.includes("hip") || name.includes("waist")) return 6;
    if (sub.includes("anklet") || sub.includes("anglet") || name.includes("anklet") || name.includes("anglet") || name.includes("payal")) return 7;
    if (sub.includes("chutti") || sub.includes("matti") || sub.includes("tikka") || name.includes("chutti") || name.includes("matti") || name.includes("tikka")) return 8;
    return 9;
}

function filterCategory(category) {
    currentCategory = category || "All";
    currentJewellerySubcat = "All";
    currentLadiesSubcat = "All";
    currentPage = 1;
    applyFiltersAndSort();

    const catalogEl = document.getElementById("catalog") || document.getElementById("products") || document.getElementById("products-grid");
    if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth" });
    }
}

function filterJewellerySubcat(subcat) {
    currentJewellerySubcat = subcat;
    currentPage = 1;
    applyFiltersAndSort();
}

function renderJewellerySubcategoryPills() {
    const container = document.getElementById("jewellery-subcat-pills");
    if (!container) return;

    const activeSubcat = (currentJewellerySubcat || "All").toString().trim().toLowerCase();

    // Standard baseline subcategories requested by user
    const standardSubcats = [
        { id: "All", label: "✨ All Jewellery" },
        { id: "Earring", label: "🌸 Earring" },
        { id: "Necklace", label: "📿 Necklace" },
        { id: "Rings", label: "💍 Rings" },
        { id: "Pendants", label: "💎 Pendants" },
        { id: "Bangles", label: "✨ Bangles" },
        { id: "Waist Chain", label: "👑 Waist Chain" },
        { id: "Anklet", label: "🦶 Anklet" },
        { id: "Chutti Matti", label: "👑 Chutti Matti" }
    ];

    const standardIdsLower = standardSubcats.map(s => s.id.toLowerCase());

    // Dynamically find any custom/new subcategories present in the catalog!
    const customSubcatsSet = new Set();
    if (Array.isArray(catalog)) {
        catalog.forEach(item => {
            if (!item) return;
            const isJewel = (item.category || '').toString().toLowerCase().includes('jewel');
            const sub = (item.subcategory || '').toString().trim();
            if (isJewel && sub && !standardIdsLower.includes(sub.toLowerCase())) {
                customSubcatsSet.add(sub);
            }
        });
    }

    const subcats = [...standardSubcats];
    customSubcatsSet.forEach(customSub => {
        subcats.push({ id: customSub, label: `✨ ${customSub}` });
    });

    container.innerHTML = subcats.map(sc => {
        const isActive = (activeSubcat === sc.id.toLowerCase().trim());
        const activeClass = isActive 
            ? "bg-amber-700 text-white shadow-md border-amber-800 scale-105" 
            : "bg-white text-slate-700 hover:bg-amber-100 hover:text-amber-900 border-slate-300";
        return `<button type="button" onclick="filterJewellerySubcat('${escapeHtml(sc.id)}')" class="px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeClass}">${sc.label}</button>`;
    }).join("");
}

let currentLadiesSubcat = "All";

function filterLadiesSubcat(subcat) {
    currentLadiesSubcat = subcat;
    currentPage = 1;
    applyFiltersAndSort();
}

function renderLadiesSubcategoryPills() {
    const container = document.getElementById("ladies-subcat-pills");
    if (!container) return;

    const activeLadiesSubcat = (currentLadiesSubcat || "All").toString().trim().toLowerCase();

    const subcats = [
        { id: "All", label: "✨ All Ladies Wear" },
        { id: "Saree", label: "🥻 Saree" },
        { id: "Readymade Blouse", label: "👚 Readymade Blouse" },
        { id: "Churidhar", label: "👗 Churidhar" },
        { id: "Coord Set", label: "✨ Coord Set" },
        { id: "Others", label: "✨ Others" }
    ];

    container.innerHTML = subcats.map(sc => {
        const isActive = (activeLadiesSubcat === sc.id.toLowerCase().trim());
        const activeClass = isActive 
            ? "bg-rose-700 text-white shadow-md border-rose-800 scale-105" 
            : "bg-white text-slate-700 hover:bg-rose-100 hover:text-rose-900 border-slate-300";
        return `<button type="button" onclick="filterLadiesSubcat('${escapeHtml(sc.id)}')" class="px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeClass}">${sc.label}</button>`;
    }).join("");
}

let newest50Codes = new Set();
let visibleItemCount = 24;

function applyFiltersAndSort() {
    try {
        renderCategorySidebar();
        renderJewellerySubcategoryPills();
        renderLadiesSubcategoryPills();

        if (!Array.isArray(catalog)) {
            catalog = [];
        }

        // Work on copy of catalog (reverse order so newest items are first by default)
        const sortedSource = catalog.slice().reverse();

        // Identify the newest 50 products in the store for the NEW ARRIVAL badge
        newest50Codes = new Set(sortedSource.slice(0, 50).map(p => p.code));

        const activeCategory = (currentCategory || "All").toString().toLowerCase().trim();
        const activeSubcat = (currentJewellerySubcat || "All").toString().toLowerCase().trim();
        const activeLadiesSubcat = (currentLadiesSubcat || "All").toString().toLowerCase().trim();

        filteredCatalog = sortedSource.filter(item => {
            if (!item) return false;
            const cat = (item.category || "").toString().toLowerCase().trim();
            
            let matchCat = false;
            if (activeCategory === "all" || activeCategory === "" || activeCategory === "all products" || activeCategory.includes("fresh") || activeCategory === "featured") {
                matchCat = true;
            } else if (activeCategory.includes("ladies")) {
                matchCat = cat.includes("ladies") || cat.includes("women");
            } else if (activeCategory.includes("men") || activeCategory.includes("gents")) {
                matchCat = cat.includes("men") || cat.includes("gents");
            } else if (activeCategory.includes("kid")) {
                matchCat = cat.includes("kid") || cat.includes("child");
            } else if (activeCategory.includes("jewel")) {
                matchCat = cat.includes("jewel");
            } else {
                matchCat = (cat === activeCategory);
            }

            // Subcategory Filter Check
            let matchSubcat = true;
            if (activeCategory.includes("jewel") && activeSubcat !== "all") {
                const sub = (item.subcategory || "").toString().toLowerCase().trim();
                const name = (item.name || "").toString().toLowerCase().trim();

                if (activeSubcat.includes("earring")) {
                    matchSubcat = sub.includes("earring") || sub.includes("jimukka") || name.includes("jimukka") || name.includes("jhumka") || name.includes("earring") || name.includes("stud");
                } else if (activeSubcat.includes("necklace")) {
                    matchSubcat = sub.includes("necklace") || sub.includes("choker") || name.includes("necklace") || name.includes("choker") || name.includes("haram");
                } else if (activeSubcat.includes("ring")) {
                    matchSubcat = sub.includes("ring") || name.includes("ring");
                } else if (activeSubcat.includes("pendant")) {
                    matchSubcat = sub.includes("pendant") || name.includes("pendant");
                } else if (activeSubcat.includes("bangle")) {
                    matchSubcat = sub.includes("bangle") || sub.includes("bracelet") || name.includes("bangle") || name.includes("bracelet");
                } else if (activeSubcat.includes("waist")) {
                    matchSubcat = sub.includes("waist") || sub.includes("hip") || name.includes("waist");
                } else if (activeSubcat.includes("anklet") || activeSubcat.includes("anglet")) {
                    matchSubcat = sub.includes("anklet") || sub.includes("anglet") || name.includes("anklet") || name.includes("anglet") || name.includes("payal");
                } else if (activeSubcat.includes("chutti") || activeSubcat.includes("matti")) {
                    matchSubcat = sub.includes("chutti") || sub.includes("matti") || sub.includes("tikka") || name.includes("chutti") || name.includes("matti") || name.includes("tikka");
                } else {
                    matchSubcat = (sub === activeSubcat || name.includes(activeSubcat));
                }
            } else if ((activeCategory.includes("ladies") || (typeof window !== "undefined" && window.PAGE_CATEGORY && window.PAGE_CATEGORY.toLowerCase().includes("ladies"))) && activeLadiesSubcat !== "all") {
                const sub = (item.subcategory || "").toString().toLowerCase().trim();
                const name = (item.name || "").toString().toLowerCase().trim();
                const desc = (item.description || "").toString().toLowerCase().trim();

                const isSaree = sub.includes("saree") || cat.includes("saree") || name.includes("saree") || desc.includes("saree");
                const isBlouse = sub.includes("blouse") || sub.includes("readymade") || cat.includes("blouse") || name.includes("blouse") || desc.includes("blouse");
                const isChuridhar = sub.includes("churidhar") || sub.includes("churidar") || sub.includes("suit") || name.includes("churidhar") || name.includes("churidar") || name.includes("suit") || name.includes("salwar") || name.includes("chanderi") || desc.includes("churidhar") || desc.includes("churidar") || desc.includes("suit");
                const isCoordSet = sub.includes("coord") || sub.includes("co-ord") || name.includes("coord") || name.includes("co-ord") || desc.includes("coord");

                if (activeLadiesSubcat.includes("saree")) {
                    matchSubcat = isSaree;
                } else if (activeLadiesSubcat.includes("blouse") || activeLadiesSubcat.includes("readymade") || activeLadiesSubcat.includes("stitched")) {
                    matchSubcat = isBlouse;
                } else if (activeLadiesSubcat.includes("churidhar") || activeLadiesSubcat.includes("churidar")) {
                    matchSubcat = isChuridhar;
                } else if (activeLadiesSubcat.includes("coord") || activeLadiesSubcat.includes("co-ord")) {
                    matchSubcat = isCoordSet;
                } else if (activeLadiesSubcat.includes("other")) {
                    matchSubcat = !isSaree && !isBlouse && !isChuridhar && !isCoordSet;
                } else {
                    matchSubcat = (sub === activeLadiesSubcat);
                }
            }
        
        // Stock check: when inStockOnly is checked, ONLY show true IN STOCK items (not LIMITED or OUT OF STOCK)
        const st = (item.stockStatus || "").toLowerCase().trim();
        let matchStock = true;
        if (inStockOnly) {
            matchStock = (st === "instock" || st === "in stock");
        }
        
        // Search query check
        const matchSearch = (!searchQuery || 
            item.name.toLowerCase().includes(searchQuery) ||
            item.code.toLowerCase().includes(searchQuery) ||
            item.category.toLowerCase().includes(searchQuery) ||
            (item.subcategory && item.subcategory.toLowerCase().includes(searchQuery)) ||
            (item.description && item.description.toLowerCase().includes(searchQuery))
        );

        return matchCat && matchSubcat && matchStock && matchSearch;
    });

    // Sorting logic
    if (currentSort === "price-low") {
        filteredCatalog.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-high") {
        filteredCatalog.sort((a, b) => b.price - a.price);
    } else if (currentSort === "discount") {
        filteredCatalog.sort((a, b) => b.discountPct - a.discountPct);
    } else if (currentSort === "name") {
        filteredCatalog.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        // Priority sort for Jewellery page: Earrings first -> Necklace -> Pendant -> Rings -> Others
        if (currentCategory.toLowerCase().includes("jewel") && currentJewellerySubcat === "All") {
            filteredCatalog.sort((a, b) => getJewellerySubcatPriority(a) - getJewellerySubcatPriority(b));
        }
    }

    visibleItemCount = 24;
    renderGrid();
    renderFreshArrivalsMarquee();
    } catch (err) {
        console.error("Error in applyFiltersAndSort:", err);
    }
}

// Dynamically render category sidebar buttons from all available categories in catalog
function renderCategorySidebar() {
    const sidebarContainer = document.getElementById("category-pills");
    if (!sidebarContainer) return;

    // Get all unique categories from catalog
    const categoriesSet = new Set();
    catalog.forEach(item => {
        if (item.category && item.category.trim()) {
            categoriesSet.add(item.category.trim());
        }
    });

    const uniqueCategories = Array.from(categoriesSet);
    
    // Build drawer category pills HTML
    let pillsHTML = `<button class="sidebar-pill ${currentCategory === 'All' ? 'active' : ''}" onclick="filterCategory('All')">All Products</button>`;
    pillsHTML += `<button class="sidebar-pill ${currentCategory === 'Offers up to 50%' ? 'active' : ''}" onclick="filterCategory('Offers up to 50%')">🔥 Offers up to 50% OFF</button>`;

    uniqueCategories.forEach(cat => {
        const isActive = (currentCategory.toLowerCase() === cat.toLowerCase());
        pillsHTML += `<button class="sidebar-pill ${isActive ? 'active' : ''}" onclick="filterCategory('${escapeHtml(cat)}')">${escapeHtml(cat)}</button>`;
    });

    sidebarContainer.innerHTML = pillsHTML;
}

function renderGrid() {
    const totalCount = filteredCatalog.length;
    
    // Active filter badge update
    if (activeFilterBadge) {
        let activeTags = [];
        if (currentCategory !== "All") activeTags.push(`Category: ${currentCategory}`);
        if (inStockOnly) activeTags.push("In Stock Only");
        if (searchQuery) activeTags.push(`Search: "${searchQuery}"`);
        activeFilterBadge.innerText = activeTags.join(" | ");
    }

    if (totalCount === 0) {
        productGrid.innerHTML = "";
        if (resultsCountEl) resultsCountEl.innerText = "0 products found";
        if (noResultsEl) noResultsEl.classList.remove("hidden");
        if (paginationWrapper) paginationWrapper.classList.add("hidden");
        return;
    }

    if (noResultsEl) noResultsEl.classList.add("hidden");

    // Grid layout: 1 column on Mobile, 4 columns on Laptop
    productGrid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6";

    const visibleItems = filteredCatalog.slice(0, visibleItemCount);
    productGrid.innerHTML = visibleItems.map(item => renderCardHTML(item)).join("");

    if (resultsCountEl) {
        resultsCountEl.innerText = `Showing ${visibleItems.length} of ${totalCount} ${totalCount === 1 ? 'product' : 'products'}`;
    }

    if (paginationWrapper) {
        if (visibleItemCount < totalCount) {
            paginationWrapper.classList.remove("hidden");
            paginationWrapper.innerHTML = `
                <button id="load-more-btn" onclick="loadMoreProducts()" class="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2">
                    <span>Load More Products (${totalCount - visibleItems.length} Remaining)</span>
                    <span class="material-symbols-outlined text-sm">expand_more</span>
                </button>
            `;
        } else {
            paginationWrapper.classList.add("hidden");
        }
    }
}

function loadMoreProducts() {
    visibleItemCount += 24;
    renderGrid();
}

function renderFreshArrivalsMarquee() {
    const track = document.getElementById("fresh-marquee-track");
    if (!track) return;
    if (!Array.isArray(catalog) || catalog.length === 0) return;

    // Extract newest 50 products
    const newest50 = catalog.slice().reverse().slice(0, 50);
    if (newest50.length === 0) return;

    // Duplicate array x2 to achieve a 100% smooth, seamless infinite loop
    const loopItems = [...newest50, ...newest50];

    track.innerHTML = loopItems.map(item => {
        const discountedPrice = item.discountPct > 0 ? Math.round(item.originalPrice * (1 - item.discountPct / 100)) : item.price;
        return `
        <div onclick="openModal('${item.code}')" class="w-52 h-72 md:w-72 md:h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-white/60 transition-all duration-500 flex-shrink-0 cursor-pointer relative group">
            <span class="absolute top-3 left-3 z-20 bg-[#9E6B7B]/90 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-xs">NEW ARRIVALS</span>
            ${item.discountPct > 0 ? `<span class="absolute top-3 right-3 z-20 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm">-${item.discountPct}%</span>` : ''}
            <div class="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style="background-image: url('${item.image}')"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                <h5 class="font-bold text-sm truncate mb-0.5">${item.name}</h5>
                <span class="text-amber-300 font-extrabold text-sm">${CONFIG.currency}${discountedPrice.toLocaleString()}</span>
            </div>
        </div>
        `;
    }).join("");

    setTimeout(() => {
        if (track && getComputedStyle(track).animationName === "none") {
            track.style.animation = "marquee-scroll 95s linear infinite";
        }
    }, 50);
}

function renderCardHTML(item) {
    const st = (item.stockStatus || "INSTOCK").toUpperCase().trim();
    const isOutOfStock = st.includes("OUT") || st.includes("SOLD");
    const isLimited = st.includes("LIMITED");
    const discountedPrice = item.discountPct > 0 ? Math.round(item.originalPrice * (1 - item.discountPct / 100)) : item.price;
    
    const isFresh = newest50Codes.has(item.code);
    const freshBadge = isFresh 
        ? `<span class="absolute top-2.5 left-2.5 z-20 bg-[#9E6B7B]/85 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs backdrop-blur-xs">NEW ARRIVALS</span>` 
        : '';

    const imgList = (item.images && item.images.length > 0) ? item.images : [item.image];
    const hasMultipleImgs = imgList.length > 1;

    const cardNavBtns = hasMultipleImgs ? `
        <button type="button" onclick="cycleCardImage('${item.code}', -1, event)" class="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 bg-slate-950/75 hover:bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 shadow border border-white/30" title="Previous Photo"><span class="material-symbols-outlined text-xs">chevron_left</span></button>
        <button type="button" onclick="cycleCardImage('${item.code}', 1, event)" class="absolute right-1.5 top-1/2 -translate-y-1/2 z-30 bg-slate-950/75 hover:bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 shadow border border-white/30" title="Next Photo"><span class="material-symbols-outlined text-xs">chevron_right</span></button>
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full">
            ${imgList.map((_, idx) => `<span class="card-dot-${item.code} ${idx === 0 ? 'w-2 h-2 bg-amber-500' : 'w-1.5 h-1.5 bg-white/70'} rounded-full transition-all"></span>`).join('')}
        </div>
    ` : '';

    return `
    <div class="flex group cursor-pointer flex-col bg-white rounded-2xl border border-slate-100 p-2.5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden" onclick="openModal('${item.code}')">
        <!-- Square Image Box (1:1 Ratio) -->
        <div class="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-slate-50">
            <!-- Top-Left FRESH Badge (Only shown for newest 50 products) -->
            ${freshBadge}
            
            <!-- Top-Right Discount Badge -->
            ${item.discountPct > 0 ? `<span class="absolute top-2.5 right-9 z-20 bg-white text-[#D9386E] border border-rose-100 font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-xs">-${item.discountPct}% OFF</span>` : ''}
            
            <!-- Top-Right Wishlist Heart Button -->
            <button type="button" onclick="event.stopPropagation(); toggleWishlist('${item.code}', this)" class="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-white/95 hover:bg-white text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-xs border border-slate-100 transition-colors" title="Wishlist"><span class="material-symbols-outlined text-[13px]">favorite</span></button>

            <!-- Card Image -->
            <div class="card-img-bg-${item.code} w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style="background-image: url('${item.image}')"></div>
            
            <!-- Multi-Image Controls -->
            ${cardNavBtns}

            <!-- Bottom-Right Circular Dark Plum Plus Button -->
            <button type="button" onclick="event.stopPropagation(); openModal('${item.code}')" class="absolute bottom-2.5 right-2.5 z-20 w-7.5 h-7.5 rounded-full bg-[#4A1525] hover:bg-[#5C1D38] text-white flex items-center justify-center shadow-md transition-transform active:scale-95" title="Quick View & Add"><span class="material-symbols-outlined text-sm font-bold">add</span></button>
        </div>

        <!-- Left-Aligned Product Details -->
        <div class="px-0.5 pb-0.5 flex flex-col justify-between flex-1">
            <h4 class="font-medium text-slate-800 text-xs truncate mb-1" title="${item.name}">${item.name}</h4>
            <div class="flex items-baseline justify-between mt-auto">
                <div class="flex items-baseline gap-1">
                    <span class="font-bold text-slate-900 text-sm">${CONFIG.currency}${discountedPrice.toLocaleString()}</span>
                    ${item.discountPct > 0 ? `<span class="text-slate-400 text-xs line-through font-normal ml-0.5">${CONFIG.currency}${item.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                <span class="text-[9px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">${item.code}</span>
            </div>
        </div>
    </div>
    `;
}

function renderPagination(totalPages) {
    if (totalPages <= 1) {
        paginationWrapper.classList.add("hidden");
        return;
    }

    prevPageBtn.disabled = (currentPage === 1);
    nextPageBtn.disabled = (currentPage === totalPages);

    let pageBtnsHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        // Show limited numbers if page count is high (for 2,000+ items)
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            pageBtnsHTML += `<button class="num-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            pageBtnsHTML += `<span style="align-self:center; color:#A1A1AA;">...</span>`;
        }
    }
    pageNumbersEl.innerHTML = pageBtnsHTML;
}

function goToPage(page) {
    currentPage = page;
    renderGrid();
    const catEl = document.getElementById("catalog"); if (catEl) window.scrollTo({ top: catEl.offsetTop - 80, behavior: "smooth" });
}

function resetFilters() {
    currentCategory = "All";
    searchQuery = "";
    inStockOnly = false;
    currentSort = "featured";
    
    searchInput.value = "";
    clearSearchBtn.classList.remove("show");
    instockCheckbox.checked = false;
    sortSelect.value = "featured";
    
    filterCategory("All");
}

let currentModalImgList = [];
let currentModalImgIdx = 0;

function injectProductSchema(item) {
    if (!item) return;
    let schemaEl = document.getElementById("product-schema-jsonld");
    if (!schemaEl) {
        schemaEl = document.createElement("script");
        schemaEl.id = "product-schema-jsonld";
        schemaEl.type = "application/ld+json";
        document.head.appendChild(schemaEl);
    }
    const imgs = (item.images && item.images.length > 0) 
        ? item.images.map(img => img.startsWith("http") ? img : "https://trendypearls.au/" + img.replace(/^\//, ""))
        : ["https://trendypearls.au/" + (item.image || "images/placeholder.svg").replace(/^\//, "")];
    
    const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": item.name + " | Indian Fashion Australia",
        "image": imgs,
        "description": item.description || (item.name + " - Authentic Indian ethnic fashion and jewellery available in Australia from Trendy Pearls."),
        "sku": item.code,
        "brand": {
            "@type": "Brand",
            "name": "Trendy Pearls"
        },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "AUD",
            "price": item.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": (item.stockStatus === "SOLD OUT") ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "Trendy Pearls Australia"
            }
        }
    };
    schemaEl.textContent = JSON.stringify(schemaData, null, 2);
}

// Modal handling
function openModal(code) {
    const item = catalog.find(p => p.code === code);
    if (!item) return;

    selectedModalProduct = item;
    selectedSizeForModal = item.size || "Standard";
    
    // Inject dynamic Product & Offer Schema for Google Structured Data
    injectProductSchema(item);
    
    currentModalImgList = (item.images && item.images.length > 0) ? item.images : [item.image || 'images/placeholder.svg'];
    currentModalImgIdx = 0;
    modalImg.src = currentModalImgList[0];
    modalImg.onerror = () => { modalImg.src = 'images/placeholder.svg'; };

    // Modal Arrow Buttons
    const prevBtn = document.getElementById("modal-prev-btn");
    const nextBtn = document.getElementById("modal-next-btn");
    if (prevBtn && nextBtn) {
        if (currentModalImgList.length > 1) {
            prevBtn.classList.remove("hidden");
            nextBtn.classList.remove("hidden");
        } else {
            prevBtn.classList.add("hidden");
            nextBtn.classList.add("hidden");
        }
    }

    // Multi-image gallery
    const modalThumbsEl = document.getElementById("modal-thumbnails");
    if (modalThumbsEl) {
        if (currentModalImgList.length > 1) {
            modalThumbsEl.innerHTML = currentModalImgList.map((imgSrc, idx) => `
                <button type="button" class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchModalIndex(${idx})">
                    <img src="${imgSrc}" alt="Thumbnail ${idx+1}">
                </button>
            `).join("");
            modalThumbsEl.style.display = "flex";
        } else {
            modalThumbsEl.innerHTML = "";
            modalThumbsEl.style.display = "none";
        }
    }

    if (item.discountPct > 0) {
        modalDiscountBadge.innerText = `${item.discountPct}% OFF`;
        modalDiscountBadge.style.display = "block";
    } else {
        modalDiscountBadge.style.display = "none";
    }

    modalCat.innerText = item.category;
    modalTitle.innerText = item.name;
    modalCode.innerText = item.code;
    
    // Render Size Selection Pills
    const modalSizeEl = document.getElementById("modal-size");
    const modalSizeValEl = document.getElementById("modal-size-val");
    if (item.size) {
        const sizes = item.size.split(',').map(s => s.trim()).filter(Boolean);
        if (sizes.length > 1) {
            modalSizeValEl.innerHTML = sizes.map((s, idx) => `
                <button type="button" class="size-pill-btn ${idx === 0 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-800'} border border-slate-300 rounded-full px-3 py-1 text-xs font-bold mr-1 mb-1 transition-all" onclick="selectModalSize('${s}', this)">${s}</button>
            `).join('');
        } else {
            modalSizeValEl.innerText = item.size;
        }
        modalSizeEl.style.display = "inline";
    } else {
        modalSizeEl.style.display = "none";
    }

    if (modalStockBadge) {
        const st = (item.stockStatus || "INSTOCK").toUpperCase().trim();
        let badgeStyle = "bg-emerald-600 text-white border-emerald-400";
        if (st.includes("OUT") || st.includes("SOLD")) {
            badgeStyle = "bg-slate-900 text-white border-slate-700";
        } else if (st.includes("LIMITED")) {
            badgeStyle = "bg-amber-600 text-white border-amber-400";
        }
        modalStockBadge.innerText = st;
        modalStockBadge.className = `absolute top-4 left-4 z-30 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-md border ${badgeStyle}`;
    }

    const modalStockDetailBadge = document.getElementById("modal-stock-detail-badge");
    if (modalStockDetailBadge) {
        const st = (item.stockStatus || "INSTOCK").toUpperCase().trim();
        let badgeDetailStyle = "bg-emerald-100 text-emerald-800 border-emerald-300";
        if (st.includes("OUT") || st.includes("SOLD")) {
            badgeDetailStyle = "bg-red-100 text-red-800 border-red-300";
        } else if (st.includes("LIMITED")) {
            badgeDetailStyle = "bg-amber-100 text-amber-800 border-amber-300";
        }
        modalStockDetailBadge.innerText = st;
        modalStockDetailBadge.className = `inline-block ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeDetailStyle}`;
    }
    
    modalPrice.innerText = `${CONFIG.currency}${item.price.toLocaleString()}`;
    if (item.originalPrice > item.price) {
        modalOrigPrice.innerText = `${CONFIG.currency}${item.originalPrice.toLocaleString()}`;
        modalOrigPrice.style.display = "inline";
        const savings = item.originalPrice - item.price;
        modalSavings.innerText = `(Save ${CONFIG.currency}${savings.toLocaleString()})`;
    } else {
        modalOrigPrice.style.display = "none";
        modalSavings.innerText = "";
    }

    modalDesc.innerText = item.description || "High quality boutique product. Contact us for custom sizes and details.";

    // Action buttons (Buy Now & Add to Cart)
    const modalActionsEl = document.getElementById("modal-actions");
    if (modalActionsEl) {
        modalActionsEl.innerHTML = `
            <div class="grid grid-cols-2 gap-3 w-full mt-4">
                <button onclick="addCurrentModalItemToCart()" class="py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow">
                    <span class="material-symbols-outlined text-sm">add_shopping_cart</span> Add to Cart
                </button>
                <button onclick="buyCurrentModalItemNow()" class="py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow">
                    <span class="material-symbols-outlined text-sm">local_shipping</span> Buy Now
                </button>
            </div>
        `;
    }

    productModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    productModal.classList.add("hidden");
    document.body.style.overflow = "auto";
}

function closeModalOnOverlay(e) {
    if (e.target === productModal) {
        closeModal();
    }
}

function switchModalIndex(idx) {
    if (!currentModalImgList || currentModalImgList.length === 0) return;
    currentModalImgIdx = (idx + currentModalImgList.length) % currentModalImgList.length;
    if (modalImg) {
        modalImg.src = currentModalImgList[currentModalImgIdx];
    }
    const thumbs = document.querySelectorAll(".modal-thumb-btn");
    thumbs.forEach((t, i) => {
        if (i === currentModalImgIdx) t.classList.add("active");
        else t.classList.remove("active");
    });
}

function nextModalImage() {
    switchModalIndex(currentModalImgIdx + 1);
}

function prevModalImage() {
    switchModalIndex(currentModalImgIdx - 1);
}

function switchModalImage(imgSrc, btnEl) {
    if (currentModalImgList.includes(imgSrc)) {
        switchModalIndex(currentModalImgList.indexOf(imgSrc));
    } else {
        if (modalImg) modalImg.src = imgSrc;
    }
}

function cycleCardImage(code, dir, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const item = catalog.find(p => p.code === code);
    if (!item) return;
    const imgList = (item.images && item.images.length > 0) ? item.images : [item.image || 'images/placeholder.svg'];
    if (imgList.length <= 1) return;

    if (!window.cardImageMap) window.cardImageMap = {};
    let currIdx = window.cardImageMap[code] || 0;
    currIdx = (currIdx + dir + imgList.length) % imgList.length;
    window.cardImageMap[code] = currIdx;

    const bgEls = document.querySelectorAll(`.card-img-bg-${code}`);
    bgEls.forEach(el => {
        el.style.backgroundImage = `url('${imgList[currIdx]}')`;
    });

    const dotEls = document.querySelectorAll(`.card-dot-${code}`);
    dotEls.forEach((dot, i) => {
        if (i === currIdx) {
            dot.className = `card-dot-${code} w-2 h-2 rounded-full bg-amber-500 shadow-sm transition-all`;
        } else {
            dot.className = `card-dot-${code} w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm transition-all`;
        }
    });
}

function toggleWishlist(code, btnEl) {
    if (!window.tpWishlist) window.tpWishlist = new Set();
    const icon = btnEl.querySelector(".material-symbols-outlined");
    if (window.tpWishlist.has(code)) {
        window.tpWishlist.delete(code);
        btnEl.classList.remove("text-rose-500");
        btnEl.classList.add("text-slate-400");
    } else {
        window.tpWishlist.add(code);
        btnEl.classList.remove("text-slate-400");
        btnEl.classList.add("text-rose-500");
    }
}

function orderCurrentModalItem() {
    if (selectedModalProduct) {
        sendWhatsAppOrder(selectedModalProduct.code);
    }
}

// WhatsApp Link Generator
function sendWhatsAppOrder(code) {
    const item = catalog.find(p => p.code === code);
    if (!item) return;

    const message = `Hello Trendy Pearls Boutique! 👋\nI would like to order / inquire about:\n\n📌 *Product:* ${item.name}\n🏷️ *Code:* ${item.code}\n💰 *Price:* ${CONFIG.currency}${item.price}\n📦 *Stock:* ${item.stockStatus}\n\nPlease share payment and delivery details!`;
    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMsg}`;
    
    window.open(waUrl, "_blank");
}

function openWhatsAppGeneral() {
    const message = `Hello Trendy Pearls Boutique! 👋 I have a question about your collection.`;
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
}

// Helpers
function getStockBadgeClass(status) {
    const s = status.toLowerCase();
    if (s === "in stock") return "in-stock";
    if (s === "out of stock") return "out-stock";
    return "sold-out";
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getSampleCatalog() {
    return [
        {
            code: "BG-101",
            name: "Embroidered Floral Velvet Tote Bag",
            category: "Bags",
            price: 1299,
            originalPrice: 1999,
            discountPct: 35,
            stockStatus: "In Stock",
            image: "images/placeholder.svg",
            description: "Luxurious velvet tote bag with intricate floral embroidery.",
            featured: true
        }
    ];
}

// Filter functionality for drawer
const drawerFilterBtns = document.querySelectorAll('.drawer-filter-btn');
drawerFilterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = btn.getAttribute('data-category');
        
        // Find and click the corresponding main filter button
        const mainFilterBtn = document.querySelector(`.filter-btn[data-category="${category}"]`);
        if(mainFilterBtn) {
            mainFilterBtn.click();
        }
        
        // Scroll to catalog
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    });
});


function selectModalSize(sizeStr, btnEl) {
    selectedSizeForModal = sizeStr;
    const pills = document.querySelectorAll(".size-pill-btn");
    pills.forEach(p => { p.classList.remove("bg-amber-600", "text-white"); p.classList.add("bg-slate-100", "text-slate-800"); });
    if (btnEl) { btnEl.classList.remove("bg-slate-100", "text-slate-800"); btnEl.classList.add("bg-amber-600", "text-white"); }
}

function saveCart() {
    localStorage.setItem("tp_cart", JSON.stringify(cart));
    updateCartBadges();
    renderCartDrawer();
}

function updateCartBadges() {
    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const dBadge = document.getElementById("desktop-cart-badge");
    const mBadge = document.getElementById("mobile-cart-badge");
    const dDrawerCount = document.getElementById("cart-drawer-count");

    if (dBadge) dBadge.innerText = totalQty;
    if (mBadge) mBadge.innerText = totalQty;
    if (dDrawerCount) dDrawerCount.innerText = `${totalQty} item${totalQty === 1 ? '' : 's'}`;
}

function toggleCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-backdrop");
    const panel = document.getElementById("cart-panel");

    if (!drawer) return;

    const isHidden = drawer.classList.contains("pointer-events-none");
    if (isHidden) {
        drawer.classList.remove("pointer-events-none");
        if (backdrop) backdrop.classList.remove("opacity-0");
        if (panel) panel.classList.remove("translate-x-full");
        renderCartDrawer();
    } else {
        if (backdrop) backdrop.classList.add("opacity-0");
        if (panel) panel.classList.add("translate-x-full");
        setTimeout(() => drawer.classList.add("pointer-events-none"), 300);
    }
}

function addToCart(code, selectedSize, qty = 1) {
    const item = catalog.find(p => p.code === code);
    if (!item) return;

    const size = selectedSize || item.size || "Standard";
    const existing = cart.find(c => c.code === code && (c.selectedSize || c.size) === size);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + qty;
    } else {
        cart.push({
            code: item.code,
            name: item.name,
            price: item.price,
            image: item.image,
            selectedSize: size,
            size: size,
            quantity: qty
        });
    }

    saveCart();
    toggleCartDrawer();
}

function addCurrentModalItemToCart() {
    if (!selectedModalProduct) return;
    addToCart(selectedModalProduct.code, selectedSizeForModal || selectedModalProduct.size || "Standard");
    closeModal();
}

function buyCurrentModalItemNow() {
    if (!selectedModalProduct) return;
    currentCheckoutItems = [{
        code: selectedModalProduct.code,
        name: selectedModalProduct.name,
        price: selectedModalProduct.price,
        image: selectedModalProduct.image,
        selectedSize: selectedSizeForModal || selectedModalProduct.size || "Standard",
        quantity: 1
    }];
    closeModal();
    openShippingModal();
}

function updateCartQty(code, size, delta) {
    const idx = cart.findIndex(c => c.code === code && (c.selectedSize || c.size) === size);
    if (idx >= 0) {
        cart[idx].quantity = (cart[idx].quantity || 1) + delta;
        if (cart[idx].quantity <= 0) {
            cart.splice(idx, 1);
        }
        saveCart();
    }
}

function removeFromCart(code, size) {
    cart = cart.filter(c => !(c.code === code && (c.selectedSize || c.size) === size));
    saveCart();
}

function renderCartDrawer() {
    const container = document.getElementById("cart-items-container");
    const subtotalEl = document.getElementById("cart-subtotal");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="py-16 text-center space-y-3">
                <span class="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
                <p class="text-sm font-bold text-slate-600">Your cart is empty</p>
                <p class="text-xs text-slate-400">Explore our fresh arrivals & collections to add items!</p>
            </div>
        `;
        if (subtotalEl) subtotalEl.innerText = CONFIG.currency + "0.00";
        return;
    }

    let subtotal = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        subtotal += itemTotal;
        return `
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img src="${item.image || 'images/placeholder.svg'}" class="w-16 h-16 rounded-lg object-cover border border-slate-200">
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-xs text-slate-900 truncate">${item.name}</h4>
                    <p class="text-[10px] text-slate-400 font-mono">${item.code} | Size: ${item.selectedSize || 'Standard'}</p>
                    <p class="text-xs font-bold text-amber-700 mt-0.5">${CONFIG.currency}${item.price}</p>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <button onclick="removeFromCart('${item.code}', '${item.selectedSize || 'Standard'}')" class="text-red-500 hover:text-red-700">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <div class="flex items-center border border-slate-300 rounded bg-white">
                        <button onclick="updateCartQty('${item.code}', '${item.selectedSize || 'Standard'}', -1)" class="px-1.5 py-0.5 text-xs text-slate-600 font-bold">-</button>
                        <span class="px-2 text-xs font-bold text-slate-800">${item.quantity || 1}</span>
                        <button onclick="updateCartQty('${item.code}', '${item.selectedSize || 'Standard'}', 1)" class="px-1.5 py-0.5 text-xs text-slate-600 font-bold">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    if (subtotalEl) subtotalEl.innerText = CONFIG.currency + subtotal.toFixed(2);
}

function openShippingModalFromCart() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    currentCheckoutItems = [...cart];
    toggleCartDrawer();
    openShippingModal();
}

function openShippingModal() {
    const modal = document.getElementById("shipping-modal");
    if (modal) modal.classList.remove("hidden");
}

function closeShippingModal() {
    const modal = document.getElementById("shipping-modal");
    if (modal) modal.classList.add("hidden");
}

function submitOrder(e) {
    e.preventDefault();

    const name = document.getElementById("cust-name").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const address = document.getElementById("cust-address").value.trim();
    const city = document.getElementById("cust-city").value.trim();
    const postcode = document.getElementById("cust-postcode").value.trim();

    if (currentCheckoutItems.length === 0) {
        currentCheckoutItems = [...cart];
    }

    if (currentCheckoutItems.length === 0) {
        alert("No items to checkout!");
        return;
    }

    const orderId = "TP-" + Math.floor(100000 + Math.random() * 900000);
    const totalAmount = currentCheckoutItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

    const orderObj = {
        orderId: orderId,
        date: new Date().toLocaleDateString(),
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerCity: city,
        customerPostcode: postcode,
        items: currentCheckoutItems,
        total: totalAmount
    };

    localStorage.setItem("tp_last_order", JSON.stringify(orderObj));

    // SILENT AUTO-SYNC: Send all details to Google Form & Backup Storage in the background
    // (Ensures order is captured even if customer forgets to send WhatsApp message!)
    sendOrderToGoogleForm(orderObj);

    // Construct Receipt Link
    const baseUrl = window.location.href.split('?')[0].replace(/\/[^\/]*$/, '/');
    const encodedOrder = encodeURIComponent(JSON.stringify(orderObj));
    const receiptUrl = `${baseUrl}receipt.html?data=${encodedOrder}`;

    // Construct WhatsApp message with Name & Address + Receipt Link
    const waMsg = `Hello Trendy Pearls Boutique! 👋\nI would like to place an order.\n\n👤 *Customer Name:* ${name}\n📍 *Shipping Address:* ${address}, ${city} ${postcode}\n💰 *Total Amount:* ${CONFIG.currency}${totalAmount}\n\n📄 *View Order Receipt & Items:* ${receiptUrl}`;

    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

    // Clear cart if full checkout
    if (currentCheckoutItems.length === cart.length) {
        cart = [];
        saveCart();
    }

    closeShippingModal();

    // Redirect to receipt & WhatsApp
    window.open(receiptUrl, "_blank");
    window.location.href = waUrl;
}

// Background Silent Auto-Sync for Orders (Google Form & Backup Storage)
function sendOrderToGoogleForm(orderObj) {
    if (!orderObj) return;

    try {
        const itemSummary = (orderObj.items || []).map(i => `${i.name} (Code: ${i.code || '-'}, Size: ${i.selectedSize || i.size || 'Standard'}, Qty: ${i.quantity || 1}, Price: A$${i.price})`).join("; ");
        const fullAddress = `${orderObj.customerAddress || ''}, ${orderObj.customerCity || ''} ${orderObj.customerPostcode || ''}`.trim();
        const timestamp = new Date().toLocaleString();

        // 1. Permanent Browser Storage Backup (Logs ALL orders submitted on device)
        const allOrders = JSON.parse(localStorage.getItem("tp_all_orders") || "[]");
        if (!allOrders.some(o => o.orderId === orderObj.orderId)) {
            allOrders.push({ ...orderObj, timestamp, status: "Submitted" });
            localStorage.setItem("tp_all_orders", JSON.stringify(allOrders));
        }

        // 2. Google Form / Webhook Submit (Silent Background POST)
        if (CONFIG.googleFormUrl && !CONFIG.googleFormUrl.includes("YOUR_GOOGLE_FORM_ID")) {
            const formData = new FormData();
            if (CONFIG.googleFormEntries) {
                if (CONFIG.googleFormEntries.customerName) formData.append(CONFIG.googleFormEntries.customerName, orderObj.customerName || "");
                if (CONFIG.googleFormEntries.customerPhone) formData.append(CONFIG.googleFormEntries.customerPhone, orderObj.customerPhone || "");
                if (CONFIG.googleFormEntries.customerAddress) formData.append(CONFIG.googleFormEntries.customerAddress, fullAddress);
                if (CONFIG.googleFormEntries.orderDetails) formData.append(CONFIG.googleFormEntries.orderDetails, `Order #: ${orderObj.orderId} | Items: ${itemSummary}`);
                if (CONFIG.googleFormEntries.totalAmount) formData.append(CONFIG.googleFormEntries.totalAmount, "A$" + (orderObj.total || 0).toFixed(2));
            }

            fetch(CONFIG.googleFormUrl, {
                method: "POST",
                mode: "no-cors",
                body: formData
            }).catch(err => console.log("Google Form background sync notice:", err));
        }

        // 3. Local Admin Server Backup (if running)
        fetch('/api/save-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...orderObj, timestamp })
        }).catch(() => {});

    } catch (e) {
        console.error("Error logging background order:", e);
    }
}

// Initial cart badges update when app starts
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadges();
});
