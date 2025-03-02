import { getFirestore, collection, doc, setDoc, getDocs } from "firebase/firestore";

const db = getFirestore();

async function addRecipe(recipeData) {
    // Получаем список существующих документов в коллекции "rec"
    const recCollection = collection(db, "rec");
    const recSnapshot = await getDocs(recCollection);
    const nextRecId = `recept${recSnapshot.size}`; // Определяем следующий порядковый номер

    // Создаём документ в "rec"
    await setDoc(doc(db, "rec", nextRecId), {
        name: recipeData.name,
        dis: recipeData.description.substring(0, 120) // Обрезаем до 120 символов
    });

    // Определяем следующий порядковый номер для receptmain
    const receptmainCollection = collection(db, "receptmain0"); // Просто получаем размер коллекции
    const receptmainSnapshot = await getDocs(receptmainCollection);
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

    console.log(`Рецепт "${recipeData.name}" успешно добавлен в Firebase!`);
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
