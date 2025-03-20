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

            await setDoc(doc(db, "p_rec", recDocName), { name, dis, image: imageUrl, status: "pending" });
            await setDoc(doc(db, receptMainName, "main"), { dis: about, name, porcii: portions, timemin: time });
            await setDoc(doc(db, receptMainName, "photo"), { url: imageUrl });

            let prodData = {};
            document.querySelectorAll("#product-list .product-item").forEach((product, index) => {
                const title = product.querySelector("input:nth-of-type(1)").value.trim();
                const amount = product.querySelector("input:nth-of-type(2)").value.trim();
                const unit = product.querySelector("select").value; 
            
                if (title && amount) {
                    const formattedUnit = unit === "грамм" ? "г." : "шт.";
                    prodData[`${index + 1}`] = title;
                    prodData[`${index + 1}-1`] = `${amount} ${formattedUnit}`;
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

    function setupMultiSelect(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("selected");

                if (btn.classList.contains("selected")) {
                    btn.style.backgroundColor = "#4CAF50";
                    btn.style.color = "#fff";
                } else {
                    btn.style.backgroundColor = "";
                    btn.style.color = "";
                }
            });
        });
    }

    setTimeout(() => {
        setupMultiSelect(".filter-btn");
        setupMultiSelect(".category-btn");
        setupMultiSelect(".tech-btn");
    }, 500);

    async function searchProducts(query) {
        if (query.length < 2) return [];
        let products = [];

        for (let i = 1; i <= 17; i++) {
            const docRef = collection(db, `products/${i}/items`);
            const querySnapshot = await getDocs(docRef);

            querySnapshot.forEach(doc => {
                const name = doc.data().name.toLowerCase();
                if (name.startsWith(query.toLowerCase())) {
                    products.push(name);
                }
            });
        }

        return products;
    }

    function setupAutocomplete(inputField) {
        const suggestionBox = document.createElement("div");
        suggestionBox.classList.add("suggestions");
        inputField.parentNode.appendChild(suggestionBox);

        inputField.addEventListener("input", async () => {
            const query = inputField.value.trim();
            suggestionBox.innerHTML = "";

            if (query.length < 2) return;

            const results = await searchProducts(query);
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

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("add-product").addEventListener("click", () => {
            setTimeout(() => {
                const newInput = document.querySelector("#product-list .product-item:last-child input[type='text']");
                if (newInput) setupAutocomplete(newInput);
            }, 100);
        });

        document.querySelectorAll("#product-list .product-item input[type='text']").forEach(setupAutocomplete);
    });
});
