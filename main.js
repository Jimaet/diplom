// 🔹 Импорт Firebase 🔹
import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Конфигурация Firebase 🔹
const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.firebasestorage.app",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// 🔹 Инициализация Firebase (чтобы не было ошибки "Firebase App already exists") 🔹
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

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

    let loadedRecipes = new Set();

    querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        const recipeId = doc.id;
        const imageUrl = data.image ? data.image : "placeholder.jpg";

        console.log("📜 Рецепт:", data); // Проверка загруженных данных

        if (loadedRecipes.has(recipeId)) return;
        loadedRecipes.add(recipeId);

        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        recipeCard.innerHTML = `
            <img src="${imageUrl}" class="recipe-img" alt="${data.name}">
            <div class="recipe-info">
                <h3 class="recipe-title">${data.name}</h3>
                <p class="recipe-description">${data.dis}</p>
            </div>
            <button class="favorite-button" data-id="${recipeId}">❤️</button>
            <a href="recipe.html?id=${recipeId}" class="recipe-link">
                <button class="start-button">Начать!</button>
            </a>
        `;

        console.log("🔹 Добавляем карточку рецепта в DOM", recipeCard);

        // Проверяем, находится ли рецепт в избранном
        if (typeof window.Telegram !== "undefined" && window.Telegram.WebApp) {
            await checkIfFavourite(recipeId, recipeCard.querySelector(".favorite-button"));
        } else {
            console.warn("⚠️ Telegram WebApp не доступен. Пропускаем избранное.");
        }

        // Добавляем обработчик клика на кнопку "Добавить в избранное"
        recipeCard.querySelector(".favorite-button").addEventListener("click", toggleFavourite);

        recipesContainer.appendChild(recipeCard);
    });

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// 🔹 Функция проверки, добавлен ли рецепт в избранное 🔹
async function checkIfFavourite(recipeId, button) {
    if (typeof window.Telegram === "undefined" || !window.Telegram.WebApp) {
        console.error("❌ Ошибка: Telegram WebApp API недоступен!");
        return;
    }

    const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;
    if (!userId) {
        console.error("❌ Ошибка: Не удалось получить ID пользователя!");
        return;
    }

    const userRef = doc(db, "person", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const favourites = userDoc.data();
        if (favourites[recipeId]) {
            button.classList.add("active"); // Добавляем класс, если в избранном
        }
    }
}

// 🔹 Загружаем рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", loadRecipes);
