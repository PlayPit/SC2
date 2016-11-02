; (function () {
    'use strict';
    var app = angular.module('sound-cloud-player');
    var controllerName = 'TracksTabController';
    var APIHelper = chrome.extension.getBackgroundPage().APIHelper;
    var SCHelper = chrome.extension.getBackgroundPage().SCHelper;
    app.controller(controllerName, [
        function TracksTabController() {
            
            this.myTracks = function () {
                var controller = angular.element($('#list')).scope().itemsController;
                controller.setItems(
                    APIHelper.getMyTracks(function (result) {
                        var sounds = []
                        for (var i in result) {
                            sounds.push(getSoundObject(result[i], false));
                        }
                        return sounds;
                    })
                );
            }

            this.favorites = function () {
                var controller = angular.element($('#list')).scope().itemsController;
                controller.setItems(
                    APIHelper.getMyFavorites(function (result) {
                        var sounds = []
                        for (var i in result) {
                            sounds.push(getSoundObject(result[i], false));
                        }
                        return sounds;
                    })
                );
            }

            var getSoundObject = function (object, inPlaylist) {
                return SCHelper.buildSoundObject(object, inPlaylist);
            }
        }
    ]);
})();