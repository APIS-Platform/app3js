# app3-core-subscriptions

This is a sub package of [app3.js][repo]

The subscriptions package used within some [app3.js][repo] packages.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install app3-core-subscriptions
```

### In the Browser

Build running the following in the [app3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/app3-core-subscriptions.js` in your html file.
This will expose the `App3Subscriptions` object on the window object.


## Usage

```js
// in node.js
var App3Subscriptions = require('app3-core-subscriptions');

var sub = new App3Subscriptions({
    name: 'subscribe',
    type: 'apis',
    subscriptions: {
        'newBlockHeaders': {
            subscriptionName: 'newHeads',
            params: 0,
            outputFormatter: formatters.outputBlockFormatter
        },
        'pendingTransactions': {
            params: 0,
            outputFormatter: formatters.outputTransactionFormatter
        }
    }
});
sub.attachToObject(myCoolLib);

myCoolLib.subscribe('newBlockHeaders', function(){ ... });
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js


