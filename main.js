// 🔹 Импорт Firebase 🔹
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 🔹 Объект для хранения выбранных фильтров 🔹
const selectedFilters = {
    type: new Set(),
    type2: new Set(),
};

// 🔹 Обработчик для фильтров 🔹
document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const filterValue = btn.textContent.trim();

        if (selectedFilters.type.has(filterValue)) {
            selectedFilters.type.delete(filterValue); // Убираем фильтр
        } else {
            selectedFilters.type.add(filterValue); // Добавляем фильтр
        }

        loadRecipes(); // Перезагружаем рецепты с учетом фильтров
    });
});

// 🔹 Обработчик для фильтров по категориям 🔹
document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const filterValue = btn.querySelector("span").textContent.trim();

        if (selectedFilters.type2.has(filterValue)) {
            selectedFilters.type2.delete(filterValue);
        } else {
            selectedFilters.type2.add(filterValue);
        }

        loadRecipes(); // Перезагружаем рецепты с учетом фильтров
    });
});

// 🔹 Функция загрузки рецептов с фильтрами 🔹
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

    // Загружаем рецепты и проверяем фильтры
    querySnapshot.forEach(async (doc) => {
        const recipeId = doc.id;
        const recipeData = doc.data();

        let isMatch = false; // Флаг для проверки соответствия фильтрам

        for (let i = 0; i < 10; i++) { // Пройдем по коллекциям receptmainX
            const receptmainDoc = await getDoc(doc(db, "receptmain" + i, recipeId));
            if (!receptmainDoc.exists()) continue; // Пропустить если коллекция не существует

            const data = receptmainDoc.data();
            const typeMatches = selectedFilters.type.size === 0 || selectedFilters.type.has(data.type);
            const type2Matches = selectedFilters.type2.size === 0 || selectedFilters.type2.has(data.type2);

            if (typeMatches && type2Matches) {
                isMatch = true;
                break;
            }
        }

        if (isMatch) {
            const imageUrl = recipeData.image || "placeholder.jpg";

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
            loadedRecipes.add(recipeId);
        }
    });

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// 🔹 Загружаем рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", loadRecipes);

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
