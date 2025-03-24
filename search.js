import { db } from "./firebase-config.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.querySelector(".recipe-btn").addEventListener("click", async () => {
    const userProducts = Array.from(document.querySelectorAll("#product-list input[type='text']"))
        .map(input => input.value.trim().toLowerCase()) // Обрезаем пробелы
        .filter(value => value !== "");

    console.log("🛒 Пользователь выбрал:", userProducts);

    if (userProducts.length === 0) {
        alert("Выберите хотя бы один продукт!");
        return;
    }

    let matchingRecipes = [];

    // Получаем список всех рецептов (rec/receptX)
    const recRef = collection(db, "rec");
    const recSnapshot = await getDocs(recRef);

    for (const recDoc of recSnapshot.docs) {
        const receptId = recDoc.id; // например, recept0, recept1 и т.д.
        const receptmainId = `receptmain${receptId.replace("recept", "")}`; // receptmain0, receptmain1

        const prodRef = doc(db, receptmainId, "prod");
        const prodSnap = await getDoc(prodRef);

        if (prodSnap.exists()) {
            const prodData = prodSnap.data();
            const recipeProducts = Object.entries(prodData)
                .filter(([key, _]) => typeof key === "string" && !key.includes("-")) // Игнорируем граммовку
                .map(([_, value]) => value.toLowerCase().trim()); // Обрезаем пробелы

            console.log(`📖 Продукты в ${receptmainId}:`, recipeProducts);

            // Проверяем, есть ли все продукты пользователя в рецепте
            if (userProducts.every(p => recipeProducts.some(rp => rp.includes(p)))) {
                matchingRecipes.push(receptId); // Используем receptX, а не receptmainX
            }
        }
    }

    console.log("✅ Подходящие рецепты:", matchingRecipes);
    displayRecipes(matchingRecipes);
});

// 📌 Функция для вывода рецептов
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
