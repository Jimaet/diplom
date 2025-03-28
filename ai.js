const API_KEY = "AQVNzn4lu8GL0qtDP94czMV0uDfq9AuP8JqxqFxA"; // Замените на свой API-ключ Yandex
const API_URL = "https://llm.api.cloud.yandex.net"; // API-URL для YandexGPT

function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><strong>Вы:</strong> ${userInput}</p>`;
    document.getElementById("user-input").value = "";

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "yandex-gpt", // Указываем модель GPT от Yandex
            messages: [{ role: "user", content: userInput }],
            max_tokens: 100 // Ограничение на количество токенов
        })
    })
    .then(response => response.json())
    .then(data => {
        let reply = data.choices[0]?.message?.content || "Ошибка ответа от ИИ";
        chatBox.innerHTML += `<p><strong>Yandex GPT:</strong> ${reply}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => {
        console.error("Ошибка:", error);
        chatBox.innerHTML += `<p><strong>Yandex GPT:</strong> Ошибка при получении ответа</p>`;
    });
}
