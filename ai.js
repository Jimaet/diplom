const API_KEY = "sk-2598f1e6d315481d835398d6ad6987f4"; // Замени на свой API-ключ
const API_URL = "https://api.deepseek.com"; // Проверь актуальный URL в документации

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
            model: "deepseek-chat",
            messages: [{ role: "user", content: userInput }]
        })
    })
    .then(response => response.json())
    .then(data => {
        let reply = data.choices[0]?.message?.content || "Ошибка ответа от ИИ";
        chatBox.innerHTML += `<p><strong>DeepSeek:</strong> ${reply}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => {
        console.error("Ошибка:", error);
        chatBox.innerHTML += `<p><strong>DeepSeek:</strong> Ошибка при получении ответа</p>`;
    });
}
