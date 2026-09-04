// page.js for /account/manage/
// Depends on window.sbReady / window.sb from script.js.

let currentProfile = null;
const dirtyFields = new Set();

async function loadAccount() {
    await window.sbReady;
    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
        location.href = '/account/signin/';
        return;
    }

    const user = session.user;
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

// Puts every editable field back into its default (non-editing) display state.
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

// ---- Editable fields (first/last name, email, password) ----
document.querySelectorAll('.account-item').forEach((item) => {
    const field = item.dataset.field;
    const display = item.querySelector('p[id^="current"]');
    const input = item.querySelector('input');
    const editBtn = item.querySelector('.field-edit');
    const cancelBtn = item.querySelector('.field-cancel');

    editBtn.addEventListener('click', () => {
        // Password never has a real current value to prefill from.
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

// ---- Profile picture ----
document.querySelector('.pfp-container').addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;

    document.querySelectorAll('.pfp-container img').forEach((i) => i.classList.remove('active'));
    img.classList.add('active');

    const selected = Number(img.dataset.pfp);
    if (selected !== currentProfile.pfp_number) markDirty('pfp');
    else clearDirty('pfp');
});

// SAVE BTN
document.getElementById('save-edits').addEventListener('click', async () => {
    await window.sbReady;

    const authUpdates = {};    // goes to sb.auth.updateUser (email/password)
    const profileUpdates = {}; // goes to the profiles table (first/last name, pfp)

    document.querySelectorAll('.account-item').forEach((item) => {
        const field = item.dataset.field;
        if (!dirtyFields.has(field)) return;

        const value = item.querySelector('input').value.trim();
        if (!value) return; // dont submit an edit that was opened but left empty

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
        if (Object.keys(authUpdates).length > 0) {
            const { error } = await sb.auth.updateUser(authUpdates);
            if (error) throw error;
        }

        if (Object.keys(profileUpdates).length > 0) {
            const { data: { session } } = await sb.auth.getSession();
            const { error } = await sb.from('profiles').update(profileUpdates).eq('id', session.user.id);
            if (error) throw error;
        }

        await loadAccount(); // refreshes displayed values and resets edit UI
    } catch (err) {
        console.error('Failed to save changes:', err);
        alert('Something went wrong saving your changes — please try again.');
    }
});

// SIGN OUT
document.getElementById('signout-btn').addEventListener('click', async () => {
    await window.sbReady;
    await sb.auth.signOut();
    location.href = '/';
});


// EXPAND ITEMS (TO DO)
const expandOrder = document.getElementById('expandOrder');
expandOrder.addEventListener('click', () => {
    const expanded = document.querySelector('.order-box-expanded');
    if (expanded.style.display === 'none') {
        expanded.style.display = 'flex';
    } else {
        expanded.style.display = 'none';
    }
});

loadAccount();