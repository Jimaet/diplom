async function loadFavourites(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        const favourites = userData.favourites || [];

        const container = document.getElementById("favourites-container");
        container.innerHTML = ""; // Очищаем перед обновлением

        if (favourites.length === 0) {
            container.innerHTML = "<p>Нет избранных рецептов</p>";
            return;
        }

        favourites.forEach(receptID => {
            const recipeElement = document.createElement("div");
            recipeElement.textContent = `Рецепт: ${receptID}`;
            container.appendChild(recipeElement);
        });
    } else {
        console.log("Пользователь не найден.");
    }
}

// Вызов функции при загрузке страницы
loadFavourites("123456789");
