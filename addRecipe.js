import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const IMGBB_API_KEY = "6353a9ccc652efaad72bf6c7b2b4fbf3"; // Вставь свой ключ от ImgBB

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector(".submit-btn");

    submitButton?.addEventListener("click", async () => {
        try {
            console.log("Кнопка нажата, начинаем создание рецепта...");

            const nameInput = document.getElementById("recipe-name");
            const disInput = document.getElementById("short-description");
            const aboutInput = document.getElementById("about-recipe");
            const portionsInput = document.getElementById("portions");
            const timeInput = document.getElementById("time");
            const imageInput = document.getElementById("recipe-image");

            if (![nameInput, disInput, aboutInput, portionsInput, timeInput, imageInput].every(el => el)) {
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

            const prodData = collectInputs("#product-list .product-item", ["input:nth-of-type(1)", "input:nth-of-type(2)"]);
            console.log("✅ Продукты:", prodData);
            await setDoc(doc(db, receptMainName, "prod"), prodData);

            const stepData = collectInputs("#step-list .step-item input");
            console.log("✅ Шаги приготовления:", stepData);
            await setDoc(doc(db, receptMainName, "step"), stepData);

            await saveCategory(".filter-btn.selected", "type", receptMainName);
            await saveCategory(".category-btn.selected", "type2", receptMainName);
            await saveCategory(".tech-btn.selected", "items", receptMainName);

            console.log("🎉 Рецепт успешно создан!");
        } catch (error) {
            console.error("❌ Ошибка при создании рецепта:", error);
        }
    });

    async function uploadToImgBB(imageFile) {
        let formData = new FormData();
        formData.append("image", imageFile);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const result = await response.json();
        if (result.success) return result.data.url;
        throw new Error("Ошибка загрузки изображения на ImgBB");
    }

    function collectInputs(selector, childSelectors = []) {
        let data = {};
        document.querySelectorAll(selector).forEach((item, index) => {
            if (childSelectors.length) {
                childSelectors.forEach((child, i) => {
                    const el = item.querySelector(child);
                    if (el) data[`${index + 1}-${i + 1}`] = el.value.trim();
                });
            } else {
                if (item.value) data[`${index + 1}`] = item.value;
            }
        });
        return data;
    }

    async function saveCategory(selector, docName, receptMainName) {
        let categoryData = {};
        document.querySelectorAll(selector).forEach((btn, index) => {
            categoryData[`${index + 1}`] = btn.textContent.trim();
        });
        console.log(`✅ Категории ${docName}:`, categoryData);
        await setDoc(doc(db, receptMainName, docName), categoryData);
    }

    function setupMultiSelect(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");
                btn.style.backgroundColor = btn.classList.contains("selected") ? "#4CAF50" : "";
                btn.style.color = btn.classList.contains("selected") ? "#fff" : "";
            });
        });
    }

    setTimeout(() => {
        setupMultiSelect(".filter-btn");
        setupMultiSelect(".category-btn");
        setupMultiSelect(".tech-btn");
    }, 500);
});
