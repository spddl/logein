'use strict'
const app = angular.module('App', ['ngSanitize', 'ngScrollGlue', 'ngStorage'])

app.config(['$compileProvider', function ($compileProvider) { // https://docs.angularjs.org/guide/production
  $compileProvider.debugInfoEnabled(false)
  $compileProvider.commentDirectivesEnabled(false)
}])

app.filter('htmlToPlaintext', function () {
  return function (text) {
    return angular.element(text).text()
  }
})

app.controller('Ctrl', function controller ($scope, $sce, $timeout, $window, $q, $localStorage) {
  $scope.optionsDefault = {
    dark: true,
    q: '',
    app: '',
    lvl: '',
    orderByField: 'timestamp',
    reverseSort: false,
    glued: true,
    update: true,
    strict: false,
    apps: {},
    maxcount: 0,
    totalDisplayed: 250
  }

  $scope.options = $localStorage.$default($scope.optionsDefault)

  $scope.reset = function () {
    $localStorage.$reset($scope.optionsDefault)
    timestampFormat()
    UIkit.notification("<span uk-icon='icon: trash'></span> Reset settings")
  }

  // shrink Timestamp on Mobile
  function timestampFormat () {
    if ($window.innerWidth < 640) {
      $scope.options.timestampFormat = 'HH:mm:ss.sss'
    } else {
      $scope.options.timestampFormat = 'yyyy-MM-dd HH:mm:ss.sss'
    }
  }

  // on startup
  $scope.options.q = ''
  $scope.options.app = ''
  $scope.options.lvl = ''
  $scope.options.glued = true
  $scope.options.update = true
  timestampFormat()

  $scope.logs = []

  let LogMessage
  protobuf.load('log.proto', function pb (err, root) {
    if (err) {
      throw err
    }
    LogMessage = root.lookupType('log.set')

    let connection = new WebSocket('ws://' + window.location.host)
    connection.binaryType = 'arraybuffer'
    connection.onopen = function () {
      console.log('Websocket connected')
    }
    connection.onclose = function () {
      console.log('Websocket connection lost')
      // Try to reconnect in 5 seconds
      setTimeout(function () { connection = new WebSocket('ws://' + window.location.host) }, 5000)
    }
    connection.onerror = function (error) {
      console.error('WebSocket Error', error)
    }

    function asyncUnique (data) {
      return $q(function (resolve, reject) {
        let apps = {}
        angular.forEach(data, function forEach (value, key) {
          if (!$scope.options.apps[value.app] && !apps[value.app]) {
            apps[value.app] = {}
            apps[value.app].status = true
            apps[value.app].color = getRandomColorr()
          }
        })
        resolve(apps)
      })
    }

    connection.onmessage = function (e) {
      // Protobuf
      const data = new Uint8Array(e.data)
      const message = LogMessage.decode(data)

      // Add to Array
      if (message.data.length === 1) {
        $scope.logs.push(message.data[0])
      } else {
        $scope.logs = $scope.logs.concat(message.data)
      }

      // update view
      if ($scope.options.update) {
        asyncUnique(message.data).then(function (done) {
          $scope.options.apps = Object.assign({}, done, $scope.options.apps)
        })
        // $scope.$evalAsync() // no longer needed
      }

      if ($scope.options.maxcount !== 0) {
        if ($scope.logs.length > $scope.options.maxcount || false) $scope.logs = $scope.logs.splice(-$scope.options.maxcount)
      }
    }
  })

  $scope.$watch('options.glued', function watchGlue (newValue, oldValue) {
    $scope.options.update = newValue
    if (newValue === oldValue) { return }
    if ($scope.options.update) {
      UIkit.notification.closeAll()
      UIkit.notification("<span uk-icon='icon: refresh'></span> update")
      $scope.$evalAsync()
    } else {
      UIkit.notification.closeAll()
      UIkit.notification({
        message: "<span uk-icon='icon: ban'></span> disable update",
        timeout: 0
      })
    }
  })

  $scope.trustAsHtml = function trustAsHtml (string) {
    return $sce.trustAsHtml(string)
  }

  $scope.AppFilter = function AppFilter (item) {
    if (angular.isUndefined($scope.options.apps[item.app])) {
      return true
    } else {
      if ($scope.options.apps[item.app]) {
        return $scope.options.apps[item.app].status === true
      } else {
        return false
      }
    }
  }

  $scope.query = function () {
    if ($scope.options.q === '') {
      $scope.options.strict = true
    } else {
      $scope.options.strict = false
    }
  }

  $scope.FilterLevel = function FilterLevel (name) {
    if ($scope.options.lvl === name) {
      $scope.options.lvl = ''
      $scope.options.strict = false

      UIkit.notification.closeAll()
      UIkit.notification('Reset FilterLevel')
    } else {
      $scope.options.lvl = name
      $scope.options.app = ''
      $scope.options.strict = true

      UIkit.notification.closeAll()
      UIkit.notification('FilterLevel: ' + angular.element(name).text())
    }
    // console.log('FilterLevel', name, $scope.options.strict, $scope.options.lvl)
  }
  $scope.FilterApp = function FilterApp (name) {
    if ($scope.options.app === name) {
      $scope.options.app = ''
      $scope.options.strict = false

      UIkit.notification.closeAll()
      UIkit.notification('Reset FilterApp')
    } else {
      $scope.options.app = name
      $scope.options.lvl = ''
      $scope.options.strict = true

      UIkit.notification.closeAll()
      UIkit.notification('FilterApp: ' + name)
    }
    // console.log('FilterApp', name, $scope.options.strict, $scope.options.app)
  }
})

let randomcolor = ['#fc5c65', '#fd9644', '#fed330', '#26de81', '#2bcbba', '#eb3b5a', '#fa8231', '#f7b731', '#20bf6b', '#0fb9b1', '#45aaf2', '#4b7bec', '#a55eea', '#d1d8e0', '#778ca3', '#2d98da', '#3867d6', '#8854d0', '#a5b1c2', '#4b6584'] // https://flatuicolors.com/
function getRandomColorr () {
  const index = Math.floor(Math.random() * randomcolor.length)
  const color = randomcolor[index]
  randomcolor.splice(index, 1)
  if (!randomcolor.length) {
    randomcolor = ['#fc5c65', '#fd9644', '#fed330', '#26de81', '#2bcbba', '#eb3b5a', '#fa8231', '#f7b731', '#20bf6b', '#0fb9b1', '#45aaf2', '#4b7bec', '#a55eea', '#d1d8e0', '#778ca3', '#2d98da', '#3867d6', '#8854d0', '#a5b1c2', '#4b6584']
  }
  return color
}
