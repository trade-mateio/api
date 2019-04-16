var crypto = require('crypto');
var request = require('request');
var async = require('async');

var URL = 'https://cryptex.alterspace.info/api/bot/v1';

var key = 'prod156';
var secret = 'L2ztJQOYE0rndyCINU6taw==';

// var key = 'test156';
// var secret = 'rSfSzzNA97nNJSgc0aToSw==';

let tmApi = {
    api : {
        getExchanges : function() {
           let nonce = tmApi.utils.getNonce();
            let url = URL + '/exchanges';
            let parameters = { nonce };
            url = tmApi.utils.addParameters(url, parameters);
            let options = {
                method : 'GET',
                url : url,
                headers : {
                    authKey : key,
                    authSignature : tmApi.utils.makeHash(parameters),
                }
            };
            console.log('url', url);
            console.log('parameters', parameters);

            function callback(error, response, body) {
                // console.log('callback', error, body);
                if (body) {
                    let b = JSON.parse(body);
                    console.log('exchanges count', Object.keys(b).length);
                    console.log('exchanges ids', Object.values(b).map(el => el.name));
                }
            }

            console.log(options);

            request(options, callback);
        },
        getSignals : function() {
           let nonce = tmApi.utils.getNonce();
            let url = URL + '/signals';
            // let parameters = { nonce, active : true, bought : false, performance : 'loss', baseCurrency : 'BTC', exchangeId : 4 };
            let parameters = { nonce };
            // Доступные параметры для фильтрации:
            // active<bool>
            // bought<bool>
            // performance<str> : 'gain', 'loss'
            // currency<bool>
            // baseCurrency<str>
            // exchangeId<id>
            url = tmApi.utils.addParameters(url, parameters);
            let options = {
                method : 'GET',
                url : url,
                headers : {
                    authKey : key,
                    authSignature : tmApi.utils.makeHash(parameters),
                }
            };
            console.log('url', url);
            console.log('parameters', parameters);

            function callback(error, response, body) {
                // console.log('callback', error, body);
                if (body) {
                    let b = JSON.parse(body);
                    console.log('signals');
                    console.log(b.map(el => {
                        return {
                            signalId : el.signalId,
                            symbolId : el.symbolId,
                            active : el.active,
                            exchangeId : el.exchangeId
                        }
                    }));
                }
            }

            console.log(options);

            request(options, callback);
        },
        getSignal : function(signalId) {
           let nonce = tmApi.utils.getNonce();
            let url = URL + '/signal';
            let parameters = { nonce, signalId };
            url = tmApi.utils.addParameters(url, parameters);
            let options = {
                method : 'GET',
                url : url,
                headers : {
                    authKey : key,
                    authSignature : tmApi.utils.makeHash(parameters),
                }
            };
            console.log('url', url);
            console.log('parameters', parameters);

            function callback(error, response, body) {
                if (body) {
                    // console.log(body);
                    console.dir(JSON.parse(body), {depth: null, colors: true});
                }
            }

            console.log(options);

            request(options, callback);
        },
        getSymbols : function() {
           let nonce = tmApi.utils.getNonce();
            let url = URL + '/symbols';
            let parameters = { nonce };
            url = tmApi.utils.addParameters(url, parameters);
            let options = {
                method : 'GET',
                url : url,
                headers : {
                    authKey : key,
                    authSignature : tmApi.utils.makeHash(parameters),
                }
            };
            console.log('url', url);
            console.log('parameters', parameters);

            function callback(error, response, body) {
                // console.log('callback', error, body);
                if (body) {
                    let b = JSON.parse(body);
                    console.log('symbols count', Object.keys(b).length);
                }
            }

            console.log(options);

            request(options, callback);
        },
        makeSignal : function() {
            let nonce = tmApi.utils.getNonce();
            let url = URL + '/signal';
            let parameters = { nonce };
            url = tmApi.utils.addParameters(url, parameters);
            let body = {
                buys: {
                    1 : {
                        price: "0.00006266",
                        type: "Buy",
                        amount: "0.15"
                    }
                },
                takeProfits: {
                    2 : {
                        amount: "0.15",
                        threshold: "0.0000639132",
                        type: "TakeProfitSell"
                    }
                },
                stopLoss: {
                    amount: "0.15",
                    type: "StopLossSell",
                    threshold: "0.00005953",
                    ladder: false
                },
                symbolId: "208"
            }
            let options = {
                method : 'POST',
                url : url,
                headers : {
                    authKey : key,
                    authSignature : tmApi.utils.makeHash(parameters, body),
                },
                json : true,
                body
            };

            console.log('url', url);
            console.log('parameters', parameters);
            console.log('body', body);

            function callback(error, response, body) {
                console.log('callback', body);
            }

            console.log(options);

            request(options, callback);
        },
        updateSignal : function(signalId) {
            let nonce = tmApi.utils.getNonce();
            let url = URL + '/signal';
            let parameters = { nonce, signalId };
            url = tmApi.utils.addParameters(url, parameters);

            let body = {
                buys: {},
                takeProfits: {
                    2 : {
                        editMode: "replace",
                        amount: "0.15",
                        threshold: "0.00008",
                        // type: "TakeProfitSell",
                        type: "TakeProfitTrailingSell",
                        trailing : '0.02'
                    },
                },
                stopLoss: {
                    editMode: "replace",
                    amount: "0.15",
                    // type: "StopLossSell",
                    type: "StopLossTrailingSell",
                    trailing : '0.05',
                    ladder: true,
                    // threshold : "0.00005"
                },
                symbolId: "208"
            }
            let options = {
                method : 'PATCH',
                url : url,
                headers : {
                    authKey : key,
                    authSignature : tmApi.utils.makeHash(parameters, body),
                },
                json : true,
                body
            };

            // console.log('url', url);
            // console.log('parameters', parameters);
            // console.log('body', body);

            function callback(error, response, body) {
                console.log('callback', body);
            }

            // console.log(options);

            request(options, callback);  
        },
        panicSellSignal : function(signalId) {
            let nonce = tmApi.utils.getNonce();
            let url = URL + '/panic';
            let parameters = { nonce, signalId };
            url = tmApi.utils.addParameters(url, parameters);
            let options = {
                method : 'POST',
                url : url,
                headers : {
                    authKey : key,
                    authSignature : tmApi.utils.makeHash(parameters, body),
                },
                json : true
            };

            console.log('url', url);
            console.log('parameters', parameters);
            console.log('body', body);

            function callback(error, response, body) {
                console.log('callback', error, body);
                if (body) {
                    // let b = JSON.parse(body);
                    console.log('panic sold', body.active);
                }
            }

            console.log(options);

            request(options, callback);
        },
        getStats : function() {
            let nonce = tmApi.utils.getNonce();
            let url = URL + '/stats';
            let parameters = { nonce };
            url = tmApi.utils.addParameters(url, parameters);
            let options = {
                method : 'GET',
                url : url,
                headers : {
                    authKey : key,
                    authSignature : tmApi.utils.makeHash(parameters),
                }
            };

            function callback(error, response, body) {
                if (body) {
                    console.log(body);
                }
            }

            request(options, callback);
        }
    },
    utils : {
        addParameters : function(url, parameters) {
            url += '?';
            for (let i in parameters){
                url += i + '=' + parameters[i] + '&';
            }
            return url;
        },
        getNonce : function() {
            return +new Date();
        },
        makeHash : function(parameters, body) {
            var paramsString = '';
            var paramsArr = [];
            Object.keys(parameters).sort().forEach(function(v, i) {
                paramsArr.push(v + ':' + parameters[v]);
            });
            paramsString += paramsArr.join(':');
            if (body && Object.keys(body).length) {
                paramsString += ':' + JSON.stringify(body) + ':';
            } else {
                paramsString += '::';
            }
            paramsString += secret;

            signature = crypto.createHash('sha256', secret).update(paramsString).digest('base64');
            // console.log('parameters', parameters);
            // console.log('body', body);
            // console.log('paramsString', paramsString, signature);
            return signature;
        }
    }
}

// tmApi.utils.makeHash({ nonce : 14892427427, a: 1, b : 2 }, { some_body : '2love' });
// tmApi.api.getExchanges();
// tmApi.api.makeSignal();
// tmApi.api.getSignals();
// tmApi.api.getSymbols();
// tmApi.api.panicSellSignal(431);
// tmApi.api.getSignal(430);
// tmApi.api.getSignal(434);
tmApi.api.updateSignal(435);
// tmApi.api.getStats();