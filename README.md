# app3js - APIS JavaScript API

This is the APIS [JavaScript API][docs]

You need to run a local or remote APIS node to use this library.

Please read the [documentation][docs] for more.

## Installation

### Node

```bash
npm install app3js
```

### Yarn

```bash
yarn add app3js
```

### In the Browser

Use the prebuild ``dist/app3.min.js``, or
build using the [app3js][repo] repository:

```bash
npm run-script build
```

Then include `dist/app3.js` in your html file.
This will expose `App3` on the window object.

## Usage

```js
// in node.js
var App3 = require('app3');

var app3 = new App3('ws://153a17085797541e1b821aa7f0:111d8060fd25b75dfadbe0379f@127.0.0.1:40405');

```

Additionally you can set a provider using `app3.setProvider()` (e.g. WebsocketProvider)

```js
app3.setProvider(''ws://153a17085797541e1b821aa7f0:111d8060fd25b75dfadbe0379f@127.0.0.1:40405'');
// or
app3.setProvider(new App3.providers.WebsocketProvider(''ws://153a17085797541e1b821aa7f0:111d8060fd25b75dfadbe0379f@127.0.0.1:40405''));
```

There you go, now you can use it:

```js
app3.apis.getAccounts()
.then(console.log);
```

## Documentation

Documentation can be found at [read the docs][docs]


## Building

### Requirements

* [Node.js](https://nodejs.org)
* npm

```bash
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```

### Building (gulp)

Build only the app3js package

```bash
npm run-script build
```

Or build all sub packages as well

```bash
npm run-script build-all
```

This will put all the browser build files into the `dist` folder.


[repo]: https://github.com/APIS-Platform/app3.js
[docs]: https://app3js.readthedocs.io/en/latest
[npm-url]: https://npmjs.org/package/app3js