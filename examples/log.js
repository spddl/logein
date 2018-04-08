'use strict'

const winston = require('winston')
require('winston-daily-rotate-file') // https://github.com/winstonjs/winston-daily-rotate-file
const LogeinWebsocket = require('winston-logein-websocket')

// winston level only specific
// https://github.com/winstonjs/winston#filtering-info-objects

module.exports = function (option) {
  const log = new (winston.Logger)({ // https://github.com/winstonjs/winston/tree/2.x
    exitOnError: false,
    transports: [
      new (winston.transports.Console)({ // https://github.com/winstonjs/winston/blob/master/docs/transports.md#console-transport
        level: 'silly',
        colorize: true,
        timestamp: (process.argv[1].indexOf('ProcessContainerFork.js') === -1), // PM2 ?
        prettyPrint: true,
        humanReadableUnhandledException: true,
        showLevel: true
      }),
      new (winston.transports.DailyRotateFile)({
        name: 'info-file',
        level: 'silly',
        prettyPrint: true,
        dirname: 'C:/NodeJS/Data/logein/logs/',
        filename: option.name + '-info.log',
        datePattern: 'yyyy/MM/dd/',
        createTree: true,
        prepend: true,
        localTime: true,
        colorize: true,
        json: false
      }),
      new (winston.transports.DailyRotateFile)({
        name: 'error-file',
        level: 'error',
        prettyPrint: true,
        dirname: 'C:/NodeJS/Data/logein/logs/',
        filename: option.name + '-error.log',
        datePattern: 'yyyy/MM/dd/',
        createTree: true,
        prepend: true,
        localTime: true,
        colorize: true,
        json: false
      }),
      new LogeinWebsocket({
        level: 'silly',
        url: 'ws://localhost:30001',
        name: option.name,
        regex: true,
        colorize: true,
        ConvertAnsi: true,
        MetaJsonMarkup: true
      })
    ]
  })

  // Replace console.log and add more
  global.console.error = log.error
  global.console.warn = log.warn
  global.console.info = log.info
  global.console.verbose = log.verbose
  global.console.debug = log.debug
  global.console.silly = log.silly
  global.console.log = log.debug
  return log
}
