(function () {
    "use strict";

    /**
     * The EVNotify constructor class
     * @param       {String} akey   the account key
     * @constructor                 EVNotify
     */
    function EVNotify(akey) {
        var user = {
            akey: akey,
            token: false
        };

        // prevent wrong declaration
        if(!(this instanceof EVNotify) || this.__previouslyConstructedByEVNotify) throw new Error('EVNotify must be called as constructor. Missing new keyword?');
        this.__previouslyConstructedByEVNotify = true;
    }
    // apply to window
    window.EVNotify = EVNotify;
}());
