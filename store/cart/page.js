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

promoInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        applyPromo(e.target.value);
    }
});

// list of promo codes (WILL BE MOVED TO DATABASE LATER)
const promoCodes = [
    'TEST-CODE-1',
]

// if valid code, apply discount
function applyPromo(code) {
    if (promoCodes.includes(code)) {
        promoStatus.textContent = 'Promo Code Applied';
        promoStatus.style.color = 'var(--success)';
    } else {
        promoStatus.textContent = 'Invalid Promo Code';
        promoStatus.style.color = 'var(--error)';
    }
}

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

