# wpp3-core-promievent

This is a sub package of [wpp3.js][repo]

This is the PromiEvent package is used to return a EventEmitter mixed with a Promise to allow multiple final states as well as chaining.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install wpp3-core-promievent
```

### In the Browser

Build running the following in the [wpp3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/wpp3-core-promievent.js` in your html file.
This will expose the `App3PromiEvent` object on the window object.


## Usage

```js
// in node.js
var App3PromiEvent = require('wpp3-core-promievent');

var myFunc = function(){
    var promiEvent = App3PromiEvent();
    
    setTimeout(function() {
        promiEvent.eventEmitter.emit('done', 'Hello!');
        promiEvent.resolve('Hello!');
    }, 10);
    
    return promiEvent.eventEmitter;
};


// and run it
myFunc()
.then(console.log);
.on('done', console.log);
```


[docs]: https://app3js.readthedocs.io/en/latest
[repo]: https://github.com/APIS-Platform/app3.js


