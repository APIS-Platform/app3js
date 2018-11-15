# app3-utils

This is a sub package of [app3.js][repo]

This contains useful utility functions for Dapp developers.   
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-utils
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-utils.js` in your html file.
This will expose the `Apis3Utils` object on the window object.


## Usage

```js
// in node.js
var Apis3Utils = require('app3-utils');
console.log(Apis3Utils);
{
    sha3: function(){},
    soliditySha3: function(){},
    isAddress: function(){},
    ...
}
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js


