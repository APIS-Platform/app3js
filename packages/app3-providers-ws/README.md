# app3-providers-ws

This is a sub package of [app3.js][repo]

This is a websocket provider for [app3.js][repo].   
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-providers-ws
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-providers-ws.js` in your html file.
This will expose the `Web3WsProvider` object on the window object.


## Usage

```js
// in node.js
var App3WsProvider = require('app3-providers-ws');

var options = { timeout: 30000, headers: {authorization: 'Basic username:password'} } // set a custom timeout at 30 seconds, and credentials (you can also add the credentials to the URL: ws://username:password@localhost:8546)
var ws = new App3WsProvider('ws://localhost:8546', options);

// Disable AES encryption and improve communication speed with RPC.
ws.enableEncryption(false);

```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js