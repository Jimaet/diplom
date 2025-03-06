import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let selectedFilters = new Set(); // Храним выбранные фильтры

// 🔹 Функция загрузки рецептов 🔹
async function loadRecipes() {
    const recipesContainer = document.getElementById("recipes-container");
    if (!recipesContainer) {
        console.error("❌ Ошибка: recipes-container не найден!");
        return;
    }

    recipesContainer.innerHTML = ""; // Очистка перед загрузкой

    console.log("🔹 Загрузка рецептов...");

    // Получаем все рецепты из коллекции rec (например, recept1, recept2, ...)
    const recipesSnapshot = await getDocs(collection(db, "rec"));
    
    let loadedRecipes = new Set();

    // Проходим по каждому рецепту в коллекции rec
    for (const recipeDoc of recipesSnapshot.docs) {
        const recipeData = recipeDoc.data();
        const recipeId = recipeDoc.id; // Получаем ID рецепта

        console.log(`🔹 Обработка рецепта ${recipeId}...`);

        // Получаем коллекцию receptmainX для каждого рецепта
        const recipeMainRef = doc(db, `receptmain${recipeId}`);
        const recipeMainSnap = await getDoc(recipeMainRef);

        if (recipeMainSnap.exists()) {
            const recipeMainData = recipeMainSnap.data();

            // Получаем фильтры из коллекции receptmainX
            const filters = new Set([
                ...(recipeMainData.type || []),
                ...(recipeMainData.type2 || [])
            ]);

            console.log(`🔹 Фильтры рецепта ${recipeId}:`, filters);

            // Если фильтры выбраны, проверяем соответствие
            if (selectedFilters.size === 0 || [...selectedFilters].some(filter => filters.has(filter))) {
                // Проверяем, если рецепт уже был загружен
                if (loadedRecipes.has(recipeId)) continue;
                loadedRecipes.add(recipeId);

                // Создание карточки рецепта
                const recipeCard = document.createElement("div");
                recipeCard.classList.add("recipe-card");

                recipeCard.innerHTML = `
                    <img src="${recipeData.image || "placeholder.jpg"}" class="recipe-img" alt="${recipeData.name}">
                    <div class="recipe-info">
                        <h3 class="recipe-title">${recipeData.name}</h3>
                        <p class="recipe-description">${recipeData.dis}</p>
                    </div>
                    <a href="recipe.html?id=${recipeId}" class="recipe-link">
                        <button class="start-button">Начать!</button>
                    </a>
                `;

                recipesContainer.appendChild(recipeCard);
            }
        } else {
            console.log(`❌ Не найдено данных для коллекции receptmain${recipeId}`);
        }
    }

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// 🔹 Обработчик выбора фильтров 🔹
function toggleFilter(event) {
    const button = event.target;
    const filterValue = button.textContent.trim();

    if (selectedFilters.has(filterValue)) {
        selectedFilters.delete(filterValue);
        button.classList.remove("active");
    } else {
        selectedFilters.add(filterValue);
        button.classList.add("active");
    }

    loadRecipes();
}

// Добавляем обработчики для кнопок фильтров
const filterButtons = document.querySelectorAll(".filter-btn, .category-btn");
filterButtons.forEach(button => button.addEventListener("click", toggleFilter));

// 🔹 Загружаем рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", loadRecipes);
