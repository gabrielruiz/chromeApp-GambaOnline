// Copyright (c) 2015 Gene-Sis APP-Web Author.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.browserAction.getTitle({}, function(title){
    if(title === 'Gamba FM') {
        chrome.browserAction.setIcon({path:"icon.png"});
    }
});


var timeInterval = (60 * 1000) * 60,
    radioState = 'pause';


function initPlayer(data) {

    var streamMedia = new Object(),
        jplayer_1 = $("#jquery_jplayer_1"),
        ready = false,
        timeOut;

    streamMedia[data['streamType']] = data['streamUrl'];
    jplayer_1.jPlayer({
    ready: function () {
        ready = true;
        $(this).jPlayer("setMedia", streamMedia );
        console.log("playerready")
    },
    play: function(event){
        console.log("playing now");
        timeOut = setTimeout(function () {
            console.log('Set timeout');
            clearStreamBuffered(streamMedia); 
        }, timeInterval);
    },
    pause: function(event) {
        //kill the media to change the "pause" normal action.
        jplayer_1.jPlayer("clearMedia");
        clearTimeout(timeOut);
        timeOut = null;
        console.log("pausing the player");
    },

    error: function(event) {
        //check if the user clicked on the play button after a pause interval.
        if (ready && event.jPlayer.error.type == $.jPlayer.error.URL_NOT_SET) {
            jplayer_1.jPlayer("setMedia", streamMedia).jPlayer("play");
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
    setTimeout(function () { clearStreamBuffered(streamMedia); }, timeInterval);
}

$(document).ready(function(){

    var data = {
    "streamUrl" : "http://gambafm.lorini.net:10630/;",
    "streamType": "mp3"
    };
    initPlayer(data);

});

chrome.browserAction.onClicked.addListener(function(tab) {

    if (radioState === 'pause') {
        radioState = 'play';
        chrome.browserAction.setIcon({path:"iconPlay.png"});
        chrome.browserAction.setTitle({title:"Playing Gamba FM"});
    }
    else {
        radioState = 'pause';
        chrome.browserAction.setIcon({path:"iconPause.png"});
        chrome.browserAction.setTitle({title:"Paused Gamba FM"});
    }

    $("#jquery_jplayer_1").jPlayer(radioState);
});