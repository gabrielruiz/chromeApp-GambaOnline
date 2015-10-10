// Copyright (c) 2015 Gene-Sis APP-Web Author.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.browserAction.getTitle({}, function(title){
    if(title === 'Gamba FM') {
        chrome.browserAction.setIcon({path:"../icons/icon.png"});
    }
});


var ln = window.navigator.language || navigator.browserLanguage,
	data = {
        "streamUrl" : "http://gambafm.lorini.net:10630/;",
        "streamUrl2": "http://www.fm.net.ve:9000/GAMBAFM",
        "streamType": "mp3"
    },
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
    volume: 0.7,
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
        reconnectingCounter = 0;
        SetTimeOut(function () {
            ReConnect(STATE);
        }, timeReconnection);
        return;
    }

    if (reconnectingCounter%2 === 0) {
        streamMedia[data['streamType']] = data['streamUrl'];
        jplayer_1.jPlayer("setMedia", streamMedia).jPlayer(state);
        
    }
    else {
        streamMedia[data['streamType']] = data['streamUrl2'];
        jplayer_1.jPlayer("setMedia", streamMedia).jPlayer(state);
    }

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