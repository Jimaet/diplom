// Инициализация Firebase
import { db } from "./firebase-config.js"; 
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
            const imageUrl = document.getElementById("recipe-image").value || "";
            
            const products = document.querySelectorAll("#product-list .product-item");
            const steps = document.querySelectorAll("#step-list .step-item input");
            const selectedTypes = document.querySelectorAll(".filter-btn.selected");
            const selectedType2 = document.querySelectorAll(".category-btn.selected");
            const selectedItems = document.querySelectorAll(".multi-btn.selected");
            
            // Определяем следующий номер рецепта
            const recRef = collection(db, "rec");
            const recSnapshot = await getDocs(recRef);
            const nextIndex = recSnapshot.size; // Кол-во документов = следующий индекс
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
                const title = product.children[0].value;
                const weight = product.children[1].value;
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
                stepData[`${index + 1}`] = step.value;
            });
            console.log("Добавляем шаги:", stepData);
            await setDoc(doc(db, receptMainName, "step"), stepData);
            
            // Категории
            let typeData = {};
            selectedTypes.forEach((btn, index) => {
                typeData[`${index + 1}`] = btn.textContent;
            });
            console.log("Добавляем категорию type:", typeData);
            await setDoc(doc(db, receptMainName, "type"), typeData);
            
            let type2Data = {};
            selectedType2.forEach((btn, index) => {
                type2Data[`${index + 1}`] = btn.textContent;
            });
            console.log("Добавляем категорию type2:", type2Data);
            await setDoc(doc(db, receptMainName, "type2"), type2Data);
            
            let itemsData = {};
            selectedItems.forEach((btn, index) => {
                itemsData[`${index + 1}`] = btn.textContent;
            });
            console.log("Добавляем оборудование items:", itemsData);
            await setDoc(doc(db, receptMainName, "items"), itemsData);
            
            console.log("Рецепт успешно создан!");
        } catch (error) {
            console.error("Ошибка при создании рецепта:", error);
        }
    });
});
