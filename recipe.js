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

// Получаем `receptId` из URL
const params = new URLSearchParams(window.location.search);
const receptId = params.get("id");

if (!receptId) {
    showRecipeNotReady();
} else {
    loadRecipe(receptId);
}

async function loadRecipe(receptId) {
    try {
        // Получаем ID коллекции (например, recept2 → receptmain2)
        const receptMainId = `receptmain${receptId.replace("recept", "")}`;

        // Проверяем, существует ли документ
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

        // Обновляем страницу
        document.getElementById("recipe-title").textContent = mainData.name;
        document.getElementById("recipe-description").textContent = mainData.dis;
        document.getElementById("recipe-info").textContent = `Порции: ${mainData.porcii} | Время: ${mainData.timemin} мин`;

        // Продукты
        const ingredientsList = document.getElementById("ingredients-list");
        ingredientsList.innerHTML = "";
        Object.values(prodData).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            ingredientsList.appendChild(li);
        });

        // Шаги
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

    } catch (error) {
        console.error("Ошибка загрузки рецепта:", error);
        showRecipeNotReady();
    }
}

// Функция для показа сообщения "Упс.... Рецепт еще не готов("
function showRecipeNotReady() {
    document.getElementById("recipe-title").textContent = "Упс.... Рецепт еще не готов(";
    document.getElementById("recipe-title").style.textAlign = "center";
    document.getElementById("recipe-title").style.fontSize = "20px";
    document.getElementById("recipe-title").style.color = "#FF5733"; // Красивый цвет ошибки

    document.getElementById("recipe-description").textContent = "Мы уже работаем над этим!";
    document.getElementById("recipe-description").style.textAlign = "center";

    document.getElementById("recipe-info").textContent = "";
    document.getElementById("ingredients-list").innerHTML = "";
    document.getElementById("steps-container").innerHTML = "";
}

// Добавляем кнопку "Показать больше" для длинного описания
document.addEventListener("DOMContentLoaded", function () {
    const description = document.getElementById("recipe-description");

    if (description.scrollHeight > description.clientHeight) {
        const expandButton = document.createElement("span");
        expandButton.classList.add("expand-button");
        expandButton.textContent = "Показать больше";
        description.after(expandButton);

        expandButton.addEventListener("click", function () {
            description.classList.toggle("expanded");
            expandButton.textContent = description.classList.contains("expanded") ? "Скрыть" : "Показать больше";
        });
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const description = document.getElementById("recipe-description");
    const showMoreBtn = document.getElementById("show-more");

    if (!description || !showMoreBtn) return;

    showMoreBtn.addEventListener("click", function () {
        description.classList.toggle("expanded");
        showMoreBtn.textContent = description.classList.contains("expanded") ? "Скрыть" : "Показать больше";
    });
});

