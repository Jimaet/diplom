import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const IMGBB_API_KEY = "6353a9ccc652efaad72bf6c7b2b4fbf3"; // Вставь свой ключ от ImgBB
const TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"; // Вставь свой токен бота
const TELEGRAM_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID"; // Вставь ID чата

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
            const imageInput = document.getElementById("recipe-image");

            if (!nameInput || !disInput || !aboutInput || !portionsInput || !timeInput || !imageInput) {
                console.error("Ошибка: один из обязательных элементов не найден.");
                return;
            }

            const name = nameInput.value;
            const dis = disInput.value.substring(0, 120);
            const about = aboutInput.value;
            const portions = portionsInput.value;
            const time = timeInput.value;
            const imageFile = imageInput.files[0];

            if (!imageFile) {
                console.error("Ошибка: изображение не выбрано.");
                return;
            }

            console.log("Загружаем изображение в ImgBB...");
            const imageUrl = await uploadToImgBB(imageFile);
            console.log("✅ Изображение загружено:", imageUrl);

            const recRef = collection(db, "rec");
            const recSnapshot = await getDocs(recRef);
            const nextIndex = recSnapshot.size;
            const recDocName = `recept${nextIndex}`;
            const receptMainName = `receptmain${nextIndex}`;

            console.log("Создаём документ в Firestore:", recDocName);
            await setDoc(doc(db, "rec", recDocName), { name, dis, image: imageUrl });

            console.log("Создаём коллекцию:", receptMainName);
            await setDoc(doc(db, receptMainName, "main"), {
                dis: about,
                name,
                porcii: portions,
                timemin: time
            });

            await setDoc(doc(db, receptMainName, "photo"), { url: imageUrl });

            let prodData = {};
            document.querySelectorAll("#product-list .product-item").forEach((product, index) => {
                const titleEl = product.querySelector("input:nth-of-type(1)");
                const weightEl = product.querySelector("input:nth-of-type(2)");
                if (titleEl && weightEl) {
                    const title = titleEl.value.trim();
                    const weight = weightEl.value.trim();
                    if (title && weight) {
                        prodData[`${index + 1}`] = title;
                        prodData[`${index + 1}-1`] = weight;
                    }
                }
            });
            console.log("✅ Продукты:", prodData);
            await setDoc(doc(db, receptMainName, "prod"), prodData);

            let stepData = {};
            document.querySelectorAll("#step-list .step-item input").forEach((step, index) => {
                if (step.value) {
                    stepData[`${index + 1}`] = step.value;
                }
            });
            console.log("✅ Шаги приготовления:", stepData);
            await setDoc(doc(db, receptMainName, "step"), stepData);

            async function saveCategory(selector, docName) {
                let categoryData = {};
                document.querySelectorAll(selector).forEach((btn, index) => {
                    categoryData[`${index + 1}`] = btn.textContent.trim();
                });
                console.log(`✅ Категории ${docName}:", categoryData);
                await setDoc(doc(db, receptMainName, docName), categoryData);
            }

            await saveCategory(".filter-btn.selected", "type");
            await saveCategory(".category-btn.selected", "type2");
            await saveCategory(".tech-btn.selected", "items");

            console.log("🎉 Рецепт успешно создан!");

            await sendToTelegram(name, dis, about, time, portions, prodData, stepData, imageUrl);

        } catch (error) {
            console.error("❌ Ошибка при создании рецепта:", error);
        }
    });

    async function uploadToImgBB(imageFile) {
        let formData = new FormData();
        formData.append("image", imageFile);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const result = await response.json();
        if (result.success) {
            return result.data.url;
        } else {
            throw new Error("Ошибка загрузки изображения на ImgBB");
        }
    }

    async function sendToTelegram(name, dis, about, time, portions, prodData, stepData, imageUrl) {
        const message = `Название рецепта: ${name}\nОписание краткое: ${dis}\nО рецепте: ${about}\nВремя: ${time}\nПорции: ${portions}\nПродукты: ${JSON.stringify(prodData, null, 2)}\nШаги: ${JSON.stringify(stepData, null, 2)}`;
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" })
        });
    }

    setTimeout(() => {
        setupMultiSelect(".filter-btn");
        setupMultiSelect(".category-btn");
        setupMultiSelect(".tech-btn");
    }, 500);
});
