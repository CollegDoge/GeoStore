// for all pages with product boxes

// PRODUCT ROW FUNCTIONALITY
const rows = document.querySelectorAll('.product-row');

if (rows.length) {
    rows.forEach(row => {
        const btnLeft = row.querySelector('.row-mvleft');
        const btnRight = row.querySelector('.row-mvright');

        function updateState() {
            const maxScroll = row.scrollWidth - row.clientWidth;
            const atStart = row.scrollLeft <= 0;
            const atEnd = row.scrollLeft >= maxScroll - 2; 

            btnLeft.style.visibility = atStart ? 'hidden' : 'visible';
            btnRight.style.visibility = atEnd ? 'hidden' : 'visible';
        }

        btnLeft.addEventListener('click', () => {
            row.scrollBy({ left: -row.clientWidth, behavior: 'smooth' });
        });

        btnRight.addEventListener('click', () => {
            row.scrollBy({ left: row.clientWidth, behavior: 'smooth' });
        });

        row.addEventListener('scroll', updateState);
        window.addEventListener('resize', updateState);
        updateState();
    });
}

// TODO - figure out other overlays
type = [
    'shirt',
    'hoodie',
    'mug',
    'sock',
    'sticker',
]

const productStyle = {
    shirt: {
        overlay: { width: '30%',},
    },
    hoodie: {
        overlay: { },
    },
    sock: {
        overlay: { },
    },
    mug: {
        overlay: { },
    },
    sticker: {
        overlay: { },
    }
};

// TODO - link with db (use temp url images.geodearc.com/store/sssdfg/1/{num}.png)
productBgImg = document.querySelector('.product-box');
productBgImg.style.backgroundImage = `url(/assets/store-images/shirt/shirt1-w.webp)`;

// temp
document.addEventListener('DOMContentLoaded', () => {
    productOvImg = document.querySelector('.product-image img');
    productOvImg.src = `https://images.geodearc.com/store/sssdfg/1.webp`;
    productOvImg.style.width = '38%';
});