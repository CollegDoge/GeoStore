// THEME SWITCH / HEADER SCROLL
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

// NAVIGATION DATA
const NAV_DATA = [
    {
        id: 'collections',
        label: 'Collections',
        items: [
            { text: "'h' collection",               href: ''    },
            { text: "'sssdfg' collection",          href: ''    },
            { text: "'wtflip' collection",          href: ''    },
            { text: "'from twitter' collection",    href: ''    },
            { text: "'DON'T wear this' collection", href: ''    },
            { text: "All Collections",              href: ''    },
        ]
    },
    {
        id: 'specials',
        label: 'Specials',
        items: [
            { text: 'a',                            href: ''    },
            { text: 'a',                            href: ''    },
            { text: 'a',                            href: ''    },
            { text: 'a',                            href: ''    },
            { text: 'a',                            href: ''    },
            { text: 'All Specials',                 href: ''    },
        ]
    },
    {
        id: 'byproduct',
        label: 'By Product',
        items: [
            { text: 'Shirts',                       href: ''    },
            { text: 'Hoodies',                      href: ''    },
            { text: 'Socks',                        href: ''    },
            { text: 'Mugs',                         href: ''    },
            { text: 'Stickers',                     href: ''    },
            { text: 'All Products',                 href: ''    },
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

// hamburger
const hamburger = document.querySelector('.hamburger-overlay');
const hamopen = document.querySelector('#hamburger-open');
const hamclose = document.querySelector('#hamburger-close');

function openHamburger() {
    hamburger.classList.add('show');
}
function closeHamburger() {
    hamburger.classList.remove('show');
}
hamopen.addEventListener('click', openHamburger);
hamclose.addEventListener('click', closeHamburger);