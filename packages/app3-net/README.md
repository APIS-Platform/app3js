# app3-net

This is a sub package of [app3.js][repo]

This is the net package to be used in other app3.js packages.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-net
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-net.js` in your html file.
This will expose the `App3Net` object on the window object.


## Usage

```js
// in node.js
var App3Net = require('app3-net');

var net = new App3Net('ws://localhost:8546');
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js
