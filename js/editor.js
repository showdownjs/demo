window.onload = function () {

  //Check if AngularJs and Showdown is defined and only load ng-Showdown if both are present
  if (typeof angular !== 'undefined' && typeof showdown !== 'undefined') {
    (function (module, showdown) {
      'use strict';

      module
        .provider('$showdown', ngShowdown)
        .directive('sdModelToHtml', ['$showdown', '$sanitize', '$sce', sdModelToHtmlDirective]) //<-- DEPRECATED: will be removed in the next major version release
        .directive('markdownToHtml', ['$showdown', '$sanitize', '$sce', markdownToHtmlDirective])
        .filter('sdStripHtml', ['$showdown', stripHtmlFilter]) //<-- DEPRECATED: will be removed in the next major version release
        .filter('stripHtml', ['$showdown', stripHtmlFilter]);

      /**
       * Angular Provider
       * Enables configuration of showdown via angular.config and Dependency Injection into controllers, views
       * directives, etc... This assures the directives and filters provided by the library itself stay consistent
       * with the user configurations.
       * If the user wants to use a different configuration in a determined context, he can use the "classic" Showdown
       * object instead.
       */
      function ngShowdown() {

        // Configuration parameters for Showdown
        var config = {
          extensions: [],
          sanitize: false
        };

        /**
         * Sets a configuration option
         *
         * @param {string} key Config parameter key
         * @param {string} value Config parameter value
         */
        /* jshint validthis: true */
        this.setOption = function (key, value) {
          config[key] = value;
          return this;
        };

        /**
         * Gets the value of the configuration parameter specified by key
         *
         * @param {string} key The config parameter key
         * @returns {string|null} Returns the value of the config parameter. (or null if the config parameter is not set)
         */
        this.getOption = function (key) {
          if (config.hasOwnProperty(key)) {
            return config[key];
          } else {
            return undefined;
          }
        };

        /**
         * Loads a Showdown Extension
         *
         * @param {string} extensionName The name of the extension to load
         */
        this.loadExtension = function (extensionName) {
          config.extensions.push(extensionName);

          return this;
        };

        function SDObject() {
          var converter = new showdown.Converter(config);

          /**
           * Converts a markdown text into HTML
           *
           * @param {string} markdown The markdown string to be converted to HTML
           * @returns {string} The converted HTML
           */
          this.makeHtml = function (markdown) {
            return converter.makeHtml(markdown);
          };

          /**
           * Strips a text of it's HTML tags. See http://stackoverflow.com/questions/17289448/angularjs-to-output-plain-text-instead-of-html
           *
           * @param {string} text
           * @returns {string}
           */
          this.stripHtml = function (text) {
            return String(text).replace(/<[^>]+>/gm, '');
          };

          /**
           * Gets the value of the configuration parameter of CONVERTER specified by key
           * @param {string} key The config parameter key
           * @returns {*}
           */
          this.getOption = function (key) {
            return converter.getOption(key);
          };

          /**
           * Gets the converter configuration params
           * @returns {*}
           */
          this.getOptions = function () {
            return converter.getOptions();
          };

          /**
           * Sets a configuration option
           *
           * @param {string} key Config parameter key
           * @param {string} value Config parameter value
           * @returns {SDObject}
           */
          this.setOption = function (key, value) {
            converter.setOption(key, value);
            return this;
          };
        }

        // The object returned by service provider
        this.$get = function () {
          return new SDObject();
        };
      }

      /**
       * @deprecated
       * Legacy AngularJS Directive to Md to HTML transformation
       *
       * Usage example:
       * <div sd-model-to-html="markdownText" ></div>
       *
       * @param {showdown.Converter} $showdown
       * @param {$sanitize} $sanitize
       * @param {$sce} $sce
       * @returns {*}
       */
      function sdModelToHtmlDirective($showdown, $sanitize, $sce) {
        return {
          restrict: 'A',
          link: getLinkFn($showdown, $sanitize, $sce),
          scope: {
            model: '=sdModelToHtml'
          },
          template: '<div ng-bind-html="trustedHtml"></div>'
        };
      }

      /**
       * AngularJS Directive to Md to HTML transformation
       *
       * Usage example:
       * <div markdown-to-html="markdownText" ></div>
       *
       * @param {showdown.Converter} $showdown
       * @param {$sanitize} $sanitize
       * @param {$sce} $sce
       * @returns {*}
       */
      function markdownToHtmlDirective($showdown, $sanitize, $sce) {
        return {
          restrict: 'A',
          link: getLinkFn($showdown, $sanitize, $sce),
          scope: {
            model: '=markdownToHtml'
          },
          template: '<div ng-bind-html="trustedHtml"></div>'
        };
      }

      function getLinkFn($showdown, $sanitize, $sce) {
        return function (scope, element, attrs) {
          scope.$watch('model', function (newValue) {
            var showdownHTML;
            if (typeof newValue === 'string') {
              showdownHTML = $showdown.makeHtml(newValue);
              scope.trustedHtml = ($showdown.getOption('sanitize')) ? $sanitize(showdownHTML) : $sce.trustAsHtml(showdownHTML);
            } else {
              scope.trustedHtml = typeof newValue;
            }
          });
        };
      }

      /**
       * AngularJS Filter to Strip HTML tags from text
       *
       * @returns {Function}
       */
      function stripHtmlFilter($showdown) {
        return function (text) {
          return $showdown.stripHtml(text);
        };
      }

    })(angular.module('ng-showdown', ['ngSanitize']), showdown);

  } else {
    document.cookie = 'version=develop';
    throw new Error('ng-showdown was not loaded because one of its dependencies (AngularJS or Showdown) was not met');
  }


  var app = angular.module('showdown.editor', ['ng-showdown', 'pageslide-directive', 'ngAnimate', 'ngRoute', 'ngCookies']);

  app.directive('squeeze', ['$animate', function ($animate) {
    return {
      link: function (scope, element, attrs) {
        scope.$watch('checked', function (newValue) {
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


  app.controller('editorCtrl', ['$scope', '$showdown', '$http', '$cookies', function ($scope, $showdown, $http, $cookies) {

    var hack = true;

    $scope.versions = ['develop', 'master'];
    $scope.version = $cookies.get('version') || 'develop';
    $scope.showModal = false;
    $scope.hashTxt = '';
    $scope.checked = false;
    $scope.firstLoad = true;
    $scope.text = '';

		var savedCheckOpts = $cookies.getObject('checkOpts') || [];
    $scope.checkOpts = [
        {name: 'omitExtraWLInCodeBlocks', value: true},
        {name: 'noHeaderId', value: false},
        {name: 'parseImgDimensions', value: true},
        {name: 'simplifiedAutoLink', value: true},
        {name: 'literalMidWordUnderscores', value: true},
        {name: 'strikethrough', value: true},
        {name: 'tables', value: true},
        {name: 'tablesHeaderId', value: false},
        {name: 'ghCodeBlocks', value: true},
        {name: 'tasklists', value: true},
        {name: 'smoothLivePreview', value: true},
        {name: 'prefixHeaderId', value: false},
        {name: 'disableForced4SpacesIndentedSublists', value: false}
      ];
			
		for (var i = 0; i < $scope.checkOpts.length; ++i) {
			for (var ii = 0; ii < savedCheckOpts.length; ++ii) {
				if ($scope.checkOpts[i].name === savedCheckOpts[ii].name) {
					$scope.checkOpts[i].value = savedCheckOpts[ii].value;
					break;
				}
			}
		}
			
    $scope.valOpts = $cookies.getObject('valOpts') || [
        {name: 'headerLevelStart', value: 3}
      ];

    $scope.toggleMenu = function () {
      $scope.firstLoad = false;
      $scope.checked = !$scope.checked;
    };

    $scope.getHash = function () {
      $scope.hashTxt = document.location.origin + document.location.pathname + '#/' + encodeURIComponent($scope.text);
      $scope.showModal = true;
    };

    $scope.closeModal = function () {
      $scope.showModal = false;
    };

    $scope.loadVersion = function () {
      $cookies.put('version', $scope.version);
      sessionStorage.setItem("text", $scope.text);
      location.reload();
    };

    $scope.updateOptions = function () {
      for (var i = 0; i < $scope.checkOpts.length; ++i) {
        $showdown.setOption($scope.checkOpts[i].name, $scope.checkOpts[i].value);
      }

      for (i = 0; i < $scope.valOpts.length; ++i) {
        if ($scope.valOpts[i].name === 'headerLevelStart') {
          if (isNaN($scope.valOpts[i].value) || $scope.valOpts[i].value < 1) {
            $scope.valOpts[i].value = 1;
          } else if ($scope.valOpts[i].value > 6) {
            $scope.valOpts[i].value = 6;
          }
        }
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
      $cookies.putObject('checkOpts', $scope.checkOpts);
      $cookies.putObject('valOpts', $scope.valOpts);
    };

    //load available versions
    $http.get('https://api.github.com/repos/showdownjs/showdown/releases')
      .then(
      function (response) {
        for (var i = 0; i < response.data.length; ++i) {
          if (compareVersions(response.data[i].tag_name, '1.0.0') >= 0) {
            $scope.versions.push(response.data[i].tag_name);
          }
        }
      },
      function (error) {
        console.error('Error retrieving versions', error);
      }
    );

    $scope.updateOptions();

    // get text from URL or load the default text
    if (window.location.hash) {
      var hashText = window.location.hash.replace(/^#(\/)?/, '');
      hashText = decodeURIComponent(hashText);
      $scope.text = hashText;
    } else if (sessionStorage.getItem('text')) {
      $scope.text = sessionStorage.getItem('text');
    } else {
      $http.get('md/text.md')
        .success(function (data) {
					$scope.text = data;
					$http.get('//raw.githubusercontent.com/wiki/showdownjs/showdown/Showdown\'s-Markdown-syntax.md')
						.success(function (data2) {
							$scope.text = $scope.text + '\n\n' + data2;
						});
        })
        .error(function () {
          $scope.text = '';
        });
    }

  }]);


  angular.bootstrap(document, ['showdown.editor']);
};