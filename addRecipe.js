// Инициализация Firebase
import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

            const recRef = collection(db, "rec");
            const recSnapshot = await getDocs(recRef);
            const nextIndex = recSnapshot.size;
            const recDocName = `recept${nextIndex}`;

            console.log("Создаём документ в rec:", recDocName);
            await setDoc(doc(db, "rec", recDocName), { name, dis, image: imageUrl });

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
            document.querySelectorAll("#product-list .product-item").forEach((product, index) => {
                const titleEl = product.querySelector("input:nth-of-type(1)");
                const weightEl = product.querySelector("input:nth-of-type(2)");

                console.log(`🟢 Найден продукт ${index + 1}:`, titleEl?.value, weightEl?.value);

                if (titleEl && weightEl) {
                    const title = titleEl.value.trim();
                    const weight = weightEl.value.trim();
                    if (title && weight) {
                        prodData[`${index + 1}`] = title;
                        prodData[`${index + 1}-1`] = weight;
                    }
                }
            });
            console.log("✅ Итоговый объект prodData:", prodData);
            await setDoc(doc(db, receptMainName, "prod"), prodData);

            // Добавляем шаги
            let stepData = {};
            document.querySelectorAll("#step-list .step-item input").forEach((step, index) => {
                if (step.value) {
                    stepData[`${index + 1}`] = step.value;
                }
            });
            console.log("Добавляем шаги:", stepData);
            await setDoc(doc(db, receptMainName, "step"), stepData);

            // Добавляем категории
            async function saveCategory(selector, docName) {
                let categoryData = {};
                document.querySelectorAll(selector).forEach((btn, index) => {
                    categoryData[`${index + 1}`] = btn.textContent.trim();
                });
                console.log(`Добавляем ${docName}:`, categoryData);
                await setDoc(doc(db, receptMainName, docName), categoryData);
            }

            await saveCategory(".filter-btn.selected", "type");
            await saveCategory(".category-btn.selected", "type2");
            await saveCategory(".multi-btn.selected", "items");

            console.log("Рецепт успешно создан!");
        } catch (error) {
            console.error("Ошибка при создании рецепта:", error);
        }
    });

    // Настройка множественного выбора
    function setupMultiSelect(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");
                console.log(`🔹 ${btn.textContent} ${btn.classList.contains("selected") ? "выбран" : "снят"}`);
            });
        });
    }

    setupMultiSelect(".filter-btn");   // Первая категория (карусель)
    setupMultiSelect(".category-btn"); // Вторая категория (например, горячее, закуски)
    setupMultiSelect(".multi-btn");    // Третья категория (оборудование)
});
