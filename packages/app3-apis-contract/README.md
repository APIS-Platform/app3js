# app3-apis-contract

This is a sub package of [app3.js][repo]

This is the contract package to be used in the `app3-apis` package.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-apis-contract
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-apis-contract.js` in your html file.
This will expose the `App3EthContract` object on the window object.


## Usage

```js
// in node.js
var App3EthContract = require('app3-apis-contract');

// set provider for all later instances to use
App3EthContract.setProvider('ws://localhost:8546');

var contract = new App3EthContract(jsonInterface, address);
contract.methods.somFunc().send({from: ....})
.on('receipt', function(){
    ...
});
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js
