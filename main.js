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

// 🔹 Фильтры 🔹
let selectedType = null;
let selectedType2 = null;

// 🔹 Функция загрузки рецептов с учетом фильтров 🔹
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

    for (const recipeDoc of querySnapshot.docs) {
        const recipeId = recipeDoc.id;
        const recipeData = recipeDoc.data();
        const imageUrl = recipeData.image ? recipeData.image : "placeholder.jpg";

        // Получаем данные о категориях
        const categoryDocRef = doc(db, "receptmain", recipeId);
        const categoryDocSnap = await getDocs(collection(db, "receptmain"));
        let type = null;
        let type2 = null;

        categoryDocSnap.forEach((doc) => {
            if (doc.id === recipeId) {
                type = doc.data().type || null;
                type2 = doc.data().type2 || null;
            }
        });

        // Фильтрация по выбранным категориям
        if ((selectedType && selectedType !== type) || (selectedType2 && selectedType2 !== type2)) {
            continue;
        }

        if (loadedRecipes.has(recipeId)) continue;
        loadedRecipes.add(recipeId);

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
    }

    console.log(`✅ Загружено рецептов: ${loadedRecipes.size}`);
}

// 🔹 Обработчики фильтров 🔹
const filterButtons = document.querySelectorAll(".filter-btn");
const categoryButtons = document.querySelectorAll(".category-btn");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedType = button.innerText === selectedType ? null : button.innerText;
        loadRecipes();
    });
});

categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedType2 = button.querySelector("span").innerText === selectedType2 ? null : button.querySelector("span").innerText;
        loadRecipes();
    });
});

// 🔹 Загружаем рецепты при загрузке страницы 🔹
document.addEventListener("DOMContentLoaded", loadRecipes);

// 🔹 Кнопка "Home" - скролл вверх или перезагрузка 🔹
const homeButton = document.querySelector(".nav-btn:first-child");
let lastClickTime = 0;

homeButton.addEventListener("click", () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 1000) {
        location.reload();
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    lastClickTime = currentTime;
});
