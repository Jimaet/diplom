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
const receptId = params.get("id"); // Например, recept2

if (!receptId) {
    document.getElementById("recipe-title").textContent = "Рецепт не найден";
} else {
    loadRecipe(receptId);
}

async function loadRecipe(receptId) {
    try {
        const receptMainId = `receptmain${receptId.replace("recept", "")}`; // Преобразуем recept2 → receptmain2

        // Проверяем, существует ли коллекция
        const mainRef = doc(db, receptMainId, "main");
        const mainSnap = await getDoc(mainRef);

        if (!mainSnap.exists()) {
            document.getElementById("recipe-title").textContent = "Рецепт не найден";
            document.getElementById("recipe-description").textContent = "";
            document.getElementById("recipe-info").textContent = "";
            return;
        }

        // Загружаем данные
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
    }
}
