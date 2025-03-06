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

    // Получаем коллекции, которые начинаются с "receptmain"
    const recipeCollections = await getRecipeCollections();

    let loadedRecipes = new Set();

    // Пробегаем по каждой коллекции
    for (const recipeCollection of recipeCollections) {
        const recipeId = recipeCollection.id; // Получаем имя коллекции, например, receptmain1

        console.log(`🔹 Обработка рецепта ${recipeId}...`);

        // Путь к данным карточки рецепта в коллекции rec
        const recipeDataRef = doc(db, `rec`, recipeId);
        const recipeDataSnap = await getDoc(recipeDataRef);

        if (recipeDataSnap.exists()) {
            const recipeData = recipeDataSnap.data();
            const imageUrl = recipeData.image ? recipeData.image : "placeholder.jpg";

            // Путь к коллекциям type и type2
            const typeDocRef = doc(db, `receptmain${recipeId}`, "type");
            const type2DocRef = doc(db, `receptmain${recipeId}`, "type2");

            // Логируем путь для проверки
            console.log(`🔹 Пытаемся получить документы по пути: receptmain${recipeId}/type и receptmain${recipeId}/type2`);

            // Получаем документы type и type2
            const typeDocSnap = await getDoc(typeDocRef);
            const type2DocSnap = await getDoc(type2DocRef);

            // Если документы не существуют, логируем ошибку
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
            console.log(`🔹 Фильтры из type:`, typeFilters);

            // Сбор всех фильтров из документа type2
            const type2Filters = type2DocSnap.exists()
                ? Object.values(type2DocSnap.data()).map(val => val.trim())
                : [];
            console.log(`🔹 Фильтры из type2:`, type2Filters);

            // Объединяем оба фильтра
            const allFilters = new Set([...typeFilters, ...type2Filters]);

            // Логируем все фильтры
            console.log(`🔹 Все фильтры рецепта ${recipeId}:`, allFilters);

            // Если нет выбранных фильтров, показываем все рецепты
            if (selectedFilters.size === 0) {
                console.log(`🔹 Показаны все рецепты, так как фильтры не выбраны`);
                // Проверка, если рецепт уже был загружен
                if (loadedRecipes.has(recipeId)) continue;
                loadedRecipes.add(recipeId);

                // Создание карточки рецепта
                const recipeCard = document.createElement("div");
                recipeCard.classList.add("recipe-card");

                recipeCard.innerHTML = `
                    <img src="${imageUrl}" class="recipe-img" alt="${recipeData.name}">
                    <div class="recipe-info">
                        <h3 class="recipe-title">${recipeData.name}</h3>
                        <p class="recipe-description">${recipeData.dis}</p>
                    </div>
                    <a href="recipe.html?id=${recipeId}" class="recipe-link">
                        <button class="start-button">Начать!</button>
                    </a>
                `;

                recipesContainer.appendChild(recipeCard);
                continue;
            }

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

            // Создание карточки рецепта
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-card");

            recipeCard.innerHTML = `
                <img src="${imageUrl}" class="recipe-img" alt="${recipeData.name}">
                <div class="recipe-info">
                    <h3 class="recipe-title">${recipeData.name}</h3>
                    <p class="recipe-description">${recipeData.dis}</p>
                </div>
                <a href="recipe.html?id=${recipeId}" class="recipe-link">
                    <button class="start-button">Начать!</button>
                </a>
            `;

            recipesContainer.appendChild(recipeCard);
        } else {
            console.log(`❌ Не найдено данных для рецепта ${recipeId}`);
        }
    }

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// Получение всех коллекций, начинающихся с "receptmain"
async function getRecipeCollections() {
    const collectionsRef = collection(db, "receptmain");
    const collectionsSnapshot = await getDocs(collectionsRef);
    return collectionsSnapshot.docs;
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
