import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

if (!receptId) {
    showRecipeNotReady();
} else {
    loadRecipe(receptId);
}

async function loadRecipe(receptId) {
    try {
        // ✅ Правильное формирование ID коллекции
        const receptMainId = `receptmain${receptId.replace("recept", "")}`;
        console.log("📁 Загружаем коллекцию:", receptMainId);

        // Получаем данные рецепта
        const mainRef = doc(db, receptMainId, "main");
        const mainSnap = await getDoc(mainRef);

        if (!mainSnap.exists()) {
            showRecipeNotReady();
            return;
        }

        // Загружаем продукты и шаги
        const prodRef = doc(db, receptMainId, "prod");
        const stepRef = doc(db, receptMainId, "step");

        const prodSnap = await getDoc(prodRef);
        const stepSnap = await getDoc(stepRef);

        const mainData = mainSnap.data();
        const prodData = prodSnap.exists() ? prodSnap.data() : {};
        const stepData = stepSnap.exists() ? stepSnap.data() : {};

        console.log("✅ Данные рецепта загружены:", mainData);

        // ✅ Обновляем страницу
        document.getElementById("recipe-title").textContent = mainData.name || "Без названия";
        document.getElementById("recipe-description").textContent = mainData.dis || "Описание отсутствует";
        document.getElementById("recipe-info").textContent = `Порции: ${mainData.porcii} | Время: ${mainData.timemin} мин`;

        // ✅ Продукты
        const ingredientsList = document.getElementById("ingredients-list");
        ingredientsList.innerHTML = "";
        Object.values(prodData).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            ingredientsList.appendChild(li);
        });

        // ✅ Шаги приготовления
        const stepsContainer = document.getElementById("steps-container");
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

    } catch (error) {
        console.error("🔥 Ошибка загрузки рецепта:", error);
        showRecipeNotReady();
    }
}

// Функция для показа ошибки, если рецепт не найден
function showRecipeNotReady() {
    const title = document.getElementById("recipe-title");
    title.textContent = "Упс.... Рецепт еще не готов(";
    title.style.textAlign = "center";
    title.style.fontSize = "20px";
    title.style.color = "#FF5733";

    document.getElementById("recipe-description").textContent = "Мы уже работаем над этим!";
    document.getElementById("recipe-description").style.textAlign = "center";
    document.getElementById("recipe-info").textContent = "";
    document.getElementById("ingredients-list").innerHTML = "";
    document.getElementById("steps-container").innerHTML = "";
}

// ✅ Функция для кнопки "Показать больше"
function setupShowMoreButton() {
    const description = document.getElementById("recipe-description");
    const showMoreBtn = document.getElementById("show-more");

    if (!description || !showMoreBtn) return;

    // Если текста больше, чем вмещается, включаем кнопку
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
