import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let cachedProducts = [];
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadProducts();
        setupAutocompleteForExistingInputs();
        setupMultiSelect(".equipment-btn");
    } catch (error) {
        console.error("❌ Ошибка инициализации:", error);
    }
});

document.querySelector(".recipe-btn").addEventListener("click", async () => {
    const selectedProducts = [...document.querySelectorAll("#product-list .product-item input[type='text']")]
        .map(input => input.value.trim())
        .filter(value => value);

    if (selectedProducts.length === 0) {
        alert("Выберите хотя бы один продукт!");
        return;
    }

    const recipesContainer = document.getElementById("recipes");
    recipesContainer.innerHTML = "";
    let foundRecipes = [];

    try {
        for (let i = 0; i < 100; i++) {
            const recipeMainRef = collection(db, `receptmain${i}`);
            const prodDoc = await getDoc(doc(recipeMainRef, "prod"));

            if (!prodDoc.exists()) continue;

            const recipeProducts = Object.values(prodDoc.data()).filter(value => 
                typeof value === "string" && !value.includes("г.") && !value.includes("шт.")
            );

            if (selectedProducts.every(product => recipeProducts.includes(product))) {
                foundRecipes.push(`recept${i}`);

                const [photoDoc, recipeSnap, mainDoc] = await Promise.all([
                    getDoc(doc(recipeMainRef, "Photo")),
                    getDoc(doc(db, "rec", `recept${i}`)),
                    getDoc(doc(recipeMainRef, "main"))
                ]);

                if (!mainDoc.exists()) continue;
                
                const photoUrl = photoDoc.exists() ? photoDoc.data().url : "https://via.placeholder.com/90";
                const recipeDis = recipeSnap.exists() ? recipeSnap.data().dis : "";
                const recipeData = mainDoc.data();

                recipesContainer.appendChild(createRecipeCard(recipeData, i, photoUrl, recipeDis));
            }
        }

        if (foundRecipes.length === 0) {
            recipesContainer.innerHTML = "<p>❌ Нет рецептов с выбранными продуктами</p>";
        }
    } catch (error) {
        console.error("❌ Ошибка загрузки рецептов:", error);
        recipesContainer.innerHTML = "<p>⚠ Произошла ошибка при загрузке рецептов.</p>";
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

    newProductItem.append(newInput, quantityInput, deleteButton);
    productList.appendChild(newProductItem);

    setTimeout(() => setupAutocomplete(newInput), 100);
});

async function loadProducts() {
    cachedProducts = [];
    try {
        const productPromises = [];
        for (let i = 1; i <= 18; i++) {
            productPromises.push(getDoc(doc(db, "products", `${i}`)));
        }
        const productDocs = await Promise.all(productPromises);

        productDocs.forEach(docSnap => {
            if (docSnap.exists()) {
                cachedProducts.push(...Object.values(docSnap.data()));
            }
        });
    } catch (error) {
        console.error("❌ Ошибка загрузки продуктов:", error);
    }
}

function searchProducts(query) {
    if (query.length < 2) return [];
    return cachedProducts.filter(name => name.toLowerCase().startsWith(query.toLowerCase()));
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

        const startButton = document.createElement("button");
        startButton.classList.add("start-button");
        startButton.textContent = "Начать";
        startButton.addEventListener("click", () => {
            window.location.href = `recipe.html?id=${recipeId}`;
        });

        infoContainer.appendChild(title);
        if (recipeDis) {
            const description = document.createElement("p");
            description.classList.add("recipe-description");
            description.textContent = recipeDis;
            infoContainer.appendChild(description);
        }

        card.append(img, infoContainer, startButton);
        return card;
    } catch (error) {
        console.error("❌ Ошибка при создании карточки рецепта:", error);
        return null;
    }
}
