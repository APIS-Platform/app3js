# app3-apis-accounts

This is a sub package of [app3.js][repo]

This is the accounts package to be used in the `app3-apis` package.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-apis-accounts
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-apis-accounts.js` in your html file.
This will expose the `App3ApisAccounts` object on the window object.


## Usage

```js
// in node.js
var App3ApisAccounts = require('app3-apis-accounts');

var account = new App3ApisAccounts('ws://localhost:8546');
account.create();
> {
  address: '0x2c7536E3605D9C16a7a3D7b1898e529396a65c23',
  privateKey: '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318',
  signTransaction: function(tx){...},
  sign: function(data){...},
  encrypt: function(password){...}
}
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js


