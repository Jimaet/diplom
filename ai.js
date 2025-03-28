async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    const chatBox = document.getElementById('chat-box');
    
    // Отображаем сообщение пользователя
    chatBox.innerHTML += `<div class="user-message">${userInput}</div>`;
    
    // Очищаем поле ввода
    document.getElementById('user-input').value = '';

    // Отправляем запрос к Яндекс GPT API
    try {
        const response = await fetch('https://api.chat.yandex.net/gpt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'AQVNzn4lu8GL0qtDP94czMV0uDfq9AuP8JqxqFxA' // Замените на ваш API ключ
            },
            body: JSON.stringify({
                prompt: userInput,
                max_tokens: 150,
                temperature: 0.7
            })
        });
        const data = await response.json();

        // Проверяем наличие ответа
        if (data && data.choices && data.choices.length > 0) {
            const aiResponse = data.choices[0].text;
            // Отображаем ответ от AI
            chatBox.innerHTML += `<div class="ai-message">${aiResponse}</div>`;
        } else {
            chatBox.innerHTML += `<div class="ai-message">Что-то пошло не так, попробуйте снова.</div>`;
        }
    } catch (error) {
        chatBox.innerHTML += `<div class="ai-message">Ошибка: ${error.message}</div>`;
    }
}
