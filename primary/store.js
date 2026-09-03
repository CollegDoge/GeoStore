// for all pages with product boxes

const PRODUCTS_URL = '/assets/database/products.json';

PRODUCT_TYPES = [
    'shirt',
    'hoodie',
    'mug',
    'sock',
    'sticker',
]

const productStyle = {
    shirt: {
        overlay: { width: '33%', transform: 'translateY(-10%)' },
    },
    hoodie: {
        overlay: { width: '30%' },
    },
    sock: {
        overlay: { width: '20%', transform: 'translateY(-90%) translateX(20%)' },
    },
    mug: {
        overlay: { width: '30%', transform: 'translateX(-25%)' },
    },
    sticker: {
        overlay: { width: '50%', transform: 'translateY(-5%)', background: '#F9F9F9', padding: '4px', borderRadius: '10px', boxShadow: '0 10px 10px var(--shadow)' },
    }
};

// HELPERS
// create color span elements
function colorSwatchHTML(count) {
    let html = '';
    for (let i = 1; i <= count; i++) {
        html += `<span class="product-colour${i}" style="background-color: var(--store-color${i})"></span>`;
    }
    return html;
}

// shuffle without overwriting original array
function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// check for type/collection 
function parseFilterString(filterStr) {
    const map = {};
    (filterStr || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((part) => {
        if (part === 'popular') { map.popular = 'true'; return; }
        const [key, value] = part.split(':');
        map[key] = value;
    });
    return map;
}

// filter products by attribute
function filterMapToFn(map) {
    const entries = Object.entries(map);
    if (entries.length === 0) return () => true;
    return (p) => entries.every(([key, value]) => {
        if (key === 'popular') return p.popular === true;
        return String(p[key]) === value;
    });
}

// filter products by attribute
function getFilterFn(filterAttr) {
    return filterMapToFn(parseFilterString(filterAttr));
}

 
// CREATE PRODUCT BOX
function createProductCard(product) {
    const { id, name, collection, type, variation, colors, price, onSale, inStock } = product;
    const salePrice = onSale ? price * 0.8 : price;
 
    const el = document.createElement('div');
    el.className = 'product';
    el.addEventListener('click', () => { location.href = `/product/${id}/`; });
 
    el.innerHTML = `
        <div class="product-box">
            <div class="product-top">
                ${!inStock ? '<div class="product-top-stock">no stock</div>' : ''}
                ${onSale ? '<div class="product-top-deal">-20%</div>' : ''}
            </div>
            <div class="product-image">
                <img alt="${name}">
            </div>
            <div class="product-bottom">
                ${colors > 0 ? `<div class="product-bottom-colours">${colorSwatchHTML(colors)}</div>` : ''}
                <div class="product-bottom-price">$${salePrice.toFixed(2)}</div>
            </div>
        </div>
        <div class="product-title">
            <h2>${name}</h2>
            <a>${(type)} - ${(collection)}</a>
        </div>
    `;
 
    // BACKGROUND IMAGE
    if (type !== 'sticker') {
        el.querySelector('.product-box').style.backgroundImage =
            `url(/assets/store-images/${type}/${type}1-w.webp)`;
    }

    // FOREGROUND (OVERLAY) IMAGE
    const overlayImg = el.querySelector('.product-image img');
    overlayImg.src = `https://images.geodearc.com/store/${collection}/${variation}.webp`;
    Object.assign(overlayImg.style, (productStyle[type] && productStyle[type].overlay) || {});
 
    return el;
}
 
// REWORKED ROW BUTTONS
function initRowScroll(row) {
    const btnLeft = row.querySelector('.row-mvleft');
    const btnRight = row.querySelector('.row-mvright');

    if (!btnLeft || !btnRight) return;
 
    function updateState() {
        const maxScroll = row.scrollWidth - row.clientWidth;
        const atStart = row.scrollLeft <= 0;
        const atEnd = row.scrollLeft >= maxScroll - 2;
        btnLeft.style.visibility = atStart ? 'hidden' : 'visible';
        btnRight.style.visibility = atEnd ? 'hidden' : 'visible';
    }
    if (!row.dataset.scrollInit) {
        btnLeft.addEventListener('click', () => row.scrollBy({ left: -row.clientWidth, behavior: 'smooth' }));
        btnRight.addEventListener('click', () => row.scrollBy({ left: row.clientWidth, behavior: 'smooth' }));
        row.addEventListener('scroll', updateState);
        window.addEventListener('resize', updateState);
        row.dataset.scrollInit = 'true';
    }
    row.scrollLeft = 0;
    updateState();
}
 
// RENDER PRODUCT ROWS
function renderRow(row, products) {
    const select = row.dataset.select ? document.querySelector(row.dataset.select) : null;
 
    const activeMap = parseFilterString(row.dataset.filter);
    if (select && select.value && select.value !== 'all') {
        const filterKey = select.dataset.filterKey;
        if (!filterKey) {
            console.warn(`Select "${row.dataset.select}" is missing data-filter-key — its value is being ignored.`);
        } else {
            activeMap[filterKey] = select.value; // adds a new axis, or overrides the base's if they share a key
        }
    }
 
    const filterFn = filterMapToFn(activeMap);
    const limit = parseInt(row.dataset.limit, 10) || Infinity;
    const order = row.dataset.order || 'random'; // 'random' (default) or 'fixed'
 
    const filtered = products.filter(filterFn);
    const ordered = order === 'fixed' ? filtered : shuffle(filtered);
    const matches = ordered.slice(0, limit);
 
    row.querySelectorAll('.product').forEach((el) => el.remove()); // clear placeholder/old cards
    const buttons = row.querySelector('.product-buttons');
    matches.forEach((product) => {
        row.insertBefore(createProductCard(product), buttons);
    });
 
    initRowScroll(row);
}

// RENDER
function renderProductRows(products) {
    document.querySelectorAll('.product-row[data-filter]').forEach((row) => {
        renderRow(row, products);
    });
}
 
// FILTER
function initFilterSelects() {
    document.querySelectorAll('.product-row[data-select]').forEach((row) => {
        const select = document.querySelector(row.dataset.select);
        if (!select) return;
        select.addEventListener('change', () => renderRow(row, allProducts));
    });
}
 
// INIT
let allProducts = [];
 
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(PRODUCTS_URL);
        if (!res.ok) throw new Error(`Failed to load products.json: ${res.status}`);
        const data = await res.json();
        allProducts = data.products;
        renderProductRows(allProducts);
        initFilterSelects();
    } catch (err) {
        console.error('Failed to load products:', err);
    }
});
