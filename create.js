document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const stepList = document.getElementById("step-list");
    const addProductBtn = document.getElementById("add-product");
    const addStepBtn = document.getElementById("add-step");
    const submitButton = document.querySelector(".submit-btn");
    const loadingScreen = document.querySelector(".loading-screen");
    const successMessage = document.querySelector(".success-message");

    let stepCount = 0;

    // === Проверка формы перед отправкой ===
    function checkFormValidity() {
        let allFilled = true;

        document.querySelectorAll(".input-field, .small-input").forEach(input => {
            if (input.value.trim() === "") {
                showError(input, "Это поле обязательно!");
                allFilled = false;
            } else {
                hideError(input);
            }
        });

        if (document.querySelectorAll(".product-item").length > 0) {
            document.querySelectorAll("#product-list input").forEach(input => {
                if (input.value.trim() === "") {
                    showError(input, "Заполните продукт!");
                    allFilled = false;
                } else {
                    hideError(input);
                }
            });
        }

        if (document.querySelectorAll(".step-item").length > 0) {
            document.querySelectorAll("#step-list input").forEach(input => {
                if (input.value.trim() === "") {
                    showError(input, "Заполните шаг!");
                    allFilled = false;
                } else {
                    hideError(input);
                }
            });
        }

        let category1Selected = document.querySelector(".category1 .selected") !== null;
        let category2Selected = document.querySelectorAll(".category2 .selected").length > 0;
        let category3Selected = document.querySelectorAll(".category3 .selected").length > 0;

        document.querySelector(".category1-error").style.display = category1Selected ? "none" : "block";
        document.querySelector(".category2-error").style.display = category2Selected ? "none" : "block";

        submitButton.disabled = !(allFilled && category1Selected && category2Selected && category3Selected);
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

    function updateStepNumbers() {
        document.querySelectorAll(".step-item span").forEach((step, index) => {
            step.textContent = `Шаг ${index + 1}`;
        });
        stepCount = document.querySelectorAll(".step-item").length;
    }

    // === Обработчик выбора категорий ===

    // === Первая категория (Один выбор, остаётся включённой) ===
    document.querySelectorAll(".category1 .multi-btn").forEach(button => {
        button.addEventListener("click", function () {
            // Если уже выбрана — выключаем
            if (this.classList.contains("selected")) {
                this.classList.remove("selected");
            } else {
                // Выключаем другие и включаем текущую
                document.querySelectorAll(".category1 .multi-btn").forEach(btn => btn.classList.remove("selected"));
                this.classList.add("selected");
            }
            checkFormValidity();
        });
    });

    // === Вторая категория (Можно выбрать несколько, остаются включёнными) ===
    document.querySelectorAll(".category2 .multi-btn").forEach(button => {
        button.addEventListener("click", function () {
            this.classList.toggle("selected");
            checkFormValidity();
        });
    });

    // === Третья категория (Можно выбрать несколько, остаются включёнными) ===
    document.querySelectorAll(".category3 .multi-btn").forEach(button => {
        button.addEventListener("click", function () {
            this.classList.toggle("selected");
            checkFormValidity();
        });
    });

    // === Обработка кнопки отправки ===
    if (submitButton) {
        submitButton.addEventListener("click", function () {
            loadingScreen.style.display = "flex";

            setTimeout(() => {
                loadingScreen.style.display = "none";
                successMessage.style.display = "block";

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 3000);
            }, 2000);
        });
    }

    // Следим за изменениями в полях ввода
    document.querySelectorAll(".input-field, .small-input").forEach(input => {
        input.addEventListener("input", checkFormValidity);
    });

    // Блокируем кнопку при загрузке
    checkFormValidity();
});
