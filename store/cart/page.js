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
    completeOrder();
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
function clearCart(reload = true) {
    localStorage.removeItem(CART_KEY);
    if (reload) location.reload();
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

// pure calculation — returns the numbers, doesn't touch the DOM.
// Shared by updateTotals() (for display) and completeOrder() (for the order total).
function calculateTotals() {
    const cart = getCart();
    const total = itemsTotal();

    const base = total * 0.85;
    const gst = total * 0.15;
    const shipping = cart.length > 0 ? SHIPPING_FLAT_RATE : 0; // flat rate, unaffected by promo

    let promo = 0;
    if (appliedPromoIndex === 0) {
        promo = -(total * 0.10);
    } else if (appliedPromoIndex === 1) {
        promo = -SHIPPING_FLAT_RATE; // effectively cancels the shipping line out
    }

    return { base, gst, shipping, promo, total: base + gst + shipping + promo };
}

function updateTotals() {
    const { base, gst, shipping, promo, total } = calculateTotals();
    const promoText = promo < 0 ? `-$${Math.abs(promo).toFixed(2)}` : `$${promo.toFixed(2)}`;

    document.getElementById('cost-base').textContent = `Base: $${base.toFixed(2)}`;
    document.getElementById('cost-gst').textContent = `GST: $${gst.toFixed(2)}`;
    document.getElementById('cost-shipping').textContent = `Shipping: $${shipping.toFixed(2)}`;
    document.getElementById('cost-promo').textContent = `Promo: ${promoText}`;
    document.getElementById('cost-total').textContent = `$${total.toFixed(2)}`;
}

// if valid code, apply discount (position in products.json's promo-codes list decides the effect:
// index 0 = 10% off, index 1 = free-shipping-ish)
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

// ORDER SUBMISSION (revised)
let orderSubmitting = false;

async function completeOrder() {
    if (orderSubmitting) return;

    if (!termsCheckbox.classList.contains('nf-fa-circle_check')) {
        showError('Terms required', 'Please accept the Terms and Conditions first.');
        return;
    }

    const cart = getCart();
    if (cart.length === 0 || !productsDb) {
        showError('Cart is empty', 'Add something to your cart before checking out.');
        return;
    }

    const resolvedItems = [];
    for (const item of cart) {
        const product = productsDb.products.find((p) => p.id === item.productId);
        if (!product) {
            showError('Item unavailable', 'One or more items in your cart could no longer be found. Remove them and try again.');
            return;
        }
        resolvedItems.push({ item, product });
    }

    const firstName = document.getElementById('cart-firstname').value.trim();
    const lastName = document.getElementById('cart-lastname').value.trim();
    const email = document.getElementById('cart-email').value.trim();
    if (!firstName || !lastName || !email) {
        showError('Missing info', 'Fill in your first name, last name, and email.');
        return;
    }

    await window.sbReady; // wait until auth is ready
    const { data: sessionData } = await sb.auth.getSession(); // get session data
    const user = sessionData.session?.user; // get user data

    // if not signed in, show error
    if (!user) {
        showError('Not signed in', 'Please sign in to complete your order.');
        return;
    }

    // update submit status
    orderSubmitting = true;
    orderBtn.classList.add('disabled');

    try {
        // calculate total cost
        const totals = calculateTotals();

        // insert user data into the orders table (supabase sql)
        const { data: order, error: orderError } = await sb
            .from('orders')
            .insert({
                user_id: user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                total_cost: Number(totals.total.toFixed(2)),
            })
            .select()
            .single();

        // if order insert failed, show error and return
        if (orderError || !order) {
            showError('Failed to place order', orderError ? orderError.message : 'Something went wrong.');
            return;
        }

        // insert order items into the order_items table (supabase sql)
        const orderItemsPayload = resolvedItems.map(({ item, product }) => ({
            order_id: order.id,
            quantity: item.quantity,
            item_name: product.name,
            item_type: product.type,
            item_size: sizeLabel(productsDb, product.type, item.size) || item.size || null,
            item_color: colorLabel(productsDb, item.color) || item.color || null,
            item_price: product.price,
        }));

        // if order items insert failed, show error and return
        const { error: itemsError } = await sb.from('order_items').insert(orderItemsPayload);

        // further error prevention
        if (itemsError) {
            await sb.from('orders').delete().eq('id', order.id);
            showError('Failed to place order', itemsError.message);
            return;
        }

        // update cart
        clearCart(false);
        window.location.href = `/account/completed-order/?order=${order.id}`; // redirect to completed order page
    } finally {
        orderSubmitting = false; // prevents multiple clicks
        orderBtn.classList.remove('disabled');
    }
}