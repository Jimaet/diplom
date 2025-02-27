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
    if (!recipesContainer) {
        console.error("❌ Ошибка: recipes-container не найден!");
        return;
    }

    recipesContainer.innerHTML = ""; // Очистка перед загрузкой

    console.log("🔹 Загрузка рецептов...");

    const recipesQuery = collection(db, "rec");
    const querySnapshot = await getDocs(recipesQuery);

    let loadedRecipes = new Set(); // Храним ID рецептов, чтобы исключить дубли

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const recipeId = doc.id;
        const imageUrl = data.image ? data.image : "placeholder.jpg";

        if (loadedRecipes.has(recipeId)) {
            console.warn(`⚠️ Дубликат рецепта: ${recipeId}`);
            return; // Пропускаем дубликаты
        }

        loadedRecipes.add(recipeId);

        const recipeCard = `
            <div class="recipe-card">
                <img src="${imageUrl}" class="recipe-img" alt="${data.name}">
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

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// Запускаем загрузку один раз
document.addEventListener("DOMContentLoaded", () => {
    loadRecipes();
});
// Запускаем загрузку рецептов

// 🔹 Функция загрузки категорий (карусель) 🔹
function loadCategoryCarousel() {
    const categoryContainer = document.querySelector(".category-carousel .carousel");

    const categories = [
        { name: "Закуски", image: "k2/zakyski.jpg" },
        { name: "Салаты", image: "k2/salat.jpg" },
        { name: "Десерты", image: "k2/desert.jpg" },
        { name: "Выпечка", image: "k2/vipechka.jpg" },
        { name: "Напитки", image: "k2/napitki.jpg" },
        { name: "Фастфуд", image: "k2/fastfod.jpg" },
        { name: "Гарнир", image: "k2/garnir.jpg" },
        { name: "Горячее", image: "k2/goryachee.jpg" },
        { name: "Соусы", image: "k2/sousi.jpg" }
    ];

    categoryContainer.innerHTML = ""; // Очистка перед добавлением категорий

    categories.forEach(category => {
        const categoryBtn = document.createElement("button");
        categoryBtn.classList.add("category-btn");

        categoryBtn.innerHTML = `
            <img src="${category.image}" alt="${category.name}">
            <span>${category.name}</span>
        `;

        categoryContainer.appendChild(categoryBtn);
    });
}

// Загружаем рецепты и категории при запуске страницы
document.addEventListener("DOMContentLoaded", () => {
    loadRecipes();
    loadCategoryCarousel();
});
