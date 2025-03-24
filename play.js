import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("📥 Загружаем кнопки...");
    
    // Включаем множественный выбор
    function setupMultiSelect(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");
                btn.style.backgroundColor = btn.classList.contains("selected") ? "#5D7B76" : "#FFBE62";
            });
        });
    }
    
    setupMultiSelect(".tech-btn"); // Множественный выбор техники
    setupMultiSelect(".filter-btn"); // Фильтры
    setupMultiSelect(".category-btn"); // Категории

    console.log("✅ Кнопки загружены!");

    // Начинаем загрузку продуктов в фоновом режиме
    let cachedProducts = [];
    loadProducts();

    // Загружаем продукты одним запросом (ускорение!)
    async function loadProducts() {
        try {
            console.log("📥 Загружаем продукты в кэш...");

            const querySnapshot = await getDocs(collection(db, "products")); // 1 запрос вместо 17
            querySnapshot.forEach((doc) => {
                cachedProducts.push(...Object.values(doc.data()));
            });

            console.log("✅ Продукты загружены в кэш:", cachedProducts);
        } catch (error) {
            console.error("❌ Ошибка загрузки продуктов:", error);
        }
    }

    // Поиск продуктов
    function searchProducts(query) {
        if (query.length < 2) return [];
        return cachedProducts.filter(name => name.toLowerCase().startsWith(query.toLowerCase()));
    }

    // Автодополнение
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

    // Добавление продукта
    const addProductBtn = document.getElementById("add-product");
    const productList = document.getElementById("product-list");

    function addProductField() {
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Введите продукт";

        const amountInput = document.createElement("input");
        amountInput.type = "number";
        amountInput.placeholder = "Граммы / штуки";

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "✖";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => productItem.remove());

        productItem.appendChild(nameInput);
        productItem.appendChild(amountInput);
        productItem.appendChild(deleteBtn);
        productList.appendChild(productItem);

        // Подключаем автодополнение
        setupAutocomplete(nameInput);
    }

    addProductBtn.addEventListener("click", addProductField);
});
