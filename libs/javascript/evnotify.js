(function () {
    'use strict';

    var RESTURL = 'https://evnotify.de:8743/';

    /**
     * Function which sends a specific request to backend server and returns the information/data (or error information if any)
     * @param  {String}     [fnc]       the function which should be used (e.g. login)
     * @param  {*}          [data]      the data to send (mostly an object)
     * @param  {Function}   callback    callback function
     * @return {void}
     */
    var sendRequest = function(fnc, data, callback) {
        try {
            var xmlhttp = new XMLHttpRequest(),
                retData;

            // apply listener for the request
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    // try to parse the response as JSON
                    try {retData = JSON.parse(this.responseText);} catch (e) {retData = this.responseText}

                    callback(((this.status !== 200)? this.status : null), {
                        status: this.status,
                        data: retData
                    });
                }
            };
            xmlhttp.onerror = function(e) {
                callback(e, null);
            };
            // send the request
            xmlhttp.open('POST', RESTURL + ((fnc)? fnc : ''), true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json');
            xmlhttp.send(((typeof data === 'object')? JSON.stringify(data) : ((typeof data !== 'undefined')? data : '')));
        } catch (e) {
            callback(e, null);
        }
    };

    /**
     * The EVNotify constructor class
     * @constructor                 EVNotify
     */
    function EVNotify() {
        // prevent wrong declaration
        if(!(this instanceof EVNotify) || this.__previouslyConstructedByEVNotify) throw new Error('EVNotify must be called as constructor. Missing new keyword?');
        this.__previouslyConstructedByEVNotify = true;
    }

    /**
     * Function to retrieve a random akey which was available at the time of the request
     * @param  {Function} [callback]    callback function
     * @return {Object}                   returns this
     */
    EVNotify.prototype.getKey = function(callback) {
        var self = this;

        sendRequest('getkey', {}, function(err, res) {
            // send response to callback if applied
            if(typeof callback === 'function') callback(err, ((err)? null : self.akey));
        });

        return self;
    };

    /**
     * Function to register account for given akey with specified password to retrieve and set token and the AKey
     * @param  {String}   akey          the AKey to register
     * @param  {String}   password      the password to use for the AKey
     * @param  {Function} [callback]    callback function
     * @return {Object}                 returns this
     */
    EVNotify.prototype.register = function (akey, password, callback) {
        var self = this;

        sendRequest('register', {akey: akey, password: password}, function(err, res) {
            // attach token
            self.token = ((!err && res && res.data)? res.data.token : null);
            // attach AKey
            self.akey = ((self.token)? akey : null);
            // send response to callback if applied
            if(typeof callback === 'function') callback(err, ((err)? null : self.token));
        });

        return self;
    };

    /**
     * Function to login account with given credentials and applies the AKey the returned token
     * @param  {String}   akey          the AKey to login
     * @param  {String}   password      the password to use for the account
     * @param  {Function} [callback]    callback function
     * @return {Object}                 returns this
     */
    EVNotify.prototype.login = function (akey, password, callback) {
        var self = this;

        sendRequest('login', {akey: akey, password: password}, function(err, res) {
            // attach token
            self.token = ((!err && res && res.data)? res.data.token : null);
            // attach AKey
            self.akey = ((self.token)? akey : null);
            // send response to callback if applied
            if(typeof callback === 'function') callback(err, ((err)? null : self.token));
        });

        return self;
    };

    /**
     * Function to change the password of the account for specified AKey with given old password and the new password
     * NOTE: Requires previous authentication via login request
     * @param  {String}   oldpassword   the old (current) password
     * @param  {String}   newpassword   the new password to set
     * @param  {Function} [callback]    callback function
     * @return {Object}                 returns this
     */
    EVNotify.prototype.changePW = function(oldpassword, newpassword, callback) {
        var self = this;

        // check authentication
        if(!self.akey || !self.token) {
            if(typeof callback === 'function') callback(401, null); // missing previous login request
        } else {
            sendRequest('password', {akey: self.akey, token: self.token, password: oldpassword, newpassword: newpassword}, function(err, res) {
                if(typeof callback === 'function') callback(err, ((err)? false : true));
            });
        }

        return self;
    };

    /**
     * Function to renew and change the current token to a new persistent one
     * NOTE: Requires previous authentication via login request
     * @param  {String}   password      the password of the AKey to change the token for
     * @param  {Function} [callback]    callback function
     * @return {Object}                 returns this
     */
    EVNotify.prototype.renewToken = function(password, callback) {
        var self = this;

        // check authentication
        if(!self.akey || !self.token) {
            if(typeof callback === 'function') callback(401, null); // missing previous login request
        } else {
            sendRequest('renewtoken', {akey: self.akey, password: password}, function(err, res) {
                // attach new token
                self.token = ((!err && res && res.data && res.data.token)? res.data.token : self.token);
                if(typeof callback === 'function') callback(err, ((err)? null : self.token));
            });
        }

        return self;
    };

    /**
     * Function to get the settings and stats of the account for the given AKey
     * @param  {String}   password      the password of the AKey to get the settings and stats for
     * @param  {Function} [callback]    callback function
     * @return {Object}                 returns this
     */
    EVNotify.prototype.getSettings = function(password, callback) {
        var self = this;

        // check authentication
        if(!self.akey || !self.token) {
            if(typeof callback === 'function') callback(401, null); // missing previous login request
        } else {
            sendRequest('settings', {akey: self.akey, token: self.token, password: password, option: 'GET'}, function(err, res) {
                if(typeof callback === 'function') callback(err, ((!err && res && res.data && res.data.settings)? res.data.settings : null));
            });
        }

        return self;
    };

    /**
     * Function to set the settings and stats of the account for the given AKey
     * @param  {String}   password      the password of the AKey to set the settings and stats for
     * @param  {Object}   settingsObj   the object containing all keys to set
     * @param  {Function} [callback]    callback function
     * @return {Object}                 returns this
     */
    EVNotify.prototype.setSettings = function(password, settingsObj, callback) {
        var self = this;

        // check authentication
        if(!self.akey || !self.token) {
            if(typeof callback === 'function') callback(401, null); // missing previous login request
        } else {
            sendRequest('settings', {
                akey: self.akey,
                token: self.token,
                password: password,
                option: 'SET',
                optionObj: settingsObj
            }, function(err, res) {
                if(typeof callback === 'function') callback(err, ((!err && res)? true : false));
            });
        }

        return self;
    };

    /**
     * Function to retrieve the settings and stats of the account without being prompted for a password
     * NOTE: Requires 'autoSync' to be enabled for the given AKey
     * @param  {Function} callback  callback function
     * @return {Object}             returns this
     */
    EVNotify.prototype.pullSettings = function(callback) {
        var self = this;

        // check authentication
        if(!self.akey || !self.token) {
            if(typeof callback === 'function') callback(401, null); // missing previous login request
        } else {
            sendRequest('sync', {
                akey: self.akey,
                token: self.token,
                type: 'PULL',
            }, function(err, res) {
                if(typeof callback === 'function') callback(err, ((!err && res && res.data)? res.data.syncRes : null));
            });
        }

        return self;
    };

    /**
     * Function to apply the settings and stats of the account without being prompted for a password
     * NOTE: Requires 'autoSync' to be enabled for the given AKey
     * @param  {Object} syncObj     the object containing all the settings and stats
     * @param  {Function} callback  callback function
     * @return {Object}             returns this
     */
    EVNotify.prototype.pushSettings = function(syncObj, callback) {
        var self = this;

        // check authentication
        if(!self.akey || !self.token) {
            if(typeof callback === 'function') callback(401, null); // missing previous login request
        } else {
            sendRequest('sync', {
                akey: self.akey,
                token: self.token,
                type: 'PUSH',
                syncObj: syncObj
            }, function(err, res) {
                if(typeof callback === 'function') callback(err, ((!err && res && res.data)? res.data.syncRes : null));
            });
        }

        return self;
    };

    // apply to window
    window.EVNotify = EVNotify;
}());
