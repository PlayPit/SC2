; (function () {
    'use strict';
    var app = angular.module('sound-cloud-player');
    var controllerName = 'SettingsController';
    var Settings = chrome.extension.getBackgroundPage().Settings;
    app.controller(controllerName, [
        function SettingsController() {
            this.notification = Settings.notification;
            this.tracksSize = Settings.tracksSize;

            this.save = function () {
                Settings.save(this.tracksSize, this.notification);
            }

            this.setDefault = function () {
                Settings.backToDefault();
                window.close();
            }
            
            this.logout = function () {
                Settings.terminate();
                window.close();
            }
        }
    ]);
})();