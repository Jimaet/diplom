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

    for (let i = 0; i <= 9; i++) { // Перебираем рецепты receptmain0 - receptmain9
        const prodRef = doc(db, `receptmain${i}`, "prod");
        const prodSnap = await getDoc(prodRef);

        if (prodSnap.exists()) {
            const prodData = prodSnap.data();
            const recipeProducts = Object.values(prodData)
                .filter((_, key) => !key.includes("-")) // Игнорируем граммовку
                .map(p => p.toLowerCase());

            console.log(`📖 Продукты в receptmain${i}:`, recipeProducts);

            // Проверяем, есть ли все продукты пользователя в рецепте
            if (userProducts.every(p => recipeProducts.includes(p))) {
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
