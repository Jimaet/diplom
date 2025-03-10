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
            stepDiv.innerHTML = `
                <p class="step-title">Шаг ${stepNum}:</p>
                <p class="step-description">${stepText}</p>
            `;
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

// ✅ Добавление продукта
const productInput = document.getElementById("product-input");
const suggestionsList = document.getElementById("suggestions-list");

// Массив с продуктами (вы можете заменить на получение данных из Firebase)
const allProducts = ["Яблоко", "Помидор", "Огурец", "Картофель", "Морковь", "Лук", "Чеснок"];

// Функция для фильтрации предложений
productInput.addEventListener("input", () => {
    const query = productInput.value.toLowerCase();
    const filteredProducts = allProducts.filter((product) => product.toLowerCase().includes(query));

    // Очищаем старые предложения
    suggestionsList.innerHTML = "";

    filteredProducts.forEach((product) => {
        const suggestion = document.createElement("div");
        suggestion.classList.add("suggestion-item");
        suggestion.textContent = product;

        // Добавляем продукт при клике
        suggestion.addEventListener("click", () => {
            addProductToList(product);
        });

        suggestionsList.appendChild(suggestion);
    });
});

// Функция для добавления продукта в список
function addProductToList(product) {
    const productList = document.getElementById("product-list");
    const productItem = document.createElement("div");
    productItem.classList.add("product-item");
    productItem.textContent = product;
    productList.appendChild(productItem);

    // Очищаем поле ввода и список предложений
    productInput.value = "";
    suggestionsList.innerHTML = "";
}
