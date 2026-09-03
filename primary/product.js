// for all product pages

const { type, collection, variation } = PRODUCT;

// CUSTOM STYLING FOR OVERLAY IMAGES
const productStyle = {
    shirt: {
        overlay1: { width: '40%',},
        overlay2: { width: '34%', transform: 'translateY(20%)' }
    },
    hoodie: {
        overlay1: { width: '40%', transform: 'translateY(10%)' },
        overlay2: { width: '50%', transform: 'translateY(10%)' }
    },
    sock: {
        overlay1: { width: '25%', transform: 'translateY(-70%) translateX(15%)' },
        overlay2: { width: '22%', transform: 'translateY(-60%) translateX(65%)' }
    },
    mug: {
        overlay1: { width: '42%', transform: 'translateX(-20%)' },
        overlay2: { width: '30%', transform: 'translateX(10%) translateY(30%)' }
    },
    sticker: {
        overlay1: { width: '80%', background: '#F9F9F9', padding: '4px', borderRadius: '10px', boxShadow: '0 10px 10px var(--shadow)' },
        overlay2: { width: '25%', transform: 'translateY(-80%) translateX(30%) rotate(-7deg)', background: '#F9F9F9', padding: '4px', borderRadius: '10px'},
        overlay3: { width: '30%', transform: 'translateY(-40%) translateX(-20%)', background: '#F9F9F9', padding: '4px', borderRadius: '10px' },
        overlay4: { width: '15%', background: '#F9F9F9', padding: '4px', borderRadius: '10px', boxShadow: '0 10px 10px var(--shadow)' },
    }
};

// APPLY STYLES
function applyOverlayStyles(productType) {
    const styles = productStyle[productType];
    if (!styles) return;
 
    document.querySelectorAll('img[id^="imgOv"]').forEach((img) => {
        const key = 'overlay' + img.id.replace('imgOv', '');
        if (styles[key]) Object.assign(img.style, styles[key]);
    });
}

function setStickerBackgrounds() {
    document.querySelectorAll('.productpage-subimg').forEach((container, index) => {
        container.style.backgroundImage = `url(/assets/store-images/sticker/sticker${index + 1}.webp)`;
    });
}
 
document.addEventListener('DOMContentLoaded', () => {
    changeSize();
    changeColors();
    applyOverlayStyles(type);
    if (type === 'sticker') setStickerBackgrounds();
});

// IMAGE SWAPPING ETC
const mainImg = document.querySelector('.productpage-mainimg');
const subImages = document.querySelectorAll('.productpage-subimg');
 
document.querySelectorAll('img[id^="imgOv"]').forEach((img) => {
    img.src = `https://images.geodearc.com/store/${collection}/${variation}.webp`;
});
 
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
 
// SIZE SELECTION
const imgDim = document.getElementById('imgDim');
const productDim = document.getElementById('productSize');
if (productDim) productDim.addEventListener('change', changeSize);
 
function changeSize() {
    if (!imgDim || !productDim) return;
    imgDim.src = `/assets/store-images/dimensions/${type}-${productDim.value}.png`;
}
 
// COLOR SELECTION
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
