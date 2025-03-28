const API_KEY = "YOUR_COHERE_API_KEY"; // Замените на свой API-ключ Cohere
const API_URL = "https://api.cohere.ai/v1/chat/completions"; // URL для Cohere API

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
            model: "command-r-plus", // Используем модель Command R+
            messages: [{ role: "user", content: userInput }],
            max_tokens: 100
        })
    })
    .then(response => response.json())
    .then(data => {
        let reply = data.choices[0]?.message?.content || "Ошибка ответа от ИИ";
        chatBox.innerHTML += `<p><strong>Cohere:</strong> ${reply}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => {
        console.error("Ошибка:", error);
        chatBox.innerHTML += `<p><strong>Cohere:</strong> Ошибка при получении ответа</p>`;
    });
}
