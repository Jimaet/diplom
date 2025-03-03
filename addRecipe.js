import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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

            const name = nameInput.value.trim();
            const dis = disInput.value.substring(0, 120).trim();
            const about = aboutInput.value.trim();
            const portions = portionsInput.value.trim();
            const time = timeInput.value.trim();
            const imageFile = imageInput.files[0];

            if (!name || !dis || !about || !portions || !time || !imageFile) {
                console.error("Ошибка: все поля должны быть заполнены.");
                return;
            }

            const recRef = collection(db, "rec");
            const recSnapshot = await getDocs(recRef);
            const nextIndex = recSnapshot.size;
            const recDocName = `recept${nextIndex}`;
            const receptMainName = `receptmain${nextIndex}`;

            let imageUrl = await uploadImageToGitHub(imageFile, recDocName);
            if (!imageUrl) {
                console.error("Ошибка загрузки изображения. Прерываем выполнение.");
                return;
            }
            console.log("Изображение загружено:", imageUrl);

            await setDoc(doc(db, "rec", recDocName), { name, dis, image: imageUrl });
            await setDoc(doc(db, receptMainName, "main"), { dis: about, name, porcii: portions, timemin: time });
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
            await setDoc(doc(db, receptMainName, "prod"), prodData);

            let stepData = {};
            document.querySelectorAll("#step-list .step-item input").forEach((step, index) => {
                if (step.value.trim()) {
                    stepData[`${index + 1}`] = step.value.trim();
                }
            });
            await setDoc(doc(db, receptMainName, "step"), stepData);

            async function saveCategory(selector, docName) {
                let categoryData = {};
                document.querySelectorAll(selector).forEach((btn, index) => {
                    categoryData[`${index + 1}`] = btn.textContent.trim();
                });
                await setDoc(doc(db, receptMainName, docName), categoryData);
            }

            await saveCategory(".filter-btn.selected", "type");
            await saveCategory(".category-btn.selected", "type2");
            await saveCategory(".tech-btn.selected", "items");

            console.log("Рецепт успешно создан!");
        } catch (error) {
            console.error("Ошибка при создании рецепта:", error);
        }
    });

    async function uploadImageToGitHub(file, fileName) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = async function () {
                const base64Image = reader.result.split(',')[1];
                const githubApiUrl = `https://api.github.com/repos/Jimaet/diplom/contents/images/${fileName}.jpg`;
                const githubToken = YOUR_GITHUB_TOKEN; // <-- Передавай токен безопасно!
                try {
                    const response = await fetch(githubApiUrl, {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${githubToken}`,
                            "Accept": "application/vnd.github.v3+json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            message: `Добавлено изображение ${fileName}`,
                            content: base64Image
                        })
                    });
                    const result = await response.json();
                    if (response.ok && result.content?.download_url) {
                        resolve(result.content.download_url);
                    } else {
                        console.error("Ошибка загрузки на GitHub:", result);
                        reject(null);
                    }
                } catch (error) {
                    console.error("Ошибка сети или авторизации:", error);
                    reject(null);
                }
            };
            reader.readAsDataURL(file);
        });
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
