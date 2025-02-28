import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

// Firebase конфигурация (замени на свои данные из Firebase)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Функция для входа через Google
async function login() {
    try {
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
    if (user) {
        profileButton.innerHTML = `<img src="${user.photoURL}" alt="Profile" class="profile-pic">`;
    } else {
        profileButton.innerHTML = `<img src="icons/profile.svg" alt="Me">`;
    }
}

// Проверяем, авторизован ли пользователь
auth.onAuthStateChanged((user) => {
    updateProfileButton(user);
});

// Добавляем обработчик события для кнопки "Me"
document.getElementById("profile-btn").addEventListener("click", () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
        logout();
    } else {
        login();
    }
});
