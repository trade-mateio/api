import base64
import hashlib
import json
import time

import requests


class TradeMateBotApi:

    BASE_URL = 'https://trade-mate.io/api/bot/v1'

    def __init__(self, key, secret):
        self.key = key
        self.secret = secret

    def _make_sign(self, params, body):
        nonce = int(round(time.time() * 1000))
        prepared_params = {'nonce': nonce}
        prepared_params.update(params)
        params_list = sorted(prepared_params.items(), key=lambda x: x[0])
        params_str = ''
        if params_list:
            params_str += ':'.join([f'{x}:{y}' for x, y in params_list])
        params_str += ':'
        if body:
            params_str += json.dumps(body)
        params_str += f':{self.secret}'
        return base64.b64encode(hashlib.sha256(params_str.encode()).digest()), prepared_params

    def _send_request(self, method, url, params=None, body=None):
        sign, prepared_params = self._make_sign(params or {}, body)
        return requests.request(method, f'{self.BASE_URL}/{url}',
                                params=prepared_params,
                                json=body,
                                headers={'authKey': self.key,
                                         'authSignature': sign}).json()

    def get_stats(self):
        return self._send_request('GET', 'stats')

    def get_exchanges(self):
        return self._send_request('GET', 'exchanges')

    def get_symbols(self):
        return self._send_request('GET', 'symbols')

    def get_signals(self):
        return self._send_request('GET', 'signals')

    def get_signal(self, signal_id):
        return self._send_request('GET', 'signal', {'signalId': signal_id})

    def make_signal(self, signal):
        return self._send_request('POST', 'signal', None, signal)

    def update_signal(self, signal_id, signal):
        return self._send_request('PATCH', 'signal', {'signalId': signal_id}, signal)

    def panic_sell_signal(self, signal_id):
        return self._send_request('POST', 'panic', {'signalId': signal_id})

