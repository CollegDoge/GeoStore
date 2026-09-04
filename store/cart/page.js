// PERSONAL DETAILS AUTOFILL (signed-in users only)
async function autofillPersonalDetails() {
    await window.sbReady;
    const { data } = await sb.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    const emailInput = document.getElementById('cart-email');
    if (emailInput) emailInput.value = user.email || '';

    const { data: profile } = await sb
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

    if (profile) {
        const firstInput = document.getElementById('cart-firstname');
        const lastInput = document.getElementById('cart-lastname');
        if (firstInput) firstInput.value = profile.first_name || '';
        if (lastInput) lastInput.value = profile.last_name || '';
    }
}

autofillPersonalDetails();

// temp email checkbox change
const emailCheckbox = document.getElementById('checkbox-email');

emailCheckbox.addEventListener('click', () => {
    if (emailCheckbox.classList.contains('nf-fa-circle_o')) {
        emailCheckbox.classList.remove('nf-fa-circle_o');
        emailCheckbox.classList.add('nf-fa-circle_check');
    } else {
        emailCheckbox.classList.remove('nf-fa-circle_check');
        emailCheckbox.classList.add('nf-fa-circle_o');
    }
});

// terms checkbox change
const termsCheckbox = document.getElementById('checkbox-terms');
const orderBtn = document.getElementById('button-major');

termsCheckbox.addEventListener('click', () => {
    if (termsCheckbox.classList.contains('nf-fa-circle_o')) {
        termsCheckbox.classList.remove('nf-fa-circle_o');
        termsCheckbox.classList.add('nf-fa-circle_check');
        orderBtn.classList.add('active');
    } else {
        termsCheckbox.classList.remove('nf-fa-circle_check');
        termsCheckbox.classList.add('nf-fa-circle_o');
        orderBtn.classList.remove('active');
    }
});

// show/hide billing info
const billingInfo = document.getElementById('billing');
const billingInfoTitle = document.getElementById('billing-title');
const billingInfoBtn = document.getElementById('checkbox-billing');

// click event
billingInfoBtn.addEventListener('click', () => {
    if (billingInfo.classList.contains('show')) {
        billingInfo.classList.remove('show');
        billingInfoTitle.classList.remove('show');
        billingInfoBtn.classList.remove('nf-fa-circle_o');
        billingInfoBtn.classList.add('nf-fa-circle_check');
    } else {
        billingInfo.classList.add('show');
        billingInfoTitle.classList.add('show');
        billingInfoBtn.classList.remove('nf-fa-circle_check');
        billingInfoBtn.classList.add('nf-fa-circle_o');
    }
});

// promo status
const promoStatus = document.getElementById('promoStatus');
const promoInput = document.getElementById('promoCode');
const promoButton = document.getElementById('promoButton');

promoButton.addEventListener('click', () => {
    applyPromo(promoInput.value);
});
promoInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        applyPromo(promoInput.value);
    }
});

// temp error message on submit
const error = document.querySelector('.checkout-error');
const errorTitle = document.querySelector('.checkout-error h2');
const errorMsg = document.querySelector('.checkout-error p');

orderBtn.addEventListener('click', () => {
    showError('Failed to place order', 'Havent implemented yet :(');
});

function showError(title, msg) {
    error.style.display = 'flex';
    errorTitle.textContent = title;
    errorMsg.textContent = msg;
}

function hideError() {
    error.style.display = 'none';
}

// CART
const CART_KEY = 'cart';
const cartStatus = document.getElementById('cartStatus');
const cartClearBtn = document.getElementById('cartClearBtn');
const cartItemList = document.getElementById('cart-item-list');

const PRODUCTS_JSON_URL = '/assets/database/products.json';
const SHIPPING_FLAT_RATE = 20;

let productsDb = null;
let appliedPromoIndex = null; // null = no promo, 0 = percent-off code, 1 = free-shipping code

