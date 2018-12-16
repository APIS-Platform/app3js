/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/** @file WebsocketProvider.js
 * @authors:
 *   Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

"use strict";

const isDebug = false;

var crypt = require('./crypt');

var _ = require('underscore');
var errors = require('app3-core-helpers').errors;


var Ws = null;
var _btoa = null;
var parseURL = null;
if (typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined') {
    _btoa = btoa;
    parseURL = function parseURL(url) {
        return new URL(url);
    };

    /*
     * Encrypts the user ID and password, and sends it to the RPC server.
     */
    Ws = function Ws(url, protocols) {
        let parsedUrl = parseURL(url);
        let encryptedAuth = _btoa(crypt.encryptAuth(parsedUrl.username, parsedUrl.password));
        let finalUrl = url+ "?authkey=" + encryptedAuth;

        return new window.WebSocket(finalUrl, protocols);
    };
} else {
    Ws = require('websocket').w3cwebsocket;
    _btoa = function _btoa(str) {
        return Buffer(str).toString('base64');
    };
    var url = require('url');
    if (url.URL) {
        // Use the new Node 6+ API for parsing URLs that supports username/password
        var newURL = url.URL;
        parseURL = function parseURL(url) {
            return new newURL(url);
        };
    } else {
        // Web3 supports Node.js 5, so fall back to the legacy URL API if necessary
        parseURL = require('url').parse;
    }
}
// Default connection ws://localhost:8546


var WebsocketProvider = function WebsocketProvider(url, options) {
    var _this = this;
    this.responseCallbacks = {};
    this.notificationCallbacks = [];

    this.userpass = '';
    this.password = '';
    this.token = '';
    this.requestId = 0;

    options = options || {};
    this._customTimeout = options.timeout;

    // The w3cwebsocket implementation does not support Basic Auth
    // username/password in the URL. So generate the basic auth header, and
    // pass through with any additional headers supplied in constructor
    var parsedURL = parseURL(url);
    var headers = options.headers || {};
    var protocol = options.protocol || undefined;
    if (parsedURL.username && parsedURL.password) {
        _this.username = parsedURL.username;
        _this.userpass = parsedURL.password;

        // Encrypts the user ID and password, and sends it to the RPC server.
        headers.authKey = crypt.encryptAuth(_this.username, _this.userpass);
    }

    // Allow a custom client configuration
    var clientConfig = options.clientConfig || undefined;

    this.connection = new Ws(url, protocol, undefined, headers, undefined, clientConfig);

    // 웹소켓 통신 시 AES 암호화를 적용할지 여부를 저장한다.
    // It stores whether or not to apply AES encryption in ws communication.
    this.messageEncryptionEnabled = true;

    this.addDefaultEvents();

    // LISTEN FOR CONNECTION RESPONSES
    this.connection.onmessage = function (e) {
        /*jshint maxcomplexity: 6 */
        var data = typeof e.data === 'string' ? e.data : '';

        if(isDebug) {
            console.log("===========================");
            console.log("received Message");
            console.log(data);
            console.log("=========================//");
            console.log();
            console.log();
        }

        if(_this.token === '') {
            _this.token = crypt.decryptToken(_this.userpass, data);
            if(isDebug) {
                console.log('Token received : ' + _this.token.substring(0, 4) + "..." + _this.token.substring(_this.token.length - 4, _this.token.length));
            }
            return;
        }

        _this._parseResponse(data).forEach(function (result) {

            var id = null;

            // get the id which matches the returned id
            if (_.isArray(result)) {
                result.forEach(function (load) {
                    if (_this.responseCallbacks[load.id]) id = load.id;
                });
            } else {
                id = result.id;
            }

            if(typeof result.result !== undefined && result.result === 'null') {
                result.result = null;
            }

            if(isDebug) {
                console.log();
                console.log("[provider-ws]");
                console.log(result);
                console.log();
            }

            // notification
            if (!id && result && result.method && result.method.indexOf('_subscription') !== -1) {
                _this.notificationCallbacks.forEach(function (callback) {
                    if (_.isFunction(callback)) callback(result);
                });

                // fire the callback
            } else if (_this.responseCallbacks[id]) {
                _this.responseCallbacks[id](null, result);
                delete _this.responseCallbacks[id];
            }
        });
    };

    // make property `connected` which will return the current connection status
    Object.defineProperty(this, 'connected', {
        get: function get() {
            return this.connection && this.connection.readyState === this.connection.OPEN;
        },
        enumerable: true
    });
};

