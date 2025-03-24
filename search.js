import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.querySelector(".recipe-btn").addEventListener("click", async () => {
    const userProducts = getUserProducts();
    console.log("🔍 Пользователь выбрал:", userProducts);

    const matchingRecipes = await findMatchingRecipes(userProducts);
    console.log("✅ Подходящие рецепты:", matchingRecipes);

    displayRecipes(matchingRecipes);
});

// 📝 Получаем продукты, введенные пользователем
function getUserProducts() {
    return Array.from(document.querySelectorAll("#product-list input"))
        .map(input => input.value.trim().toLowerCase())
        .filter(value => value !== "");
}

// 🔍 Ищем рецепты, содержащие только продукты пользователя
async function findMatchingRecipes(userProducts) {
    const recipes = [];
    const querySnapshot = await getDocs(collection(db, "rec"));

    querySnapshot.forEach(doc => {
        const recipeId = doc.id;
        const recipeProducts = Object.values(doc.data().prod || {}).map(p => p.toLowerCase());

        if (isSubset(recipeProducts, userProducts)) {
            recipes.push(recipeId);
        }
    });

    return recipes;
}

// ✅ Проверяем, что все продукты рецепта входят в список пользователя
function isSubset(recipeProducts, userProducts) {
    return recipeProducts.every(product => userProducts.includes(product));
}

// 📌 Выводим найденные рецепты
function displayRecipes(recipes) {
    const container = document.getElementById("recipe-list") || createRecipeListContainer();
    container.innerHTML = recipes.length
        ? recipes.map(id => `<p>Рецепт: ${id}</p>`).join("")
        : "<p>Нет подходящих рецептов</p>";
}
console.log(`📌 Проверяем рецепты...`);
for (let i = 0; i <= 9; i++) {
    const docRef = doc(db, "rec", `recept${i}`, "receptmain", `${i}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const recipeProducts = Object.values(docSnap.data().prod || {});
        console.log(`📖 recept${i} содержит:`, recipeProducts);
    }
}
// 🔧 Создаем контейнер для вывода рецептов (если его нет)
function createRecipeListContainer() {
    const container = document.createElement("div");
    container.id = "recipe-list";
    document.body.appendChild(container);
    return container;
}
