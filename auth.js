import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";

// Проверка загрузки скрипта
console.log("Файл auth.js загружен!");

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

// Проверяем, есть ли кнопка профиля
document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.getElementById("profile-btn");

    if (!profileButton) {
        console.error("Ошибка: Кнопка профиля (profile-btn) не найдена!");
        return;
    }

    profileButton.addEventListener("click", () => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            logout();
        } else {
            login();
        }
    });

    // Проверяем, авторизован ли пользователь
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Пользователь авторизован:", user.uid);
            localStorage.setItem("userId", user.uid);
            updateProfileButton(user);
        } else {
            console.log("Пользователь не авторизован.");
            localStorage.removeItem("userId");
            updateProfileButton(null);
        }
    });
});

// Функция входа
async function login() {
    try {
        console.log("Попытка входа...");
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Вход выполнен:", user);
        localStorage.setItem("userId", user.uid);
        updateProfileButton(user);
    } catch (error) {
        console.error("Ошибка авторизации:", error);
    }
}

// Функция выхода
async function logout() {
    try {
        console.log("Выход...");
        await signOut(auth);
        console.log("Выход выполнен.");
        localStorage.removeItem("userId");
        updateProfileButton(null);
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
}

// Функция обновления кнопки "Me"
function updateProfileButton(user) {
    const profileButton = document.getElementById("profile-btn");
    if (!profileButton) {
        console.error("Ошибка: Кнопка профиля (profile-btn) не найдена при обновлении!");
        return;
    }

    if (user) {
        profileButton.innerHTML = `<img src="${user.photoURL}" alt="Profile" class="profile-pic">`;
    } else {
        profileButton.innerHTML = `<img src="icons/profile.svg" alt="Me">`;
    }
}
