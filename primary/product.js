// load images
const mainImg = document.querySelector('.productpage-mainimg');
const subImg11 = document.querySelector('.productpage-subimg:nth-child(1)');
const subImg12 = document.querySelector('.productpage-subimg:nth-child(2)');
const subImg13 = document.querySelector('.productpage-subimg:nth-child(3)');

type = [
    'shirt',
    'hoodie',
    'mug',
    'sock',
    'sticker',
]
color = [
    'col-w',
    'col-d',
    'col-p',
    'col-b',
]

// TODO - CHOOSE BASED ON PAGE
type = type[0];

// swap images
document.querySelectorAll('.productpage-subimg').forEach(subimg => {
    subimg.addEventListener('click', () => {
        const mainImg = document.querySelector('.productpage-mainimg');
        
        const mainBg = getComputedStyle(mainImg).backgroundImage;
        const subBg = getComputedStyle(subimg).backgroundImage;

        mainImg.style.backgroundImage = subBg;
        subimg.style.backgroundImage = mainBg;
    });
});

// select size (overlay 4th image)
// TO DO

// color selection
productCol = document.getElementById('productCol');

productCol.addEventListener('change', changeColors);
document.addEventListener('DOMContentLoaded', changeColors);

function changeColors() {
    const mainImg = document.querySelector('.productpage-mainimg');
    const subImg11 = document.querySelector('.productpage-subimg:nth-child(1)');
    const subImg12 = document.querySelector('.productpage-subimg:nth-child(2)');
    const subImg13 = document.querySelector('.productpage-subimg:nth-child(3)');

    const newColor = productCol.value.split('col-')[1];

    mainImg.style.backgroundImage = `url(/assets/store-images/${type}/${type}1-${newColor}.webp)`;
    subImg11.style.backgroundImage = `url(/assets/store-images/${type}/${type}2-${newColor}.webp)`;
    subImg12.style.backgroundImage = `url(/assets/store-images/${type}/${type}3-${newColor}.webp)`;
    subImg13.style.backgroundImage = `url(/assets/store-images/${type}/${type}4-${newColor}.webp)`;
}