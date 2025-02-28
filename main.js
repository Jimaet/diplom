// 🔹 Импорт Firebase 🔹
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

        const favButton = recipeCard.querySelector(".favorite-button");

        // Проверяем, находится ли рецепт в избранном
        await checkIfFavourite(recipeId, favButton);

        // Добавляем обработчик клика на кнопку "Добавить в избранное"
        favButton.addEventListener("click", toggleFavourite);

        recipesContainer.appendChild(recipeCard);
    });

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// 🔹 Загружаем рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", loadRecipes);

// Добавляем обработчик на кнопку Favourite
const favButton = document.querySelector(".nav-btn:nth-child(2)");
if (favButton) {
    favButton.addEventListener("click", () => {
        window.location.href = "favourites.html";
    });
} else {
    console.error("❌ Ошибка: Кнопка 'Favourite' не найдена!");
}
document.addEventListener("DOMContentLoaded", () => {
    const avatarButton = document.querySelector(".avatar");

    // Получаем ID пользователя из Telegram Mini App
    const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;

    if (!userId) {
        console.error("Не удалось получить ID пользователя");
        return;
    }

    avatarButton.addEventListener("click", () => {
        window.location.href = `profile.html?id=${userId}`;
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.getElementById("profile-btn");

    if (!profileButton) {
        console.error("Ошибка: Кнопка профиля не найдена!");
        return;
    }

    profileButton.addEventListener("click", () => {
        window.location.href = "login.html"; // Переход на страницу авторизации
    });
});
