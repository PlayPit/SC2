;(function () {
    'use strict';
    var app = angular.module('sound-cloud-player');
    var controllerName = 'PlayerController';
    var Player = chrome.extension.getBackgroundPage().Player;
    var PlayerHelper = chrome.extension.getBackgroundPage().PlayerHelper;
    app.controller(controllerName, ["$interval",
        function PlayerController($interval) {
            var pc = this;
            
            this.view = PlayerHelper.view;
            this.tabsList = PlayerHelper.tabsList;
            this.player = Player;
            this.volumeIcon = "";
            
            this.changePlayerViewMode = function() {
                if (PlayerHelper.view.isMinimized) {
                    PlayerHelper.maximize();
                } else {
                    PlayerHelper.minimize();
                }
            }
            
            this.toggleTabs = function() {
                if (PlayerHelper.view.isTabsOpened) {
                    PlayerHelper.closeTabs();
                } else {
                    PlayerHelper.openTabs();
                }
            }
            
            this.openHomeTab = function() {
                PlayerHelper.openHomeTab();
            }
            this.openTracksTab = function() {
                PlayerHelper.openTracksTab();
            }
            this.openPlayListTab = function() {
                PlayerHelper.openPlayListTab();
            }
            this.openSettingsTab = function() {
                PlayerHelper.openSettingsTab();
            }
            
            this.muteVolume = function() {
                 Player.mute();
                 updateVolumeIcon();
            }
            
            this.updateVolume = function() {
                 Player.setVolume(Player.state.volume);
                 Player.state.isMute = false;
                 updateVolumeIcon();
            };
            
            this.updatePosition = function() {
                Player.setPosition(Player.sound.position);
            }
            
            this.play = function() {
                if (Player.state.onPause) {
                    Player.toggle();
                } else {
                    Player.play();
                }
            }
            
            this.stop = function() {
                Player.stop();
            }
            
            this.toggle = function() {
                Player.toggle();
            }
            
            this.next = function() {
                Player.next();
            }
            
            this.prev = function() {
                Player.prev();
            }
            
            this.replay = function() {
                Player.play();
            }
            
            this.toggleRandom = function() {
                Player.toggleRandomPlaying();
            }
            
            this.windowMode = function() {
                var pageURL = chrome.extension.getURL('window_mode.html');
                chrome.windows.create({ url: pageURL, type: 'popup', 'width': 370, 'height': 120 });
                window.close();
            }
            
            function updateVolumeIcon() {
                if (Player.state.isMute) {
                    pc.volumeIcon = "volume_off";
                } else {
                    if (Player.state.volume > 50) {
                         pc.volumeIcon = "volume_up";
                    } else {
                        if (Player.state.volume == 0) {
                             pc.volumeIcon = "volume_mute";
                        } else {
                             pc.volumeIcon = "volume_down";
                        }
                    }
                }
            }
            
            function setActiveTab() {
                var plaingTab = Player.customProperty.activeTabName;
                if (plaingTab) {
                    switch (plaingTab) {
                        case PlayerHelper.tabsList.tracksTabName:  
                            pc.openTracksTab();                     
                            break;
                        case PlayerHelper.tabsList.playListsTabName:   
                            pc.openPlayListTab();                    
                            break; 
                        case PlayerHelper.tabsList.settingsTabName:  
                            pc.openSettingsTab();                     
                            break;
                        default:
                            pc.openHomeTab();
                            break;
                    }
                }
            }
            
            updateVolumeIcon();
            setActiveTab();
            $interval(function() {
               //$scope.player = $player;
            }, 0);
        }
    ]);
})();