// Подключаем Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Конфигурация Firebase (замени на свои данные!)
const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.firebasestorage.app",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Telegram Mini App API
window.Telegram.WebApp.ready();

// Получаем ID пользователя
const user = window.Telegram.WebApp.initDataUnsafe?.user;
if (user) {
    const userId = user.id;
    const userName = user.first_name || "Без имени";

    console.log("✅ ID пользователя:", userId);
    console.log("👤 Имя пользователя:", userName);
    alert("User ID: " + userId); // Покажет всплывающее окно (удали, если не нужно)

    // Функция для сохранения в Firebase
    async function saveUserToFirebase(userId, userName) {
        try {
            await setDoc(doc(db, "person", String(userId)), {
                name: userName,
                timestamp: new Date()
            });
            console.log("✅ Пользователь сохранён в Firebase!");
        } catch (error) {
            console.error("❌ Ошибка при сохранении в Firebase:", error);
        }
    }

    // Сохраняем пользователя в Firestore
    saveUserToFirebase(userId, userName);
} else {
    console.error("❌ ID пользователя не получен! Mini App, возможно, запущена вне Telegram.");
}
