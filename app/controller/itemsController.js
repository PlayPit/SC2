; (function () {
    'use strict';
    var app = angular.module('sound-cloud-player');
    var controllerName = 'ItemsController';
    var Player = chrome.extension.getBackgroundPage().Player;
    var APIHelper = chrome.extension.getBackgroundPage().APIHelper;
    var SCHelper = chrome.extension.getBackgroundPage().SCHelper;
    app.controller(controllerName, ["$interval",
        function ItemsController($interval) {
            var tc = this;
            var selectedSoundId = -1;
            var isInitialized = true;

            this.likedTracksIds = [];
            this.likedPlayListsIds = [];

            this.currentUser; // = APIHelper.currentUser;
            this.sound; // = Player.sound;
            this.playlist; // = Player.playList;
            this.list = []; // = Player.getItemsList();

            this.init = function () {
                if (Player.customProperty.activeTabName == chrome.extension.getBackgroundPage().PlayerHelper.view.activeTabName) {
                    this.construct();
                    var scrollTop = $interval(function () {
                        if (tc.sound.id != selectedSoundId) {
                            SCHelper.scrollToSound($('#list'), tc.sound.id, tc.sound.inPlaylist, tc.playlist.id);
                            selectedSoundId = tc.sound.id;
                        }
                    }, 1000);

                    $('#list').on('$destroy', function () {
                        $interval.cancel(scrollTop);
                    });
                }
            }

            this.construct = function () {
                this.currentUser = APIHelper.currentUser;
                this.sound = Player.sound;
                this.playlist = Player.playList;
                this.list = Player.getItemsList();
            }


            this.setItems = function (callback) {
                SCHelper.drawObjects($('#loading'),
                    callback.then(function (data) {
                        tc.list = data;
                        isInitialized = false;
                        if (APIHelper.currentUser.scUser) {
                            APIHelper.getMyLikedTracksIds(function (data) {
                                for (var i in tc.list) {
                                    if (tc.list[i].type == "sound") {
                                        tc.list[i].marked = (jQuery.inArray(tc.list[i].id, data) != -1);
                                    } else {
                                        for (var j in tc.list[i].sounds) {
                                            tc.list[i].sounds[j].marked = (jQuery.inArray(tc.list[i].sounds[j].id, data) != -1);
                                        }
                                    }
                                }
                            });
                            APIHelper.getMyLikedPlayListsIds(function (data) {
                                for (var i in tc.list) {
                                    if (tc.list[i].type == "playlist") {
                                        tc.list[i].marked = (jQuery.inArray(tc.list[i].id, data) != -1);
                                    }
                                }
                            });
                        }
                        return true;
                    })
                );
            }

            this.playSound = function (id, plId) {
                if (!isInitialized) {
                    Player.setItems(this.list, true);
                    isInitialized = true;
                    Player.customProperty.activeTabName = chrome.extension.getBackgroundPage().PlayerHelper.view.activeTabName;
                    this.init();
                }
                if (plId == -1) {
                    Player.playSoundById(id);
                } else {
                    Player.playSoundFromPlayListById(id, plId);
                }
            }

            this.doLikeTrack = function (id) {
                setLikeForSound(id, true);
                Player.setLikeForSound(id, true);
                APIHelper.doLikeTrack(id, function (data) {
                });
            }

            this.doUnLikeTrack = function (id) {
                setLikeForSound(id, false);
                Player.setLikeForSound(id, false);
                APIHelper.doUnLikeTrack(id, function (data) {
                });
            }

            this.doLikePlaylist = function (id) {
                setLikeForPlaylist(id, true);
                Player.setLikeForPlaylist(id, true);
                APIHelper.doLikePlaylist(id, function (data) {
                });
            }

            this.doUnLikePlaylist = function (id) {
                setLikeForPlaylist(id, false);
                Player.setLikeForPlaylist(id, false);
                APIHelper.doUnLikePlaylist(id, function (data) {
                });
            }

            this.goToSoundCloudTrack = function (id) {
                APIHelper.getTrackPermalinkURL(id);
            }

             this.goToSoundCloudPlayList = function (id) {
                APIHelper.getPlayListPermalinkURL(id);
            }

            this.getDownloadUrl = function (id) {
                return APIHelper.getTrackURL(id);
            }

            this.normalizeString = function (string) {
                return !!string ? string.replace(/ /g,'_') : '';
            }

            var setLikeForSound = function (soundId, like) {
                var items = tc.list;
                for (var i in items) {
                    var item = items[i];
                    if (item.type == 'sound' && item.id == soundId) {
                        item.marked = like;
                    }
                    if (item.type == 'playlist') {
                        var sounds = item.sounds;
                        for (var j in sounds) {
                            if (sounds[j].id == soundId) {
                                sounds[j].marked = like;
                            }
                        }
                    }
                }
            }

            var setLikeForPlaylist = function (playListId, like) {
                var items = tc.list;
                for (var i in items) {
                    var item = items[i];
                    if (item.type == 'playlist' && item.id == playListId) {
                        item.marked = like;
                    }
                }
            }
        }
    ]);
})();
