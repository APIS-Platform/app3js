# app3-core-method

This is a sub package of [app3.js][repo]

The Method package used within most [app3.js][repo] packages.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-core-method
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-core-method.js` in your html file.
This will expose the `App3Method` object on the window object.


## Usage

```js
// in node.js
var App3Method = require('app3-core-method');

var method = new App3Method({
    name: 'sendTransaction',
    call: 'apis_sendTransaction',
    params: 1,
    inputFormatter: [inputTransactionFormatter]
});
method.attachToObject(myCoolLib);

myCoolLib.sendTransaction({...}, function(){ ... });
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js


