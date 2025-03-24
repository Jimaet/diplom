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

    // Загружаем рецепты из Firestore
    const recipesRef = collection(db, "rec"); // Коллекция с рецептами
    const querySnapshot = await getDocs(recipesRef);
    let matchingRecipes = [];

    for (const docSnap of querySnapshot.docs) {
        const recipeId = docSnap.id; // ID рецепта (например, recept0)

        // Загружаем продукты рецепта
        const prodRef = doc(db, `rec/${recipeId}/receptmain${recipeId.replace('recept', '')}`, "prod");
        const prodSnap = await getDoc(prodRef);

        if (prodSnap.exists()) {
            const recipeProducts = Object.values(prodSnap.data()).map(p => p.toLowerCase());
            console.log(`📖 Продукты в ${recipeId}:`, recipeProducts);

            // Новая проверка: ВСЕ введённые продукты должны быть в рецепте, но рецепт может содержать больше продуктов
            if (userProducts.every(prod => recipeProducts.includes(prod))) {
                matchingRecipes.push(recipeId);
            }
        }
    }

    console.log("✅ Подходящие рецепты:", matchingRecipes);
    displayRecipes(matchingRecipes);
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
