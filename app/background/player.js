;var _Player = (function () {
	
    soundManager.setup({
		url: '/app/lib/',
		flashVersion: 9,
        debugMode: false,
        debugFlash: false,
		onready: function () {
		}
	});
	
	var playingSound;
	var items;
    var itemIndex;
    
	function _Player() {
        
        this.state = {
            volume:  50,
            isMute:  false,
            isRandom:  false,
            onPause:  false,
            loadingSound:  false,
            isPlaying: false
        }
        
		this.sound = {
            type: 'sound',
			id: -1,
            inPlaylist: false,
			title: ".........",
            art: "",
			duration: 1000,
			position: 0,
            dynamicURL: false,
            url: "",
            playMe: function() {
            },
            marked: false
		};
        
        this.playList = {
            type: 'playlist',
            id: -1,
            title: ".........",
            art: "",
            index: 0,
            marked: false,
            sounds: [],
            static: true
        }
        
		this.customProperty = {
			
		}
        
        this.notifyOnStartingPlayingSound = function(sound){};
        
        items = [];
        itemIndex = 0;
	};
	
    _Player.prototype.setItems = function(list, replace) {
        if (replace) {
            items = [];
        }
        for (var i in list) {
            items.push(list[i]);
        }
    }
    
	_Player.prototype.playSoundById = function(soundId) {
		for (var i in items) {
            var item = items[i];
            if (item.type == 'sound') {
                if (item.id == soundId) {
                    itemIndex = parseInt(i);
                    break;
                }
            }
        }
		doPlay.call(this);
	}
    
    _Player.prototype.playSoundFromPlayListById = function(soundId, playlistId) {
        var stopSearch = false;
        for (var i in items) {
            var item = items[i];
            if (item.type == 'playlist') {
                var sounds = item.sounds;
                if (item.id == playlistId) {
                    for (var j in sounds) {
                        if (sounds[j].id == soundId) {
                            stopSearch = true;
                            itemIndex = parseInt(i);
                            this.playList.id = item.id;
                            this.playList.name = item.name;
                            this.playList.index = parseInt(j);
                            this.playList.sounds = sounds;
                            this.playList.marked = item.marked;
                            this.playList.static = item.static;
                            break;
                        }
                    }
                }
                
                if (stopSearch) {
                    break;
                }
            }
        }
        doPlay.call(this);
    }
    
	_Player.prototype.play = function () {
		doPlay.call(this);
	}

	_Player.prototype.next = function () {
		doNext.call(this);
	}

	_Player.prototype.prev = function () {
		doPrev.call(this);
	}

	_Player.prototype.stop = function () {
		doStop.call(this);
	}

	_Player.prototype.toggle = function () {
		doToggle.call(this);
	}

	_Player.prototype.setPosition = function(position) {
		if (typeof playingSound !== "undefined") {
			playingSound.setPosition(position * playingSound.duration / 100);
		}
	}
	
	_Player.prototype.setVolume = function(volume) {
		this.state.volume = volume;
		if (typeof playingSound !== "undefined") {
			playingSound.setVolume(this.state.volume);
		}
	}

	_Player.prototype.toggleRandomPlaying = function() {
		this.state.isRandom = !this.state.isRandom;
	}

	_Player.prototype.mute = function() {
		this.state.isMute = !this.state.isMute;
		if (this.state.isMute) {
			playingSound.setVolume(0);
		} else {
			playingSound.setVolume(this.state.volume);
		}
	}
	
    _Player.prototype.getItemsList = function() {
        if (items.length == 1) {
            if (items[0].type == 'playlist') {
                return items[0].sounds;
            }
        }
        return items;
    }
    
    _Player.prototype.setLikeForSound = function(soundId, like) {
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
    
    _Player.prototype.setLikeForPlaylist = function(playListId, like) {
        for (var i in items) {
            var item = items[i];
            if (item.type == 'playlist' && item.id == playListId) {
                item.marked = like;
            }
        }
    }
    
	var doPlay = function () {
        var player = this;
		doStop.call(player);
		var sound = getSound.call(player);
        if (sound == null) {
            doNext.call(player);
        }
        if(sound.dynamicURL) {
            sound.playMe(function(url) {
                sound.url = url;
                createCurrentSound.call(player, sound);
            });
        } else {
            createCurrentSound.call(player, sound);
        }
	}

    var getSound = function() {
        var player = this;
        var item = items[itemIndex];
        if (item.type == 'playlist') {
            if (item.sounds.length < 1) {
                return null;
            }
            if (item.id != player.playList.id) {
                 player.playList.id = item.id;
                 player.playList.name = item.name;
                 player.playList.sounds = item.sounds;
                 player.playList.index = 0;
            }
            return player.playList.sounds[player.playList.index];
        } else {
            return item;
        }
    }

    var createCurrentSound = function(sound) {
        var player = this;
        playingSound = soundManager.createSound({
			url: sound.url,
			onPlay: function() {
                player.state.loadingSound = true;
			},
			onload: function (success) {
                player.sound.id = sound.id;
				player.sound.title = sound.title;
                player.sound.art = sound.art;
                player.sound.inPlaylist = sound.inPlaylist;
				player.sound.duration = playingSound.duration;
				player.onPause = false;
                player.state.loadingSound = false;
                player.state.isPlaying = true;
                if (!success) {
                    removeCurrentSound.call(player);
                    doNext.call(player);
                }
                player.notifyOnStartingPlayingSound(sound);
			},
			onfinish: function () {
				doNext.call(player);
			},
			whileplaying: function () {
				player.sound.position = (playingSound.position * 100) / playingSound.duration;
			},
            ondataerror: function() {
                doNext.call(player);
            }
		});
        var volume = 0;
        if (!player.state.isMute) {
            volume = player.state.volume;
        }
		playingSound.setVolume(volume);
		playingSound.play();
    }

    var removeCurrentSound = function() {
        var player = this;
        var item = items[itemIndex];
        if (item.type == 'playlist') {
            var soundIndex = player.playList.index;
            item.sounds.splice(soundIndex, 1);
            player.playList.sounds.splice(soundIndex, 1);
        } else {
            items.splice(itemIndex, 1);
        }
    }

	var doStop = function () {
        var player = this;
		if (typeof playingSound !== "undefined") {
			playingSound.destruct();
		}
        player.state.isPlaying = false;
        player.state.onPause = false;
        player.sound.position = 0;
	}
	
	var doNext = function () {
        var player = this;
        var changeIndex = true;
        if (items[itemIndex].type == 'playlist') {
            var next;
            if (player.state.isRandom && player.playList.static) {
                next = getRandomInPlayList(player.playList.sounds.length);
            } else {
                if (player.state.isRandom) {
                    var jumpOut = Math.floor((Math.random() * 2) + 1);
                    if (jumpOut > 1) {
                         next = getRandomInPlayList(player.playList.sounds.length);
                    } else {
                        next = player.playList.sounds.length;
                    }
                } else {
                    next = player.playList.index + 1;
                }
            }
            if (next >= player.playList.sounds.length && items.length == 1) {
                player.playList.index = 0;
            } else {
                if (next < player.playList.sounds.length) {
                    player.playList.index = next;
                    changeIndex = false;
                } else {
                    itemIndex++;
                }
            }
        } else {
            itemIndex++;
        }
        if (changeIndex) {
            if (player.state.isRandom) {
                itemIndex = getRandom();
            }    
            if (itemIndex >= items.length) {
                itemIndex = 0;
            }
        }
		doPlay.call(player);
	}

	var doPrev = function () {
        var player = this;
        var changeIndex = true;
        if (items[itemIndex].type == 'playlist') {
            var prev = player.playList.index - 1; 
            if (player.state.isRandom && player.playList.static) {
                prev = getRandomInPlayList(player.playList.sounds.length) - 1;
            } else {
               if (player.state.isRandom) {
                    var jumpOut = Math.floor((Math.random() * 2) + 1);
                    if (jumpOut > 1) {
                         prev = getRandomInPlayList(player.playList.sounds.length);
                    } else {
                        prev = -1;
                    }
                } else {
                    prev = player.playList.index - 1;
                }
            }
            if (prev < 0 && items.length == 1) {
                player.playList.index = player.playList.sounds.length - 1;;
            } else {
                if (prev >= 0) {
                    player.playList.index = prev;
                    changeIndex = false;
                } else {
                    itemIndex--;
                }
            }
        } else {
            itemIndex--;
        }
        if (changeIndex) {
            if (player.state.isRandom) {
                itemIndex = getRandom();
            }    
            if (itemIndex < 0) {
                itemIndex = items.length - 1;
            }
        }
		doPlay.call(player);
	}
	
	var doToggle = function () {
        var player = this;
		if (typeof playingSound !== "undefined") {
			playingSound.togglePause();
			player.state.onPause = playingSound.paused;
		}
	}
    
    var getRandom = function() {
        var max = items.length;
        var index = Math.floor((Math.random() * max) + 1) - 1;
        return index;
    }
    
    var getRandomInPlayList = function(playListSize) {
        var max = playListSize;
        var index = Math.floor((Math.random() * max) + 1) - 1;
        return index;
    }
    
    return _Player;
})();