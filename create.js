import { addRecipe } from "./addRecipe.js";
document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const stepList = document.getElementById("step-list");
    const addProductBtn = document.getElementById("add-product");
    const addStepBtn = document.getElementById("add-step");
    const submitButton = document.querySelector(".submit-btn");
    const loadingScreen = document.querySelector(".loading-screen");
    const successMessage = document.querySelector(".success-message");

    let stepCount = 0;

    function checkFormValidity() {
        let allFilled = true;

        document.querySelectorAll(".input-field, .small-input").forEach(input => {
            if (input.value.trim() === "") {
                allFilled = false;
            }
        });

        let category1Selected = document.querySelectorAll(".category1 .selected").length > 0;
        let category2Selected = document.querySelectorAll(".category2 .selected").length > 0;
        let category3Selected = document.querySelectorAll(".category3 .selected").length > 0;

        submitButton.disabled = !(allFilled && category1Selected && category2Selected && category3Selected);
    }

    // Множественный выбор для всех категорий
    document.querySelectorAll(".category1 .multi-btn, .category2 .multi-btn, .category3 .multi-btn").forEach(button => {
        button.addEventListener("click", function () {
            this.classList.toggle("selected");
            checkFormValidity();
        });
    });

    // Добавление продукта
    addProductBtn?.addEventListener("click", () => {
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        productItem.innerHTML = `
            <input type="text" placeholder="Название продукта" required>
            <input type="number" placeholder="Граммовка" required>
            <button class="delete-btn">✖</button>
        `;

        productList.appendChild(productItem);
        productItem.querySelector(".delete-btn").addEventListener("click", () => {
            productItem.remove();
            checkFormValidity();
        });

        checkFormValidity();
    });

    // Добавление шага
    addStepBtn?.addEventListener("click", () => {
        stepCount++;
        const stepItem = document.createElement("div");
        stepItem.classList.add("step-item");

        stepItem.innerHTML = `
            <span>Шаг ${stepCount}</span>
            <input type="text" placeholder="Описание шага" required>
            <button class="delete-btn">✖</button>
        `;

        stepList.appendChild(stepItem);
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

    // Проверка полей при вводе
    document.querySelectorAll(".input-field, .small-input").forEach(input => {
        input.addEventListener("input", checkFormValidity);
    });

    // Обработчик кнопки отправки
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

    checkFormValidity();
});