/**
 Will add the error and end event to timeout existing calls

 @method addDefaultEvents
 */
WebsocketProvider.prototype.addDefaultEvents = function () {
    var _this = this;

    this.connection.onerror = function () {
        _this._timeout();
    };

    this.connection.onclose = function () {
        _this._timeout();

        // reset all requests and callbacks
        _this.reset();
    };

    // this.connection.on('timeout', function(){
    //     _this._timeout();
    // });
};

/**
 Will parse the response and make an array out of it.

 @method _parseResponse
 @param {String} data
 */
WebsocketProvider.prototype._parseResponse = function (data) {
    var _this = this,
        returnValues = [];

    if(!isJsonString(data)) {
        data = crypt.decryptMessage(data, _this.token);
        data = JSON.stringify(data);
    }

    // DE-CHUNKER
    var dechunkedData = data.replace(/\}[\n\r]?\{/g, '}|--|{') // }{
        .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
        .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
        .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
        .split('|--|');

    dechunkedData.forEach(function (data) {

        // prepend the last chunk
        if (_this.lastChunk) data = _this.lastChunk + data;

        var result = null;

        try {
            result = JSON.parse(data);
        } catch (e) {

            _this.lastChunk = data;

            // start timeout to cancel all requests
            clearTimeout(_this.lastChunkTimeout);
            _this.lastChunkTimeout = setTimeout(function () {
                _this._timeout();
                throw errors.InvalidResponse(data);
            }, 1000 * 15);

            return;
        }

        // cancel timeout and set chunk to null
        clearTimeout(_this.lastChunkTimeout);
        _this.lastChunk = null;

        if (result) returnValues.push(result);
    });

    return returnValues;
};

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 Adds a callback to the responseCallbacks object,
 which will be called if a response matching the response Id will arrive.

 @method _addResponseCallback
 */
WebsocketProvider.prototype._addResponseCallback = function (payload, callback) {
    var id = payload.id || payload[0].id;
    var method = payload.method || payload[0].method;

    this.responseCallbacks[id] = callback;
    this.responseCallbacks[id].method = method;

    var _this = this;

    // schedule triggering the error response if a custom timeout is set
    if (this._customTimeout) {
        setTimeout(function () {
            if (_this.responseCallbacks[id]) {
                _this.responseCallbacks[id](errors.ConnectionTimeout(_this._customTimeout));
                delete _this.responseCallbacks[id];
            }
        }, this._customTimeout);
    }
};

/**
 Timeout all requests when the end/error event is fired

 @method _timeout
 */
WebsocketProvider.prototype._timeout = function () {
    for (var key in this.responseCallbacks) {
        if (this.responseCallbacks.hasOwnProperty(key)) {
            this.responseCallbacks[key](errors.InvalidConnection('on WS'));
            delete this.responseCallbacks[key];
        }
    }
};

/**
 * 기능을 활성화할 경우 RPC 서버와 주고받는 모든 메시지가 암호화된다.
 * 암호화 통신은 비암호화 통신 대비 30배 이상의 시간이 더 소요되므로 신중한 선택이 필요하다.
 * When enabled, all messages to and from the RPC server are encrypted.
 * If encryption is applied, it should take more than 30 times more time than plain text communication.
 *
 * @param enable TRUE : Encryption is applied to outgoing and incoming messages.
 */
