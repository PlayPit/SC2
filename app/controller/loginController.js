;(function () {
    'use strict';
    var app = angular.module('sound-cloud-player');
    var controllerName = 'LoginController';
    var APIHelper = chrome.extension.getBackgroundPage().APIHelper;
    app.controller(controllerName, ["$scope",
        function LoginController($scope) {
            $scope.skip = function() {
                APIHelper.loginAsGuest();
            }
            
            $scope.signIn = function() {
                APIHelper.connect();
            }
        }
    ]);
})();