import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔥 Firebase конфиг (замени на свой!)
const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.appspot.com",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// 🚀 Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Элементы страницы
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");
const userPic = document.getElementById("user-pic");
const userName = document.getElementById("user-name");

// Авторизация через Google
loginBtn.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Вход выполнен:", result.user);
    } catch (error) {
        console.error("Ошибка входа:", error);
    }
});

// Выход
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("✅ Выход выполнен");
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
});

// Проверяем статус пользователя
onAuthStateChanged(auth, (user) => {
    if (user) {
        userInfo.classList.remove("hidden");
        loginBtn.classList.add("hidden");
        userPic.src = user.photoURL;
        userName.textContent = `Привет, ${user.displayName}!`;
    } else {
        userInfo.classList.add("hidden");
        loginBtn.classList.remove("hidden");
    }
});
