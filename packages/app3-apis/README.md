# app3-apis

This is a sub package of [app3.js][repo]

This is the APIS package to be used [app3.js][repo].
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-apis
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-apis.js` in your html file.
This will expose the `App3APIS` object on the window object.


## Usage

```js
// in node.js
var App3APIS = require('app3-apis');

var apis = new App3APIS('ws://localhost:8546');
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js


