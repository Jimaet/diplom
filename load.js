// Список изображений
const images = [
    "loadingphoto/1.jpg",
    "loadingphoto/2.jpg",
    "loadingphoto/3.jpg",
    "loadingphoto/4.jpg",
    "loadingphoto/5.jpg",
    "loadingphoto/6.jpg",
    "loadingphoto/7.jpg"
];

// Выбираем случайное изображение
const randomImage = images[Math.floor(Math.random() * images.length)];
document.getElementById("loading-screen").style.backgroundImage = `url(${randomImage})`;

// Скрываем экран загрузки через 3 секунды
setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("main-content").style.display = "block";
}, 3000);
