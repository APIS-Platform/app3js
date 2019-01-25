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


var version = require('../package.json').version;
var core = require('app3-core');
var APIS = require('app3-apis');
var Net = require('app3-net');
var Personal = require('app3-apis-personal');
var utils = require('app3-utils');

var App3 = function App3() {
    var _this = this;

    // sets _requestmanager etc
    core.packageInit(this, arguments);

    this.version = version;
    this.utils = utils;

    this.apis = new APIS(this);

    // overwrite package setProvider
    var setProvider = this.setProvider;
    this.setProvider = function (provider, net) {
        setProvider.apply(_this, arguments);

        this.apis.setProvider(provider, net);

        return true;
    };
};

App3.version = version;
App3.utils = utils;
App3.modules = {
    APIS: APIS,
    Net: Net,
    Personal: Personal,
};

core.addProviders(App3);

module.exports = App3;