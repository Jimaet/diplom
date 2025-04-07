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
        const receptMainId = `receptmain${receptId.replace("recept", "")}`;

        const mainRef = doc(db, receptMainId, "main");
        const prodRef = doc(db, receptMainId, "prod");
        const stepRef = doc(db, receptMainId, "step");
        const photoRef = doc(db, receptMainId, "photo");
        const itemsRef = doc(db, receptMainId, "items");

        const [mainSnap, prodSnap, stepSnap, photoSnap, itemsSnap] = await Promise.all([
            getDoc(mainRef),
            getDoc(prodRef),
            getDoc(stepRef),
            getDoc(photoRef),
            getDoc(itemsRef)
        ]);

        if (!mainSnap.exists()) {
            showRecipeNotReady();
            return;
        }

        const mainData = mainSnap.data();
        const prodData = prodSnap.exists() ? prodSnap.data() : {}; // 🔹 Исправлено
        const stepData = stepSnap.exists() ? stepSnap.data() : {};
        const photoData = photoSnap.exists() ? photoSnap.data() : {};
        const itemsData = itemsSnap.exists() ? itemsSnap.data() : {};

        console.log("📌 Загруженные данные рецепта:", { mainData, prodData, stepData, photoData, itemsData });

        // Сохраняем данные в sessionStorage
        sessionStorage.setItem("recipeMainData", JSON.stringify(mainData));
        sessionStorage.setItem("recipeProdData", JSON.stringify(prodData));
        sessionStorage.setItem("recipeStepData", JSON.stringify(stepData));

        // Выводим продукты и шаги в консоль
        console.log("📦 Продукты рецепта:", prodData);
        console.log("📋 Шаги приготовления:", stepData);

        document.getElementById("recipe-title").textContent = mainData.name || "Без названия";
        document.getElementById("recipe-description").textContent = mainData.dis || "Описание отсутствует";
        document.getElementById("recipe-info").textContent = `Порции: ${mainData.porcii} | Время: ${mainData.timemin} мин`;
        document.getElementById("recipe-image").src = photoData.url || "placeholder.jpg";

        // 🔹 Добавляем посуду и технику
        if (itemsSnap.exists()) {
            const itemsContainer = document.createElement("div");
            itemsContainer.classList.add("items-container");

            const title = document.createElement("h3");
            title.textContent = "Рекомендуемая посуда и техника:";
            itemsContainer.appendChild(title);

            Object.values(itemsData).forEach((item) => {
                const itemBox = document.createElement("div");
                itemBox.classList.add("item-box");
                itemBox.textContent = item;
                itemsContainer.appendChild(itemBox);
            });

            document.getElementById("recipe-steps")?.after(itemsContainer);
        }

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

        // Очищаем список перед добавлением новых элементов
        ingredientsList.innerHTML = "";

        Object.values(ingredientsMap).forEach((ingredient) => {
            const li = document.createElement("li");
            li.textContent = ingredient;
            li.classList.add("ingredient-item"); // Можно стилизовать через CSS
            ingredientsList.appendChild(li);
        });

        // ✅ Шаги приготовления
        const stepsContainer = document.getElementById("recipe-steps");
        stepsContainer.innerHTML = "";
        Object.entries(stepData).forEach(([stepNum, stepText]) => {
            const stepDiv = document.createElement("div");
            stepDiv.classList.add("step");

            // Создаем кнопку вопросительного знака для конкретного шага
            const questionButton = document.createElement("span");
            questionButton.classList.add("question-button");
            questionButton.textContent = "?";

            // Вставляем текст шага и кнопку вопроса
            stepDiv.innerHTML = `
                <p class="step-title">Шаг ${stepNum}:</p>
                <p class="step-description">${stepText}</p>
            `;

            // Добавляем кнопку в шаг
            stepDiv.appendChild(questionButton);

            // Добавляем обработчик события для кнопки
           questionButton.addEventListener("click", function () {
    try {
        const prompt = `Привет! Вот мой рецепт: Продукты: ${Object.values(ingredientsMap).join(". ")} Шаги: ${Object.entries(stepData).map(([num, text]) => `Шаг ${num}: ${text}`).join(". ")} У меня возник вопрос именно с шагом номер ${stepNum}: Вот он ${stepText}, расскажи мне про него подробнее!`;

        sessionStorage.setItem("question", prompt);

        const encodedPrompt = encodeURIComponent(prompt);
        const maxUrlLength = 2000;

        if (encodedPrompt.length > maxUrlLength) {
            alert("Ваш запрос слишком длинный. Пожалуйста, сократите его.");
        } else {
            window.location.href = `help.html?prompt=${encodedPrompt}`;
        }
    } catch (error) {
        console.error("Ошибка при переходе на help.html:", error);
        alert("Что-то пошло не так при обработке вашего запроса.");
    }
});


                // Кодируем строку в URL
                const encodedPrompt = encodeURIComponent(prompt);

                // Переходим на страницу help.html с параметром prompt
                // Убедимся, что URL не слишком длинный
                const maxUrlLength = 2000;
                if (encodedPrompt.length > maxUrlLength) {
                    alert("Ваш запрос слишком длинный. Пожалуйста, сократите его.");
                } else {
                    window.location.href = `help.html?prompt=${encodedPrompt}`;
                }
            });

            stepsContainer.appendChild(stepDiv);
        });

        setupShowMoreButton();

    } catch (error) {
        console.error("🔥 Ошибка загрузки рецепта:", error);
        showRecipeNotReady();
    }
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

// ✅ Улучшенная карточка рецепта
function createRecipeCard(recipe, recipeId) {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    card.innerHTML = `
        <img src="${recipe.url || 'placeholder.jpg'}" class="recipe-photo">
        <div class="recipe-info">
            <h3 class="recipe-title">${recipe.name}</h3>
            <p class="recipe-description">${recipe.dis}</p>
            <div class="recipe-actions">
                <button class="fav-btn" data-id="${recipeId}">❤️</button>
            </div>
        </div>
    `;

    card.addEventListener("click", () => {
        window.location.href = `recipe.html?id=${recipeId}`;
    });

    return card;
}
