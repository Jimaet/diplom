// Инициализация Firebase
import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
document.querySelectorAll('.tech-btn').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('selected');
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector(".submit-btn");
    submitButton?.addEventListener("click", async function () {
        try {
            console.log("Кнопка нажата, начинаем создание рецепта...");

            const nameInput = document.getElementById("recipe-name");
            const disInput = document.getElementById("short-description");
            const aboutInput = document.getElementById("about-recipe");
            const portionsInput = document.getElementById("portions");
            const timeInput = document.getElementById("time");
            const imageUrlInput = document.getElementById("recipe-image");

            if (!nameInput || !disInput || !aboutInput || !portionsInput || !timeInput) {
                console.error("Ошибка: один из обязательных элементов не найден.");
                return;
            }

            const name = nameInput.value;
            const dis = disInput.value.substring(0, 120);
            const about = aboutInput.value;
            const portions = portionsInput.value;
            const time = timeInput.value;
            const imageUrl = imageUrlInput ? imageUrlInput.value : "";

            const products = document.querySelectorAll("#product-list .product-item");
            const steps = document.querySelectorAll("#step-list .step-item input");

            // Исправленный множественный выбор категорий
            const selectedTypes = [...document.querySelectorAll(".filter-btn.selected")].map(btn => btn.textContent);
            const selectedType2 = [...document.querySelectorAll(".category-btn.selected")].map(btn => btn.textContent);
            const selectedItems = [...document.querySelectorAll(".multi-btn.selected")].map(btn => btn.textContent);

            // Определяем следующий номер рецепта
            const recRef = collection(db, "rec");
            const recSnapshot = await getDocs(recRef);
            const nextIndex = recSnapshot.size;
            const recDocName = `recept${nextIndex}`;

            console.log("Создаём документ в rec:", recDocName);
            await setDoc(doc(db, "rec", recDocName), { name, dis, image: imageUrl });

            // Создаём коллекцию receptmainN
            const receptMainName = `receptmain${nextIndex}`;
            console.log("Создаём коллекцию:", receptMainName);

            await setDoc(doc(db, receptMainName, "main"), {
                dis: "О рецепте",
                name,
                porcii: portions,
                timemin: time
            });

            await setDoc(doc(db, receptMainName, "photo"), { url: imageUrl });

            // Добавляем продукты
            let prodData = {};
            products.forEach((product, index) => {
                const title = product.querySelector(".product-title")?.value;
                const weight = product.querySelector(".product-weight")?.value;
                if (title && weight) {
                    prodData[`${index + 1}`] = title;
                    prodData[`${index + 1}-1`] = weight;
                }
            });
            console.log("Добавляем продукты:", prodData);
            await setDoc(doc(db, receptMainName, "prod"), prodData);

            // Добавляем шаги
            let stepData = {};
            steps.forEach((step, index) => {
                if (step.value) {
                    stepData[`${index + 1}`] = step.value;
                }
            });
            console.log("Добавляем шаги:", stepData);
            await setDoc(doc(db, receptMainName, "step"), stepData);

            // Добавляем первую категорию (карусель)
            let typeData = {};
            selectedTypes.forEach((text, index) => {
                typeData[`${index + 1}`] = text;
            });
            console.log("Добавляем категорию type:", typeData);
            await setDoc(doc(db, receptMainName, "type"), typeData);

            // Добавляем вторую категорию (например, горячее, закуски и т. д.)
            let type2Data = {};
            selectedType2.forEach((text, index) => {
                type2Data[`${index + 1}`] = text;
            });
            console.log("Добавляем категорию type2:", type2Data);
            await setDoc(doc(db, receptMainName, "type2"), type2Data);

            // Добавляем третью категорию (оборудование)
            let itemsData = {};
            selectedItems.forEach((text, index) => {
                itemsData[`${index + 1}`] = text;
            });
            console.log("Добавляем оборудование items:", itemsData);
            await setDoc(doc(db, receptMainName, "items"), itemsData);

            console.log("Рецепт успешно создан!");
        } catch (error) {
            console.error("Ошибка при создании рецепта:", error);
        }
    });

    // Добавляем логику множественного выбора для категорий
    function setupMultiSelect(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");
            });
        });
    }

    setupMultiSelect(".filter-btn");   // Первая категория (карусель)
    setupMultiSelect(".category-btn"); // Вторая категория (например, горячее, закуски)
    setupMultiSelect(".multi-btn");    // Третья категория (оборудование)
});
