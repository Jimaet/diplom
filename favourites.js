// 🔹 Импорт Firebase 🔹
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Получаем userId из Telegram Web Apps
let userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "guest";

console.log("🟢 User ID:", userId);

// 🔹 Функция загрузки избранных рецептов 🔹
async function loadFavourites() {
    const container = document.getElementById("favourites-container");
    if (!container) {
        console.error("❌ Ошибка: favourites-container не найден!");
        return;
    }

    container.innerHTML = "<p>Загрузка...</p>";

    // Получаем список избранных рецептов пользователя
    const userRef = doc(db, "person", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !userSnap.data().favourites?.length) {
        container.innerHTML = "<p>У вас пока нет избранных рецептов 😔</p>";
        return;
    }

    const favouriteIds = userSnap.data().favourites;
    console.log("⭐ Избранные рецепты:", favouriteIds);

    container.innerHTML = ""; // Очищаем перед загрузкой

    // Загружаем данные избранных рецептов
    const recipesQuery = collection(db, "rec");
    const querySnapshot = await getDocs(recipesQuery);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const recipeId = doc.id;

        if (!favouriteIds.includes(recipeId)) return;

        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        recipeCard.innerHTML = `
            <img src="${data.image || 'placeholder.jpg'}" class="recipe-img" alt="${data.name}">
            <div class="recipe-info">
                <h3 class="recipe-title">${data.name}</h3>
                <p class="recipe-description">${data.dis}</p>
            </div>
            <a href="recipe.html?id=${recipeId}" class="recipe-link">
                <button class="start-button">Начать!</button>
            </a>
        `;

        container.appendChild(recipeCard);
    });

    if (container.innerHTML === "") {
        container.innerHTML = "<p>Нет данных для отображения.</p>";
    }
}

// 🔹 Загружаем избранные рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", loadFavourites);
