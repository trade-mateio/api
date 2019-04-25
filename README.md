### ДОСТУП
На сайте в личном кабинете вы получаете:
* `key` - который является конкатенацией режима работы канала (test|prod) и id канала
* `secret` - можно сгенерировать по кнопке в личном кабинете

### QUERY 
В query каждого запроса добавляется
* `nonce : <number>` - Монотонно возрастающее значение

### HEADERS
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
* `score` - суммарный скор канала, в отношении к другим
* `requestsPerMinute` - лимит кол-ва запросов в минуту
* `requestsLastMinute` - кол-во сделанных запросов в минуту
* `signalsPerDay` - лимит кол-ва сигналов за день
* `signalsLastDay` - кол-во сделанных сигналов за день
* `maxActiveSignalsPerFeed` - максимальное кол-во активных сигналов по каналу
* лимиты по каналу в разрезе `exchanges` и `base_currencies`, показан остаток лимита, где максимум это 1, что равно 100%, 0.4 в примере это 40% остатка
  * В момент создания сигнала лимит по данной бирже и валютной паре уменьшается на величину обьема в сигнале, при закрытии сигнала - задействованный обьем в задаче возвращается в лимит.
  ```javascript 
  {
      "exchanges":{
          "4":{
              "baseCurrencies":{
                  "BTC":{
                      "limitRemaining":"0.40"
                  },
                  "ETH":{
                      "limitRemaining":"1"
                  }
              }
          }
      }
  }
  ```

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
`signalId` Передается в `query`


# 6. makeSignal()
Создание сигнала
Пример запроса можно посмотреть в примере вызова, сейчас детали:

> Обязательные поля в `action`:
* `amount<number>|<str>` - в долях 1
  * суммарный amount в `buys` должен быть равен суммарному `amount` в `takeProfits` и в `stopLoss`,
* `type<str>`

> Сигнал состоит из `actions`, эти действия имеют семантику `buys`, `takeProfits`, `stopLoss`.

* `buys<hashMap>`
* `takeProfits<hashMap>`
* `stopLoss<action>`, тк он единственен в рамках сигнала,
* где:
  * `key` это генерируемый вами id `action`'а, 
  * `value` сам обьект `action`.
    * id - уникальный ключ в пределах действий сигнала

## В зависимости от того, в каком из ключей лежит `action` принимаются следующие необходимые поля:

Общая концепция:
* `price` - цена покупки/продажи, если указана то будет выставлен Лимитный ордер
* `threshold` - цена активации `action`, используется как стоп цена срабатывания `action` для выставления ордера (Стоп маркетные и стоп лимитные ордера)
  * для `buys` обязательно только при `type` == `BuyIfAbove` || `BuyIfBelow`
  * для `takeProfits` и `stopLoss`, обязательно всегда
* `trailing` - доступно только для `takeProfits` и `stopLoss`
  * для `stopLoss` c `type == StopLossTrailingSell` это относительная разница уровня стоп лосс и текущей рыночной цены, в долях единицы, положительное значение
  * для `takeProfits` с `type == TakeProfitTrailingSell` это процент трейлинга в долях единицы, 3% => 0.03 
* `ladder` - доступно только для `stopLoss`, трейлинг лесенкой

Для buys
* type == `Buy`
* type == `BuyIfAbove`, обязательно `threshold`
* type == `BuyIfBelow`, обязательно `threshold`

Для take profits
* type == `TakeProfitSell`, обязательно `threshold`
* type == `TakeProfitTrailingSell`, обязательно `threshold, trailing`

Для stop loss
* type == `StopLossSell`, обязательно `threshold`
* type == `StopLossTrailingSell`, обязательно `trailing`


# 7. updateSignal(`signalId`)
Редактирование сигнала

> Обязательные поля 
* `signalId<str>`
* `action`:
  * `amount<number>|<str>`
  * `type<str>`
  * `editMode<str>`
    * `'create'`
    * `'replace'`
    * `'remove'`
      * При использовании этого типа в обьекте больше ничего передавать не надо

В `buys`, `takeProfits`, `stopLoss` надо передавать только то что подлежит изменению.


# 8. panicSellSignal(`signalId`)
Паник селл/Закрытие сигнала
`signalId` Передается в `query`

По всем вопросам https://t.me/dobrijvecher
