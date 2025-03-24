import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let cachedProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts(); // Загружаем продукты в кэш

    setupMultiSelect(".equipment-btn"); // Настраиваем множественный выбор кнопок
    setupMultiSelect(".tech-btn");

    setupAutocompleteForExistingInputs(); // Включаем автодополнение для существующих полей

    document.getElementById("add-product").addEventListener("click", () => {
        setTimeout(() => {
            const newInput = document.querySelector("#product-list .product-item:last-child input[type='text']");
            if (newInput) {
                console.log("🆕 Новое поле, включаем автодополнение...");
                setupAutocomplete(newInput);
            }
        }, 100);
    });
});

// ⚡ Загружаем продукты в кэш из Firestore
async function loadProducts() {
    console.log("📥 Загружаем продукты в кэш...");
    cachedProducts = []; // Очищаем кэш перед загрузкой

    for (let i = 1; i <= 18; i++) {
        const docRef = doc(db, "products", `${i}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            cachedProducts.push(...Object.values(docSnap.data()));
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

// 🔄 Автодополнение для уже существующих полей
function setupAutocompleteForExistingInputs() {
    document.querySelectorAll("#product-list .product-item input[type='text']").forEach(setupAutocomplete);
}

// 🔘 Настраиваем множественный выбор кнопок
function setupMultiSelect(selector) {
    document.querySelectorAll(selector).forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("selected");
        });
    });
}
