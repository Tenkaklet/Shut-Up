angular.module('ShutUp.directives', [])
.directive('scrollBottom', function() {
  return {
    scope: {
      scrollBottom: "="
    },
    link: function(scope, element) {
      scope.$watchCollection('scrollBottom', function(newValue) {
        if (newValue) {
          console.log('new element', element);
          console.log('new value', newValue);
          $(element).scrollTop($(element)[0].scrollHeight);
        }
      });
    }
  };
});
