// Copyright (c) 2015 Gene-Sis APP-Web Author.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.browserAction.getTitle({}, function(title){
    if(title === 'Gamba FM') {
        chrome.browserAction.setIcon({path:"../icons/icon.png"});
    }
});


var ln = window.navigator.language || navigator.browserLanguage,
    data = {},
    streamMedia = new Object(),
    timeInterval = (60 * 1000) * 60,
    timeReconnection = (60 * 1000) * 5,
    reconnectionAttempts = 10,
    reconnectingCounter = 0,
    radioState = 'pause',
    timeOut = null,
    _t,
    jplayer_1;


function initPlayer() {

    var ready = false,
        playerState;

    streamMedia[data['streamType']] = data['streamUrl'];

    chrome.storage.local.get('sync', function(response) {
      if(response.sync) {
        console.log('Loading Volume from Sync Storage.');
        chrome.storage.sync.get('volume', initSetVolume);
      }
      else if(response.sync == false){
        console.log('Loading Volume from Local Storage.');
        chrome.storage.local.get('volume', initSetVolume);
      }
      else {
        console.log('::Setting by default::');
        chrome.storage.local.set({volume: 0.7, sync: false}, function() {
          console.log('Init in LOCAL storage.');
          initSetVolume();
        });
      }
    })
}

function initSetVolume(data) {
  var volumeValue = 0.7,
      byDefaultText = 'By default.';
  if(data && data.volume) {
    volumeValue = data.volume;
    byDefaultText = '';
  }
  console.log('Init Volume in ' + volumeValue + '. ' + byDefaultText);
  settingPlayer(volumeValue);
}

function settingPlayer(volumeValue) {
  jplayer_1.jPlayer({
    ready: function () {
        ready = true;
        playerState = "ready";
        console.log(_t.LOG["LOADING_PLAYER"]);
    },
    play: function(event){
        SetTimeOut();
        playerState = "play";
        console.log(_t.LOG["PLAYING_NOW"]);
    },
    pause: function(event) {
        //kill the media to change the "pause" normal action.
        clearStreamBuffered();
        ClearTimeOut();
        playerState = "pause";
        console.log(_t.LOG["PAUSING_PLAYER"]);
    },
    error: function(event) {
        //check if the user clicked on the play button after a pause interval.
        if (ready && event.jPlayer.error.type == $.jPlayer.error.URL_NOT_SET) {
            playStream();
            console.error(_t.ERROR['ERROR_URL_NOT_SET']);
            return;
        }

        if(ready && event.jPlayer.error.type == $.jPlayer.error.URL) {
            ReConnect(playerState);
            console.error(_t.ERROR['ERROR_URL_NOT_RESPONSE']);
        }
    },
    swfPath: "jplayer",
    supplied: data['streamType'],
    wmode: "window",
    solution: "html",
    smoothPlayBar: true,
    keyEnabled: true,
    volume: volumeValue,
    preload: "none"
  });
}

function playStream() {
    jplayer_1.jPlayer("setMedia", streamMedia ).jPlayer("play");
    console.log(_t.LOG['STARTING_STREAMING']);
}

function clearStreamBuffered() {
    jplayer_1.jPlayer("clearMedia");
    console.log(_t.LOG['CLEARING_BUFFER']);
}

function SetTimeOut(METHOD, TIMEINTERVAL) {

    if(timeOut !== null) {
		ClearTimeOut();
    }

    var time = (typeof TIMEINTERVAL !== 'undefined') ? TIMEINTERVAL : timeInterval;

    if (typeof METHOD !== 'undefined') {
        timeOut = setTimeout(function () {
            console.log(_t.LOG['RUNNING_TIMEOUT']);
            METHOD();
        }, time);
        return;
    }

    timeOut = setTimeout(function () {
        console.log(_t.LOG['RUNNING_TIMEOUT']);
        playStream();
    }, time);

    console.log(_t.LOG['INITIALIZING_PLAY']);
}

function ClearTimeOut() {
    clearTimeout(timeOut);
    timeOut = null;
    console.log(_t.LOG['CLEARING_TIMEOUT']);
}

function ReConnect(STATE) {

    var state = (typeof STATE !== 'undefined') ? STATE : "play";

    if(reconnectingCounter === reconnectionAttempts) {
        reconnectingCounter = 1;
        SetTimeOut(function () {
            ReConnect(STATE);
        }, timeReconnection);
        return;
    }

    streamMedia[data['streamType']] = data['streamUrl'];
    
    if(reconnectingCounter%3 === 0 && typeof data['streamUrl2'] !== 'undefined') {
        streamMedia[data['streamType']] = data['streamUrl2'];
    }
    
    jplayer_1.jPlayer("setMedia", streamMedia).jPlayer(state);

    reconnectingCounter++;
}

function init() {
	var lang;
	if (ln.match(/en\-.+/)) {
		lang = 'en-US';
	}
	else {
		lang = 'es-AR';
	}
	return $.getJSON('../languages/' + lang +'.json');
}

$(document).ready(function() {
	jplayer_1 = $("#jquery_jplayer_1");
  init().then(function(value) {
    _t = value;
  });
  // Loading data.json from github and init player.
  $.getJSON('https://raw.githubusercontent.com/gabrielruiz/chromeApp-GambaOnline/master/data.json', function(response) { 
    data = response;
    console.log('Using data.json');
    initPlayer();
  });

});

chrome.browserAction.onClicked.addListener(function(tab) {
    if (radioState === 'pause') {
        chrome.browserAction.setIcon({path:"../icons/iconPlay.png"});
        chrome.browserAction.setTitle({title: _t.APP["PLAYING_GAMBA_FM"]});
        radioState = 'play';
        playStream();
    }
    else {
        chrome.browserAction.setIcon({path:"../icons/iconPause.png"});
        chrome.browserAction.setTitle({title: _t.APP["PAUSED_GAMBA_FM"]});
        radioState = 'pause';
    	jplayer_1.jPlayer(radioState);
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  chrome.storage.local.get('sync', function(response) {
    var typeStorage = (response.sync) ? 'sync': 'local';
    for (key in changes) {
      var storageChange = changes[key],
          newVolumeValue = storageChange.newValue,
          oldVolumenValue = storageChange.oldValue;
      if(key === 'volume') {
        if(namespace === typeStorage) {
          jplayer_1.jPlayer("volume", newVolumeValue);
          console.log('Update Volume in ' + typeStorage + ' to ' + newVolumeValue);
        }
        else {
          console.log('Ignoring Volume updating because is set in ' + typeStorage
                      + ' intead of ' +  namespace);
        }
      }
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  oldVolumenValue,
                  newVolumeValue);
    }
  });
});
