# app3-apis-personal

This is a sub package of [app3.js][repo]

This is the personal package to be used in the `app3-apis` package.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-apis-personal
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-apis-personal.js` in your html file.
This will expose the `App3ApisPersonal` object on the window object.


## Usage

```js
// in node.js
var App3ApisPersonal = require('app3-apis-personal');

var personal = new App3ApisPersonal('ws://localhost:8546');
```


[docs]: http://app3js.readthedocs.io/en/1.0/
[repo]: https://github.com/apisereum/app3.js


