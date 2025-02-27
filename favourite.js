
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Получаем ID пользователя из Telegram Mini App
window.Telegram.WebApp.ready();
const user = window.Telegram.WebApp.initDataUnsafe?.user;
const userId = user ? String(user.id) : null;

if (!userId) {
    console.error("❌ Ошибка: Не удалось получить ID пользователя Telegram.");
}

// Загружаем избранные рецепты
async function loadFavorites() {
    if (!userId) return;

    const userRef = doc(db, "person", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        document.getElementById("favorite-recipes").innerHTML = "<p>У вас нет избранных рецептов.</p>";
        return;
    }

    const favorites = userSnap.data().favorites || [];
    if (favorites.length === 0) {
        document.getElementById("favorite-recipes").innerHTML = "<p>У вас нет избранных рецептов.</p>";
        return;
    }

    // Отображаем рецепты
    const container = document.getElementById("favorite-recipes");
    container.innerHTML = "";

    for (const recipeId of favorites) {
        const recipeRef = doc(db, "receptmain0", recipeId); // Подставь правильную коллекцию!
        const recipeSnap = await getDoc(recipeRef);

        if (!recipeSnap.exists()) continue;

        const recipe = recipeSnap.data();
        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");
        recipeCard.innerHTML = `
            <img src="${recipe.photo || 'placeholder.jpg'}" alt="${recipe.name}">
            <h3>${recipe.name}</h3>
            <p>${recipe.dis}</p>
            <button class="remove-fav" data-id="${recipeId}">❌ Удалить</button>
        `;
        container.appendChild(recipeCard);
    }

    // Добавляем обработчик для удаления
    document.querySelectorAll(".remove-fav").forEach(button => {
        button.addEventListener("click", async function () {
            const recipeId = this.dataset.id;
            await updateDoc(userRef, { favorites: arrayRemove(recipeId) });
            loadFavorites(); // Перезагружаем список
        });
    });
}

// Обработчик кнопки "Назад"
document.getElementById("back-button").addEventListener("click", function () {
    window.history.back();
});

// Загружаем рецепты при загрузке страницы
loadFavorites();