WebsocketProvider.prototype.enableEncryption = function (enable) {
    const _this = this;

    _this.messageEncryptionEnabled = enable;
}

WebsocketProvider.prototype.send = function (payload, callback) {
    var _this = this;

    if (this.connection.readyState === this.connection.CONNECTING || _this.token === '') {
        setTimeout(function () {
            _this.send(payload, callback);
        }, 10);
        return;
    }

    _this.requestId += 1;


    var message;
    if(_this.messageEncryptionEnabled) {
        message = crypt.encryptMessage(_this.requestId, payload, _this.token);
    } else {
        message = crypt.normalMessage(_this.requestId, payload, _this.token);
    }

    if(isDebug) {
        console.log();
        console.log("TOKEN : " + _this.token);
        console.log("PAYLOAD :");
        console.log(payload);
        console.log();
        console.log("SENDING MESSAGE : ");
        console.log(message);
        console.log();
        console.log();
    }

    // try reconnect, when connection is gone
    // if(!this.connection.writable)
    //     this.connection.connect({url: this.url});
    if (this.connection.readyState !== this.connection.OPEN) {
        console.error('connection not open on send()');
        if (typeof this.connection.onerror === 'function') {
            this.connection.onerror(new Error('connection not open'));
        } else {
            console.error('no error callback');
        }
        callback(new Error('connection not open'));
        return;
    }

    this.connection.send(message);
    this._addResponseCallback(payload, callback);
};

/**
 Subscribes to provider events.provider

 @method on
 @param {String} type    'notifcation', 'connect', 'error', 'end' or 'data'
 @param {Function} callback   the callback to call
 */
WebsocketProvider.prototype.on = function (type, callback) {

    if (typeof callback !== 'function') throw new Error('The second parameter callback must be a function.');

    switch (type) {
        case 'data':
            this.notificationCallbacks.push(callback);
            break;

        case 'connect':
            this.connection.onopen = callback;
            break;

        case 'end':
            this.connection.onclose = callback;
            break;

        case 'error':
            this.connection.onerror = callback;
            break;

        // default:
        //     this.connection.on(type, callback);
        //     break;
    }
};

// TODO add once

/**
 Removes event listener

 @method removeListener
 @param {String} type    'notifcation', 'connect', 'error', 'end' or 'data'
 @param {Function} callback   the callback to call
 */
WebsocketProvider.prototype.removeListener = function (type, callback) {
    var _this = this;

    switch (type) {
        case 'data':
            this.notificationCallbacks.forEach(function (cb, index) {
                if (cb === callback) _this.notificationCallbacks.splice(index, 1);
            });
            break;

        // TODO remvoving connect missing

        // default:
        //     this.connection.removeListener(type, callback);
        //     break;
    }
};

/**
 Removes all event listeners

 @method removeAllListeners
 @param {String} type    'notifcation', 'connect', 'error', 'end' or 'data'
 */
WebsocketProvider.prototype.removeAllListeners = function (type) {
    switch (type) {
        case 'data':
            this.notificationCallbacks = [];
            break;

        // TODO remvoving connect properly missing

        case 'connect':
            this.connection.onopen = null;
            break;

        case 'end':
            this.connection.onclose = null;
            break;

        case 'error':
            this.connection.onerror = null;
            break;

        default:
            // this.connection.removeAllListeners(type);
            break;
    }
};

/**
 Resets the providers, clears all callbacks

 @method reset
 */
WebsocketProvider.prototype.reset = function () {
    this._timeout();
    this.notificationCallbacks = [];

    // this.connection.removeAllListeners('error');
    // this.connection.removeAllListeners('end');
    // this.connection.removeAllListeners('timeout');

    this.addDefaultEvents();
};

WebsocketProvider.prototype.disconnect = function () {
    if (this.connection) {
        this.connection.close();
    }
};

module.exports = WebsocketProvider;