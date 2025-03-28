const axios = require('axios');

const API_KEY = 'AQVNzn4lu8GL0qtDP94czMV0uDfq9AuP8JqxqFxA'; // Замените на ваш API-ключ Yandex
const API_URL = 'https://llm.api.cloud.yandex.net/v1/chat/completions'; // URL для YandexGPT

exports.handler = async (event, context) => {
    try {
        const { userInput } = JSON.parse(event.body);

        const response = await axios.post(API_URL, {
            model: 'yandex-gpt',
            messages: [{ role: 'user', content: userInput }],
            max_tokens: 100,
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        console.error('Ошибка при запросе к Yandex API:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ошибка при запросе к Yandex API' }),
        };
    }
};
