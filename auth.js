const firebaseConfig = {
    apiKey: "AIzaSyDqIDTQrS14wTLsh_jFkD0GZAmEEWW8TDk",
    authDomain: "cooker-62216.firebaseapp.com",
    projectId: "cooker-62216",
    storageBucket: "cooker-62216.firebasestorage.app",
    messagingSenderId: "994568659489",
    appId: "1:994568659489:web:18c15bc15fa5b723a03960"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Проверка авторизации при загрузке страницы
auth.onAuthStateChanged(user => {
    if (!user) {
        // Если пользователь не авторизован, отправляем на login.html
        if (window.location.pathname !== '/login.html') {
            window.location.href = 'login.html';
        }
    } else {
        console.log('Пользователь авторизован:', user.displayName);
    }
});

// Авторизация через Google
document.getElementById('google-login')?.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then(async (result) => {
            const user = result.user;
            if (!user) return;

            // Проверяем, есть ли пользователь в БД
            const userRef = db.collection('users').doc(user.uid);
            const doc = await userRef.get();

            if (!doc.exists) {
                // Добавляем нового пользователя в БД
                await userRef.set({
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Обновляем дату последнего входа
                await userRef.update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            alert('Вы вошли как ' + user.displayName);
        })
        .catch(error => console.error('Ошибка входа:', error));
});

// Выход из аккаунта
document.getElementById('logout')?.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            alert('Вы вышли из аккаунта');
            window.location.href = 'login.html'; // Перенаправляем на страницу входа
        })
        .catch(error => console.error('Ошибка выхода:', error));
});
