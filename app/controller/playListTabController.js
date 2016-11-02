; (function () {
    'use strict';
    var app = angular.module('sound-cloud-player');
    var controllerName = 'PlayListTabController';
    var APIHelper = chrome.extension.getBackgroundPage().APIHelper;
    var SCHelper = chrome.extension.getBackgroundPage().SCHelper;
    app.controller(controllerName, [
        function PlayListTabController() {
            
            this.myPlaylists = function () {
                var controller = angular.element($('#list')).scope().itemsController;
                controller.setItems(
                    APIHelper.getMyPlaylists(function (result) {
                        var list = [];
                        for (var i in result) {
                            var object = result[i];
                            buildPlayList(object, list);
                        }
                        return list;
                    })
                );
            }

            this.favoritesPlaylists = function () {
                var controller = angular.element($('#list')).scope().itemsController;
                controller.setItems(
                    APIHelper.getMyFavoritePlaylists(function (result) {
                        var list = [];
                        for (var i in result) {
                            var object = result[i].playlist;
                            if(object) {
                                buildPlayList(object, list);
                            }
                        }
                        return list;
                    })
                );
            }

            var buildPlayList = function (object, list) {
                var playlist = getPlayListObject(object);
                var tracks = object.tracks;
                if (!playlist.art || playlist.art == "") {
                    if (tracks.length > 0) {
                        var first = tracks[0];
                        if (first.artwork_url || first.artwork_url != "") {
                            playlist.art = first.artwork_url
                        }
                    }
                }
                for (var i in tracks) {
                    var track = tracks[i];
                    if (!track.artwork_url || track.artwork_url == "") {
                        track.artwork_url = playlist.art;
                    }
                    playlist.sounds.push(getSoundObject(track, true));
                }
                list.push(playlist);
            }

            var getSoundObject = function (object, inPlaylist) {
                return SCHelper.buildSoundObject(object, inPlaylist);
            }
            
            var getPlayListObject = function(object) {
                return  SCHelper.buildPlayListObject(object);
            }
        }
    ]);
})();