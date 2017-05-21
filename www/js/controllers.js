angular.module('ShutUp.controllers', [])

.controller('ChatroomCtrl', [ '$scope', 'PubNub', 'Auth', '$ionicPopover', '$location', '$rootScope', function($scope, PubNub, Auth, $ionicPopover, $location, $rootScope) {

  Auth.$onAuthStateChanged(function (user) {
    console.log(user);
    $scope.user = user;
    PubNub.init({
      publish_key:'pub-c-081358cb-7538-46d9-af8d-b8c31a46a2f6',
      subscribe_key: 'sub-c-b756290a-0076-11e7-aba5-0619f8945a4f',
      uuid: user.displayName,
    });
    console.log(PubNub);
    PubNub.ngSubscribe({
      channel: 'Lounge',
      triggerEvents: ['callback'],
      withPresence: true,
      presence: function (m) {
        console.log('presence', m);
      }
    });

    PubNub.ngHistory({
      channel: 'Lounge',
      callback: history
    });

    function history(hist) {
      console.log(hist);
      var messages = hist;
      $scope.messages = messages[0];
      console.log($scope.messages);
    }

    PubNub.ngHereNow({
      channel: 'Lounge',
      callback: function (person) {
        console.log(person);
      }
    });



    $scope.sendMessage = function () {
      if (!$scope.message || $scope.message === '') {
        return false;
      }
      PubNub.ngPublish({
        channel: 'Lounge',
        message: {
          message: $scope.message,
          user: user.displayName,
          time: new Date(),
          picture: user.photoURL
        },
        callback: function (m) {
          console.log(m);
        }
      });
      $scope.message = '';
    };

    $scope.messages = [];

    $rootScope.$on(PubNub.ngMsgEv('Lounge'), function (ngEvent, m) {
      console.log('m', m);
        $scope.messages.push(m);
        $scope.$apply(function() {
          
        });
    });

    // Register for presence events (optional)
 $rootScope.$on(PubNub.ngPrsEv($scope.channel), function(ngEvent, payload) {
   $scope.$apply(function() {
     $scope.users = PubNub.ngListPresence($scope.channel);
   });
 });

    $rootScope.$on(PubNub.ngPrsEv('Lounge'), function (event, payload) {
      console.log('hello');
      console.log('payload ' , payload);
      $scope.occupancy = payload.event;
      $scope.$apply(function () {

      });


      function here(channel) {
        var usersHere = PubNub.ngListPresence(channel);
        console.log(usersHere);
        $scope.users = usersHere;
        $scope.$apply(function () {

        });
      }
      here('Lounge');

      $scope.userData = PubNub.ngPresenceData('Lounge');
      console.log($scope.userData);

    });

    var state = PubNub.ngState({channel: 'Lounge'});
    console.log(state);

    $ionicPopover.fromTemplateUrl('templates/list-users.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.popover = popover;
   });

   $scope.openPopover = function($event) {
      $scope.popover.show($event);
   };

   $scope.closePopover = function() {
      $scope.popover.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.popover.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });


  }); // End of Auth state change checkerizer

}])

