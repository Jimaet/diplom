document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const addProductBtn = document.getElementById("add-product");
    const suggestionsBox = document.getElementById("suggestions");

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
            if (query.length > 1) {
                fetchProducts(query).then((products) => {
                    displaySuggestions(products, suggestionsBox, productNameInput);
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
        // Здесь запрос к базе данных, например, к Firebase
        return new Promise((resolve) => {
            // Пример данных из коллекции
            const allProducts = ["Картофель", "Кабачок", "Кари", "Яблоки", "Яйца", "Мясо", "Фрукты", "Огурцы", "Лук"];
            const filteredProducts = allProducts.filter(product => product.toLowerCase().includes(query.toLowerCase()));
            resolve(filteredProducts);
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
        // Здесь код для добавления нового продукта в коллекцию Firebase, например:
        const userProductsRef = db.collection("products").doc("produser");
        userProductsRef.update({
            products: firebase.firestore.FieldValue.arrayUnion(productName)
        });
    }
});
