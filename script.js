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

// ENABLE ANIMATIONS (flash mitigation)
window.addEventListener("load", () => {
    document.body.classList.remove("preload");
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
            { text: "'h' collection",               href: '/store/collections/h'    },
            { text: "'sssdfg' collection",          href: '/store/collections/sssdfg'    },
            { text: "'wtflip' collection",          href: '/store/collections/wtf'    },
            { text: "'from twitter' collection",    href: '/store/collections/from-twitter'    },
            { text: "'DON'T wear this' collection", href: '/store/collections/dont-wear'    },
            { text: "All Collections",              href: '/store/collections'    },
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
            { text: 'All Specials',                 href: '/store/specials'    },
        ]
    },
    {
        id: 'byproduct',
        label: 'By Product',
        items: [
            { text: 'Shirts',                       href: '/store/by-product/shirts'    },
            { text: 'Hoodies',                      href: '/store/by-product/hoodies'    },
            { text: 'Socks',                        href: '/store/by-product/socks'    },
            { text: 'Mugs',                         href: '/store/by-product/mugs'    },
            { text: 'Stickers',                     href: '/store/by-product/stickers'    },
            { text: 'All Products',                 href: '/store/by-product'    },
        ]
    }
];

// NAVIGATION FUNCTIONALITY
const pageblur = document.querySelector('.pageblur');
const dropdown = document.querySelector('.regnav-dropdown');
const regnavTitle = document.querySelector('.regnav-title h2');
const regnavInner = document.querySelector('.regnav-inner');
const navItems = document.querySelectorAll('.nav-item');

let hideTimeout;
function showMenu(sectionId) {
    clearTimeout(hideTimeout);

    const sectionData = NAV_DATA.find(item => item.id === sectionId);
    if (!sectionData) return;

    navItems.forEach(item => {
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    regnavTitle.textContent = sectionData.label;
    regnavInner.innerHTML = sectionData.items
        .map(item => `<a class="regnav-item" href="${item.href}">${item.text}</a>`)
        .join('');

    dropdown.classList.add('show');
    pageblur.classList.add('show');
}

function queueHide() {
    hideTimeout = setTimeout(() => {
        dropdown.classList.remove('show');
        pageblur.classList.remove('show');
        navItems.forEach(item => item.classList.remove('active'));
    }, 150);
}

navItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        const sectionId = item.getAttribute('data-section');
        showMenu(sectionId);
    });
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

// HAMBURGER FUNCTIONALITY
NAV_DATA.forEach(section => {
    const titleElement = document.getElementById(`ham-${section.id}`);
    if (!titleElement) return;

    const sectionContainer = titleElement.closest('.ham-body-section');
    const itemsContainer = sectionContainer.querySelector('.ham-section-items');

    itemsContainer.innerHTML = '';

    section.items.forEach(item => {
        const itemLink = document.createElement('a');
        itemLink.classList.add('ham-section-item');
        itemLink.href = item.href || '#';
        itemLink.textContent = item.text;

        itemsContainer.appendChild(itemLink);
    });

    const titleBar = titleElement.parentElement;

    titleBar.addEventListener('click', () => {
        const isCurrentSectionOpen = sectionContainer.classList.contains('open');

        document.querySelectorAll('.ham-body-section').forEach(sec => {
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