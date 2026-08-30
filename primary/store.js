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

const productStyle = {
    shirt: {
        overlay1: { width: '50%',},
    },
    hoodie: {
        overlayMain: { },
    },
    sock: {
        overlayMain: { },
    },
    mug: {
        overlayMain: { },
    },
    sticker: {
        overlayMain: { },
    }
};

// TODO - link with db (use temp url images.geodearc.com/store/sssdfg/1/{num}.png)
productBgImg = document.querySelector('.product-box');
productBgImg.style.backgroundImage = `url(/assets/store-images/shirt/shirt1-w.webp)`;