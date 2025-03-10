import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const IMGBB_API_KEY = "6353a9ccc652efaad72bf6c7b2b4fbf3"; // Вставь свой ключ от ImgBB

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

            console.log("Создаём документы в Firestore...");

            // Создаём документ в p_rec (только receptX)
            await setDoc(doc(db, "p_rec", recDocName), { name, dis, image: imageUrl, status: "pending" });

            // Создаём основной документ рецепта
            await setDoc(doc(db, receptMainName, "main"), { dis: about, name, porcii: portions, timemin: time });
            await setDoc(doc(db, receptMainName, "photo"), { url: imageUrl });

            // 📌 Продукты
            let prodData = {};
            document.querySelectorAll("#product-list .product-item").forEach((product, index) => {
                const title = product.querySelector("input:nth-of-type(1)").value.trim();
                const amount = product.querySelector("input:nth-of-type(2)").value.trim();
                const unit = product.querySelector("select").value; // Получаем выбранную единицу измерения
            
                if (title && amount) {
                    const formattedUnit = unit === "грамм" ? "г." : "шт."; // Преобразуем "грамм" в "г."
                    prodData[`${index + 1}`] = title;
                    prodData[`${index + 1}-1`] = `${amount} ${formattedUnit}`;
                }
            });
            console.log("✅ Продукты:", prodData);
            await setDoc(doc(db, receptMainName, "prod"), prodData);
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

            // 📌 Категории (type, type2, items) → сохраняем как отдельные поля
            await saveCategories(receptMainName, "type", ".filter-btn");
            await saveCategories(receptMainName, "type2", ".category-btn");
            await saveCategories(receptMainName, "items", ".tech-btn");

            console.log("🎉 Рецепт успешно сохранён!");

        } catch (error) {
            console.error("❌ Ошибка при создании рецепта:", error);
        }
    });

    // Функция для сохранения выбранных категорий в виде отдельных полей
    async function saveCategories(docName, fieldName, selector) {
        let selectedItems = Array.from(document.querySelectorAll(selector + ".selected")).map(btn => btn.textContent.trim());

        let categoryData = {};
        selectedItems.forEach((item, index) => {
            categoryData[`${fieldName}${index + 1}`] = item; // Генерируем ключи: type1, type2, type3...
        });

        console.log(`✅ ${fieldName}:`, categoryData);
        await setDoc(doc(db, docName, fieldName), categoryData);
    }

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
        setupMultiSelect(".tech-btn");     // Третья категория (оборудование)
    }, 500);
});
