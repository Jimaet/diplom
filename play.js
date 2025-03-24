document.addEventListener("DOMContentLoaded", () => {
    const addProductBtn = document.getElementById("add-product");
    const productList = document.getElementById("product-list");

    addProductBtn.addEventListener("click", () => {
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Введите продукт";

        const amountInput = document.createElement("input");
        amountInput.type = "number"; // Только числовой ввод
        amountInput.placeholder = "Граммы / штуки";

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "✖";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => productItem.remove());

        productItem.appendChild(nameInput);
        productItem.appendChild(amountInput);
        productItem.appendChild(deleteBtn);
        productList.appendChild(productItem);
    });

    // Логика множественного выбора кнопок техники и посуды
    const equipmentButtons = document.querySelectorAll(".equipment-buttons button");

    equipmentButtons.forEach(button => {
        button.addEventListener("click", () => {
            button.classList.toggle("selected");
        });
    });
});
