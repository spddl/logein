'use strict'

const spawn = require('child_process').spawn // https://nodejs.org/api/child_process.html
const path = require('path') // https://nodejs.org/api/path.html

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
      name: 'tail',
      colorize: true
    })
  ]
})

// Powershell https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-content?view=powershell-6
let cmd = spawn('powershell.exe', ['Get-Content', path.join('C:', 'A', 'B', 'C', 'logfile.txt'), '-Wait', '-Tail 25', '-Encoding UTF8'])

// Tail.exe
// let cmd = spawn(path.join(__dirname, 'tail.exe'), [path.join('U:', 'A', 'B', 'C', 'logfile.txt'), '-f', '-n 25'])

cmd.stdout.setEncoding('utf8') // https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding
cmd.stdout.on('data', function (d) {
  d.split('\r\n').forEach(function (key) {
    if (key.length !== 0) log.info(key)
  })
})

cmd.stderr.setEncoding('utf8')
cmd.stderr.on('data', function (d) {
  d.split('\r\n').forEach(function (key) {
    if (key.length !== 0) log.warn(key)
  })
})

cmd.on('exit', function (code) {
  log.info('exit', code)
})
