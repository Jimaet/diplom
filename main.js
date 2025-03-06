// 🔹 Импорт Firebase 🔹
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Конфигурация Firebase 🔹
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

let selectedType = null;
let selectedType2 = null;

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

    let loadedRecipes = new Set();

    for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const recipeId = docSnap.id;
        const imageUrl = data.image ? data.image : "placeholder.jpg";

        // Получаем информацию о типах рецепта
        const mainDocRef = doc(db, `receptmain${recipeId}`);
        const mainDocSnap = await getDocs(collection(db, `receptmain${recipeId}`));

        let type = "";
        let type2 = "";

        mainDocSnap.forEach((doc) => {
            if (doc.id === "type") type = doc.data().value;
            if (doc.id === "type2") type2 = doc.data().value;
        });

        // Фильтрация по выбранным категориям
        if ((selectedType && type !== selectedType) || (selectedType2 && type2 !== selectedType2)) {
            continue;
        }

        if (loadedRecipes.has(recipeId)) continue;
        loadedRecipes.add(recipeId);

        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        recipeCard.innerHTML = `
            <img src="${imageUrl}" class="recipe-img" alt="${data.name}">
            <div class="recipe-info">
                <h3 class="recipe-title">${data.name}</h3>
                <p class="recipe-description">${data.dis}</p>
            </div>
            <a href="recipe.html?id=${recipeId}" class="recipe-link">
                <button class="start-button">Начать!</button>
            </a>
        `;

        recipesContainer.appendChild(recipeCard);
    }

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// 🔹 Обработчик для фильтров 🔹
function setupFilters() {
    document.querySelectorAll(".filter-btn").forEach((button) => {
        button.addEventListener("click", () => {
            selectedType = button.textContent;
            loadRecipes();
        });
    });

    document.querySelectorAll(".category-btn").forEach((button) => {
        button.addEventListener("click", () => {
            selectedType2 = button.querySelector("span").textContent;
            loadRecipes();
        });
    });
}

// 🔹 Загружаем рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", () => {
    loadRecipes();
    setupFilters();
});

// 🔹 Обработчик для кнопки Home 🔹
document.addEventListener("DOMContentLoaded", () => {
    const homeButton = document.querySelector(".nav-btn:first-child"); // Кнопка Home
    let clickCount = 0;
    let clickTimer;

    if (homeButton) {
        homeButton.addEventListener("click", () => {
            clickCount++;

            if (clickCount === 1) {
                // Прокрутка вверх
                window.scrollTo({ top: 0, behavior: "smooth" });

                // Сбросить счетчик через 1 секунду
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 1000);
            } else if (clickCount === 2) {
                // Двойной клик — перезагрузка страницы
                clearTimeout(clickTimer);
                location.reload();
            }
        });
    } else {
        console.error("❌ Ошибка: Кнопка 'Home' не найдена!");
    }
});