// CLEAR CART
function clearCart() {
    localStorage.removeItem(CART_KEY);
    location.reload();
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

async function loadProducts() {
    const res = await fetch(PRODUCTS_JSON_URL);
    if (!res.ok) throw new Error('Failed to load product data');
    return res.json();
}

function typeLabel(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function colorLabel(db, code) {
    const entry = db.meta.colorPalette.find((c) => c.code === code);
    return entry ? entry.label : null;
}

function sizeLabel(db, type, value) {
    const options = db.meta.sizeOptions[type];
    if (!options) return null;
    const entry = options.find((s) => s.value === value);
    return entry ? entry.label : null;
}

// builds one .cart-item row for a single localStorage cart entry
function renderCartItem(db, item) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) return null; // product no longer exists in the catalog — skip it

    const variant = [typeLabel(product.type)];
    const cLabel = colorLabel(db, item.color);
    if (cLabel) variant.push(cLabel);
    const sLabel = sizeLabel(db, product.type, item.size);
    if (sLabel) variant.push(sLabel);

    const el = document.createElement('div');
    el.className = 'cart-item';

    const qty = document.createElement('p');
    qty.textContent = `${item.quantity}x`;

    const link = document.createElement('a');
    link.href = `/product/${product.id}`;
    link.textContent = `${product.name} - ${variant.join(' / ')}`;

    const price = document.createElement('p');
    price.textContent = `$${(product.price * item.quantity).toFixed(2)}`;

    el.append(qty, link, price);
    return el;
}

function renderCartItems() {
    const cart = getCart();
    cartItemList.innerHTML = '';

    if (cart.length === 0) {
        cartStatus.style.display = '';
        cartClearBtn.style.display = 'none';
        return;
    }

    cartStatus.style.display = 'none';
    cartClearBtn.style.display = '';

    cart.forEach((item) => {
        const el = renderCartItem(productsDb, item);
        if (el) cartItemList.appendChild(el);
    });
}

// items total = GST-inclusive sum of everything in the cart, before shipping/promo
function itemsTotal() {
    if (!productsDb) return 0;
    return getCart().reduce((sum, item) => {
        const product = productsDb.products.find((p) => p.id === item.productId);
        return product ? sum + product.price * item.quantity : sum;
    }, 0);
}

function updateTotals() {
    const cart = getCart();
    const total = itemsTotal();

    const base = total * 0.85;
    const gst = total * 0.15;

    let shipping = cart.length > 0 ? SHIPPING_FLAT_RATE : 0;
    let promo = 0;

    if (appliedPromoIndex === 0) {
        promo = -(total * 0.10);
    } else if (appliedPromoIndex === 1) {
        promo = -20;
        shipping = 0;
    }

    const grandTotal = base + gst + shipping + promo;
    const promoText = promo < 0 ? `-$${Math.abs(promo).toFixed(2)}` : `$${promo.toFixed(2)}`;

    document.getElementById('cost-base').textContent = `Base: $${base.toFixed(2)}`;
    document.getElementById('cost-gst').textContent = `GST: $${gst.toFixed(2)}`;
    document.getElementById('cost-shipping').textContent = `Shipping: $${shipping.toFixed(2)}`;
    document.getElementById('cost-promo').textContent = `Promo: ${promoText}`;
    document.getElementById('cost-total').textContent = `$${grandTotal.toFixed(2)}`;
}

// APPLY PROMO
function applyPromo(code) {
    const codes = (productsDb && productsDb.meta['promo-codes']) || [];
    const idx = codes.indexOf(code.trim().toUpperCase());

    if (idx === -1) {
        appliedPromoIndex = null;
        promoStatus.textContent = 'Invalid Promo Code';
        promoStatus.style.color = 'var(--error)';
    } else {
        appliedPromoIndex = idx;
        promoStatus.textContent = 'Promo Code Applied';
        promoStatus.style.color = 'var(--success)';
    }

    updateTotals();
}

async function init() {
    try {
        productsDb = await loadProducts();
    } catch (err) {
        cartItemList.innerHTML = '<p>Could not load product data — try refreshing.</p>';
        updateTotals();
        return;
    }

    renderCartItems();
    updateTotals();
}

init();