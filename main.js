// 🔹 Импорт Firebase 🔹
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Конфигурация Firebase 🔹
const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.appspot.com",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// 🔹 Инициализация Firebase 🔹
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let selectedFilters = new Set(); // Хранение выбранных фильтров

// 🔹 Функция загрузки всех рецептов или отфильтрованных 🔹
async function loadFilteredRecipes() {
    const recipesContainer = document.getElementById("recipes-container");
    if (!recipesContainer) {
        console.error("❌ Ошибка: recipes-container не найден!");
        return;
    }

    recipesContainer.innerHTML = "";

    console.log("🔹 Загрузка рецептов...");

    const recipesQuery = collection(db, "rec");
    const querySnapshot = await getDocs(recipesQuery);

    let loadedRecipes = new Set();

    for (const recipeDoc of querySnapshot.docs) {
        const recipeId = recipeDoc.id; // receptX
        if (selectedFilters.size > 0) {
            const match = await checkRecipeCategories(recipeId);
            if (!match) continue; // Пропустить, если нет совпадений
        }

        if (loadedRecipes.has(recipeId)) continue;
        loadedRecipes.add(recipeId);

        const data = recipeDoc.data();
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

    console.log(`✅ Отображено рецептов: ${loadedRecipes.size}`);
}

// 🔹 Проверяем, есть ли совпадения фильтров в receptmainX/type и type2 🔹
async function checkRecipeCategories(recipeId) {
    const receptMainRef = `receptmain${recipeId.slice(6)}`;
    const typeDoc = await getDoc(doc(db, receptMainRef, "type"));
    const type2Doc = await getDoc(doc(db, receptMainRef, "type2"));

    const categories = new Set([
        ...Object.values(typeDoc.exists() ? typeDoc.data() : {}),
        ...Object.values(type2Doc.exists() ? type2Doc.data() : {})
    ]);

    return [...selectedFilters].some(filter => categories.has(filter));
}

// 🔹 Функция для установки обработчиков фильтров 🔹
function setupMultiSelect(selector) {
    document.querySelectorAll(selector).forEach(button => {
        button.addEventListener("click", () => {
            const filterName = button.textContent.trim();
            if (selectedFilters.has(filterName)) {
                selectedFilters.delete(filterName);
                button.classList.remove("selected"); // Убираем активный стиль
                console.log(`❌ Фильтр удалён: ${filterName}`);
            } else {
                selectedFilters.add(filterName);
                button.classList.add("selected"); // Добавляем активный стиль
                console.log(`✅ Фильтр добавлен: ${filterName}`);
            }
            loadFilteredRecipes(); // Перезагружаем рецепты с учетом фильтров
        });
    });
}

// 🔹 Поиск рецептов 🔹
let searchTimeout;

async function searchRecipes(event) {
    const searchTerm = event.target.value.toLowerCase();
    const recipesContainer = document.getElementById("recipes-container");

    if (!searchTerm) {
        loadFilteredRecipes();
        return;
    }

    console.log("🔹 Поиск по запросу:", searchTerm);

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
        const recipesQuery = collection(db, "rec");
        const querySnapshot = await getDocs(recipesQuery);

        let loadedRecipes = new Set();
        recipesContainer.innerHTML = "";

        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const recipeId = doc.id;
            const recipeName = data.name.toLowerCase();
            const recipeDescription = data.dis.toLowerCase();

            if (recipeName.includes(searchTerm) || recipeDescription.includes(searchTerm)) {
                if (loadedRecipes.has(recipeId)) continue;
                loadedRecipes.add(recipeId);

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
        }

        console.log(`✅ Загружено рецептов по запросу: ${loadedRecipes.size}`);
    }, 1000);
}

// 🔹 Слушатель для строки поиска 🔹
const searchInput = document.querySelector(".search-bar input");
if (searchInput) {
    searchInput.addEventListener("input", searchRecipes);
} else {
    console.error("❌ Ошибка: Поле поиска не найдено!");
}

// 🔹 Кнопка "Мои рецепты" 🔹
const myRecipesBtn = document.getElementById("my-recipes-btn");
if (myRecipesBtn) {
    myRecipesBtn.addEventListener("click", () => {
        window.location.href = "create.html";
    });
}

// 🔹 Кнопка "Домой" с прокруткой вверх или обновлением 🔹
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

// 🔹 Кнопка "Играть" 🔹
const playBtn = document.getElementById("play-btn");
if (playBtn) {
    playBtn.addEventListener("click", function() {
        window.location.href = "play.html";
    });
}

// 🔹 Устанавливаем обработчики фильтров и загружаем рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", () => {
    setupMultiSelect(".filter-btn");
    setupMultiSelect(".category-btn");
    setupMultiSelect(".tech-btn");
    loadFilteredRecipes(); // Загружаем рецепты после настройки фильтров
});
