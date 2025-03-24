import { db } from "./firebase-config.js";
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let cachedProducts = [];
document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts();
    console.log("✅ Продукты загружены, настраиваем интерфейс...");
    setupAutocompleteForExistingInputs();
    setupMultiSelect(".equipment-btn");
});

document.querySelector(".recipe-btn").addEventListener("click", async () => {
    const selectedProducts = new Set(
        [...document.querySelectorAll("#product-list input[type='text']")]
            .map(input => input.value.trim().toLowerCase())
            .filter(value => value)
    );

    console.log("🛒 Выбранные продукты:", selectedProducts);

    if (selectedProducts.size === 0) {
        alert("Выберите хотя бы один продукт!");
        return;
    }

    const recipesContainer = document.getElementById("recipes");
    recipesContainer.innerHTML = "";

    const recSnapshot = await getDocs(collection(db, "rec"));
    let foundRecipes = [];

    for (const recDoc of recSnapshot.docs) {
        const receptId = recDoc.id.replace("recept", ""); // Получаем номер рецепта
        const prodRef = doc(db, `receptmain${receptId}`, "prod");
        const prodSnap = await getDoc(prodRef);

        if (!prodSnap.exists()) continue;

        const recipeProducts = new Set(
            Object.entries(prodSnap.data())
                .filter(([key]) => !key.includes("-"))
                .map(([_, value]) => value.toLowerCase())
        );

        console.log(`📖 Рецепт receptmain${receptId}:`, recipeProducts);

        // Проверяем, содержит ли рецепт все выбранные продукты
        if ([...selectedProducts].every(p => recipeProducts.has(p))) {
            console.log(`✅ Подходит: receptmain${receptId}`);
            foundRecipes.push(receptId);
        }
    }

    if (foundRecipes.length === 0) {
        recipesContainer.innerHTML = "<p>❌ Нет рецептов с выбранными продуктами</p>";
        return;
    }

    // Загружаем данные рецептов и отображаем их
    for (const recipeId of foundRecipes) {
        const [mainSnap, photoSnap] = await Promise.all([
            getDoc(doc(db, `receptmain${recipeId}`, "main")),
            getDoc(doc(db, `receptmain${recipeId}`, "photo"))
        ]);

        if (!mainSnap.exists()) continue;

        const recipeData = mainSnap.data();
        const photoUrl = photoSnap.exists() ? photoSnap.data().url : "https://via.placeholder.com/90";

        const recipeRef = doc(db, "rec", `recept${recipeId}`);
        const recipeSnap = await getDoc(recipeRef);
        const recipeDis = recipeSnap.exists() ? recipeSnap.data().dis : "Описание отсутствует";

        const recipeCard = createRecipeCard(recipeData, recipeId, photoUrl, recipeDis);
        if (recipeCard) recipesContainer.appendChild(recipeCard);
    }
});

document.getElementById("add-product").addEventListener("click", () => {
    const productList = document.getElementById("product-list");

    const newProductItem = document.createElement("div");
    newProductItem.classList.add("product-item");

    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.placeholder = "Введите продукт...";

    const quantityInput = document.createElement("input");
    quantityInput.type = "text";
    quantityInput.placeholder = "грамм/штук";
    quantityInput.classList.add("quantity-input");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", () => {
        productList.removeChild(newProductItem);
    });

    newProductItem.appendChild(newInput);
    newProductItem.appendChild(quantityInput);
    newProductItem.appendChild(deleteButton);
    productList.appendChild(newProductItem);

    setTimeout(() => {
        console.log("🆕 Новое поле добавлено, включаем автодополнение...");
        setupAutocomplete(newInput);
    }, 100);
});

async function loadProducts() {
    console.log("📥 Загружаем продукты в кэш...");

    const snapshot = await getDocs(collection(db, "products"));
    cachedProducts = snapshot.docs.flatMap(doc => Object.values(doc.data()).map(p => p.toLowerCase()));

    console.log("✅ Продукты загружены в кэш:", cachedProducts);
}

function searchProducts(query) {
    if (query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return cachedProducts.filter(name => name.startsWith(lowerQuery));
}

function setupAutocomplete(inputField) {
    const suggestionBox = document.createElement("div");
    suggestionBox.classList.add("suggestions");
    inputField.parentNode.appendChild(suggestionBox);

    inputField.addEventListener("input", () => {
        const query = inputField.value.trim();
        suggestionBox.innerHTML = "";

        if (query.length < 2) return;

        const results = searchProducts(query);
        console.log(`📋 Подсказки для ${query}:`, results);

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

function setupAutocompleteForExistingInputs() {
    document.querySelectorAll("#product-list .product-item input[type='text']").forEach(setupAutocomplete);
}

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
            window.location.href = `recipe.html?id=${recipeId}`;
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
