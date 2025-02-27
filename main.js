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
async function loadRecipe() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get("id");
    if (!recipeId) {
        console.error("❌ Ошибка: нет ID рецепта!");
        return;
    }

    const recipeRef = collection(db, recipeId); // Коллекция рецепта
    const mainDoc = await getDocs(recipeRef);
    
    let recipeData = {};
    let prodData = {};

    mainDoc.forEach((doc) => {
        if (doc.id === "main") {
            recipeData = doc.data();
        } else if (doc.id === "prod") {
            prodData = doc.data();
        }
    });

    if (!recipeData || Object.keys(recipeData).length === 0) {
        console.error("❌ Ошибка: рецепт не найден!");
        return;
    }

    // 📌 Фото рецепта
    const recipeImage = document.getElementById("recipe-image");
    recipeImage.src = recipeData.photo || "placeholder.jpg";

    // 📌 Название, описание и время приготовления
    document.getElementById("recipe-title").innerText = recipeData.name;
    document.getElementById("recipe-description").innerText = recipeData.dis;
    document.getElementById("recipe-info").innerText = 
        `Порции: ${recipeData.porcii} | Время: ${recipeData.timemin} мин`;

    // 📌 Ингредиенты в одной строке
    const ingredientsContainer = document.getElementById("recipe-ingredients");
    ingredientsContainer.innerHTML = "";

    let sortedKeys = Object.keys(prodData).sort((a, b) => {
        // Сортируем так, чтобы 1-1 шло после 1
        let numA = parseInt(a.split("-")[0], 10);
        let numB = parseInt(b.split("-")[0], 10);
        return numA - numB;
    });

    let usedKeys = new Set();
    sortedKeys.forEach((key) => {
        if (key.includes("-")) return; // Пропускаем ключи вида 1-1, 2-2, т.к. они добавятся вместе с основными
        let product = prodData[key];
        let quantity = prodData[key + "-1"] || ""; // Проверяем, есть ли граммовка
        let ingredient = `${product} - ${quantity}`;

        if (!usedKeys.has(key)) {
            ingredientsContainer.innerHTML += `<p>${ingredient}</p>`;
            usedKeys.add(key);
        }
    });
}

// Запускаем загрузку рецепта при открытии страницы
document.addEventListener("DOMContentLoaded", loadRecipe);
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

