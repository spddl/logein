'use strict'

const express = require('express')
const http = require('http')
const path = require('path')
const WebSocket = require('uws')

const app = express()
app.use('/', express.static('public', { index: 'index.htm' }))

const server = http.createServer(app)
const wsClient = new WebSocket.Server({ server })

const protobuf = require('protobufjs')
const root = protobuf.loadSync(path.join(__dirname, 'public', 'log.proto'))

const LogMessage = root.lookupType('log.set')

// Settings
const websitePort = 30000
const StoreMaxLines = 50000 // Infinity

// Broadcast to all.
wsClient.broadcast = function broadcast (data) {
  wsClient.clients.forEach(function each (client) {
    client.send(data)
  })
}

let msgbuffer = { data: [] }
wsClient.on('connection', function (ws) {
  const errMsg = LogMessage.verify(msgbuffer)
  if (errMsg) {
    console.warn(errMsg)
  }
  setImmediate(function () {
    try {
      ws.send(LogMessage.encode(LogMessage.create(msgbuffer)).finish())
    } catch (e) {
      console.warn(e)
    }
  })
})

server.listen(websitePort, function listening () {
  console.log('Listening on', websitePort)
})

const wsLog = new WebSocket.Server({ port: 30001 })
wsLog.on('connection', function (ws) {
  ws.on('message', buffer => {
    wsClient.broadcast(buffer) // to the Clients

    const msg = LogMessage.decode(new Uint8Array(buffer))
    const message = LogMessage.toObject(msg, { // https://github.com/dcodeIO/protobuf.js/blob/master/README.md#toolsetv
      longs: Number
    })

    msgbuffer.data = msgbuffer.data.concat(message.data)
    if (msgbuffer.data.length > StoreMaxLines || false) msgbuffer.data = msgbuffer.data.splice(-StoreMaxLines)
  })

  ws.on('close', function (code, reason) {
    console.log('wsLog close', code, reason)
  })
})
