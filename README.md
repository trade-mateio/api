trade-mate.io api version boilerplate

ДОСТУП
На сайте в личном кабинете вы получаете:
key который является конкатенацией режима работа канала (test|prod) и id канала
secret, который можно сгенерировать по кнопке

HEADERS
nonce : <number> Последовательно увеличиваемое значение
authKey : <string> Ваш ключ
authSignature : <string> Вычисляемая строка

ПОЛУЧЕНИЕ authSignature
1. Гет параметры сортируем по алфавиту
2. Джоиним их через ":" 
3.1 Если есть body в POST/PATCH запросах то так же через ":" добавляем стрингифаеный body и после него ":"
3.2 Если body - нет, то просто будет "::"
4. Далее добавляем ваш secret
5. Шифруем это с sha256 и берем "base64"-шный digest

ПРИМЕР
queryParams { nonce: 14892427427, a: 1, b: 2 }
body { some_body: '2love' }
Результирующая строка с body -   a:1:b:2:nonce:14892427427:{"some_body":"2love"}:rSfSzzNA97nNJSgc0aToSw==
Результирующая строка без body - a:1:b:2:nonce:14892427427::rSfSzzNA97nNJSgc0aToSw==
И далее шифруем с sha256 секретом и берем с этого digest в base64

Имеющиеся запросы

1. getStats()
Получаем статистические данные


2. getExchanges()
Получаем список доступных для создания сигналов бирж


3. getSymbols()
Получаем список символов с которыми можно сделать сигнал
Использования этого запроса необходимо для матчинга symbolId для создания сигнала


4. getSignals()
Получаем список наших текущих сигналов


5. getSignal(signalId)
Получаем сигнал по signalId


6. makeSignal()
Создание сигнала
Пример запроса можно посмотреть в примере вызова, сейчас детали:
Сигнал состоит из actions, эти действия имеют семантику buys, takeProfits, stopLoss
buys и takeProfits это hashMap, где key это генерируемый вами id action'а, а value сам обьект action
В зависимости от action.type принимаются следующие необходимые поля:

Для buys
type == Buy => price, 
type == BuyIfAbove => price, threshold
type == BuyIfBelow => price, threshold

Для take profits
type == TakeProfitSell => threshold
type == TakeProfitTrailingSell => threshold, trailing (процент трейлинга в долях единицы, прим 3% => 0.03)

Для stop loss
type == StopLossSell => threshold
type == StopLossTrailingSell => trailing (относительная разница уровня стоп лосс и текущей рыночной цены, долях единицы, положительное значение)


7. updateSignal()
Редактирование сигнала
В buys, takeProfits, stopLoss надо передавать только то что подлежит изменению


8. panicSellSignal()
Паник селл/Закрытие сигнала