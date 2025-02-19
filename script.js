document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector(".carousel-container");

    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener("mouseleave", () => {
        isDown = false;
    });

    carousel.addEventListener("mouseup", () => {
        isDown = false;
    });

    carousel.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Поддержка мобильного свайпа
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    });

    carousel.addEventListener("touchmove", (e) => {
        touchEndX = e.touches[0].clientX;
        let moveX = touchStartX - touchEndX;
        carousel.scrollLeft += moveX * 1.5;
    });

    carousel.addEventListener("touchend", () => {
        touchStartX = 0;
        touchEndX = 0;
    });
});
