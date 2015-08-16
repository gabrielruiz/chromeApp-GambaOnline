// Copyright (c) 2015 Gene-Sis APP-Web Author.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.browserAction.getTitle({}, function(title){
    if(title === 'Gamba FM') {
        chrome.browserAction.setIcon({path:"../icons/icon.png"});
    }
});


var data = {
        "streamUrl" : "http://gambafm.lorini.net:10630/;",
        "streamUrl2": "http://www.fm.net.ve:9000/GAMBAFM",
        "streamType": "mp3"
    },
    streamMedia = new Object(),
    timeInterval = (60 * 1000) * 60,
    timeReconnection = (60 * 1000) * 15,
    radioState = 'pause',
    timeOut,
    reconnect = 0;


function initPlayer() {

    var jplayer_1 = $("#jquery_jplayer_1"),
        ready = false,
        playerState;

    streamMedia[data['streamType']] = data['streamUrl'];
    jplayer_1.jPlayer({
    ready: function () {
        $(this).jPlayer("setMedia", streamMedia );
        ready = true;
        playerState = "ready";
        console.log("loading player");
    },
    play: function(event){
        SetTimeOut();
        playerState = "play";
        console.log("playing now");
    },
    pause: function(event) {
        //kill the media to change the "pause" normal action.        
        jplayer_1.jPlayer("clearMedia");
        ClearTimeOut();
        playerState = "pause";
        console.log("pausing the player");
    },

    error: function(event) {
        //check if the user clicked on the play button after a pause interval.
        if (ready && event.jPlayer.error.type == $.jPlayer.error.URL_NOT_SET) {
            jplayer_1.jPlayer("setMedia", streamMedia).jPlayer("play");
            console.log('ERROR URL NOT SET');
            return;
        }
        
        if(ready && event.jPlayer.error.type == $.jPlayer.error.URL) {
            ReConnect(jplayer_1, playerState);
            console.log('ERROR URL NOT RESPONSE');
        }
    },
    swfPath: "jplayer",
    supplied: data['streamType'],
    wmode: "window",
    smoothPlayBar: true,
    keyEnabled: true,
    volume: 0.6
    });
}

function clearStreamBuffered(streamMedia) {
    $("#jquery_jplayer_1").jPlayer("setMedia", streamMedia).jPlayer("play");
}

function SetTimeOut(METHOD, TIMEINTERVAL) {

    ClearTimeOut();

    var time = (typeof TIMEINTERVAL !== 'undefined') ? TIMEINTERVAL : timeInterval;
    
    if (typeof METHOD !== 'undefined') {
        timeOut = setTimeout(function () {
            console.log('Running timeout');
            METHOD(); 
        }, time);
        return;
    }

    timeOut = setTimeout(function () {
        console.log('Running timeout');
        clearStreamBuffered(streamMedia); 
    }, time);

    console.log('Set timeout');
}

function ClearTimeOut() {
    clearTimeout(timeOut);
    timeOut = null;
    console.log('Clear timeout');
}

function ReConnect(JPLAYER, STATE) {

    var state = (typeof STATE !== 'undefined') ? STATE : "play";

    if(reconnect === 5) {
        reconnect = 0;
        SetTimeOut(function () {
            ReConnect(JPLAYER, STATE);
        }, timeReconnection);
        return;
    }

    if (reconnect%2 === 0) {
        streamMedia[data['streamType']] = data['streamUrl'];
        JPLAYER.jPlayer("setMedia", streamMedia).jPlayer(state);
        
    }
    else {
        streamMedia[data['streamType']] = data['streamUrl2'];
        JPLAYER.jPlayer("setMedia", streamMedia).jPlayer(state);
    }

    reconnect++;
}

$(document).ready(function() {

    initPlayer();

});

chrome.browserAction.onClicked.addListener(function(tab) {

    if (radioState === 'pause') {
        chrome.browserAction.setIcon({path:"../icons/iconPlay.png"});
        chrome.browserAction.setTitle({title:"Playing Gamba FM"});
        radioState = 'play';
    }
    else {
        chrome.browserAction.setIcon({path:"../icons/iconPause.png"});
        chrome.browserAction.setTitle({title:"Paused Gamba FM"});
        radioState = 'pause';
    }

    $("#jquery_jplayer_1").jPlayer(radioState);
});