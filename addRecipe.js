// Инициализация Firebase
import { db } from "./firebase-config.js"; 
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector(".submit-btn");
    submitButton?.addEventListener("click", async function () {
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

        // Создаём документ в "rec"
        await setDoc(doc(db, "rec", recDocName), {
            name,
            dis,
            image: imageUrl
        });

        // Создаём коллекцию receptmainN
        const receptMainName = `receptmain${nextIndex}`;
        const receptMainRef = collection(db, receptMainName);

        await setDoc(doc(receptMainRef, "main"), {
            dis: "О рецепте",
            name,
            porcii: portions,
            timemin: time
        });

        await setDoc(doc(receptMainRef, "photo"), { url: imageUrl });

        // Добавляем продукты
        const prodRef = doc(receptMainRef, "prod");
        let prodData = {};
        products.forEach((product, index) => {
            const title = product.children[0].value;
            const weight = product.children[1].value;
            if (title && weight) {
                prodData[`${index + 1}`] = title;
                prodData[`${index + 1}-1`] = weight;
            }
        });
        await setDoc(prodRef, prodData);

        // Добавляем шаги
        const stepRef = doc(receptMainRef, "step");
        let stepData = {};
        steps.forEach((step, index) => {
            stepData[`${index + 1}`] = step.value;
        });
        await setDoc(stepRef, stepData);

        // Категории
        const typeRef = doc(receptMainRef, "type");
        let typeData = {};
        selectedTypes.forEach((btn, index) => {
            typeData[`${index + 1}`] = btn.textContent;
        });
        await setDoc(typeRef, typeData);

        const type2Ref = doc(receptMainRef, "type2");
        let type2Data = {};
        selectedType2.forEach((btn, index) => {
            type2Data[`${index + 1}`] = btn.textContent;
        });
        await setDoc(type2Ref, type2Data);

        const itemsRef = doc(receptMainRef, "items");
        let itemsData = {};
        selectedItems.forEach((btn, index) => {
            itemsData[`${index + 1}`] = btn.textContent;
        });
        await setDoc(itemsRef, itemsData);
    });
});
