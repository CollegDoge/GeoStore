const orderIdEl = document.getElementById('orderID');
const orderStatusEl = document.getElementById('orderStatus');
const expandedBox = document.getElementById('order-box-expanded');
const errorBox = document.querySelector('.completedorder-error');
const errorTitle = document.querySelector('.completedorder-error h2');
const errorMsg = document.querySelector('.completedorder-error p');


function showError(title, msg) {
    errorBox.style.display = 'flex';
    errorTitle.textContent = title;
    errorMsg.textContent = msg;
}

function typeLabel(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function makeP(className, text) {
    const p = document.createElement('p');
    p.className = className;
    p.textContent = text;
    return p;
}

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

async function loadOrder(user) {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');

    if (!orderId) {
        showError('No order specified', "We couldn't find an order to show — check the link you used to get here.");
        return;
    }

    const { data: order, error: orderError } = await sb
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        showError('Order not found', "We couldn't find that order — it may not exist, or it isn't yours.");
        return;
    }

    orderIdEl.textContent = order.id;
    orderStatusEl.textContent = order.status;

    const { data: items, error: itemsError } = await sb
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

    if (itemsError || !items) {
        showError('Could not load items', 'The order was found, but its items failed to load.');
        return;
    }

    items.forEach((item) => {
        expandedBox.appendChild(renderOrderItem(item));
    });
}

(async () => {
    await window.sbReady;
    const { data } = await sb.auth.getSession();
    const user = data.session?.user;

    if (!user) {
        window.location.href = '/account/signin/';
        return;
    }

    loadOrder(user);
})();