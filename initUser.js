import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 🔹 Данные Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.firebasestorage.app",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// 🔹 Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Получаем ID пользователя Telegram
window.Telegram.WebApp.ready();
const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;

if (userId) {
    saveUserToFirebase(userId);
} else {
    console.error("Не удалось получить ID пользователя Telegram");
}

// 🔹 Функция сохранения пользователя в Firestore
async function saveUserToFirebase(userId) {
    const userRef = doc(db, "person", userId.toString());

    try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Если пользователя нет — создаём его
            await setDoc(userRef, {});
            console.log(`Пользователь ${userId} добавлен в Firebase`);
        } else {
            console.log(`Пользователь ${userId} уже существует в Firebase`);
        }
    } catch (error) {
        console.error("Ошибка при сохранении пользователя в Firebase:", error);
    }
}
