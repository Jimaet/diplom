import { db } from "./firebase-config.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

    // Получаем список всех рецептов (receptmainX)
    const receptmainRef = collection(db, "receptmain");
    const receptmainSnapshot = await getDocs(receptmainRef);

    for (const receptmainDoc of receptmainSnapshot.docs) {
        const receptmainId = receptmainDoc.id; // например, receptmain0
        const prodRef = doc(db, receptmainId, "prod");
        const prodSnap = await getDoc(prodRef);

        if (prodSnap.exists()) {
            const prodData = prodSnap.data();
            const recipeProducts = Object.entries(prodData)
                .filter(([key, _]) => !key.includes("-")) // Игнорируем граммовку
                .map(([_, value]) => value.toLowerCase());

            console.log(`📖 Продукты в ${receptmainId}:`, recipeProducts);

            // Проверяем, есть ли все продукты пользователя в рецепте
            if (userProducts.every(p => recipeProducts.includes(p))) {
                matchingRecipes.push(receptmainId.replace("receptmain", "recept"));
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
