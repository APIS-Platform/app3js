# app3-apis-abi

This is a sub package of [app3.js][repo]

This is the abi package to be used in the `app3-apis` package.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-apis-abi
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-apis-abi.js` in your html file.
This will expose the `App3ApisAbi` object on the window object.


## Usage

```js
// in node.js
var App3ApisAbi = require('app3-apis-abi');

App3ApisAbi.encodeFunctionSignature('myMethod(uint256,string)');
> '0x24ee0097'
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js

