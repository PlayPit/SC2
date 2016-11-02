; (function () {
    'use strict';
    var app = angular.module('sound-cloud-player');
    var controllerName = 'HomeTabController';
    var APIHelper = chrome.extension.getBackgroundPage().APIHelper;
    var SCHelper = chrome.extension.getBackgroundPage().SCHelper;
    app.controller(controllerName, [
        function HomeTabController() {
            var htc = this;

            this.searchText = '';

            this.onenter = function (keyEvent) {
                if (keyEvent.which === 13)
                    htc.search();
            }

            this.search = function () {
                var controller = angular.element($('#list')).scope().itemsController;
                controller.setItems(
                    APIHelper.searchSounds(htc.searchText, function (result) {
                        var sounds = []
                        for (var i in result) {
                            sounds.push(getSoundObject(result[i], false));
                        }
                       return sounds;
                    })
                );
            }

            this.stream = function () {
                var controller = angular.element($('#list')).scope().itemsController;
                controller.setItems(
                   APIHelper.getMyActivities(function (result) {
                        var list = [];
                        for (var i in result) {
                            var object = result[i];
                            if (object.type.includes('track')) {
                                if (object.origin) {
                                    list.push(getSoundObject(object.origin, false));
                                }
                            } else {
                                if (object.type == 'playlist') {
                                    var playlist = getPlayListObject(object);
                                    playlist.static = false;
                                    APIHelper.getSoundsFromPlayList(playlist, function (playlist, result) {
                                        for (var i in result) {
                                            playlist.sounds.push(getSoundObject(result[i], true));
                                        }
                                    });
                                    list.push(playlist);
                                }
                            }
                        }
                        return list;
                    })
                );
            }

            this.getCharts = function () {
                var controller = angular.element($('#list')).scope().itemsController;
                controller.setItems(
                    APIHelper.getCharts(function (result) {
                        var list = [];
                        for (var i in result) {
                            var sound = result[i].track;
                            if (sound) {
                                list.push(getSoundObject(sound, false));
                            }
                        }
                        return list;
                    })
                );
            }

            var getSoundObject = function (object, inPlaylist) {
                return SCHelper.buildSoundObject(object, inPlaylist);
            }

            var getPlayListObject = function(object) {
                return  SCHelper.buildPlayListObject(object.origin);
            }
        }
    ]);
})();