.controller('AuthCtrl', [ '$scope', 'Auth', '$location', '$ionicModal', '$ionicSlideBoxDelegate', 'storeUser', function($scope, Auth, $location, $ionicModal, $ionicSlideBoxDelegate, storeUser) {

console.log(Auth);

  $ionicModal.fromTemplateUrl('templates/sign-up.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });



  $scope.login = function (data) {
    var email = data.email;
    var password = data.password;
    Auth.$signInWithEmailAndPassword(email, password)
    .then(function (user) {
      console.log(user);
      $location.path('/tab/lounge');
    })
    .catch(function (err) {
      console.log(err);
    });
  };

  $scope.goToSignUp = function () {
    $scope.modal.show();
  };
  var ref = firebase.database().ref('users');

  $scope.signUp = function (data) {
    console.log(data);

    storeUser.email = data.email;
    console.log(storeUser);
    Auth.$createUserWithEmailAndPassword(data.email, data.password)
    .then(function (user) {
      console.log(user);
      ref.child(user.uid).set({
        email: data.email
      });
      storeUser.uid = user.uid;
      $ionicSlideBoxDelegate.next();
      console.log('next step');
    })
    .catch(function (err) {
      console.log(err);
      $scope.message = err.message;
    });
  };

  $scope.createUserName = function (name) {
    var theUser = firebase.auth().currentUser;
    console.log(theUser);
    console.log(name);
    function randomNumber() {
      return Math.floor(Math.random() * 100);
    }
    theUser.updateProfile({
      displayName: name.username,
      photoURL: 'https://api.adorable.io/avatars/73/' + randomNumber()
    });
    console.info('successfully made e-mail & username');
    $location.path('/tab/home');
    $scope.modal.hide();
  };


  $scope.closeSignUp = function () {
    console.log('closing sign up modal');
    $scope.modal.hide();
    setTimeout(function () {
      var body = document.getElementsByTagName('body')[0];
      console.log(body);
      $ionicSlideBoxDelegate.previous();
      body.classList.remove('modal-open');
      console.info('done');
    }, 600);
  };


  $scope.nextStep = function() {

   };

   $scope.prevStep = function () {
     $ionicSlideBoxDelegate.previous();
   };

   Auth.$onAuthStateChanged(function (user) {
     console.log(user);
     if (user !== null) {
       $scope.loggedIn = true;
       $location.path('/tab/lounge');
       user = firebase.auth().currentUser;
       $scope.user = user;
     } else {
       $scope.loggedIn = false;

     }
   });

   $scope.signOut = function () {
     Auth.$signOut();
     $location.path('/login');
   };


}])

.controller('CreateRoomCtrl', ['$scope', 'PubNub', 'Auth', '$ionicPopover', '$location', '$localStorage', function($scope, PubNub, Auth, $ionicPopover, $location, $localStorage) {
  Auth.$onAuthStateChanged(function (user) {
    PubNub.init({
      publish_key:'pub-c-081358cb-7538-46d9-af8d-b8c31a46a2f6',
      subscribe_key: 'sub-c-b756290a-0076-11e7-aba5-0619f8945a4f',
      uuid: user.displayName,
    });
    $scope.createRoom = function (room) {
      console.log(room);
      $localStorage.newRooms = [];
      $localStorage.newRooms.push(room.name);
      
      $location.path('tab/list-rooms');      
    };
  });
}])

.controller('SpecificCtrl', ['$scope', 'PubNub', 'Auth', '$ionicPopover', '$location', '$rootScope', '$stateParams', function($scope, PubNub, Auth, $ionicPopover, $location, $rootScope, $stateParams) {
  console.log($stateParams);
  $scope.roomName = $stateParams.room;
  Auth.$onAuthStateChanged(function (user) {
    console.log(user);
    $scope.user = user;
    PubNub.init({
      publish_key:'pub-c-081358cb-7538-46d9-af8d-b8c31a46a2f6',
      subscribe_key: 'sub-c-b756290a-0076-11e7-aba5-0619f8945a4f',
      uuid: user.displayName,
    });
    console.log(PubNub);
    PubNub.ngSubscribe({
      channel: $stateParams.room,
      triggerEvents: ['callback'],
      withPresence: true,
      presence: function (m) {
        console.log('presence', m);
      }
    });

    PubNub.ngHistory({
      channel: $stateParams.room,
      callback: history
    });

    function history(hist) {
      console.log(hist);
      var messages = hist;
      $scope.messages = messages[0];
      console.log($scope.messages);
    }

    PubNub.ngHereNow({
      channel: $stateParams.room,
      callback: function (person) {
        console.log(person);
      }
    });

    PubNub.ngState({
      channel: $stateParams.room,
      state: {
        typing: true
      },
      callback: function (state) {
        console.log(state);
      }
    });



    $scope.sendMessage = function () {
      if (!$scope.message || $scope.message === '') {
        return false;
      }
      PubNub.ngPublish({
        channel: $stateParams.room,
        message: {
          message: $scope.message,
          user: user.displayName,
          time: new Date(),
          picture: user.photoURL
        },
        callback: function (m) {
          console.log(m);
        }
      });
      $scope.message = '';
    };

    $scope.messages = [];

    $rootScope.$on(PubNub.ngMsgEv($stateParams.room), function (ngEvent, m) {
      console.log('m', m);
      $scope.$apply(function () {
        $scope.messages.push(m);
      });
    });

    // Register for presence events (optional)
 $rootScope.$on(PubNub.ngPrsEv($scope.channel), function(ngEvent, payload) {
   $scope.$apply(function() {
     $scope.users = PubNub.ngListPresence($scope.channel);
   });
 });

    $rootScope.$on(PubNub.ngPrsEv($stateParams.room), function (event, payload) {
      console.log('hello');
      console.log('payload ' , payload);
      $scope.occupancy = payload.event;
      $scope.$apply(function () {

      });


      function here(channel) {
        var usersHere = PubNub.ngListPresence(channel);
        console.log(usersHere);
        $scope.users = usersHere;
        $scope.$apply(function () {

        });
      }
      here($stateParams.room);

      $scope.userData = PubNub.ngPresenceData($stateParams.room);
      console.log($scope.userData);

    });

    var state = PubNub.ngState({channel: $stateParams.room});
    console.log(state);

    $ionicPopover.fromTemplateUrl('templates/list-users.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.popover = popover;
   });

   $scope.openPopover = function($event) {
      $scope.popover.show($event);
   };

   $scope.closePopover = function() {
      $scope.popover.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.popover.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });


  }); // End of Auth state change checkerizer
}])

.controller('ListRoomsCtrl', ['$scope', 'PubNub', 'Auth', '$ionicPopover', '$location', '$localStorage', function($scope, PubNub, Auth, $ionicPopover, $location, $localStorage) {
  Auth.$onAuthStateChanged(function (user) {
    PubNub.init({
      publish_key:'pub-c-081358cb-7538-46d9-af8d-b8c31a46a2f6',
      subscribe_key: 'sub-c-b756290a-0076-11e7-aba5-0619f8945a4f',
      uuid: user.displayName,
    });

    var store = $localStorage;
    console.log(store);
    

    PubNub.ngSubscribe({
      channel: store.newRooms,
      triggerEvents: ['callback'],
      withPresence: true,
      presence: function (m) {
        console.log('presence', m);
      }
    });

    $scope.rooms = PubNub.ngListChannels();
    console.log($scope.rooms);
    alert($scope.rooms[0]);
  });
}]);
