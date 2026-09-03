// show/hide forms
const signInForm = document.getElementById('sign-in');
const signUpForm = document.getElementById('sign-up');
const signInBtn = document.getElementById('signin-btn');
const signUpBtn = document.getElementById('signup-btn');

signUpForm.style.display = 'none';

signInBtn.addEventListener('click', () => {
    signInForm.style.display = 'flex';
    signUpForm.style.display = 'none';
    signInBtn.classList.add('active');
    signUpBtn.classList.remove('active');
});
signUpBtn.addEventListener('click', () => {
    signInForm.style.display = 'none';
    signUpForm.style.display = 'flex';
    signUpBtn.classList.add('active');
    signInBtn.classList.remove('active');
});

// error message display
const error = document.querySelector('.signin-form-error');
const errorTitle = document.querySelector('.signin-form-error h2');
const errorMsg = document.querySelector('.signin-form-error p');
let errorTimeout;

function showError(title, message) {
    error.style.display = 'flex';
    errorTitle.textContent = title;
    errorMsg.textContent = message;

    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
        error.style.display = 'none';
    }, 5000);
}

// if already signed in, no reason to be on this page
window.sbReady.then(() => sb.auth.getSession()).then(({ data }) => {
    if (data.session) {
        window.location.href = '/account/manage/';
    }
});

// sign in
const signinSub = document.getElementById('signin-submit');
signinSub.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        showError('Missing info', 'Enter both your email and password.');
        return;
    }

    await window.sbReady;
    signinSub.classList.add('loading');
    const { error: signInError } = await sb.auth.signInWithPassword({ email, password });
    signinSub.classList.remove('loading');

    if (signInError) {
        showError('Failed to sign in', signInError.message);
        return;
    }

    window.location.href = '/account/manage/';
});

// sign up
const signupSub = document.getElementById('signup-submit');
signupSub.addEventListener('click', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('signup-firstname').value.trim();
    const lastName = document.getElementById('signup-lastname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!firstName || !lastName || !email || !password) {
        showError('Missing info', 'Fill out every field to create an account.');
        return;
    }

    await window.sbReady;
    signupSub.classList.add('loading');
    const { data, error: signUpError } = await sb.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                pfp_number: 1
            },
            emailRedirectTo: `${window.SITE_URL}/account/signin/`
        }
    });
    signupSub.classList.remove('loading');

    if (signUpError) {
        error.backgroundColor = 'var(--error)';
        showError('Failed to sign up', signUpError.message);
        return;
    }

    if (data.user && !data.session) {
        showError('Check your email', 'We sent a confirmation link — click it and you\'ll be signed in.');
        return;
    }

    window.location.href = '/account/manage/';
});