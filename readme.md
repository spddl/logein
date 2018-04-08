# Logein ☕

inspired by [logio.org](http://logio.org)

This is a Personal project to overview many sources of logfiles with search and filter functions

Build with [µWS](https://www.npmjs.com/package/uws) and [protobufjs](https://www.npmjs.com/package/protobufjs) ❤ 

+ [µWS](https://www.npmjs.com/package/uws) ⮞ fastest Websocket lib
+ [Protocol Buffer](https://www.npmjs.com/package/protobufjs) ⮞ faster than JSON

![example1](https://i.imgur.com/3UnvL1P.jpg)
[Sidemenu](https://i.imgur.com/U3Ma4im.jpg)

## Install & start server
---------------

```
$ npm i logein --save
$ node server.js
```

### Quick Client Example
---------------

```
$ npm i winston-logein-transport --save
```

#### App.js

```javascript
'use strict'

const winston = require('winston')
const LogeinWebsocket = require('winston-logein-websocket')

const log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ // optional console output
      colorize: true,
      timestamp: true,
      showLevel: true
    }),
    new LogeinWebsocket({
      url: 'ws://localhost:30001',
      name: 'App.js', // App Name
      ConvertAnsi: true, // convert '\x1b[36mHelloWorld\x1b[0m' to HTML
      colorize: true
    })
  ]
})

setInterval(function (params) {
  log.info('info')
}, 500)
```

For more look into ./examples dir


tail.js for exsist logfiles
or executables

or centralize all settings in one file
and add:

```js
require ('./server/examples/log.js')
```
