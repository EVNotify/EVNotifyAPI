(function () {
    'use strict';

    var RESTURL = 'https://evnotify.de:8743/';

    /**
     * Function which sends a specific request to backend server and returns the information/data (or error information if any)
     * @param  {String}     [fnc]       the function which should be used (e.g. login)
     * @param  {*}          [data]      the data to send (mostly an object)
     * @param  {Function}   callback    callback function
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

                    callback(null, {
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
            // attach AKey
            self.akey = ((!err && res && res.data)? res.data.akey : null);
            // send response to callback if applied
            if(typeof callback === 'function') callback(err, self.akey);
        });

        return self;
    };

    // apply to window
    window.EVNotify = EVNotify;
}());
