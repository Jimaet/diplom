import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const IMGBB_API_KEY = "6353a9ccc652efaad72bf6c7b2b4fbf3";
let cachedProducts = new Set();

document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts();

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

            await setDoc(doc(db, "p_rec", recDocName), { name, dis, image: imageUrl, status: "pending" });
            await setDoc(doc(db, receptMainName, "main"), { dis: about, name, porcii: portions, timemin: time });
            await setDoc(doc(db, receptMainName, "photo"), { url: imageUrl });

            let prodData = {};
            let usedProducts = new Set(await loadProducts());
            let newProducts = {};

            document.querySelectorAll("#product-list .product-item").forEach((product, index) => {
                const title = product.querySelector("input:nth-of-type(1)").value.trim();
                const amount = product.querySelector("input:nth-of-type(2)").value.trim();
                const unit = product.querySelector("select").value; 

                if (title && amount) {
                    const formattedUnit = unit === "грамм" ? "г." : "шт.";
                    prodData[`${index + 1}`] = title;
                    prodData[`${index + 1}-1`] = `${amount} ${formattedUnit}`;

                    if (!usedProducts.has(title)) {
                        newProducts[title] = title;
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

            await saveCategories(receptMainName, "type", ".filter-btn");
            await saveCategories(receptMainName, "type2", ".category-btn");
            await saveCategories(receptMainName, "items", ".tech-btn");

            if (Object.keys(newProducts).length > 0) {
                console.log("➕ Добавляем новые продукты в products/18...");
                await setDoc(doc(db, "products", "18"), newProducts, { merge: true });
            }

            console.log("🎉 Рецепт успешно сохранён!");

        } catch (error) {
            console.error("❌ Ошибка при создании рецепта:", error);
        }
    });

    async function saveCategories(docName, fieldName, selector) {
        let selectedItems = Array.from(document.querySelectorAll(selector + ".selected")).map(btn => btn.textContent.trim());
        let categoryData = {};

        selectedItems.forEach((item, index) => {
            categoryData[`${fieldName}${index + 1}`] = item;
        });

        console.log(`✅ ${fieldName}:`, categoryData);
        await setDoc(doc(db, docName, fieldName), categoryData);
    }

    async function getNextRecipeNumber() {
        const usedNumbers = new Set();

        const pRecSnapshot = await getDocs(collection(db, "p_rec"));
        pRecSnapshot.forEach((doc) => {
            const match = doc.id.match(/^recept(\d+)$/);
            if (match) usedNumbers.add(parseInt(match[1]));
        });

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

    async function loadProducts() {
        console.log("📥 Загружаем продукты в кэш...");
        let productSet = new Set();
    
        for (let i = 1; i <= 18; i++) {
            const docRef = doc(db, "products", `${i}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                Object.values(docSnap.data()).forEach(product => productSet.add(product));
            }
        }
    
        cachedProducts = productSet; // сохраняем загруженные продукты
        console.log("✅ Продукты загружены в кэш:", cachedProducts);
        return productSet;
    }

    function searchProducts(query) {
        if (query.length < 2) return [];
        if (!cachedProducts || cachedProducts.size === 0) return [];

        return Array.from(cachedProducts).filter(name => 
            name.toLowerCase().startsWith(query.toLowerCase())
        );
    }

    function setupAutocomplete(inputField) {
        const suggestionBox = document.createElement("div");
        suggestionBox.classList.add("suggestions");
        inputField.parentNode.appendChild(suggestionBox);

        inputField.addEventListener("input", () => {
            const query = inputField.value.trim();
            suggestionBox.innerHTML = "";

            if (query.length < 2) return;

            const results = searchProducts(query);
            console.log(`📋 Подсказки для ${query}:`, results);

            results.forEach(product => {
                const item = document.createElement("div");
                item.classList.add("suggestion-item");
                item.textContent = product;
                item.addEventListener("click", () => {
                    inputField.value = product;
                    suggestionBox.innerHTML = "";
                });
                suggestionBox.appendChild(item);
            });
        });

        document.addEventListener("click", (e) => {
            if (!suggestionBox.contains(e.target) && e.target !== inputField) {
                suggestionBox.innerHTML = "";
            }
        });
    }

    document.getElementById("add-product").addEventListener("click", () => {
        setTimeout(() => {
            const newInput = document.querySelector("#product-list .product-item:last-child input[type='text']");
            if (newInput) {
                console.log("🆕 Добавлено новое поле, подключаем автодополнение...");
                setupAutocomplete(newInput);
            }
        }, 100);
    });

    function setupMultiSelect(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");
            });
        });
    }

    setupMultiSelect(".filter-btn");
    setupMultiSelect(".category-btn");
    setupMultiSelect(".tech-btn");
});
