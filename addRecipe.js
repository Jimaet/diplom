import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const IMGBB_API_KEY = "6353a9ccc652efaad72bf6c7b2b4fbf3"; // Вставь свой ключ от ImgBB
const TELEGRAM_BOT_TOKEN = "8028042723:AAEVS6TZ-2wTwBQXWDUu109Z3qIOBBzEbxA"; // Вставь свой токен бота
const TELEGRAM_CHAT_ID = "1217160426"; // Вставь ID чата

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector(".submit-btn");

    submitButton?.addEventListener("click", async function () {
    try {
        console.log("Кнопка нажата, начинаем создание рецепта...");

        const name = document.getElementById("recipe-name").value;
        const dis = document.getElementById("short-description").value.substring(0, 120);
        const about = document.getElementById("about-recipe").value;
        const portions = document.getElementById("portions").value;
        const time = document.getElementById("time").value;
        const imageFile = document.getElementById("recipe-image").files[0];

        if (!name || !dis || !about || !portions || !time || !imageFile) {
            console.error("Ошибка: заполнены не все поля.");
            return;
        }

        console.log("Загружаем изображение в ImgBB...");
        const imageUrl = await uploadToImgBB(imageFile);
        console.log("✅ Изображение загружено:", imageUrl);

        const nextIndex = await getNextRecipeNumber();
        const recDocName = `recept${nextIndex}`;
        const receptMainName = `receptmain${nextIndex}`;

        console.log("Создаём документ в Firestore:", recDocName);
        await setDoc(doc(db, "p_rec", recDocName), { name, dis, image: imageUrl, status: "pending" });

        console.log("Создаём коллекцию:", receptMainName);
        await setDoc(doc(db, receptMainName, "main"), { dis: about, name, porcii: portions, timemin: time });

        await setDoc(doc(db, receptMainName, "photo"), { url: imageUrl });

        // 📌 Продукты
        let prodData = {};
        document.querySelectorAll("#product-list .product-item").forEach((product, index) => {
            const title = product.querySelector("input:nth-of-type(1)").value.trim();
            const weight = product.querySelector("input:nth-of-type(2)").value.trim();
            if (title && weight) {
                prodData[`${index + 1}`] = title;
                prodData[`${index + 1}-1`] = weight;
            }
        });
        console.log("✅ Продукты:", prodData);
        await setDoc(doc(db, receptMainName, "prod"), prodData);

        // 📌 Шаги
        let stepData = {};
        document.querySelectorAll("#step-list .step-item input").forEach((step, index) => {
            if (step.value) {
                stepData[`${index + 1}`] = step.value;
            }
        });
        console.log("✅ Шаги приготовления:", stepData);
        await setDoc(doc(db, receptMainName, "step"), stepData);

        // 📌 Категории (type, type2, items)
        let type = [];
        document.querySelectorAll(".filter-btn.selected").forEach(btn => {
            type.push(btn.textContent.trim());
        });

        let type2 = [];
        document.querySelectorAll(".category-btn.selected").forEach(btn => {
            type2.push(btn.textContent.trim());
        });

        let items = [];
        document.querySelectorAll(".tech-btn.selected").forEach(btn => {
            items.push(btn.textContent.trim());
        });

        console.log("✅ Категории (type):", type);
        console.log("✅ Подкатегории (type2):", type2);
        console.log("✅ Техника (items):", items);

        await setDoc(doc(db, receptMainName, "categories"), { type, type2, items });

        await sendToTelegram(nextIndex, name, dis, about, time, portions, prodData, stepData, type, type2, items, imageUrl);

    } catch (error) {
        console.error("❌ Ошибка при создании рецепта:", error);
    }
});


    async function getNextRecipeNumber() {
        const usedNumbers = new Set();

        // Проверяем рецепты в p_rec
        const pRecSnapshot = await getDocs(collection(db, "p_rec"));
        pRecSnapshot.forEach((doc) => {
            const match = doc.id.match(/^recept(\d+)$/);
            if (match) usedNumbers.add(parseInt(match[1]));
        });

        // Проверяем рецепты в rec
        const recSnapshot = await getDocs(collection(db, "rec"));
        recSnapshot.forEach((doc) => {
            const match = doc.id.match(/^recept(\d+)$/);
            if (match) usedNumbers.add(parseInt(match[1]));
        });

        let newNumber = 1;
        while (usedNumbers.has(newNumber)) {
            newNumber += 1;
        }

        return newNumber;
    }

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

    async function sendToTelegram(recipeId, name, dis, about, time, portions, prodData, stepData, imageUrl) {
        const message = `📌 <b>Новый рецепт на модерацию</b>\n\n`
            + `🍽 <b>Название:</b> ${name}\n`
            + `📝 <b>Описание:</b> ${dis}\n`
            + `📖 <b>О рецепте:</b> ${about}\n`
            + `⏳ <b>Время:</b> ${time} мин\n`
            + `🍴 <b>Порции:</b> ${portions}\n\n`
            + `📌 <b>Шаги:</b>\n${Object.entries(stepData).map(([key, value]) => `➡️ ${key}. ${value}`).join("\n")}`;

        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

        await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                photo: imageUrl,
                caption: message,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "✅ Подтвердить", callback_data: `approve_${recipeId}` }],
                        [{ text: "❌ Отклонить", callback_data: `reject_${recipeId}` }]
                    ]
                }
            })
        });
    }
});




    function setupMultiSelect(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => {
                console.log(`🔹 Нажата кнопка: ${btn.textContent.trim()}`);
                btn.classList.toggle("selected");

                if (btn.classList.contains("selected")) {
                    btn.style.backgroundColor = "#4CAF50"; // Выбранный цвет
                    btn.style.color = "#fff";
                } else {
                    btn.style.backgroundColor = ""; // Вернуть стандартный стиль
                    btn.style.color = "";
                }

                console.log(`📌 ${btn.textContent.trim()} теперь ${btn.classList.contains("selected") ? "выбран" : "снят"}`);

            });
        });
    }

    // Дожидаемся полной загрузки DOM перед навешиванием событий
    setTimeout(() => {
        setupMultiSelect(".filter-btn");   // Первая категория (карусель)
        setupMultiSelect(".category-btn"); // Вторая категория (например, горячее, закуски)
        setupMultiSelect(".tech-btn");    // Третья категория (оборудование)
    }, 500);

