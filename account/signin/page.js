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

// temp error message on submit
const signinSub = document.getElementById('signin-submit');
const signupSub = document.getElementById('signup-submit');
const error = document.querySelector('.signin-form-error');
const errorTitle = document.querySelector('.signin-form-error h2');
const errorMsg = document.querySelector('.signin-form-error p');

signinSub.addEventListener('click', () => {
    error.style.display = 'flex';
    errorTitle.textContent = 'Failed to sign in';
    errorMsg.textContent = 'Havent implemented yet :(';
});
signupSub.addEventListener('click', () => {
    error.style.display = 'flex';
    errorTitle.textContent = 'Failed to sign in';
    errorMsg.textContent = 'Havent implemented yet :(';
});