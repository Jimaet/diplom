import { addRecipe } from "./addRecipe.js";
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

    // === Добавление продукта ===
    addProductBtn?.addEventListener("click", () => {
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        productItem.innerHTML = `
            <input type="text" placeholder="Название продукта">
            <input type="number" placeholder="Граммовка">
            <button class="delete-btn">✖</button>
        `;

        productList.appendChild(productItem);

        productItem.querySelector(".delete-btn").addEventListener("click", () => {
            productItem.remove();
        });
    });

    // === Добавление шага ===
    addStepBtn?.addEventListener("click", () => {
        stepCount++;
        const stepItem = document.createElement("div");
        stepItem.classList.add("step-item");

        stepItem.innerHTML = `
            <span>Шаг ${stepCount}</span>
            <input type="text" placeholder="Описание шага">
            <button class="delete-btn">✖</button>
        `;

        stepList.appendChild(stepItem);

        stepItem.querySelector(".delete-btn").addEventListener("click", () => {
            stepItem.remove();
            updateStepNumbers();
        });
    });

    // === Обновление нумерации шагов ===
    function updateStepNumbers() {
        const steps = document.querySelectorAll(".step-item span");
        steps.forEach((step, index) => {
            step.textContent = `Шаг ${index + 1}`;
        });
        stepCount = steps.length;
    }

    // === Обработка множественного выбора ===
    multiButtons.forEach(button => {
        button.addEventListener("click", function () {
            this.classList.toggle("selected");
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
            }, 3000); // Переход через 3 секунды после показа сообщения
        }, 2000); // 2 секунды анимации загрузки
    });
});
