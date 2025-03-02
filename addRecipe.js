// Импорт Firebase
import { getFirestore, collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase-config"; // Убедись, что db экспортируется из firebase-config.js

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector(".submit-btn");
    submitButton?.addEventListener("click", async function () {
        const name = document.getElementById("recipe-name").value;
        const dis = document.getElementById("short-description").value;
        const portions = document.getElementById("portions").value;
        const time = document.getElementById("time").value;
        
        const products = document.querySelectorAll("#product-list .product-item");
        const steps = document.querySelectorAll("#step-list .step-item input");
        const selectedTypes = document.querySelectorAll(".filter-btn.selected");
        const selectedType2 = document.querySelectorAll(".category-btn.selected");
        const selectedItems = document.querySelectorAll(".multi-btn.selected");

        // Определяем следующий номер рецепта
        const recRef = collection(db, "rec");
        const recSnapshot = await getDocs(recRef);
        const nextIndex = recSnapshot.size; 
        const recDocName = `recept${nextIndex}`;

        // Создаём документ в коллекции "rec"
        await setDoc(doc(db, "rec", recDocName), {
            name,
            dis
        });

        // Создаём документ receptmainN
        const receptMainName = `receptmain${nextIndex}`;
        await setDoc(doc(db, receptMainName, "main"), {
            dis: "О рецепте",
            name,
            porcii: portions,
            timemin: time
        });

        await setDoc(doc(db, receptMainName, "photo"), { url: "" });

        // Добавляем продукты
        let prodData = {};
        products.forEach((product, index) => {
            const title = product.children[0].value;
            const weight = product.children[1].value;
            if (title && weight) {
                prodData[`${index + 1}`] = { title, weight };
            }
        });
        await setDoc(doc(db, receptMainName, "prod"), prodData);

        // Добавляем шаги
        let stepData = {};
        steps.forEach((step, index) => {
            stepData[`${index + 1}`] = step.value;
        });
        await setDoc(doc(db, receptMainName, "step"), stepData);

        // Категории
        let typeData = {};
        selectedTypes.forEach((btn, index) => {
            typeData[`${index + 1}`] = btn.textContent;
        });
        await setDoc(doc(db, receptMainName, "type"), typeData);

        let type2Data = {};
        selectedType2.forEach((btn, index) => {
            type2Data[`${index + 1}`] = btn.textContent;
        });
        await setDoc(doc(db, receptMainName, "type2"), type2Data);

        let itemsData = {};
        selectedItems.forEach((btn, index) => {
            itemsData[`${index + 1}`] = btn.textContent;
        });
        await setDoc(doc(db, receptMainName, "items"), itemsData);

        alert("Рецепт добавлен!");
    });
});
