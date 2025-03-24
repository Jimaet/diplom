import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let cachedProducts = [];
document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts();
    setupAutocompleteForExistingInputs();
    setupMultiSelect(".equipment-btn"); // ✅ Добавляем множественный выбор для оборудования
});

document.querySelector(".recipe-btn").addEventListener("click", async () => {
    const selectedProducts = [...document.querySelectorAll("#product-list .product-item input[type='text']")]
        .map(input => input.value.trim())
        .filter(value => value);

    if (selectedProducts.length === 0) {
        alert("Выберите хотя бы один продукт!");
        return;
    }

    console.log("📌 Выбранные продукты:", selectedProducts);
    const recipesContainer = document.getElementById("recipes");
    recipesContainer.innerHTML = ""; // Очищаем контейнер перед загрузкой рецептов

    let foundRecipes = [];

    for (let i = 0; i < 100; i++) {
        try {
            const recipeMainRef = collection(db, `receptmain${i}`);
            const prodDoc = await getDoc(doc(recipeMainRef, "prod"));

            if (!prodDoc.exists()) continue;

            // ✅ Берём только основные продукты (без граммовки и количества)
            const recipeProducts = Object.values(prodDoc.data()).filter(value => 
                typeof value === "string" && !value.includes("г.") && !value.includes("шт.")
            );

            console.log(`🔍 Рецепт receptmain${i} содержит:`, recipeProducts);

            if (selectedProducts.every(product => recipeProducts.includes(product))) {
                console.log(`✅ Рецепт receptmain${i} подходит!`);
                foundRecipes.push(i);

                // 📥 Загружаем фото
                const photoDoc = await getDoc(doc(recipeMainRef, "Photo"));
                const photoUrl = photoDoc.exists() ? photoDoc.data().url : "https://via.placeholder.com/90";

                // 📥 Загружаем описание из rec/receptX
                const recipeRef = doc(db, "rec", `recept${i}`);
                const recipeSnap = await getDoc(recipeRef);
                const recipeDis = recipeSnap.exists() ? recipeSnap.data().dis : "Описание отсутствует";

                // 📥 Загружаем основную инфу из main
                const mainDoc = await getDoc(doc(recipeMainRef, "main"));
                if (!mainDoc.exists()) continue;

                const recipeData = mainDoc.data();
                const recipeCard = createRecipeCard(recipeData, i, photoUrl, recipeDis);

                if (recipeCard) {
                    recipesContainer.appendChild(recipeCard);
                }
            }
        } catch (error) {
            console.error(`❌ Ошибка при обработке рецепта receptmain${i}:`, error);
        }
    }

    if (foundRecipes.length === 0) {
        recipesContainer.innerHTML = "<p>❌ Нет рецептов с выбранными продуктами</p>";
    }
});


document.getElementById("add-product").addEventListener("click", () => {
    const productList = document.getElementById("product-list");

    // Создаём новый элемент
    const newProductItem = document.createElement("div");
    newProductItem.classList.add("product-item");

    // Поле ввода названия продукта
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.placeholder = "Введите продукт...";

    // Поле ввода количества
    const quantityInput = document.createElement("input");
    quantityInput.type = "text";
    quantityInput.placeholder = "грамм/штук";
    quantityInput.classList.add("quantity-input");

    // Кнопка удаления
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", () => {
        productList.removeChild(newProductItem);
    });

    // Добавляем элементы в строку продукта
    newProductItem.appendChild(newInput);
    newProductItem.appendChild(quantityInput);
    newProductItem.appendChild(deleteButton);
    productList.appendChild(newProductItem);

    // Дожидаемся добавления в DOM и включаем автодополнение
    setTimeout(() => {
        console.log("🆕 Новое поле добавлено, включаем автодополнение...");
        setupAutocomplete(newInput);
    }, 100);
});

// ⚡ Загружаем продукты в кэш из Firestore
async function loadProducts() {
    console.log("📥 Загружаем продукты в кэш...");
    cachedProducts = []; // Очищаем кэш перед загрузкой

    for (let i = 1; i <= 18; i++) {
        const docRef = doc(db, "products", ${i});
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            cachedProducts.push(...Object.values(docSnap.data()));
            console.log("Добавлено в кэш:", Object.values(docSnap.data()));
        }
    }
    console.log("✅ Продукты загружены в кэш:", cachedProducts);
}

// 🔍 Ищем продукты в кэше
function searchProducts(query) {
    if (query.length < 2) return [];
    return cachedProducts.filter(name => name.toLowerCase().startsWith(query.toLowerCase()));
}

// ✨ Включаем автодополнение
function setupAutocomplete(inputField) {
    const suggestionBox = document.createElement("div");
    suggestionBox.classList.add("suggestions");
    inputField.parentNode.appendChild(suggestionBox);

    inputField.addEventListener("input", () => {
        const query = inputField.value.trim();
        suggestionBox.innerHTML = "";

        if (query.length < 2) return;

        const results = searchProducts(query);
        console.log(📋 Подсказки для ${query}:, results);

        results.forEach(product => {
            const item = document.createElement("div");
            item.classList.add("suggestion-item");
            item.textContent = product;
            item.addEventListener("click", () => {
                inputField.value = product;
                suggestionBox.innerHTML = "";
            });
            suggestionBox.appendChild(item);
        });
    });

    document.addEventListener("click", (e) => {
        if (!suggestionBox.contains(e.target) && e.target !== inputField) {
            suggestionBox.innerHTML = "";
        }
    });
}

// 🔄 Автодополнение для уже существующих полей
function setupAutocompleteForExistingInputs() {
    document.querySelectorAll("#product-list .product-item input[type='text']").forEach(setupAutocomplete);
}

// 🔘 Настраиваем множественный выбор кнопок
function setupMultiSelect(selector) {
    document.querySelectorAll(selector).forEach(btn => {
        btn.addEventListener("click", (event) => {
            event.target.classList.toggle("selected");
        });
    });
}

function createRecipeCard(recipeData, recipeId, photoUrl, recipeDis) {
    try {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        const img = document.createElement("img");
        img.src = photoUrl;
        img.alt = recipeData.name || "Рецепт без названия";

        const infoContainer = document.createElement("div");
        infoContainer.classList.add("recipe-info");

        const title = document.createElement("h3");
        title.classList.add("recipe-title");
        title.textContent = recipeData.name || "Без названия";

        const description = document.createElement("p");
        description.classList.add("recipe-description");
        description.textContent = recipeDis || "Описание отсутствует";

        const startButton = document.createElement("button");
        startButton.classList.add("start-button");
        startButton.textContent = "Начать";
        startButton.addEventListener("click", () => {
            window.location.href = recipe.html?id=${recipeId};
        });

        infoContainer.appendChild(title);
        infoContainer.appendChild(description);
        card.appendChild(img);
        card.appendChild(infoContainer);
        card.appendChild(startButton);

        return card;
    } catch (error) {
        console.error("❌ Ошибка при создании карточки рецепта:", error);
        return null;
    }
}
