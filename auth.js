import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

// Firebase конфигурация
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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Проверяем, где мы находимся (главная или login.html)
document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.getElementById("profile-btn");
    const googleLoginButton = document.getElementById("google-login");
    const backButton = document.getElementById("back-button");

    if (profileButton) {
        profileButton.addEventListener("click", () => {
            const userId = localStorage.getItem("userId");
            if (userId) {
                logout();
            } else {
                window.location.href = "login.html"; // Перенаправление на страницу авторизации
            }
        });
    }

    if (googleLoginButton) {
        googleLoginButton.addEventListener("click", login);
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            window.location.href = "index.html"; // Возврат на главную
        });
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            localStorage.setItem("userId", user.uid);
            document.getElementById("login-message").textContent = "Вы вошли!";
            setTimeout(() => {
                window.location.href = "index.html"; // После входа вернёмся на главную
            }, 1500);
        }
    });
});

// Функция входа через Google
async function login() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Вход выполнен:", user);
        localStorage.setItem("userId", user.uid);
        window.location.href = "index.html"; // Возвращаем на главную
    } catch (error) {
        console.error("Ошибка авторизации:", error);
    }
}

// Функция выхода
async function logout() {
    try {
        await signOut(auth);
        console.log("Выход выполнен.");
        localStorage.removeItem("userId");
        window.location.href = "index.html"; // Перенаправляем на главную
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
}
