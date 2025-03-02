import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs } from "firebase/firestore";

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.appspot.com",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addRecipe(recipeData) {
    try {
        // Получаем количество существующих рецептов
        const recCollection = collection(db, "rec");
        const recSnapshot = await getDocs(recCollection);
        const nextRecId = `recept${recSnapshot.size}`;

        // Создаём документ в "rec"
        await setDoc(doc(db, "rec", nextRecId), {
            name: recipeData.name,
            dis: recipeData.description.substring(0, 120) // Обрезаем до 120 символов
        });

        // Определяем порядковый номер для receptmain
        const receptmainSnapshot = await getDocs(collection(db, "receptmain"));
        const nextReceptMainId = `receptmain${receptmainSnapshot.size}`;

        const receptmainRef = collection(db, nextReceptMainId);

        // Создаём документ main
        await setDoc(doc(receptmainRef, "main"), {
            dis: "О рецепте",
            name: recipeData.name,
            porcii: recipeData.portions,
            timemin: recipeData.time
        });

        // Создаём документ photo
        await setDoc(doc(receptmainRef, "photo"), {
            url: recipeData.photoUrl
        });

        // Создаём документ prod (ингредиенты)
        const prodData = {};
        recipeData.ingredients.forEach((item, index) => {
            const num = index + 1;
            prodData[num] = item.name;
            prodData[`${num}-${num}`] = item.amount;
        });
        await setDoc(doc(receptmainRef, "prod"), prodData);

        // Создаём документ step (шаги)
        const stepData = {};
        recipeData.steps.forEach((step, index) => {
            stepData[index + 1] = step;
        });
        await setDoc(doc(receptmainRef, "step"), stepData);

        // Создаём документ type (первая категория)
        const typeData = {};
        recipeData.category1.forEach((item, index) => {
            typeData[index + 1] = item;
        });
        await setDoc(doc(receptmainRef, "type"), typeData);

        // Создаём документ type2 (вторая категория)
        const type2Data = {};
        recipeData.category2.forEach((item, index) => {
            type2Data[index + 1] = item;
        });
        await setDoc(doc(receptmainRef, "type2"), type2Data);

        // Создаём документ items (третья категория)
        const itemsData = {};
        recipeData.category3.forEach((item, index) => {
            itemsData[index + 1] = item;
        });
        await setDoc(doc(receptmainRef, "items"), itemsData);

        console.log(`✅ Рецепт "${recipeData.name}" успешно добавлен в Firebase!`);
    } catch (error) {
        console.error("❌ Ошибка при добавлении рецепта:", error);
    }
}

// Пример данных для теста
const newRecipe = {
    name: "Борщ",
    description: "Вкусный украинский борщ с мясом.",
    portions: 4,
    time: 90,
    photoUrl: "https://example.com/photo.jpg",
    ingredients: [
        { name: "Картошка", amount: 400 },
        { name: "Свекла", amount: 200 }
    ],
    steps: [
        "Подготовьте необходимые ингредиенты.",
        "Очистите и нарежьте картошку."
    ],
    category1: ["Обед"],
    category2: ["Гарнир", "Напитки"],
    category3: ["Плита", "Духовка", "Миксер"]
};

// Вызов функции
addRecipe(newRecipe);
