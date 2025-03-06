// 🔹 Импорт Firebase 🔹
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

    const recipesQuery = collection(db, "recept"); // Запрос ко всем рецептам в коллекции "recept"
    const querySnapshot = await getDocs(recipesQuery);

    let loadedRecipes = new Set();

    for (const docSnap of querySnapshot.docs) {
        const recipeId = docSnap.id;

        // Логируем путь для проверки
        console.log(`🔹 Путь для рецепта ${recipeId}:`);

        // Правильные пути для документов type и type2 внутри коллекции receptmainX
        const typeDocRef = doc(db, `receptmain${recipeId}/filters`, "type");
        const type2DocRef = doc(db, `receptmain${recipeId}/filters`, "type2");

        // Проверяем, существует ли документ
        const typeDocSnap = await getDoc(typeDocRef);
        const type2DocSnap = await getDoc(type2DocRef);

        if (!typeDocSnap.exists()) {
            console.log(`❌ Документ type не существует для рецепта ${recipeId}`);
        }
        if (!type2DocSnap.exists()) {
            console.log(`❌ Документ type2 не существует для рецепта ${recipeId}`);
        }

        // Сбор всех фильтров из документа type
        const typeFilters = typeDocSnap.exists()
            ? Object.values(typeDocSnap.data()).map(val => val.trim())
            : [];

        // Сбор всех фильтров из документа type2
        const type2Filters = type2DocSnap.exists()
            ? Object.values(type2DocSnap.data()).map(val => val.trim())
            : [];

        // Логируем фильтры
        console.log(`🔹 Рецепт ${recipeId} фильтры:`, typeFilters, type2Filters);

        // Объединяем оба фильтра
        const allFilters = new Set([...typeFilters, ...type2Filters]);

        // Фильтрация по выбранным категориям
        if (selectedFilters.size > 0) {
            console.log(`🔹 Выбранные фильтры:`, [...selectedFilters]);

            const hasMatchingFilter = [...selectedFilters].some(filter => allFilters.has(filter));
            console.log(`🔹 Рецепт ${recipeId} проходит фильтрацию:`, hasMatchingFilter);

            if (!hasMatchingFilter) continue; // Пропустить рецепт, если не совпадает ни с одним из выбранных фильтров
        }

        // Проверка, если рецепт уже был загружен
        if (loadedRecipes.has(recipeId)) continue;
        loadedRecipes.add(recipeId);

        const data = docSnap.data();
        const imageUrl = data.image ? data.image : "placeholder.jpg";

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

// 🔹 Логика кнопки "Home" 🔹
let homeButton = document.querySelector(".nav-btn:first-child");
let lastClickTime = 0;

if (homeButton) {
    homeButton.addEventListener("click", () => {
        let currentTime = new Date().getTime();
        if (currentTime - lastClickTime < 1000) {
            location.reload();
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        lastClickTime = currentTime;
    });
}
