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

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Получаем данные пользователя из Telegram Mini App
const userData = window.Telegram.WebApp.initDataUnsafe;
const userId = userData?.user?.id;
const userName = userData?.user?.first_name || "Неизвестный";

// Если есть ID пользователя — сохраняем в Firebase
if (userId) {
    saveUserToFirebase(userId, userName);
}

async function saveUserToFirebase(userId, userName) {
    try {
        const userRef = doc(db, "person", String(userId));
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                name: userName,
                favorites: {} // Создаём пустой объект для избранного
            });
            console.log(`✅ Пользователь ${userName} (ID: ${userId}) добавлен в Firebase.`);
        } else {
            console.log(`ℹ️ Пользователь ${userName} (ID: ${userId}) уже существует.`);
        }
    } catch (error) {
        console.error("🔥 Ошибка при сохранении пользователя:", error);
    }
}
