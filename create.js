import { db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const addProductBtn = document.getElementById("add-product");
    const submitButton = document.querySelector(".submit-btn");
    const loadingScreen = document.querySelector(".loading-screen");
    const successMessage = document.querySelector(".success-message");

    // === Добавление продукта ===
    addProductBtn?.addEventListener("click", () => {
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        productItem.innerHTML = 
            `<input type="text" class="product-name" placeholder="Название продукта" autocomplete="off">
            <div class="suggestions"></div>
            <input type="number" placeholder="Количество">
            <select>
                <option value="грамм">Грамм</option>
                <option value="шт">Шт.</option>
            </select>
            <button class="delete-btn">✖</button>`;

        const productNameInput = productItem.querySelector(".product-name");
        const suggestionsBox = productItem.querySelector(".suggestions");

        productList.appendChild(productItem);

        // Обработчик ввода для автозаполнения
        productNameInput.addEventListener("input", (event) => {
            const query = event.target.value;
            console.log("Запрос: " + query);  // Добавляем лог для проверки запроса

            if (query.length > 1) {
                fetchProducts(query).then((products) => {
                    console.log("Найденные продукты: ", products);  // Лог найденных продуктов
                    displaySuggestions(products, suggestionsBox, productNameInput);
                }).catch(error => {
                    console.error("Ошибка при поиске продуктов: ", error);
                });
            } else {
                suggestionsBox.innerHTML = ''; // Если строка пустая, очищаем предложения
            }
        });

        // Удаление продукта
        productItem.querySelector(".delete-btn").addEventListener("click", () => {
            productItem.remove();
        });
    });

    // Функция для получения продуктов из базы данных (например, Firebase)
    function fetchProducts(query) {
        return new Promise((resolve, reject) => {
            // Получаем ссылку на коллекцию продуктов в Firebase
            const productsRef = doc(db, "products", "produser");
            
            // Запрос к документу для поиска продуктов, содержащих query в имени
            getDoc(productsRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const products = docSnap.data().products || [];
                    const filteredProducts = products.filter(product => product.toLowerCase().includes(query.toLowerCase()));
                    resolve(filteredProducts);
                } else {
                    reject("Нет данных в коллекции");
                }
            }).catch((error) => {
                reject("Ошибка при загрузке данных: " + error);
            });
        });
    }

    // Функция для отображения предложений
    function displaySuggestions(products, suggestionsBox, inputElement) {
        suggestionsBox.innerHTML = ''; // Очищаем старые предложения
        products.forEach(product => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = product;

            suggestionItem.addEventListener("click", () => {
                inputElement.value = product;
                suggestionsBox.innerHTML = ''; // Очистить предложения после выбора
            });

            suggestionsBox.appendChild(suggestionItem);
        });
    }

    // === Обработка отправки и сохранение нового продукта в коллекцию ===
    submitButton?.addEventListener("click", function () {
        const allProductNames = document.querySelectorAll(".product-name");
        
        allProductNames.forEach(input => {
            const productName = input.value;
            if (productName && !input.classList.contains("selected")) {
                saveNewProduct(productName); // Сохраняем новый продукт
            }
        });

        // Показать экран загрузки и успешное сообщение
        loadingScreen.style.display = "flex";
        setTimeout(() => {
            loadingScreen.style.display = "none";
            successMessage.style.display = "block";
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000); // Переход через 3 секунды после показа сообщения
        }, 2000); // 2 секунды анимации загрузки
    });

    // Функция для сохранения нового продукта в коллекции
    function saveNewProduct(productName) {
        // Здесь код для добавления нового продукта в коллекцию Firebase
        const userProductsRef = doc(db, "products", "produser");
        updateDoc(userProductsRef, {
            products: arrayUnion(productName)
        }).then(() => {
            console.log("Продукт успешно добавлен: " + productName);
        }).catch((error) => {
            console.error("Ошибка при добавлении продукта: " + error);
        });
    }
});
