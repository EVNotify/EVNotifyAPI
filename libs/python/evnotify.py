import json
import requests

class CommunicationError(Exception): pass

class EVNotify:

    def __init__(self, akey = None, token = None):
        self.RESTURL = 'https://app.evnotify.de/'
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'PyEVNotifyApi/2'})
        self.akey = akey
        self.token = token
        self.timeout = 5

    def sendRequest(self, method, fnc, useAuthentication = False, data = {}):
        params = {**data}
        if useAuthentication:
            params['akey'] = self.akey
            params['token'] = self.token
        try:
            if method == 'get':
                return getattr(self.session, method)(self.RESTURL + fnc, params=params, timeout=self.timeout).json()
            else:
                return getattr(self.session, method)(self.RESTURL + fnc, json=params, timeout=self.timeout).json()

        except requests.exceptions.ConnectionError:
            raise CommunicationError()
        except TypeError:
            raise CommunicationError()

    def getKey(self):
        return self.sendRequest('get', 'key')['akey']

    def register(self, akey, password):
        self.token = self.sendRequest('post', 'register', False, {
            "akey": akey,
            "password": password
        })['token']
        self.akey = akey
        return self.token

    def login(self, akey, password):
        self.token = self.sendRequest('post', 'login', False, {
            "akey": akey,
            "password": password
        })['token']
        self.akey = akey
        return self.token

    def changePassword(self, oldpassword, newpassword):
        ret = self.sendRequest('post', 'changepw', True, {
            "oldpassword": oldpassword,
            "newpassword": newpassword
        })
        return ret['changed'] if 'changed' in ret else None

    def getSettings(self):
        return self.sendRequest('get', 'settings', True)['settings']

    def setSettings(self, settings):
        ret = self.sendRequest('put', 'settings', True, {
            "settings": settings
        })
        return ret['settings'] if 'settings' in ret else None

    def setSOC(self, display, bms):
        ret = self.sendRequest('post', 'soc', True, {
            "display": display,
            "bms": bms
        })
        return ret['synced'] if 'synced' in ret else None

    def getSOC(self):
        return self.sendRequest('get', 'soc', True)

    def setExtended(self, obj):
        ret = self.sendRequest('post', 'extended', True, obj)
        return ret['synced'] if 'synced' in ret else None

    def getExtended(self):
        return self.sendRequest('get', 'extended', True)

    def getLocation(self):
        return self.sendRequest('get', 'location', True)

    def setLocation(self, obj):
        ret = self.sendRequest('post', 'location', True, obj)
        return ret['synced'] if 'synced' in ret else None

    def renewToken(self, password):
        self.token = self.sendRequest('put', 'renewtoken', True, {
            "password": password
        })['token']
        return self.token

    def sendNotification(self, abort = False):
        return self.sendRequest('post', 'notification', True, {
            "abort": abort
        })['notified']
