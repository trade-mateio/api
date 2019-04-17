### ДОСТУП
На сайте в личном кабинете вы получаете:
* `key` - который является конкатенацией режима работы канала (test|prod) и id канала
* `secret` - можно сгенерировать по кнопке в личном кабинете

### HEADERS
* `nonce : <number>` - Монотонно возрастающее значение
* `authKey : <string>` - Ваш ключ
* `authSignature : <string>` - Вычисляемая строка

### ПОЛУЧЕНИЕ authSignature
1. Гет параметры сортируем по алфавиту, и join'им их через ":"
3. Если есть body в POST/PATCH запросах то так же через ":" добавляем stringify(body) и после него ":"
4. Если body - нет, то просто будет "::"
5. Добавляем ваш secret
6. Шифруем это с sha256 и берем base64'шный digest

### ПРИМЕР
1. queryParams `{ nonce: 14892427427, a: 1, b: 2 }`
2. body `{ some_body: '2love' }`
3. Результирующая строка с body -   
`a:1:b:2:nonce:14892427427:{"some_body":"2love"}:rSfSzzNA97nNJSgc0aToSw==`
4. Результирующая строка без body - 
`a:1:b:2:nonce:14892427427::rSfSzzNA97nNJSgc0aToSw==`
5. И далее шифруем с sha256 секретом и берем с этого digest в base64

### Имеющиеся запросы соответствуют методам в примере:

# 1. getStats()
Получение статистических данных
* `score`
* `requestsPerMinute`
* `requestsLastMinute`
* `signalsPerDay`
* `signalsLastDay`
* лимиты по каналу в разрезе `exchanges` и `base_currencies`

# 2. getExchanges()
Получение списка доступных бирж


# 3. getSymbols()
Получение списка символов и их `symbolId`, для дальнейшего создания сигнала.


# 4. getSignals()
Получение списка текущих сигналов

Доступные фильтры в query:
* `active<bool>`
* `bought<bool>`
* `performance<str>, валидные значения : 'gain', 'loss'`
* `currency<bool>`
* `baseCurrency<str>`
* `exchangeId<id>`


# 5. getSignal(`signalId`)
Получение сигнал по `signalId`


# 6. makeSignal()
Создание сигнала
Пример запроса можно посмотреть в примере вызова, сейчас детали:

> Сигнал состоит из `actions`, эти действия имеют семантику `buys`, `takeProfits`, `stopLoss`.

* `buys<hashMap>`
* `takeProfits<hashMap>`
* `stopLoss<action>`, тк он единственен в рамках сигнала,
* где:
* * `key` это генерируемый вами id `action`'а, 
* * `value` сам обьект `action`.
* * * id - уникальный ключ в пределах действий сигнала

## В зависимости от того, в каком из ключей лежит `action` принимаются следующие необходимые поля:

Для buys
* type == `Buy` => `price`,
* type == `BuyIfAbove` => `price, threshold`
* type == `BuyIfBelow` => `price, threshold`

Для take profits
* type == `TakeProfitSell` => `threshold`
* type == `TakeProfitTrailingSell` => `threshold, trailing` (процент трейлинга в долях единицы, прим 3% => 0.03)

Для stop loss
* type == `StopLossSell` => `threshold`
* type == `StopLossTrailingSell` => `trailing` (относительная разница уровня стоп лосс и текущей рыночной цены, долях единицы, положительное значение)


# 7. updateSignal(`signalId`)
Редактирование сигнала

В buys, `takeProfits`, `stopLoss` надо передавать только то что подлежит изменению


# 8. panicSellSignal(`signalId`)
Паник селл/Закрытие сигнала

По всем вопросам https://t.me/dobrijvecher
