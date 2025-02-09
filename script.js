const apiKey = '50f37a15c54712fcfbfe1291';  
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;

const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const amount = document.getElementById('amount');
const convertBtn = document.getElementById('convertBtn');
const result = document.getElementById('result');

const currencies = ['USD', 'EUR', 'RUB', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD']; 

currencies.forEach(currency => {
    const option1 = document.createElement('option');
    const option2 = document.createElement('option');
    option1.value = option2.value = currency;
    option1.textContent = option2.textContent = currency;
    fromCurrency.appendChild(option1);
    toCurrency.appendChild(option2);
});

fromCurrency.value = 'USD';
toCurrency.value = 'RUB';

convertBtn.addEventListener('click', async () => {
    const amountValue = parseFloat(amount.value);
    if (isNaN(amountValue) || amountValue <= 0) {
        result.textContent = "Введите корректную сумму!";
        return;
    }

    const from = fromCurrency.value;
    const to = toCurrency.value;

    try {
        const response = await fetch(apiUrl + from);
        const data = await response.json();

        if (data.result !== "success") {
            result.textContent = "Ошибка: " + (data['error-type'] || "Неизвестная ошибка");
            return;
        }

        const rate = data.conversion_rates[to];

        if (!rate) {
            result.textContent = "Ошибка при получении курса валют!";
            return;
        }

        const convertedAmount = (amountValue * rate).toFixed(2);
        result.textContent = `${amountValue} ${from} ≈ ${convertedAmount} ${to}`;
    } catch (error) {
        result.textContent = "Ошибка соединения с API!";
    }
});
