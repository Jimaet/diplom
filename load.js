// Список изображений
const images = [
    "loadingphoto/1.png",
    "loadingphoto/2.png",
    "loadingphoto/3.png",
    "loadingphoto/4.png"
];

// Выбираем случайное изображение
const randomImage = images[Math.floor(Math.random() * images.length)];
document.getElementById("loading-screen").style.backgroundImage = `url(${randomImage})`;

// Скрываем экран загрузки через 3 секунды
setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("main-content").style.display = "block";
}, 4000);
