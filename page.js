// CAROUSEL FUNCTIONALITY
const track = document.getElementById('bannerTrack');
const dots = document.querySelectorAll('.slider-dot');
let index = 0, timer, startX = 0;

const updateCarousel = (newIndex) => {
    index = (newIndex + 3) % 3;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    resetTimer();
};

const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => updateCarousel(index + 1), 5000);
};

dots.forEach((dot, i) => dot.addEventListener('click', () => updateCarousel(i)));

const getX = e => e.changedTouches ? e.changedTouches[0].clientX : e.clientX;

track.addEventListener('touchstart', e => startX = getX(e), { passive: true });
track.addEventListener('touchend', e => {
    const diff = getX(e) - startX;
    if (Math.abs(diff) > 50) updateCarousel(index + (diff > 0 ? -1 : 1));
}, { passive: true });

track.addEventListener('mousedown', e => startX = getX(e));
track.addEventListener('mouseup', e => {
    const diff = getX(e) - startX;
    if (Math.abs(diff) > 50) updateCarousel(index + (diff > 0 ? -1 : 1));
});

resetTimer();