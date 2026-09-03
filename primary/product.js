// for all product pages

const { type, collection, variation } = PRODUCT;

// CUSTOM STYLING FOR OVERLAY IMAGES
// TODO - figure out other overlays
const productStyle = {
    shirt: {
        overlay1: { width: '40%',},
        overlay2: { width: '34%', transform: 'translateY(20%)' }
    },
    hoodie: {
        overlay1: { },
        overlay2: { }
    },
    sock: {
        overlay1: { },
        overlay2: { }
    },
    mug: {
        overlay1: { },
        overlay2: { }
    },
    sticker: {
        overlay1: { },
        overlay2: { }
    }
};
function applyOverlayStyles(productType) {
    const styles = productStyle[productType];
    
    if (styles) {
        const overlay1 = document.getElementById('imgOv1');
        const overlay2 = document.getElementById('imgOv2');

        if (overlay1 && styles.overlay1) {
            Object.assign(overlay1.style, styles.overlay1);
        }
        
        if (overlay2 && styles.overlay2) {
            Object.assign(overlay2.style, styles.overlay2);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    changeSize();
    changeColors();
    applyOverlayStyles(type);
});


// IMAGE SWAPPING ETC
const mainImg = document.querySelector('.productpage-mainimg');
const subImages = document.querySelectorAll('.productpage-subimg');

const overlay1 = document.getElementById('imgOv1');
const overlay2 = document.getElementById('imgOv2');

if (overlay1) overlay1.src = `https://images.geodearc.com/store/${collection}/${variation}.webp`;
if (overlay2) overlay2.src = `https://images.geodearc.com/store/${collection}/${variation}.webp`;

subImages.forEach(subimg => {
    subimg.addEventListener('click', () => {
        const mainBg = getComputedStyle(mainImg).backgroundImage;
        const subBg = getComputedStyle(subimg).backgroundImage;

        mainImg.style.backgroundImage = subBg;
        subimg.style.backgroundImage = mainBg;

        const temp = document.createElement('div');
        
        while (mainImg.firstChild) {
            temp.appendChild(mainImg.firstChild);
        }
        
        while (subimg.firstChild) {
            mainImg.appendChild(subimg.firstChild);
        }
        
        while (temp.firstChild) {
            subimg.appendChild(temp.firstChild);
        }
    });
});

// select size (overlay 4th image)
const imgDim = document.getElementById('imgDim');
const productDim = document.getElementById('productSize');
if (productDim) productDim.addEventListener('change', changeSize);

function changeSize() {
    if (!imgDim || !productDim) return;
    imgDim.src = `/assets/store-images/dimensions/${type}-${productDim.value}.png`;
}

// color selection
const productCol = document.getElementById('productCol');
if (productCol) productCol.addEventListener('change', changeColors);

function changeColors() {
    if (!productCol) return;
    const newColor = productCol.value.split('col-')[1];
    const mainImg = document.querySelector('.productpage-mainimg');
    const subImages = document.querySelectorAll('.productpage-subimg');
    const allContainers = [mainImg, ...subImages];

    allContainers.forEach(container => {
        const childImg = container.querySelector('img');
        
        if (childImg && childImg.id === 'imgOv1') {
            container.style.backgroundImage = `url(/assets/store-images/${type}/${type}1-${newColor}.webp)`;
        } 
        else if (childImg && childImg.id === 'imgOv2') {
            container.style.backgroundImage = `url(/assets/store-images/${type}/${type}2-${newColor}.webp)`;
        } 
        else if (childImg && childImg.id === 'imgDim') {
            container.style.backgroundImage = `url(/assets/store-images/${type}/${type}4-${newColor}.webp)`;
        } 
        else {
            container.style.backgroundImage = `url(/assets/store-images/${type}/${type}3-${newColor}.webp)`;
        }
    });
}

// review modal
const reviewModal = document.querySelector('.review-modal');
const reviewModalShow = document.querySelector('#reviewShow');
const reviewModalInput = document.querySelector('.review-modal-input textarea');
const reviewModalStar = document.querySelector('.review-modal-star');
const reviewModalSubmit = document.querySelector('#reviewSubmit');
const reviewModalBack = document.querySelector('#reviewBack');
const pageBlur = document.querySelector('.pageblur');

reviewModalShow.addEventListener('click', () => {
    pageBlur.classList.add('show');
    reviewModal.classList.add('show');
});
reviewModalBack.addEventListener('click', () => {
    reviewModal.classList.remove('show');
    pageBlur.classList.remove('show');
});
reviewModalSubmit.addEventListener('click', () => {
    reviewModal.classList.remove('show');
    pageBlur.classList.remove('show');
});

reviewModalStar.addEventListener('click', () => {
    const stars = document.querySelectorAll('.review-modal-star span');
    const allStars = Array.from(stars);
    const targetIndex = allStars.indexOf(event.target) + 1;

    allStars.forEach((star, index) => {
        if (index < targetIndex) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
});

reviewModalInput.addEventListener('input', () => {
    if (reviewModalInput.value.length > 0) {
        reviewModalSubmit.classList.add('active');
    } else {
        reviewModalSubmit.classList.remove('active');
    }
});