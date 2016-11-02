; var _APIHelper = (function (SC) {

    var client_id = 'c0e833fecbe9557b9ba8e676b4786b3a';
    var connectionURL = 'https://soundcloud.com/connect?client_id=c0e833fecbe9557b9ba8e676b4786b3a&redirect_uri=http%3a%2f%2fkrtaras.github.io%2fsound-cloud%2fcallback.html&response_type=token&scope=non-expiring';
    var access_token = '';


    var isGuest = false;
    var isLoginned = false;
    var scUser = false;
    var tracksSize = 200;

    SC.initialize({
        client_id: client_id,
    });

    function _APIHelper() {
        this.currentUser = {
            isGuest: false,
            isLoginned: false,
            scUser: false
        };
        this.tracksSize = 200;
    }

    function setSettings() {
        var api = this;
        var settings = {
            access_token: access_token,
            isGuest: api.currentUser.isGuest,
            isLoginned: api.currentUser.isLoginned,
            scUser: api.currentUser.scUser
        };
        chrome.storage.local.set({ 'scAPIAuthorization': settings }, function () {
        });
    }

    _APIHelper.prototype.init = function () {
        var api = this;
        chrome.storage.local.get('scAPIAuthorization', function (result) {
            if (result.scAPIAuthorization) {
                var settings = result.scAPIAuthorization;
                access_token = settings.access_token;
                isLoginned = settings.isLoginned;
                if (access_token == "") {
                    if (isLoginned) {
                         isGuest = true;
                         scUser = false;
                    } else {
                         isGuest = false;
                         scUser = false;
                    }
                } else {
                    SC.initialize({
                        client_id: client_id,
                        oauth_token: access_token
                    });
                    isGuest = settings.isGuest;
                    scUser = settings.scUser;
                }
                api.currentUser.isLoginned = isLoginned;
                api.currentUser.isGuest = isGuest;
                api.currentUser.scUser = scUser;
            } else {
                setSettings.call(api);
            }
        });
    }

    _APIHelper.prototype.clearStorage = function() {
        chrome.storage.local.remove('scAPIAuthorization', function(result) { 
        });
    }

    _APIHelper.prototype.setTrackSize = function (size) {
        if (size >= 10 && size <= 200) {
            tracksSize = size;
            this.tracksSize = size;
        }
    }

    _APIHelper.prototype.loginAsGuest = function () {
        var api = this;
        isGuest = true;
        isLoginned = true;
        api.currentUser.isLoginned = isLoginned;
        api.currentUser.isGuest = isGuest;
        setSettings.call(api);
    }

    _APIHelper.prototype.connect = function () {
        var api = this;
        chrome.tabs.create({ url: connectionURL, selected: true }, function (tab) {
            var authTabId = tab.id;
            chrome.tabs.onUpdated.addListener(function tabUpdateListener(tabId, changeInfo) {
                if (tabId == authTabId && changeInfo.url != undefined && changeInfo.status == "loading") {
                    if (changeInfo.url.indexOf('access_token') > -1) {
                        access_token = getParam('#access_token', changeInfo.url);
                        if (access_token != null && access_token != '') {
                            SC.initialize({
                                client_id: client_id,
                                oauth_token: access_token
                            });
                            isLoginned = true;
                            scUser = true;
                            isGuest = false;
                        }
                        api.currentUser.isLoginned = isLoginned;
                        api.currentUser.isGuest = isGuest;
                        api.currentUser.scUser = scUser;
                        setSettings.call(api);
                        chrome.tabs.remove(tabId, function () { });
                    }
                }
            });
        });
    }

    _APIHelper.prototype.searchSounds = function (searchStr, callback) {
        return callGetAPI('/tracks', { q: searchStr, limit: tracksSize }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.getMyActivities = function (callback) {
        return callGetAPI('/me/activities', { oauth_token: access_token, limit: tracksSize }, function (data) {
            return callback(data.collection);
        });
    }

    _APIHelper.prototype.getCharts = function (callback) {
        return $.getJSON('https://api-v2.soundcloud.com/charts?kind=top&genre=soundcloud%3Agenres%3Aall-music&client_id=' + client_id + '&limit='+tracksSize)
            .then(function (data) {
                return callback(data.collection);
            });
    }

    _APIHelper.prototype.getMyTracks = function (callback) {
        return callGetAPI('/me/tracks', { oauth_token: access_token, limit: tracksSize }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.getMyFavorites = function (callback) {
        return callGetAPI('/me/favorites', { oauth_token: access_token, limit: tracksSize }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.getSoundsFromPlayList = function (playlist, callback) {
        return callGetAPI('/playlists/' + playlist.id + '/tracks', { oauth_token: access_token }, function (data) {
            return callback(playlist, data);
        });
    }

    _APIHelper.prototype.getMyPlaylists = function (callback) {
        return callGetAPI('/me/playlists', { oauth_token: access_token, limit: tracksSize }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.getMyFavoritePlaylists = function (callback) {
        return callGetAPI('/e1/me/playlist_likes', { oauth_token: access_token, limit: tracksSize, }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.getMyLikedTracksIds = function (callback) {
        return callGetAPI('/e1/me/track_likes/ids', { linked_partitioning: 1, oauth_token: access_token, limit: 5000 }, function (data) {
            return callback(data.collection);
        });
    }

    _APIHelper.prototype.getMyLikedPlayListsIds = function (callback) {
        return callGetAPI('/e1/me/playlist_likes/ids', { oauth_token: access_token, limit: 5000 }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.doUnLikeTrack = function (trackId, callback) {
        return callDeleteAPI('/me/favorites/' + trackId, { oauth_token: access_token }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.doLikeTrack = function (trackId, callback) {
        return callPutAPI('/me/favorites/' + trackId, { oauth_token: access_token }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.doUnLikePlaylist = function (playListId, callback) {
        return callDeleteAPI('/e1/me/playlist_likes/' + playListId, { oauth_token: access_token }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.doLikePlaylist = function (playListId, callback) {
        return callPutAPI('/e1/me/playlist_likes/' + playListId, { oauth_token: access_token }, function (data) {
            return callback(data);
        });
    }

    _APIHelper.prototype.getCompleteURL = function (url) {
        return url + '/stream?client_id=' + client_id;
    }

    _APIHelper.prototype.getTrackURL = function (trackId) {
        return 'https://api.soundcloud.com/tracks/' + trackId + '/stream?client_id=' + client_id;
    }

    _APIHelper.prototype.getTrackPermalinkURL = function (trackId) {
        return callGetAPI('/tracks/' + trackId, { client_id: client_id }, function (data) {
            var newURL = data.permalink_url;
            if (newURL && newURL.length > 0) {
                chrome.tabs.create({ url: (newURL + '?auto_play=false') });
            }
        });
    }

    _APIHelper.prototype.getPlayListPermalinkURL = function (playListId) {
        return callGetAPI('/playlists/' + playListId, { client_id: client_id }, function (data) {
            var newURL = data.permalink_url;
            if (newURL && newURL.length > 0) {
                chrome.tabs.create({ url: (newURL + '?auto_play=false') });
            }
        });
    }

    function callGetAPI(str, params, callback) {
        return SC.get(str, params).then(callback);
    }

    function callPutAPI(str, params, callback) {
        return SC.put(str, params).then(callback);
    }

    function callDeleteAPI(str, params, callback) {
        return SC.delete(str, params).then(callback);
    }

    function getParam(param, url) {
        var vars = {};

        url.replace(location.hash, '').replace(
            /[?&]+([^=&]+)=?([^&]*)?/gi,
            function (m, key, value) {
                vars[key] = value !== undefined ? value : '';
            }
        );

        if (param) {
            return vars[param] ? vars[param] : null;
        }
        return vars;
    }

    return _APIHelper;
})(SC);