'use strict'

const winston = require('winston')
const LogeinWebsocket = require('winston-logein-websocket')

const log = new (winston.Logger)({ // https://github.com/winstonjs/winston/tree/2.x
  exitOnError: false,
  transports: [
    new (winston.transports.Console)({ // https://github.com/winstonjs/winston/blob/master/docs/transports.md#console-transport
      colorize: true,
      timestamp: true,
      prettyPrint: true,
      humanReadableUnhandledException: true,
      showLevel: true
    }),
    new LogeinWebsocket({
      url: 'ws://localhost:30001',
      name: 'simple.js',
      ConvertAnsi: true,
      colorize: true
    })
  ]
})

setInterval(function (params) {
  log.info('info')
}, 500)
