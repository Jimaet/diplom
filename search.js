import { db } from "./firebase-config.js";
import { collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.querySelector(".recipe-btn").addEventListener("click", async () => {
    let selectedProducts = Array.from(document.querySelectorAll("#product-list input[type='text']"))
        .map(input => input.value.trim().toLowerCase())
        .filter(product => product !== "");

    console.log("🛒 Пользователь выбрал:", selectedProducts);

    let matchingRecipes = [];

    for (let i = 0; i <= 9; i++) {
        const docRef = doc(db, "rec", `recept${i}`, "receptmain", `${i}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const recipeProducts = Object.values(docSnap.data().prod || {}).map(p => p.toLowerCase());

            console.log(`📖 recept${i} содержит:`, recipeProducts);

            // Проверяем, что ВСЕ продукты из рецепта есть у пользователя и нет лишних
            if (recipeProducts.every(p => selectedProducts.includes(p)) && selectedProducts.every(p => recipeProducts.includes(p))) {
                matchingRecipes.push(`recept${i}`);
            }
        }
    }

    console.log("✅ Подходящие рецепты:", matchingRecipes);
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
