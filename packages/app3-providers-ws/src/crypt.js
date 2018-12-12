'use strict';

const isDebug = false;

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.decryptMessage = exports.encryptMessage = exports.decryptToken = exports.sendAuthMsg = exports.normalMessage = undefined;

var _cryptoRandomString = require('crypto-random-string');

var _cryptoRandomString2 = _interopRequireDefault(_cryptoRandomString);

var _keccak = require('keccak');

var _keccak2 = _interopRequireDefault(_keccak);

var _keydata = require('./keydata');

var keydata = _interopRequireWildcard(_keydata);

var _AesUtil = require('./AesUtil');

var aesUtil = _interopRequireWildcard(_AesUtil);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

aesUtil.setup(keydata.keySize, keydata.iterationCount);


function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                0x80 | ((charcode>>12) & 0x3f),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

function concatenate(resultConstructor, ...arrays) {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new resultConstructor(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}



// Convert a hex string to a byte array
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}


function longToByteArray (/*long*/long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = byteArray.length - 1; index >= 0; index -- ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
};

function byteArrayToLong (/*byte[]*/byteArray) {
    var value = 0;
    for ( var i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256) + byteArray[i];
    }

    return value;
};


var encryptMsg = function encryptMsg(passPhrase, plainText) {
    var iv            = (0, _cryptoRandomString2.default)(32);
    var salt          = (0, _cryptoRandomString2.default)(64);

    return salt + iv + aesUtil.encrypt(salt, iv, passPhrase, plainText);
};

function createTokenHash(payload, token) {
    var method = payload["method"];
    var params = payload.params;
    var payId = payload["id"];


    var paramsStr = "";
    for(var i = 0; i < params.length; i++) {
        if(params[i] !== null && typeof params[i] === 'object') {
            const ordered = {};
            Object.keys(params[i]).sort().forEach(function(key) {
                var value = params[i][key];
                if(value !== undefined) {
                    paramsStr += key;
                    paramsStr += value;
                }
                //ordered[key] = params[i][key];
            });

            //paramsStr += JSON.stringify(ordered);
        } else {
            paramsStr += params[i];
        }
    }
    paramsStr = paramsStr.replace(/['":=, ]+/g, "");

    if(isDebug) {
        console.log();
        console.log("[crypt.js] Token Hash Parameter : ");
        console.log(paramsStr);
        console.log();
    }

    var arrMethod = toUTF8Array(String(method));
    var arrParams = toUTF8Array(paramsStr);
    var arrPayId = longToByteArray(Number(payId));

    let merge = concatenate(Uint8Array, arrMethod, arrParams, arrPayId, hexToBytes(token));

    return (0, _keccak2.default)('keccak256').update(new Buffer(merge, 'hex')).digest('hex');
}

var decryptMsg = function decryptMsg(salt, iv, passPhrase, plainText) {
    return aesUtil.decrypt(salt, iv, passPhrase, plainText);
};
var getSalt = function getSalt(msg) {
    return msg.substring(0, 64);
};
var getIv = function getIv(msg) {
    return msg.substring(64, 96);
};



var encryptAuth = exports.encryptAuth = function encryptAuth(id, passwd) {
    var hashedId      = (0, _keccak2.default)('keccak256').update(id).digest('hex');
    var hashedPasswd  = (0, _keccak2.default)('keccak256').update(passwd).digest('hex');

    return encryptMsg(hashedPasswd, hashedId);
}


var decryptToken = exports.decryptToken = function decryptToken(userPassword, message) {
    var data = message;

    if(message.utf8Data !== undefined) {
        data = message.utf8Data;
    }

    var resSalt = getSalt(data);
    var resIv = getIv(data);
    var receiveMsg = data.replace(resSalt, '').replace(resIv, '');
    var receiveMsgDec = decryptMsg(resSalt, resIv, userPassword, receiveMsg);

    try {
        var tokenMsgObj = JSON.parse(receiveMsgDec);
    } catch (e) {
        throw Error(data);
    }
    var tokenEnc = tokenMsgObj.result;

    var deTokenSalt = getSalt(tokenEnc);
    var deTokenIv = getIv(tokenEnc);
    var deToken = tokenEnc.replace(deTokenSalt, '').replace(deTokenIv, '');

    return decryptMsg(deTokenSalt, deTokenIv, userPassword, deToken);
};

var encryptMessage = exports.encryptMessage = function encryptMessage(nonce, payload, token) {
    var tokenHash = createTokenHash(payload, token);//encryptMsg(userPassword, token);

    var msgObj = {
        "hash": tokenHash,
        "payload": payload
    };

    if(isDebug) {
        console.log(msgObj);
    }

    var sendMsg = encryptMsg(token, JSON.stringify(msgObj));
    return sendMsg;
};

const normalMessage = exports.normalMessage = function normalMessage(nonce, payload, token) {
    const tokenHash = createTokenHash(payload, token);//encryptMsg(userPassword, token);

    const msgObj = {
        "hash": tokenHash,
        "payload": payload
    };

    if(isDebug) {
        console.log(msgObj);
    }

    return JSON.stringify(msgObj);
};

var decryptMessage = exports.decryptMessage = function decryptMessage(message, token) {
    var salt = getSalt(message);
    var iv = getIv(message);
    var msg = message.replace(salt, '').replace(iv, '');
    var decMsg = decryptMsg(salt, iv, token, msg);

    return JSON.parse(decMsg);
};