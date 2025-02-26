// 🔹 Импорт Firebase 🔹
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
document.addEventListener("DOMContentLoaded", function () {
    function enableCarouselScrolling(carousel) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            carousel.style.scrollBehavior = "auto";
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

        // Поддержка мобильного свайпа (плавная)
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
            carousel.style.scrollBehavior = "auto";
        });

        carousel.addEventListener("touchmove", (e) => {
            touchEndX = e.touches[0].clientX;
            let moveX = touchStartX - touchEndX;
            carousel.scrollLeft += moveX * 1.5;
            touchStartX = touchEndX;
        });

        carousel.addEventListener("touchend", () => {
            carousel.style.scrollBehavior = "smooth";
        });
    }

    const carousels = document.querySelectorAll(".carousel-container");
    carousels.forEach(enableCarouselScrolling);
});
// 🔹 Конфигурация Firebase (это остаётся в коде, но скрыть ключи можно через backend) 🔹
const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.firebasestorage.app",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// 🔹 Инициализация Firebase 🔹
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Функция загрузки рецептов 🔹
async function loadRecipes() {
    const recipesContainer = document.getElementById("recipes-container");
    recipesContainer.innerHTML = ""; // Очистка перед загрузкой

    // Получаем все рецепты из коллекции "rec"
    const recipesQuery = collection(db, "rec");
    const querySnapshot = await getDocs(recipesQuery);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const recipeId = doc.id; // Получаем ID рецепта

        // Создаём карточку рецепта
        const recipeCard = `
            <div class="recipe-card">
                <img src="${data.image || 'placeholder.jpg'}" class="recipe-img" alt="${data.name}">
                <div class="recipe-info">
                    <h3 class="recipe-title">${data.name}</h3>
                    <p class="recipe-description">${data.dis}</p>
                </div>
                <button class="favorite-button"></button>
                <a href="recipe.html?id=${recipeId}" class="recipe-link">
                    <button class="start-button">Начать!</button>
                </a>
            </div>
        `;

        recipesContainer.innerHTML += recipeCard;
    });
}

// Запускаем загрузку рецептов
loadRecipes();
