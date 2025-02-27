document.addEventListener("DOMContentLoaded", function () {
    // Подключение к Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Получаем Telegram ID пользователя
    window.Telegram.WebApp.ready();
    const userTelegramId = window.Telegram.WebApp.initDataUnsafe?.user?.id;

    if (!userTelegramId) {
        console.error("Не удалось получить Telegram ID пользователя");
        return;
    }

    // Функция для работы с лайками
    async function toggleFavorite(recipeId, button) {
        if (!userTelegramId) return;

        const userRef = db.collection("users").doc(String(userTelegramId));

        try {
            const doc = await userRef.get();
            let favorites = doc.exists && doc.data().favorites ? doc.data().favorites : [];

            if (favorites.includes(recipeId)) {
                // Удаляем из избранного
                await userRef.update({
                    favorites: firebase.firestore.FieldValue.arrayRemove(recipeId)
                });
                button.classList.remove("active"); // Сердечко белое
            } else {
                // Добавляем в избранное
                await userRef.set({
                    favorites: firebase.firestore.FieldValue.arrayUnion(recipeId)
                }, { merge: true });
                button.classList.add("active"); // Сердечко красное
            }
        } catch (error) {
            console.error("Ошибка при обновлении избранного:", error);
        }
    }

    // Подключение кнопок ко всем карточкам рецептов
    document.querySelectorAll(".favorite-button").forEach(button => {
        button.addEventListener("click", () => {
            const recipeId = button.dataset.recipeId;
            toggleFavorite(recipeId, button);
        });
    });
});
