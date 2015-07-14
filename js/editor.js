var app = angular.module('showdown.editor', ['ng-showdown']);

app.config(['$showdownProvider', function ($showdownProvider) {
  $showdownProvider.setOption('omitExtraWLInCodeBlocks',   true);
  $showdownProvider.setOption('simplifiedAutoLink',        true);
  $showdownProvider.setOption('literalMidWordUnderscores', true);
  $showdownProvider.setOption('strikethrough',             true);
  $showdownProvider.setOption('tables',                    true);
  $showdownProvider.setOption('tablesHeaderId',            true);
  $showdownProvider.setOption('ghCodeBlocks',              true);
  $showdownProvider.setOption('tasklists',                 true);
  $showdownProvider.setOption('parseImgDimensions',        true);
  $showdownProvider.setOption('parseImgDimensions',        true);
  $showdownProvider.setOption('headerLevelStart',          3);
}]);

app.controller('editorCtrl', ['$scope', '$showdown', '$http', function($scope, $showdown, $http) {
  $scope.text = '';

  $http.get('md/text.md')
    .success(function(data) {
      $scope.text = data;
    })
    .error(function() {
      $scope.text =  "Request failed";
    });
}]);
