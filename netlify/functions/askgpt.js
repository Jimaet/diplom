export async function handler(event) {
    const { prompt } = JSON.parse(event.body);
  
    const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Authorization": "Bearer AQVNzn4lu8GL0qtDP94czMV0uDfq9AuP8JqxqFxA", // токен спрятан на серверной стороне
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelUri: "gpt://b1gcddg3cp5v2mjc8knl/yandexgpt-lite",
        completionOptions: {
          stream: false,
          temperature: 0.3,
          maxTokens: 1000,
        },
        messages: [
          { role: "system", text: "Привет" },
          { role: "user", text: prompt },
        ],
      }),
    });
  
    const data = await response.json();
  
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // разрешаем доступ с фронта
      },
      body: JSON.stringify({
        reply: data.result.alternatives[0].message.text,
      }),
    };
  }
  
