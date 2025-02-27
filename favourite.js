import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();
const container = document.getElementById("favourites-container");

// Функция загрузки избранных рецептов
async function loadFavourites() {
    const user = auth.currentUser;
    if (!user) {
        container.innerHTML = "<p>❌ Ошибка: пользователь не авторизован.</p>";
        return;
    }

    const userRef = doc(db, "person", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const favourites = userSnap.data();
        renderFavourites(favourites);
    } else {
        container.innerHTML = "<p>❌ У вас нет избранных рецептов.</p>";
    }
}

// Функция отрисовки рецептов
function renderFavourites(favourites) {
    container.innerHTML = "";
    Object.keys(favourites).forEach(recipeId => {
        const recipeName = favourites[recipeId];

        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");
        recipeCard.innerHTML = `
            <h3>${recipeName}</h3>
            <button onclick="openRecipe('${recipeId}')">Открыть</button>
        `;
        container.appendChild(recipeCard);
    });
}

// Функция перехода к рецепту
function openRecipe(recipeId) {
    window.location.href = `recipe.html?id=${recipeId}`;
}

// Загружаем избранные рецепты при загрузке страницы
document.addEventListener("DOMContentLoaded", loadFavourites);
