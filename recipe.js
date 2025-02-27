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
        if (photoData.url) {
            recipeImage.src = photoData.url;
        } else {
            recipeImage.src = "placeholder.jpg"; // Заглушка, если фото нет
        }

        // ✅ Продукты
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

        Object.values(ingredientsMap).forEach((ingredient) => {
            const p = document.createElement("p");
            p.textContent = ingredient;
            ingredientsList.appendChild(p);
        });

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
    document.getElementById("recipe-ingredients").innerHTML = "";
    document.getElementById("recipe-steps").innerHTML = "";
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
