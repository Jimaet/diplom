import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("📥 Загружаем продукты в кэш...");

    const addProductBtn = document.getElementById("add-product");
    const productList = document.getElementById("product-list");

    let cachedProducts = [];

    // Асинхронная загрузка продуктов
    async function loadProducts() {
        try {
            for (let i = 1; i <= 17; i++) {
                const docRef = doc(db, "products", ${i});
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    cachedProducts.push(...Object.values(docSnap.data()));
                }
            }
            console.log("✅ Продукты загружены в кэш:", cachedProducts);
        } catch (error) {
            console.error("❌ Ошибка загрузки продуктов:", error);
        }
    }

    // Функция поиска продуктов для автодополнения
    function searchProducts(query) {
        if (query.length < 2) return [];
        return cachedProducts.filter(name => name.toLowerCase().startsWith(query.toLowerCase()));
    }

    // Функция автодополнения
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

    // Функция добавления нового продукта
    function addProductField() {
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Введите продукт";

        const amountInput = document.createElement("input");
        amountInput.type = "number"; // Теперь ввод только числа
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

    // Функция включения множественного выбора
    function setupMultiSelect(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");
                if (btn.classList.contains("selected")) {
                    btn.style.backgroundColor = "#5D7B76";
                } else {
                    btn.style.backgroundColor = "#FFBE62";
                }
            });
        });
    }

    // Ждём загрузки продуктов, затем активируем кнопки
    await loadProducts();
    setupMultiSelect(".tech-btn"); // Для выбора техники
});
