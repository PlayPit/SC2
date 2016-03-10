;var Player = (function () {
	
    soundManager.setup({
		url: '/app/lib/',
		flashVersion: 9,
		onready: function () {
		}
	});
	
	var playingSound;
	var items;
    var itemIndex;
    
	function Player() {
        
        this.state = {
            volume:  50,
            isMute:  false,
            isRandom:  false,
            onPause:  false,
            loadingSound:  false
        }
        
		this.sound = {
            type: 'sound',
			id: -1,
            loading: false,
			title: ".........",
            art: "",
			duration: 1000,
			position: 0,
            dynamicURL: false,
            url: "",
            playMe: function() {
            }
		};
        
        this.playList = {
            type: 'playlist',
            id: -1,
            title: ".........",
            art: "",
            index: 0,
            sounds: []
        }
        
		this.customProperty = {
			
		}
        items = [];
        itemIndex = 0;
	};
    
    Player.prototype.setItem = function(list) {
       items = list;
    }

	Player.prototype.setPlayList = function(id, name, sounds, firstPage) {
		if (firstPage) {
            items = [];
            this.playList.id = id;
		    this.playList.name = name;
            this.playList.index = 0;
			this.playList.sounds = sounds;
		} else {
            for (var i in sounds) {
			    this.playList.sounds.push(sounds[i]);
            }
		}
        items.push(this.playList);
	}
	
    Player.prototype.setSounds = function(sounds, replace) {
        if (replace) {
            items = [];
        }
        for (var i in sounds) {
            items.push(sounds[i]);
        }
    }
    
	Player.prototype.playSoundById = function(soundId) {
		for (var i in items) {
            var item = items[i];
            if (item.type == 'sound') {
                if (item.id == soundId) {
                    itemIndex = parseInt(i);
                    break;
                }
            } else {
                var sounds = item.sounds;
                for (var j in sounds) {
                    if (sounds[j].id == soundId) {
                        itemIndex = parseInt(i);
                        this.playList.id = item.id;
                        this.playList.name = item.name;
                        this.playList.index = parseInt(j);
                        this.playList.sounds = sounds;
                        break;
                    }
                }
            }
        }
		doPlay.call(this);
	}

	Player.prototype.play = function () {
		doPlay.call(this);
	}

	Player.prototype.next = function () {
		doNext.call(this);
	}

	Player.prototype.prev = function () {
		doPrev.call(this);
	}

	Player.prototype.stop = function () {
		doStop.call(this);
	}

	Player.prototype.toggle = function () {
		doToggle.call(this);
	}

	Player.prototype.setPosition = function(position) {
		if (typeof playingSound !== "undefined") {
			playingSound.setPosition(position);
		}
	}
	
	Player.prototype.setVolume = function(volume) {
		this.state.volume = volume;
		if (typeof playingSound !== "undefined") {
			playingSound.setVolume(this.state.volume);
		}
	}

	Player.prototype.toggleRandomPlaying = function() {
		this.state.isRandom = !this.state.isRandom;
	}

	Player.prototype.mute = function() {
		this.state.isMute = !this.state.isMute;
		if (this.state.isMute) {
			playingSound.setVolume(0);
		} else {
			playingSound.setVolume(this.state.volume);
		}
	}
	
    Player.prototype.getItemsList = function() {
        if (items.length == 1) {
            if (items[0].type == 'playlist') {
                return items[0].sounds;
            }
        }
        return items;
    }
    
	var doPlay = function () {
        var player = this;
		doStop.call(player);
		var sound = getSound.call(player);
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
            if (item.id == player.playList.id) {
                return player.playList.sounds[player.playList.index];
            }
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
				player.sound.duration = playingSound.duration;
				player.onPause = false;
                player.state.loadingSound = false;
                if (!success) {
                    removeCurrentSound.call(player);
                    doNext.call(player);
                }
			},
			onfinish: function () {
				doNext.call(player);
			},
			whileplaying: function () {
				player.sound.position = playingSound.position;
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
		if (typeof playingSound !== "undefined") {
			playingSound.destruct();
		}
	}
	
	var doNext = function () {
        var player = this;
        var changeIndex = true;
        if (items[itemIndex].type == 'playlist') {
            var next = player.playList.index + 1; 
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
        var max = items.length-1;
        var index = Math.floor((Math.random() * max) + 1);
        return index;
    }
    
    return Player;
})();