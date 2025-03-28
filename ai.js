const API_URL = "/.netlify/functions/chat"; // Прокси-сервер через Netlify Functions

function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><strong>Вы:</strong> ${userInput}</p>`;
    document.getElementById("user-input").value = "";

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userInput }) // Отправляем данные на Netlify Function
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
