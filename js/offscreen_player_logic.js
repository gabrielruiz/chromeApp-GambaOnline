$(document).ready(function() {
  const $jplayer = $("#jquery_jplayer_1");

  $jplayer.jPlayer({
    ready: function () {
      console.log("jPlayer in offscreen document is ready.");
      // Optional: Send a message to service worker that player is ready
      chrome.runtime.sendMessage({ target: 'service-worker', type: 'playerReady' });
    },
    // You might want to listen to jPlayer events and inform the service worker
    // play: function() { /* Inform SW */ },
    // pause: function() { /* Inform SW */ },
    // ended: function() { /* Inform SW, maybe try to reconnect or stop */ },
    error: function(event) {
      console.error("jPlayer Error:", event.jPlayer.error);
      // Inform service worker about the error
      chrome.runtime.sendMessage({
        target: 'service-worker',
        type: 'playerError',
        data: {
          message: event.jPlayer.error.message,
          code: event.jPlayer.error.type
        }
      });
    },
    swfPath: "/components/jplayer", // Path to jplayer.swf (fallback for older browsers, less relevant now)
    supplied: "mp3", // Or "m4a, oga" or whatever your stream format is
    solution: "html", // Prefer HTML5
    preload: "none", // Or 'metadata' or 'auto'
    volume: 0.8, // Default volume
    muted: false,
    backgroundColor: "#000000",
    cssSelectorAncestor: "#jp_container_1", // Matches your HTML
    cssSelector: {
      // Copied from your index.html, ensure these are present in offscreen_player.html's jPlayer structure
      play: ".jp-play",
      pause: ".jp-pause",
      mute: ".jp-mute",
      unmute: ".jp-unmute",
      volumeBar: ".jp-volume-bar",
      volumeBarValue: ".jp-volume-bar-value",
    },
    errorAlerts: false,
    warningAlerts: false
  });

  // Listen for messages from the Service Worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === 'offscreen') {
      if (message.type === 'play') {
        console.log("Offscreen: Play command received", message.data.url);
        $jplayer.jPlayer("setMedia", { mp3: message.data.url }).jPlayer("play");
        sendResponse({ status: "Playback started in offscreen document" });
      } else if (message.type === 'pause') {
        console.log("Offscreen: Pause command received");
        $jplayer.jPlayer("pause");
        sendResponse({ status: "Playback paused in offscreen document" });
      } else if (message.type === 'setVolume') {
        $jplayer.jPlayer("volume", message.data.volume);
        sendResponse({ status: "Volume set in offscreen document" });
      }
    }
    return true; // For asynchronous sendResponse
  });
});