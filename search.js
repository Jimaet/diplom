import { db } from "./firebase-config.js";
import { collection, doc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.querySelector(".recipe-btn").addEventListener("click", async () => {
    const userProducts = Array.from(document.querySelectorAll("#product-list input[type='text']"))
        .map(input => input.value.trim().toLowerCase())
        .filter(value => value !== "");

    console.log("🛒 Пользователь выбрал:", userProducts);

    if (userProducts.length === 0) {
        alert("Выберите хотя бы один продукт!");
        return;
    }

    let matchingRecipes = [];

    // Проходим по возможным рецептам
    for (let i = 0; i <= 9; i++) {
        const prodRef = doc(db, `receptmain${i}`, "prod");
        const prodSnap = await getDoc(prodRef);

        if (prodSnap.exists()) {
            const recipeProducts = Object.values(prodSnap.data()).map(p => p.toLowerCase());
            console.log(`📖 Продукты в receptmain${i}:`, recipeProducts);

            // Проверяем, содержит ли рецепт только введённые продукты
            if (recipeProducts.every(prod => userProducts.includes(prod))) {
                matchingRecipes.push(`recept${i}`);
            }
        }
    }

    console.log("✅ Подходящие рецепты:", matchingRecipes);
});

// 📌 Выводим найденные рецепты
function displayRecipes(recipes) {
    let container = document.getElementById("recipe-list");
    if (!container) {
        container = document.createElement("div");
        container.id = "recipe-list";
        document.body.appendChild(container);
    }

    container.innerHTML = recipes.length
        ? recipes.map(id => `<p>Рецепт: ${id}</p>`).join("")
        : "<p>Нет подходящих рецептов</p>";
}
// 🔧 Создаем контейнер для вывода рецептов (если его нет)
function createRecipeListContainer() {
    const container = document.createElement("div");
    container.id = "recipe-list";
    document.body.appendChild(container);
    return container;
}
