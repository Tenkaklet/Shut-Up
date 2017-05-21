// Ionic ShutUp App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'ShutUp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'ShutUp.services' is found in services.js
// 'ShutUp.controllers' is found in controllers.js
angular.module('ShutUp', ['ionic', 'ShutUp.controllers', 'ShutUp.services', 'pubnub.angular.service', 'firebase', 'ShutUp.directives', 'luegg.directives', 'angularMoment', 'ngStorage'])

.run(function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    if (error === 'AUTH_REQUIRED') {
      $state.go('login');
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.lounge', {
    url: '/lounge',
    views: {
      'tab-dash': {
        templateUrl: 'templates/lounge.html',
        controller: 'ChatroomCtrl'
      }
    },
    resolve: {
      'currentAuth' : ['Auth', function (Auth) {
        return Auth.$requireSignIn();
      }]
    }
  })

  .state('tab.create-room', {
      url: '/create-room',
      views: {
        'tab-create-room': {
          templateUrl: 'templates/tab-create-room.html',
          controller: 'CreateRoomCtrl'
        }
      },
      resolve: {
        'currentAuth' : ['Auth', function (Auth) {
          return Auth.$requireSignIn();
        }]
      }
    })

    .state('login', {
      url: '/login',
          templateUrl: 'templates/login.html',
          controller: 'AuthCtrl'
    })
    .state('tab.home', {
      url: '/home',
      views: {
        'tab-home': {
          templateUrl: 'templates/home.html',
          controller: 'AuthCtrl'
        }
      },
      resolve: {
        'currentAuth' : ['Auth', function (Auth) {
          return Auth.$requireSignIn();
        }]
      }
    })

    .state('tab.specific', {
      url: '/room/:room',
      templateUrl: 'templates/specific.html',
      controller: 'SpecificCtrl'
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AuthCtrl'
      }
    },
    resolve: {
      'currentAuth' : ['Auth', function (Auth) {
        return Auth.$requireSignIn();
      }]
    }
  })
  .state('tab.list', {
    url: '/list-rooms',
    views: {
      'tab-list': {
        templateUrl: 'templates/list-rooms.html',
        controller: 'ListRoomsCtrl'
      }
    },
    resolve: {
      'currentAuth' : ['Auth', function (Auth) {
        return Auth.$requireSignIn();
      }]
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
