var app = angular.module('showdown.editor', ['ng-showdown', 'pageslide-directive', 'ngAnimate', 'ngRoute']);

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
}]);


app.controller('editorCtrl', ['$scope', '$showdown', '$http', function($scope, $showdown, $http) {

  var hack = true;

  $scope.showModal = false;
  $scope.hashTxt = '';
  $scope.checked = false;
  $scope.firstLoad = true;
  $scope.text = '';
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

  $scope.toggleMenu = function () {
    $scope.firstLoad = false;
    $scope.checked = !$scope.checked;
  };

  $scope.getHash = function() {
    $scope.hashTxt = document.location.origin + document.location.pathname + '#/' + encodeURIComponent($scope.text);
    $scope.showModal = true;
  };

  $scope.closeModal = function () {
    $scope.showModal = false;
  };

  $scope.updateOptions = function () {
    for ( var i = 0; i < $scope.checkOpts.length; ++i) {
      $showdown.setOption($scope.checkOpts[i].name, $scope.checkOpts[i].value);
    }

    for ( i = 0; i < $scope.valOpts.length; ++i) {
      $showdown.setOption($scope.valOpts[i].name, $scope.valOpts[i].value);
    }

    // trigger text repaint (hackish way)
    $scope.text = $scope.text.replace(/\u200B/, '');
    if (hack) {
      $scope.text = '\u200B' + $scope.text;
    } else {
      $scope.text = $scope.text + '\u200B';
    }

    hack = !hack;
  };


  $scope.updateOptions();

  // get text from URL or load the default text
  if(window.location.hash) {
    var hashText = window.location.hash.replace(/^#(\/)?/, '');
    hashText = decodeURIComponent(hashText);
    $scope.text = hashText;
  } else {
    $http.get('md/text.md')
      .success(function(data) {
        $scope.text = data;
      })
      .error(function() {
        $scope.text =  '';
      });
  }
}]);

app.controller('getHashModalCtrl', function($scope) {

});
