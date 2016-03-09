;(function () {
    'use strict';
    var app = angular.module('sound-cloud-player');
    var controllerName = 'LoginController';
    var BG = chrome.extension.getBackgroundPage().BackGround;
    var APIHelper = chrome.extension.getBackgroundPage().apiHelper;
    app.controller(controllerName, ["$scope",
        function LoginController($scope) {
            $scope.skip = function() {
                BG.currentUser.loginAsGuest();
            }
            
            $scope.signIn = function() {
                APIHelper.connect();
            }
        }
    ]);
})();