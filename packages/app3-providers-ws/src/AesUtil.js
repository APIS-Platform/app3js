'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decrypt = exports.encrypt = exports.generateKey = exports.setup = undefined;

var _cryptoJs = require('crypto-js');

var _cryptoJs2 = _interopRequireDefault(_cryptoJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __keySize = void 0;
var __iterationCount = void 0;

var setup = exports.setup = function setup(_keySize, _iterationCount) {
  __keySize = _keySize / 32;
  __iterationCount = _iterationCount;
};

var generateKey = exports.generateKey = function generateKey(salt, passPhrase) {
  var key = _cryptoJs2.default.PBKDF2(passPhrase, _cryptoJs2.default.enc.Hex.parse(salt), { keySize: __keySize, iterations: __iterationCount });
  return key;
};

var encrypt = exports.encrypt = function encrypt(salt, iv, passPhrase, plainText) {
  var key = generateKey(salt, passPhrase);
  var encrypted = _cryptoJs2.default.AES.encrypt(plainText, key, { iv: _cryptoJs2.default.enc.Hex.parse(iv) });
  return encrypted.ciphertext.toString(_cryptoJs2.default.enc.Base64);
};

var decrypt = exports.decrypt = function decrypt(salt, iv, passPhrase, cipherText) {
  var key = generateKey(salt, passPhrase);
  var cipherParams = _cryptoJs2.default.lib.CipherParams.create({
    ciphertext: _cryptoJs2.default.enc.Base64.parse(cipherText)
  });
  var decrypted = _cryptoJs2.default.AES.decrypt(cipherParams, key, { iv: _cryptoJs2.default.enc.Hex.parse(iv) });
  return decrypted.toString(_cryptoJs2.default.enc.Utf8);
};