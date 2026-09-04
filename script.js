// THEME SWITCH
document.addEventListener("DOMContentLoaded", () => { // theme switching
    const togglebtn = document.getElementById("themeswitch");
    const body = document.body;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");

    function applyTheme(theme) {  // applies the theme
        if (theme === "dark") {
            body.classList.add("darkmode");
        } else {
            body.classList.remove("darkmode");
        }
    }

    if (savedTheme) { // checks local storage, and system preferences
        applyTheme(savedTheme);
    } else {
        applyTheme(systemPrefersDark ? "dark" : "light"); 
    }
    if (togglebtn) {
        togglebtn.addEventListener("click", () => { // theme switching, click script
            const currentTheme = body.classList.contains("darkmode") ? "dark" : "light";
            const newTheme = currentTheme === "dark" ? "light" : "dark";

            applyTheme(newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => { // live reloading
        if (!localStorage.getItem("theme")) { 
            applyTheme(event.matches ? "dark" : "light");
        }
    });
});

// ACCESSIBILITY
function setHighContrast(enabled) {
    document.body.classList.toggle("highcontrast", enabled);
    localStorage.setItem("highcontrast", enabled);
 
    const btn = document.getElementById("highcontrastbtn");
    if (btn) btn.textContent = enabled ? "Disable High Contrast" : "Enable High Contrast";
}
 
function setLargeText(enabled) {
    document.body.classList.toggle("largetext", enabled);
    localStorage.setItem("largetext", enabled);
 
    const btn = document.getElementById("largetextbtn");
    if (btn) btn.textContent = enabled ? "Disable Large Text" : "Enable Large Text";
}
 
// these are the ones the buttons' onclick= attributes call directly
function highContrastToggle() {
    setHighContrast(!document.body.classList.contains("highcontrast"));
}
 
function largeTextToggle() {
    setLargeText(!document.body.classList.contains("largetext"));
}
 
document.addEventListener("DOMContentLoaded", () => { // apply saved accessibility prefs on every page
    setHighContrast(localStorage.getItem("highcontrast") === "true");
    setLargeText(localStorage.getItem("largetext") === "true");
});

// ENABLE ANIMATIONS (flash mitigation) + SPECIAL NAV ITEMS
window.addEventListener("load", () => {
    document.body.classList.remove("preload");
    loadSpecialsNav();
});

// HEADER SEARCH OPEN (1080 to 768)
const searchBtn = document.querySelector('#searchbtn-mid');
const headerSearch = document.querySelector('#searchbar');
const headerCenter = document.querySelector('.header-center');

function toggleSearch() {
    headerSearch.classList.toggle('is-active');
    headerCenter.classList.toggle('search-hidden');
    searchBtn.classList.toggle('nf-oct-search');
    searchBtn.classList.toggle('nf-fa-chevron_right');
}
searchBtn.addEventListener('click', toggleSearch);


// HEADER BG CHANGE
document.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const headerSearch = document.querySelector('#searchbar');

    if (window.scrollY > 1) {
        header.style.backgroundColor = 'var(--banner)';
        headerSearch.style.backgroundColor = 'var(--primary-color)';
    } else {
        header.style.backgroundColor = 'transparent';
        headerSearch.style.backgroundColor = 'var(--banner)';
    }
});

// NAVIGATION DATA
const NAV_DATA = [
    {
        id: 'collections',
        label: 'Collections',
        items: [
            { text: "'h' collection",               href: '/store/collections/h/'    },
            { text: "'sssdfg' collection",          href: '/store/collections/sssdfg/'    },
            { text: "'wtflip' collection",          href: '/store/collections/wtf/'    },
            { text: "'from twitter' collection",    href: '/store/collections/from-twitter/'    },
            { text: "'DON'T wear this' collection", href: '/store/collections/dont-wear/'    },
            { text: "All Collections",              href: '/store/collections/'    },
        ]
    },
    {
        id: 'specials',
        label: 'Specials',
        items: [
            { text: 'Loading',                      href: ''    },
            { text: 'Loading',                      href: ''    },
            { text: 'Loading',                      href: ''    },
            { text: 'Loading',                      href: ''    },
            { text: 'Loading',                      href: ''    },
            { text: 'All Specials',                 href: '/store/specials/'    },
        ]
    },
    {
        id: 'byproduct',
        label: 'By Product',
        items: [
            { text: 'Shirts',                       href: '/store/by-product/shirts/'    },
            { text: 'Hoodies',                      href: '/store/by-product/hoodies/'    },
            { text: 'Socks',                        href: '/store/by-product/socks/'    },
            { text: 'Mugs',                         href: '/store/by-product/mugs/'    },
            { text: 'Stickers',                     href: '/store/by-product/stickers/'    },
            { text: 'All Products',                 href: '/store/by-product/'    },
        ]
    }
];

async function loadSpecialsNav() {
    const specials = NAV_DATA.find((section) => section.id === 'specials');
    if (!specials) return;

    try {
        const res = await fetch('/assets/database/products.json');
        const data = await res.json();
        const onSale = data.products.filter((p) => p.onSale);
        if (onSale.length === 0) return;

        // shuffle
        for (let i = onSale.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [onSale[i], onSale[j]] = [onSale[j], onSale[i]];
        }

        let pick = 0;
        specials.items.forEach((item) => {
            if (item.text !== 'Loading') return;
            const product = onSale[pick % onSale.length]; // wraps around if fewer sale items than slots
            item.text = product.name;
            item.href = `/product/${product.id}`;
            pick++;
        });
    } catch (err) {
        console.error('Failed to load specials for nav:', err);
    }
}


// NAVIGATION
const navReady = loadSpecialsNav();

function renderNavItems(container, items, className) {
    container.innerHTML = items
        .map((item) => `<a class="${className}" href="${item.href || '#'}">${item.text}</a>`)
        .join('');
}

// DROPDOWN
const pageblur = document.querySelector('.pageblur');
const dropdown = document.querySelector('.regnav-dropdown');
const regnavTitle = document.querySelector('.regnav-title h2');
const regnavInner = document.querySelector('.regnav-inner');
const navItems = document.querySelectorAll('.nav-item');

let hideTimeout;
async function showMenu(sectionId) {
    await navReady;
    clearTimeout(hideTimeout);

    const sectionData = NAV_DATA.find((item) => item.id === sectionId);
    if (!sectionData) return;

    navItems.forEach((item) => {
        item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
    });

    regnavTitle.textContent = sectionData.label;
    renderNavItems(regnavInner, sectionData.items, 'regnav-item');

    dropdown.classList.add('show');
    pageblur.classList.add('show');
}

function queueHide() {
    hideTimeout = setTimeout(() => {
        dropdown.classList.remove('show');
        pageblur.classList.remove('show');
        navItems.forEach((item) => item.classList.remove('active'));
    }, 150);
}

navItems.forEach((item) => {
    item.addEventListener('mouseenter', () => showMenu(item.getAttribute('data-section')));
    item.addEventListener('mouseleave', queueHide);
});

dropdown.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
dropdown.addEventListener('mouseleave', queueHide);

// HAMBURGER
const hamburger = document.querySelector('.hamburger-overlay');
const hamopen = document.querySelector('#hamburger-open');
const hamclose = document.querySelector('#hamburger-close');
const body = document.body;

function openHamburger() {
    hamburger.classList.add('show');
    body.style.overflow = 'hidden';
}
function closeHamburger() {
    hamburger.classList.remove('show');
    body.style.overflow = 'auto';
}
hamopen.addEventListener('click', openHamburger);
hamclose.addEventListener('click', closeHamburger);

async function buildHamburgerNav() {
    await navReady;

    NAV_DATA.forEach((section) => {
        const titleElement = document.getElementById(`ham-${section.id}`);
        if (!titleElement) return;

        const sectionContainer = titleElement.closest('.ham-body-section');
        const itemsContainer = sectionContainer.querySelector('.ham-section-items');
        renderNavItems(itemsContainer, section.items, 'ham-section-item');

        const titleBar = titleElement.parentElement;
        titleBar.addEventListener('click', () => {
            const isCurrentSectionOpen = sectionContainer.classList.contains('open');

            document.querySelectorAll('.ham-body-section').forEach((sec) => {
                sec.classList.remove('open');
                const icon = sec.querySelector('.nf-fa-angle_up, .nf-fa-angle_down');
                if (icon) {
                    icon.classList.remove('nf-fa-angle_up');
                    icon.classList.add('nf-fa-angle_down');
                }
            });

            if (!isCurrentSectionOpen) {
                sectionContainer.classList.add('open');
                const currentIcon = titleBar.querySelector('.nf-fa-angle_down');
                if (currentIcon) {
                    currentIcon.classList.remove('nf-fa-angle_down');
                    currentIcon.classList.add('nf-fa-angle_up');
                }
            }
        });
    });
}
buildHamburgerNav();

// SEARCH FUNCTIONALITY
document.querySelectorAll('#search, #search-mobile').forEach((input) => {
    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const term = input.value.trim();
        if (!term) return;
        location.href = `/store/search-result/?q=${encodeURIComponent(term)}`;
    });

    // mobile button
    const searchBtn = document.querySelector('#searchbar-mobile');
    searchBtn.addEventListener('click', () => {
        const term = input.value.trim();
        if (!term) return;
        location.href = `/store/search-result/?q=${encodeURIComponent(term)}`;
    });
});

// SUPABASE INTEGRATION
window.sbReady = (async () => {
    await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load supabase-js'));
        document.head.appendChild(s);
    });
 
    const SUPABASE_URL = 'https://rrnqymjqqerqxcyefrmk.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_MvxiSQWnUCnMIXe06fi1Ng_n_eKYUr8';
 
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
 
    return window.sb;
})();
 
window.SITE_URL = 'https://store.geodearc.com';
 
// UPDATE NAVIGATION
async function updateAuthNav() {
    await window.sbReady;
 
    const accountLink = document.querySelector('.header-right .nf-oct-person');
    const cartLink = document.querySelector('.header-right .nf-md-cart_variant');
 
    const { data } = await sb.auth.getSession();
    const signedIn = !!data.session;
 
    if (accountLink) accountLink.href = signedIn ? '/account/manage/' : '/account/signin/';
    if (cartLink) cartLink.href = signedIn ? '/store/cart/' : '/account/signin/';
}
 
updateAuthNav();
window.sbReady.then(() => sb.auth.onAuthStateChange(() => updateAuthNav()));
 