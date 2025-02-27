document.addEventListener("DOMContentLoaded", function () {
    function enableCarouselScrolling(carousel) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            carousel.style.scrollBehavior = "auto";
        });

        carousel.addEventListener("mouseleave", () => {
            isDown = false;
        });

        carousel.addEventListener("mouseup", () => {
            isDown = false;
        });

        carousel.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        });

        // Поддержка мобильного свайпа (плавная)
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
            carousel.style.scrollBehavior = "auto";
        });

        carousel.addEventListener("touchmove", (e) => {
            touchEndX = e.touches[0].clientX;
            let moveX = touchStartX - touchEndX;
            carousel.scrollLeft += moveX * 1.5;
            touchStartX = touchEndX;
        });

        carousel.addEventListener("touchend", () => {
            carousel.style.scrollBehavior = "smooth";
        });
    }

    const carousels = document.querySelectorAll(".carousel-container");
    carousels.forEach(enableCarouselScrolling);
});
function addToFavourites(recipeId) {
    let userId = Telegram.WebApp.initDataUnsafe.user.id; // Получаем ID пользователя

    if (!userId) {
        alert("Ошибка: не удалось получить Telegram ID!");
        return;
    }

    firebase.database().ref(`person/${userId}/favourites/${recipeId}`).set(true)
        .then(() => {
            alert("✅ Рецепт добавлен в избранное!");
        })
        .catch(error => {
            console.error("Ошибка при добавлении в избранное:", error);
        });
}
function removeFromFavourites(recipeId) {
    let userId = Telegram.WebApp.initDataUnsafe.user.id;

    if (!userId) {
        alert("Ошибка: не удалось получить Telegram ID!");
        return;
    }

    firebase.database().ref(`person/${userId}/favourites/${recipeId}`).remove()
        .then(() => {
            alert("❌ Рецепт удалён из избранного!");
        })
        .catch(error => {
            console.error("Ошибка при удалении из избранного:", error);
        });
}
function toggleFavourite(recipeId, button) {
    let userId = Telegram.WebApp.initDataUnsafe.user.id;

    if (!userId) {
        alert("Ошибка: не удалось получить Telegram ID!");
        return;
    }

    let favRef = firebase.database().ref(`person/${userId}/favourites/${recipeId}`);

    favRef.get().then(snapshot => {
        if (snapshot.exists()) {
            // Уже в избранном — удаляем
            favRef.remove().then(() => {
                button.textContent = "🤍 Добавить";
                alert("❌ Рецепт удалён из избранного!");
            });
        } else {
            // Добавляем в избранное
            favRef.set(true).then(() => {
                button.textContent = "❤️ В избранном";
                alert("✅ Рецепт добавлен в избранное!");
            });
        }
    }).catch(error => {
        console.error("Ошибка:", error);
    });
}
