# app3-core-requestmanager

This is a sub package of [app3.js][repo]

The requestmanager package is used by most [app3.js][repo] packages.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-core-requestmanager
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-core-requestmanager.js` in your html file.
This will expose the `App3RequestManager` object on the window object.


## Usage

```js
// in node.js
var App3WsProvider = require('app3-providers-ws');
var App3RequestManager = require('app3-core-requestmanager');

var requestManager = new App3RequestManager(new App3WsProvider('ws://localhost:8546'));
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js


