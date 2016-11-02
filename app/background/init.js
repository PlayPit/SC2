;
var APIHelper = new _APIHelper();
APIHelper.init();
var Player = new _Player();
var PlayerHelper = new _PlayerHelper();
var SCHelper = new _SCHelper();

; var _Settings = (function () {
    
    var defSize = 200;
    var defNotyfi = false;
    
    function _Settings() {
        this.tracksSize = 200;
        this.notification = false;
    }

    _Settings.prototype.init = function () {
        var st = this;
        chrome.storage.local.get('soundCloudPlayerSettings', function (result) {
            if (result.soundCloudPlayerSettings) {
                var settings = result.soundCloudPlayerSettings;
                update.call(st, settings);
            } else {
                st.save(st.tracksSize, st.notification);
            }
        });
    };

    _Settings.prototype.clearStorage = function () {
        chrome.storage.local.remove('soundCloudPlayerSettings', function (result) {
        });
    }

    _Settings.prototype.save = function (tracksSize, notification) {
        var st = this;
        var settings = {
            tracksSize: tracksSize,
            notification: notification
        }
        chrome.storage.local.set({ 'soundCloudPlayerSettings': settings }, function (result) {
            update.call(st, settings);
        });
    }

    _Settings.prototype.terminate = function () {
        APIHelper.clearStorage();
        APIHelper = new _APIHelper();
        APIHelper.init();
        Player.stop();
        Player = new _Player();
        PlayerHelper = new _PlayerHelper();
        SCHelper = new _SCHelper();
    }

    _Settings.prototype.backToDefault = function() {
        var st = this;
        st.clearStorage();
        st.save(defSize, defNotyfi);
        st.terminate();
    }

    function update(settings) {
        var st = this;
        if (settings.notification) {
            st.notification = true;
            Player.notifyOnStartingPlayingSound = function (sound) {
                var url = "https://w.soundcloud.com/icon/assets/images/orange_transparent_64-94fc761.png";
                if (sound.art && sound.art.length > 0) {
                    url = sound.art;
                }
                var notification = {
                    type: "basic",
                    title: "SoundCloud Player",
                    message: sound.title,
                    iconUrl: url
                };
                chrome.notifications.create(notification);
            }
        } else {
            st.notification = false;
            Player.notifyOnStartingPlayingSound = function (sound) {
            }
        }
        APIHelper.setTrackSize(settings.tracksSize);
        st.tracksSize = APIHelper.tracksSize;
    }

    return _Settings;
})();

var Settings = new _Settings();
Settings.init();



