var app = angular.module('showdown.editor', ['ng-showdown', 'pageslide-directive', 'ngAnimate']);

app.config([function () {

}]);

app.directive('squeeze', ['$animate', function($animate){

  return {
    link: function(scope, element, attrs) {
      scope.$watch('checked', function(newValue) {
        if (!scope.firstLoad) {
          if (newValue) {
            $animate.addClass(element, 'squeezed-body');
            element.removeClass('full-body');
          } else {
            $animate.addClass(element, 'full-body');
            element.removeClass('squeezed-body');
          }
        }
      });
    }
  };

  /*
  return function(scope, element, attrs) {
    var width = (scope.checked) ? $window.innerWidth - 300 : $window.innerWidth;
    width += 'px';
    var body = angular.element(document.body);
    document.body.style.width = width;
    console.log(scope);
     if (scope.checked) {
     $animate.addClass(element, 'squeezed-body');
     } else {
     $animate.removeClass(element, 'squeezed-body')
     }
  };
  */
}]);


app.controller('editorCtrl', ['$scope', '$showdown', '$http', function($scope, $showdown, $http) {
  $scope.checked = false;
  $scope.firstLoad = true;

  $scope.toggleMenu = function () {
    $scope.firstLoad = false;
    $scope.checked = !$scope.checked;
  };

  $scope.text = '';

  /** options **/
  $scope.checkOpts = [
    { name: 'omitExtraWLInCodeBlocks', value: true },
    { name: 'noHeaderId',              value: false },
    { name: 'parseImgDimensions',      value: true },
    { name: 'simplifiedAutoLink', value: true },
    { name: 'literalMidWordUnderscores', value: true },
    { name: 'strikethrough', value: true },
    { name: 'tables', value: true },
    { name: 'tablesHeaderId', value: false },
    { name: 'ghCodeBlocks', value: true },
    { name: 'tasklists', value: true },
    { name: 'smoothLivePreview', value: true },
    { name: 'prefixHeaderId', value: false }
  ];
  $scope.valOpts = [
    { name: 'headerLevelStart', value: 3 }
  ];
  /** end options **/

  $scope.updateOptions = function () {
    for ( var i = 0; i < $scope.checkOpts.length; ++i) {
      $showdown.setOption($scope.checkOpts[i].name, $scope.checkOpts[i].value);
    }

    for ( i = 0; i < $scope.valOpts.length; ++i) {
      $showdown.setOption($scope.valOpts[i].name, $scope.valOpts[i].value);
    }

    // trigger a showdown reload
    $scope.text = $scope.text + '&';
    $scope.text.replace(/&$/, '');

  };

  $scope.updateOptions();

  $http.get('md/text.md')
    .success(function(data) {
      $scope.text = data;
    })
    .error(function() {
      $scope.text =  "Request failed";
    });


}]);
