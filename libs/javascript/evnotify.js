(function () {
    "use strict";

    var RESTURL = 'https://evnotify.de:8743/';

    /**
     * Function which sends a specific request to backend server and returns the information/data (or error information if any)
     * @param  {String}     [fnc]       the function which should be used (e.g. login)
     * @param  {*}          [data]      the data to send (mostly an object)
     * @param  {Function}   callback    callback function
     */
    var sendRequest = function(fnc, data, callback) {
        try {
            var xmlhttp = new XMLHttpRequest();

            // apply listener for the request
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4) callback(null, {status: this.status, data: JSON.parse(this.responseText)});
            };
            xmlhttp.onerror = function(e) {
                callback(e, null);
            };
            // send the request
            xmlhttp.open("POST", RESTURL + ((fnc)? fnc : ''), true);
            xmlhttp.send(((typeof data === 'object')? JSON.stringify(data) : ((typeof data !== 'undefined')? data : '')));
        } catch (e) {
            callback(e, null);
        }
    };

    /**
     * The EVNotify constructor class
     * @param       {String} akey   the account key
     * @constructor                 EVNotify
     */
    function EVNotify(akey) {
        if(typeof akey === 'undefined') throw new Error('You must initialize EVNotify with an akey.');
        this.user = {akey: akey};

        // prevent wrong declaration
        if(!(this instanceof EVNotify) || this.__previouslyConstructedByEVNotify) throw new Error('EVNotify must be called as constructor. Missing new keyword?');
        this.__previouslyConstructedByEVNotify = true;
    }

    /**
     * Function to retrieve a random akey which was available at the time of the request
     * @param  {Function} [callback]    callback function
     * @return {this}                   returns this
     */
    EVNotify.prototype.getAKey = function(callback) {
        sendRequest('getkey', {}, function(err, res) {
            // send response to callback if applied
            if(typeof callback === 'function') callback(err, res);
        });

        return this;
    };

    // apply to window
    window.EVNotify = EVNotify;
}());
