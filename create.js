document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const stepList = document.getElementById("step-list");
    const addProductBtn = document.getElementById("add-product");
    const addStepBtn = document.getElementById("add-step");
    const multiButtons = document.querySelectorAll(".multi-btn");
    const submitButton = document.querySelector(".submit-btn");
    const loadingScreen = document.querySelector(".loading-screen");
    const successMessage = document.querySelector(".success-message");

    let stepCount = 0;

    function checkFormValidity() {
        let allFilled = true;

        // Проверяем все статические поля
        document.querySelectorAll(".input-field, .small-input").forEach(input => {
            if (input.value.trim() === "") {
                showError(input, "Это поле обязательно!");
                allFilled = false;
            } else {
                hideError(input);
            }
        });

        // Проверяем динамически добавленные поля продуктов
        document.querySelectorAll("#product-list input").forEach(input => {
            if (input.value.trim() === "") {
                showError(input, "Заполните продукт!");
                allFilled = false;
            } else {
                hideError(input);
            }
        });

        // Проверяем динамически добавленные шаги
        document.querySelectorAll("#step-list input").forEach(input => {
            if (input.value.trim() === "") {
                showError(input, "Заполните шаг!");
                allFilled = false;
            } else {
                hideError(input);
            }
        });

        // Проверяем, выбрана ли хотя бы одна категория
        let categorySelected = Array.from(multiButtons).some(btn => btn.classList.contains("selected"));

        if (!categorySelected) {
            document.querySelector(".category-error").style.display = "block";
        } else {
            document.querySelector(".category-error").style.display = "none";
        }

        // Разблокируем кнопку, если всё заполнено и есть категория
        submitButton.disabled = !(allFilled && categorySelected);
    }

    function showError(input, message) {
        let error = input.nextElementSibling;
        if (!error || !error.classList.contains("error-message")) {
            error = document.createElement("div");
            error.classList.add("error-message");
            input.parentNode.appendChild(error);
        }
        error.textContent = message;
    }

    function hideError(input) {
        let error = input.nextElementSibling;
        if (error && error.classList.contains("error-message")) {
            error.remove();
        }
    }

    // === Добавление продукта ===
    addProductBtn?.addEventListener("click", () => {
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        productItem.innerHTML = `
            <input type="text" placeholder="Название продукта" required>
            <div class="error-message"></div>
            <input type="number" placeholder="Граммовка" required>
            <div class="error-message"></div>
            <button class="delete-btn">✖</button>
        `;

        productList.appendChild(productItem);

        productItem.querySelectorAll("input").forEach(input => input.addEventListener("input", checkFormValidity));

        productItem.querySelector(".delete-btn").addEventListener("click", () => {
            productItem.remove();
            checkFormValidity();
        });

        checkFormValidity();
    });

    // === Добавление шага ===
    addStepBtn?.addEventListener("click", () => {
        stepCount++;
        const stepItem = document.createElement("div");
        stepItem.classList.add("step-item");

        stepItem.innerHTML = `
            <span>Шаг ${stepCount}</span>
            <input type="text" placeholder="Описание шага" required>
            <div class="error-message"></div>
            <button class="delete-btn">✖</button>
        `;

        stepList.appendChild(stepItem);

        stepItem.querySelector("input").addEventListener("input", checkFormValidity);

        stepItem.querySelector(".delete-btn").addEventListener("click", () => {
            stepItem.remove();
            updateStepNumbers();
            checkFormValidity();
        });

        checkFormValidity();
    });

    // === Обновление нумерации шагов ===
    function updateStepNumbers() {
        document.querySelectorAll(".step-item span").forEach((step, index) => {
            step.textContent = `Шаг ${index + 1}`;
        });
        stepCount = document.querySelectorAll(".step-item").length;
    }

    // === Обработка множественного выбора ===
    multiButtons.forEach((button, index) => {
        button.addEventListener("click", function () {
            if (index < 2) {
                // Первые две кнопки можно выбирать одновременно
                this.classList.toggle("selected");
            } else {
                // Остальные кнопки работают как раньше
                multiButtons.forEach(btn => {
                    if (btn !== this) btn.classList.remove("selected");
                });
                this.classList.toggle("selected");
            }
            checkFormValidity();
        });
    });

    // === Обработка кнопки отправки ===
    submitButton?.addEventListener("click", function () {
        loadingScreen.style.display = "flex";

        setTimeout(() => {
            loadingScreen.style.display = "none";
            successMessage.style.display = "block";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
        }, 2000);
    });

    // Следим за изменениями в статических полях
    document.querySelectorAll(".input-field, .small-input").forEach(input => {
        input.addEventListener("input", checkFormValidity);
    });

    // Блокируем кнопку при загрузке
    checkFormValidity();
});
