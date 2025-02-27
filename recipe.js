import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 🔹 Данные Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.firebasestorage.app",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Получаем `id` рецепта из URL
const params = new URLSearchParams(window.location.search);
const receptId = params.get("id");

console.log("🔍 Полученный ID рецепта:", receptId);

// Получаем ID пользователя из Telegram Mini App
const userData = window.Telegram.WebApp.initDataUnsafe;
const userId = userData?.user?.id;
console.log("✅ ID пользователя:", userId);

if (!receptId) {
    showRecipeNotReady();
} else {
    loadRecipe(receptId);
}

// Функция загрузки рецепта
async function loadRecipe(receptId) {
    try {
        const receptMainId = `receptmain${receptId.replace("recept", "")}`;
        console.log("📁 Загружаем коллекцию:", receptMainId);

        const mainRef = doc(db, receptMainId, "main");
        const prodRef = doc(db, receptMainId, "prod");
        const stepRef = doc(db, receptMainId, "step");
        const photoRef = doc(db, receptMainId, "photo");

        const [mainSnap, prodSnap, stepSnap, photoSnap] = await Promise.all([
            getDoc(mainRef),
            getDoc(prodRef),
            getDoc(stepRef),
            getDoc(photoRef)
        ]);

        if (!mainSnap.exists()) {
            showRecipeNotReady();
            return;
        }

        const mainData = mainSnap.data();
        const prodData = prodSnap.exists() ? prodSnap.data() : {};
        const stepData = stepSnap.exists() ? stepSnap.data() : {};
        const photoData = photoSnap.exists() ? photoSnap.data() : {};

        console.log("✅ Данные рецепта загружены:", mainData);

        // ✅ Обновляем страницу
        document.getElementById("recipe-title").textContent = mainData.name || "Без названия";
        document.getElementById("recipe-description").textContent = mainData.dis || "Описание отсутствует";
        document.getElementById("recipe-info").textContent = `Порции: ${mainData.porcii} | Время: ${mainData.timemin} мин`;

        // ✅ Установка фото рецепта
        const recipeImage = document.getElementById("recipe-image");
        recipeImage.src = photoData.url || "placeholder.jpg";

        // ✅ Продукты (через точку)
        const ingredientsList = document.getElementById("recipe-ingredients");
        ingredientsList.innerHTML = "";

        let sortedKeys = Object.keys(prodData).sort((a, b) => {
            let numA = parseInt(a.split("-")[0]);
            let numB = parseInt(b.split("-")[0]);
            return numA - numB;
        });

        let ingredientsMap = {};
        sortedKeys.forEach((key) => {
            let baseKey = key.split("-")[0];
            if (!ingredientsMap[baseKey]) {
                ingredientsMap[baseKey] = prodData[key];
            } else {
                ingredientsMap[baseKey] += ` - ${prodData[key]}`;
            }
        });

        let ingredientsText = Object.values(ingredientsMap).join(". ") + ".";
        const p = document.createElement("p");
        p.textContent = ingredientsText;
        ingredientsList.appendChild(p);

        // ✅ Шаги приготовления
        const stepsContainer = document.getElementById("recipe-steps");
        stepsContainer.innerHTML = "";
        Object.entries(stepData).forEach(([stepNum, stepText]) => {
            const stepDiv = document.createElement("div");
            stepDiv.classList.add("step");
            stepDiv.innerHTML = `
                <p class="step-title">Шаг ${stepNum}:</p>
                <p class="step-description">${stepText}</p>
            `;
            stepsContainer.appendChild(stepDiv);
        });

        // ✅ Добавляем кнопку "Показать больше", если текст длинный
        setupShowMoreButton();

        // ✅ Проверяем, есть ли рецепт в избранном
        updateFavoriteButton(userId, receptId);

    } catch (error) {
        console.error("🔥 Ошибка загрузки рецепта:", error);
        showRecipeNotReady();
    }
}

// Функция для проверки избранного
async function updateFavoriteButton(userId, receptId) {
    if (!userId) return;

    const userRef = doc(db, "person", String(userId));
    const userSnap = await getDoc(userRef);
    const favoriteBtn = document.getElementById("favorite-btn");

    if (userSnap.exists() && userSnap.data()[receptId]) {
        favoriteBtn.classList.add("active");
        favoriteBtn.textContent = "⭐ В избранном";
    } else {
        favoriteBtn.classList.remove("active");
        favoriteBtn.textContent = "☆ В избранное";
    }
}

// Функция для добавления/удаления рецепта в избранное
async function toggleFavoriteRecipe() {
    if (!userId) return;

    const userRef = doc(db, "person", String(userId));
    const userSnap = await getDoc(userRef);
    const recipeName = document.getElementById("recipe-title").textContent;

    if (!userSnap.exists()) {
        await setDoc(userRef, { [receptId]: recipeName });
    } else {
        const userData = userSnap.data();
        if (userData.hasOwnProperty(receptId)) {
            delete userData[receptId];
            await setDoc(userRef, userData);
        } else {
            await updateDoc(userRef, { [receptId]: recipeName });
        }
    }
    updateFavoriteButton(userId, receptId);
}

// ✅ Функция для кнопки "Показать больше"
function setupShowMoreButton() {
    const description = document.getElementById("recipe-description");
    const showMoreBtn = document.getElementById("show-more");

    if (!description || !showMoreBtn) return;

    if (description.scrollHeight > description.clientHeight) {
        showMoreBtn.style.display = "inline";
    } else {
        showMoreBtn.style.display = "none";
    }

    showMoreBtn.addEventListener("click", function () {
        description.classList.toggle("expanded");
        showMoreBtn.textContent = description.classList.contains("expanded") ? "Скрыть" : "Показать больше";
    });
}

// Функция для показа ошибки, если рецепт не найден
function showRecipeNotReady() {
    const title = document.getElementById("recipe-title");
    title.textContent = "Упс.... Рецепт еще не готов(";
    title.style.textAlign = "center";
    title.style.fontSize = "20px";
    title.style.color = "#FF5733";

    document.getElementById("recipe-description").textContent = "Мы уже работаем над этим!";
    document.getElementById("recipe-info").textContent = "";
    document.getElementById("recipe-ingredients").innerHTML = "";
    document.getElementById("recipe-steps").innerHTML = "";
}

// ✅ Добавляем обработчик на кнопку избранного
document.getElementById("favorite-btn").addEventListener("click", toggleFavoriteRecipe);
