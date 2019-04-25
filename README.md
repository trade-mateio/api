### API Documentation 

> trade-mate.io cryptocurrency trading platform with autotrade and copytrade functions.

![Imgur](https://i.imgur.com/Y334Jzp.png)

### ДОСТУП
On the website in Trader's Cabinet you need to generate your secrets for two modes "test" and "prod":

In test you can make integration works, and signals created in this mode wouldn't be available from other channe mode.
* `key` - looks like `channel_mode`(In lowercase) + `channel_id` Ex: prod156
* `secret` - Generate it in channel page

### QUERY 
Query of each request should have
* `nonce : <number>` - monotonically increasing value. Ex: `+new Date()`

### HEADERS
* `authKey : <string>` - You key
* `authSignature : <string>` - Calculated signature

### CALCULATE authSignature
1. Query params sorted alphabetically, join keys and values via ":"
3. If request has body in POST/PATCH request, then add it (stringify(body)) wrapped with ":"
4. If request has not body - "::"
5. Append secret
6. Use sha256 for resulted string and calculate digest in base64

### EXAMPLE authSignature
1. queryParams `{ nonce: 14892427427, a: 1, b: 2 }`
2. body `{ some_body: '2love' }`
3. Resulted string with body -   
`a:1:b:2:nonce:14892427427:{"some_body":"2love"}:rSfSzzNA97nNJSgc0aToSw==`
4. Resulted string without body - 
`a:1:b:2:nonce:14892427427::rSfSzzNA97nNJSgc0aToSw==`
5. Use sha256 for resulted string and calculate digest in base64

### Requests in documentation example:

# 1. getStats()
Get statistics info for channel
* `score` - calculated score of the channel
* `requestsPerMinute` - max requests limit per minute
* `requestsLastMinute` - number of requests last minute
* `signalsPerDay` - max signals per day
* `signalsLastDay` - number of created signals last day
* `maxActiveSignalsPerFeed` - max active signals per channel
* channel limits for `exchanges` and `base_currencies`. in limitRemaining field - 1 means 100%.
  * At the time the signal is created, the limit on this exchange and the base_currency is reduced by the amount of volume in the signal; when the signal is closed, the limit volume involved in the signal returns to the limit.
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
Get list of exchanges


# 3. getSymbols()
Get list of symbols and it's `symbolId`


# 4. getSignals()
Get channel signals

Available filters in query:
* `active<bool>`
* `bought<bool>`
* `performance<str>, valid values : 'gain', 'loss'`
* `currency<bool>`
* `baseCurrency<str>`
* `exchangeId<id>`


# 5. getSignal(`signalId`)
Get signal with `signalId`

`signalId` in `query`


# 6. makeSignal()
Signal creation
Request example into example file, here are details:

> Mandatory fields in `action`:
* `amount<number>|<str>` - 0 ~ 1
  * summary amount of `buys` should be equal to summary `amount` в `takeProfits` и в `stopLoss`,
* `type<str>`

> Signal is consists of `actions`, this actions has semantics like `buys`, `takeProfits`, `stopLoss`.

* `buys<hashMap<id, action>>`
* `takeProfits<hashMap<id, action>>`
* `stopLoss<action>`,
* where:
  * `key` generated by you id `action`, 
  * `value` - `action`.
    * id - unique key in signal (can be monotonically increasing value) 

## In case of what this `action` is, it has different values:

Fields:
* `price` - price buy/sell, if specified - it's MARKET order
* `threshold` - threshold price for activation `action`, using how stop price for `action` (STOP MARKET/LIMIT orders)
  * for `buys` mandatory only if `type` == `BuyIfAbove` || `BuyIfBelow`
  * for `takeProfits` и `stopLoss`, always mandatory
* `trailing` - available only for `takeProfits` и `stopLoss`
  * для `stopLoss` c `type == StopLossTrailingSell` this is the relative difference between the stop loss level and the current market price, in fractions of a unit, a positive value
  * для `takeProfits` с `type == TakeProfitTrailingSell` this is the percentage of trailing, 3% => 0.03
* `ladder` - available for `stopLoss`

For buys
* type == `Buy`
* type == `BuyIfAbove`, mandatory `threshold`
* type == `BuyIfBelow`, mandatory `threshold`

For take profits
* type == `TakeProfitSell`, mandatory `threshold`
* type == `TakeProfitTrailingSell`, mandatory `threshold, trailing`

For stop loss
* type == `StopLossSell`, mandatory `threshold`
* type == `StopLossTrailingSell`, mandatory `trailing`


# 7. updateSignal(`signalId`)
Signal update

> Mandatory fields 
* `signalId<str>`
* `action`:
  * `amount<number>|<str>`
  * `type<str>`
  * `editMode<str>`
    * `'create'`
    * `'replace'`
    * `'remove'`
      * Using this type of editMode, use just it in whole `action` object

In `buys`, `takeProfits`, `stopLoss` it is necessary to use only what is subject to change.


# 8. panicSellSignal(`signalId`)
Panic Sell/Clsoe signal

`signalId` in `query`

All questions - https://t.me/dobrijvecher
