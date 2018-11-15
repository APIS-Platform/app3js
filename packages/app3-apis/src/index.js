/*
 This file is part of app3.js.

 app3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 app3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with app3.js.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

var _ = require('underscore');
var core = require('app3-core');
var helpers = require('app3-core-helpers');
var Subscriptions = require('app3-core-subscriptions').subscriptions;
var Method = require('app3-core-method');
var utils = require('app3-utils');
var Net = require('app3-net');

var Personal = require('app3-apis-personal');
var BaseContract = require('app3-apis-contract');
var Accounts = require('app3-apis-accounts');
var abi = require('app3-apis-abi');

var getNetworkType = require('./getNetworkType.js');
var formatter = helpers.formatters;


var blockCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? "apis_getBlockByHash" : "apis_getBlockByNumber";
};

var transactionFromBlockCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'apis_getTransactionByBlockHashAndIndex' : 'apis_getTransactionByBlockNumberAndIndex';
};

var getBlockTransactionCountCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'apis_getBlockTransactionCountByHash' : 'apis_getBlockTransactionCountByNumber';
};


var Eth = function Eth() {
    var _this = this;

    // sets _requestmanager
    core.packageInit(this, arguments);

    // overwrite setProvider
    var setProvider = this.setProvider;
    this.setProvider = function () {
        setProvider.apply(_this, arguments);
        _this.net.setProvider.apply(_this, arguments);
        _this.personal.setProvider.apply(_this, arguments);
        _this.accounts.setProvider.apply(_this, arguments);
        _this.Contract.setProvider(_this.currentProvider, _this.accounts);
    };


    var defaultAccount = null;
    var defaultBlock = 'latest';

    Object.defineProperty(this, 'defaultAccount', {
        get: function () {
            return defaultAccount;
        },
        set: function (val) {
            if(val) {
                defaultAccount = utils.toChecksumAddress(formatter.inputAddressFormatter(val));
            }

            // also set on the Contract object
            _this.Contract.defaultAccount = defaultAccount;
            _this.personal.defaultAccount = defaultAccount;

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultAccount = defaultAccount;
            });

            return val;
        },
        enumerable: true
    });
    Object.defineProperty(this, 'defaultBlock', {
        get: function () {
            return defaultBlock;
        },
        set: function (val) {
            defaultBlock = val;
            // also set on the Contract object
            _this.Contract.defaultBlock = defaultBlock;
            _this.personal.defaultBlock = defaultBlock;

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultBlock = defaultBlock;
            });

            return val;
        },
        enumerable: true
    });


    this.clearSubscriptions = _this._requestManager.clearSubscriptions;

    // add net
    this.net = new Net(this.currentProvider);
    // add chain detection
    this.net.getNetworkType = getNetworkType.bind(this);

    // add accounts
    this.accounts = new Accounts(this.currentProvider);

    // add personal
    this.personal = new Personal(this.currentProvider);
    this.personal.defaultAccount = this.defaultAccount;

    // create a proxy Contract type for this instance, as a Contract's provider
    // is stored as a class member rather than an instance variable. If we do
    // not create this proxy type, changing the provider in one instance of
    // app3-apis would subsequently change the provider for _all_ contract
    // instances!
    var self = this;
    var Contract = function Contract() {
        BaseContract.apply(this, arguments);

        // when Eth.setProvider is called, call packageInit
        // on all contract instances instantiated via this Eth
        // instances. This will update the currentProvider for
        // the contract instances
        var _this = this;
        var setProvider = self.setProvider;
        self.setProvider = function() {
          setProvider.apply(self, arguments);
          core.packageInit(_this, [self.currentProvider]);
        };
    };

    Contract.setProvider = function() {
        BaseContract.setProvider.apply(this, arguments);
    };

    // make our proxy Contract inherit from app3-apis-contract so that it has all
    // the right functionality and so that instanceof and friends work properly
    Contract.prototype = Object.create(BaseContract.prototype);
    Contract.prototype.constructor = Contract;

    // add contract
    this.Contract = Contract;
    this.Contract.defaultAccount = this.defaultAccount;
    this.Contract.defaultBlock = this.defaultBlock;
    this.Contract.setProvider(this.currentProvider, this.accounts);

    // add ABI
    this.abi = abi;

    var methods = [
        new Method({
            name: 'getNodeInfo',
            call: 'app3_clientVersion'
        }),
        new Method({
            name: 'getProtocolVersion',
            call: 'apis_protocolVersion',
            params: 0
        }),
        new Method({
            name: 'getCoinbase',
            call: 'apis_coinbase',
            params: 0
        }),
        new Method({
            name: 'isMining',
            call: 'apis_mining',
            params: 0
        }),
        new Method({
            name: 'isSyncing',
            call: 'apis_syncing',
            params: 0,
            outputFormatter: formatter.outputSyncingFormatter
        }),
        new Method({
            name: 'getGasPrice',
            call: 'apis_gasPrice',
            params: 0,
            outputFormatter: formatter.outputBigNumberFormatter
        }),
        new Method({
            name: 'getAccounts',
            call: 'apis_accounts',
            params: 0,
            /*outputFormatter: utils.toChecksumAddress*/
        }),
        new Method({
            name: 'getWalletInfo',
            call: 'apis_getWalletInfo',
            params: 1
        }),
        new Method({
            name: 'getBlockNumber',
            call: 'apis_blockNumber',
            params: 0,
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'getBalance',
            call: 'apis_getBalance',
            params: 2,
            inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter]
        }),
        new Method({
            name: 'getCode',
            call: 'apis_getCode',
            params: 2,
            inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter]
        }),
        new Method({
            name: 'getBlock',
            call: blockCall,
            params: 2,
            inputFormatter: [formatter.inputBlockNumberFormatter, function (val) { return !!val; }],
            outputFormatter: formatter.outputBlockFormatter
        }),
        new Method({
            name: 'getBlockTransactionCount',
            call: getBlockTransactionCountCall,
            params: 1,
            inputFormatter: [formatter.inputBlockNumberFormatter],
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'getTransaction',
            call: 'apis_getTransactionByHash',
            params: 1,
            inputFormatter: [null],
            outputFormatter: formatter.outputTransactionFormatter
        }),
        new Method({
            name: 'getTransactionFromBlock',
            call: transactionFromBlockCall,
            params: 2,
            inputFormatter: [formatter.inputBlockNumberFormatter, utils.numberToHex],
            outputFormatter: formatter.outputTransactionFormatter
        }),
        new Method({
            name: 'getTransactionReceipt',
            call: 'apis_getTransactionReceipt',
            params: 1,
            inputFormatter: [null],
            outputFormatter: formatter.outputTransactionReceiptFormatter
        }),
        new Method({
            name: 'getTransactionCount',
            call: 'apis_getTransactionCount',
            params: 1,
            inputFormatter: [formatter.inputAddressFormatter],
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'sendSignedTransaction',
            call: 'apis_sendRawTransaction',
            params: 1,
            inputFormatter: [null]
        }),
        new Method({
            name: 'signTransaction',
            call: 'apis_signTransaction',
            params: 1,
            inputFormatter: [formatter.inputTransactionFormatter]
        }),
        new Method({
            name: 'sendTransaction',
            call: 'apis_sendTransaction',
            params: 1,
            inputFormatter: [formatter.inputTransactionFormatter]
        }),
        new Method({
            name: 'sign',
            call: 'apis_sign',
            params: 2,
            inputFormatter: [formatter.inputSignFormatter, formatter.inputAddressFormatter],
            transformPayload: function (payload) {
                payload.params.reverse();
                return payload;
            }
        }),
        new Method({
            name: 'call',
            call: 'apis_call',
            params: 2,
            inputFormatter: [formatter.inputCallFormatter, formatter.inputDefaultBlockNumberFormatter]
        }),
        new Method({
            name: 'estimateGas',
            call: 'apis_estimateGas',
            params: 1,
            inputFormatter: [formatter.inputCallFormatter],
            outputFormatter: utils.hexToNumber
        }),
        new Method({
            name: 'getPastLogs',
            call: 'apis_getLogs',
            params: 1,
            inputFormatter: [formatter.inputLogFormatter],
            outputFormatter: formatter.outputLogFormatter
        }),

        // subscriptions
        new Subscriptions({
            name: 'subscribe',
            type: 'apis',
            subscriptions: {
                'newBlockHeaders': {
                    subscriptionName: 'newHeads', // replace subscription with this name
                    params: 0,
                    outputFormatter: formatter.outputBlockFormatter
                },
                'pendingTransactions': {
                    subscriptionName: 'newPendingTransactions', // replace subscription with this name
                    params: 0
                },
                'logs': {
                    params: 1,
                    inputFormatter: [formatter.inputLogFormatter],
                    outputFormatter: formatter.outputLogFormatter,
                    // DUBLICATE, also in app3-apis-contract
                    subscriptionHandler: function (output) {
                        if(output.removed) {
                            this.emit('changed', output);
                        } else {
                            this.emit('data', output);
                        }

                        if (_.isFunction(this.callback)) {
                            this.callback(null, output, this);
                        }
                    }
                }
            }
        })
    ];

    methods.forEach(function(method) {
        method.attachToObject(_this);
        method.setRequestManager(_this._requestManager, _this.accounts); // second param means is eth.accounts (necessary for wallet signing)
        method.defaultBlock = _this.defaultBlock;
        method.defaultAccount = _this.defaultAccount;
    });

};

core.addProviders(Eth);


module.exports = Eth;

