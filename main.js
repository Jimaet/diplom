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
let userId = "12345"; // Тут нужно подставить реальный ID пользователя из Telegram

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

    let loadedRecipes = new Set(); // Храним ID рецептов, чтобы исключить дубли

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const recipeId = doc.id;
        const imageUrl = data.image ? data.image : "placeholder.jpg";

        if (loadedRecipes.has(recipeId)) {
            console.warn(`⚠️ Дубликат рецепта: ${recipeId}`);
            return;
        }

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

        // Добавляем обработчик клика на кнопку "Добавить в избранное"
        recipeCard.querySelector(".favorite-button").addEventListener("click", toggleFavourite);

        recipesContainer.appendChild(recipeCard);
    });

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// 🔹 Функция добавления/удаления из избранного 🔹
async function toggleFavourite(event) {
    const recipeId = event.target.dataset.id;
    const userRef = doc(db, "person", userId);

    try {
        const userSnap = await getDoc(userRef);
        let favRecipes = userSnap.exists() ? userSnap.data().favourites || [] : [];

        if (favRecipes.includes(recipeId)) {
            // Удаляем из избранного
            await updateDoc(userRef, {
                favourites: arrayRemove(recipeId)
            });
            event.target.classList.remove("active");
        } else {
            // Добавляем в избранное
            await setDoc(userRef, {
                favourites: arrayUnion(recipeId)
            }, { merge: true });
            event.target.classList.add("active");
        }
    } catch (error) {
        console.error("Ошибка при обновлении избранного:", error);
    }
}

// 🔹 Загружаем рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", () => {
    loadRecipes();
});
