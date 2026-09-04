// page.js for /account/manage/

let currentProfile = null; // { first_name, last_name, pfp_number } — cached after load
const dirtyFields = new Set(); // 'firstName' | 'lastName' | 'email' | 'password' | 'pfp'

// LOAD ACC
async function loadAccount(user) {
    const { data: profile, error } = await sb
        .from('profiles')
        .select('first_name, last_name, pfp_number')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Failed to load profile:', error);
        return;
    }

    currentProfile = profile;

    document.getElementById('currentFName').textContent = profile.first_name;
    document.getElementById('currentLName').textContent = profile.last_name;
    document.getElementById('currentEmail').textContent = user.email;

    setActivePfp(profile.pfp_number);
    resetFieldUI();
    dirtyFields.clear();
    document.getElementById('save-edits').style.display = 'none';
}

function setActivePfp(num) {
    document.querySelectorAll('.pfp-container img').forEach((img) => {
        img.classList.toggle('active', Number(img.dataset.pfp) === num);
    });
}

function resetFieldUI() {
    document.querySelectorAll('.account-item').forEach((item) => {
        item.querySelector('input').style.display = 'none';
        item.querySelector('.field-cancel').style.display = 'none';
        item.querySelector('.field-edit').style.display = 'flex';
        item.querySelector('p[id^="current"]').style.display = 'flex';
    });
}

function markDirty(key) {
    dirtyFields.add(key);
    document.getElementById('save-edits').style.display = 'flex';
}

function clearDirty(key) {
    dirtyFields.delete(key);
    if (dirtyFields.size === 0) {
        document.getElementById('save-edits').style.display = 'none';
    }
}

// EDITABLE FIELDSS
document.querySelectorAll('.account-item').forEach((item) => {
    const field = item.dataset.field;
    const display = item.querySelector('p[id^="current"]');
    const input = item.querySelector('input');
    const editBtn = item.querySelector('.field-edit');
    const cancelBtn = item.querySelector('.field-cancel');

    editBtn.addEventListener('click', () => {
        input.value = field === 'password' ? '' : display.textContent;
        display.style.display = 'none';
        input.style.display = 'flex';
        cancelBtn.style.display = 'flex';
        editBtn.style.display = 'none';
        input.focus();
        markDirty(field);
    });

    cancelBtn.addEventListener('click', () => {
        input.style.display = 'none';
        cancelBtn.style.display = 'none';
        editBtn.style.display = 'flex';
        display.style.display = 'flex';
        clearDirty(field);
    });
});

// PFP
document.querySelector('.pfp-container').addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;

    document.querySelectorAll('.pfp-container img').forEach((i) => i.classList.remove('active'));
    img.classList.add('active');

    const selected = Number(img.dataset.pfp);
    if (selected !== currentProfile.pfp_number) markDirty('pfp');
    else clearDirty('pfp');
});

// SAVE
document.getElementById('save-edits').addEventListener('click', async () => {
    await window.sbReady;

    const authUpdates = {};    // goes to sb.auth.updateUser (email/password)
    const profileUpdates = {}; // goes to the profiles table (first/last name, pfp)

    document.querySelectorAll('.account-item').forEach((item) => {
        const field = item.dataset.field;
        if (!dirtyFields.has(field)) return;

        const value = item.querySelector('input').value.trim();
        if (!value) return; // don't submit an edit that was opened but left empty

        if (field === 'firstName') profileUpdates.first_name = value;
        if (field === 'lastName') profileUpdates.last_name = value;
        if (field === 'email') authUpdates.email = value;
        if (field === 'password') authUpdates.password = value;
    });

    if (dirtyFields.has('pfp')) {
        const activeImg = document.querySelector('.pfp-container img.active');
        profileUpdates.pfp_number = Number(activeImg.dataset.pfp);
    }

    try {
        const { data: { session } } = await sb.auth.getSession();

        if (Object.keys(authUpdates).length > 0) {
            const { error } = await sb.auth.updateUser(authUpdates);
            if (error) throw error;
        }

        if (Object.keys(profileUpdates).length > 0) {
            const { error } = await sb.from('profiles').update(profileUpdates).eq('id', session.user.id);
            if (error) throw error;
        }

        await loadAccount(session.user); // refreshes displayed values and resets edit UI
    } catch (err) {
        console.error('Failed to save changes:', err);
        alert('Something went wrong saving your changes — please try again.');
    }
});

// SIGN OUT BTN
document.getElementById('signout-btn').addEventListener('click', async () => {
    await window.sbReady;
    await sb.auth.signOut();
    location.href = '/';
});

// PREVIOUS ORDERS
function typeLabel(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function makeP(className, text) {
    const p = document.createElement('p');
    p.className = className;
    p.textContent = text;
    return p;
}

// RENDER ORDERS
function renderOrderItem(item) {
    const el = document.createElement('div');
    el.className = 'order-item';

    el.appendChild(makeP('order-item-qty', `${item.quantity}x`));

    const segments = [
        makeP('order-item-name', item.item_name),
        makeP('order-item-type', typeLabel(item.item_type)),
    ];
    if (item.item_size) segments.push(makeP('order-item-size', item.item_size));
    if (item.item_color) segments.push(makeP('order-item-color', item.item_color));

    segments.forEach((seg, i) => {
        el.appendChild(seg);
        if (i < segments.length - 1) el.appendChild(document.createTextNode(' - '));
    });

    el.appendChild(makeP('order-item-price', `$${(item.item_price * item.quantity).toFixed(2)}`));

    return el;
}
function createOrderBox(order) {
    const box = document.createElement('div');
    box.className = 'order-box';
    box.dataset.orderId = order.id;

    box.innerHTML = `
        <div class="order-box-header">
            <h3>Order ID: </h3>
            <p class="order-id-display">${order.id}</p>
            <p class="order-status-display">${order.status}</p>
            <a class="expand-order">View Order</a>
        </div>
        <div class="order-box-expanded" style="display: none"></div>
    `;

    const expandBtn = box.querySelector('.expand-order');
    const expandedBox = box.querySelector('.order-box-expanded');
    let itemsLoaded = false;

    expandBtn.addEventListener('click', async () => {
        const isHidden = expandedBox.style.display === 'none';

        if (isHidden && !itemsLoaded) {
            const { data: items, error } = await sb
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

            if (error) {
                expandedBox.textContent = 'Failed to load items for this order.';
            } else {
                items.forEach((item) => expandedBox.appendChild(renderOrderItem(item)));
            }
            itemsLoaded = true;
        }

        expandedBox.style.display = isHidden ? 'flex' : 'none';
    });

    return box;
}

async function loadOrders(userId) {
    const container = document.querySelector('.orders-container');
    container.querySelectorAll('.order-box, .orders-empty').forEach((el) => el.remove());

    const { data: orders, error } = await sb
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to load orders:', error);
        return;
    }

    if (orders.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'orders-empty';
        empty.textContent = "You haven't placed any orders yet.";
        container.appendChild(empty);
        return;
    }

    orders.forEach((order) => container.appendChild(createOrderBox(order)));
}

// INIT
(async () => {
    await window.sbReady;
    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
        location.href = '/account/signin/';
        return;
    }

    await loadAccount(session.user);
    loadOrders(session.user.id);
})();