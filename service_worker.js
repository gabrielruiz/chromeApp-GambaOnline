// Path to your offscreen document
const OFFSCREEN_DOCUMENT_PATH = '/offscreen_player.html';

let creatingOffscreenDocument; // A promise during creation
let isPlayingNow = false;

// Function to ensure the offscreen document is active
async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creatingOffscreenDocument) {
    await creatingOffscreenDocument;
  } else {
    creatingOffscreenDocument = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Required for playing Gamba FM audio stream using jPlayer.',
    });
    await creatingOffscreenDocument;
    creatingOffscreenDocument = null;
  }
}

// Function to update the extension icon
async function updateIcon(isPlaying) {
  const iconPaths = isPlaying ? {
    "19": "icons/iconPlay.png",
    "38": "icons/iconPlay.png"  // Or your default 38px icon
  } : {
    "19": "icons/iconPause.png",
    "38": "icons/iconPause.png" // Or your default 38px icon
  };
  try {
    await chrome.action.setIcon({ path: iconPaths });
    console.log("Icon updated, isPlaying:", isPlaying);
  } catch (error) {
    console.error("Error setting icon:", error);
  }
}

// Example: Function to send a "play" command to the offscreen document
async function playAudio(streamUrl) {
  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({ target: 'offscreen', type: 'play', data: { url: streamUrl } });
  updateIcon(true); // Update icon to "playing" state
  isPlayingNow = true;
}

// Example: Function to send a "pause" command
async function pauseAudio() {
  // No need to ensure offscreen if we're just pausing an existing player
  // but good practice if the offscreen doc might close.
  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({ target: 'offscreen', type: 'pause' });
  updateIcon(false); // Update icon to "paused" or default state
  isPlayingNow = false;
}

// Example: Function to set volume
async function setVolume(level) {
  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({
    target: 'offscreen',
    type: 'setVolume',
    data: { volume: level } // jPlayer usually takes 0.0 to 1.0
  });
}

// --- Event Listeners ---

// Example: Handle browser action click (toolbar icon)
chrome.action.onClicked.addListener(async (tab) => {
  console.log("Action clicked. Attempting to fetch stream data and play.");

  if (isPlayingNow) {
    await pauseAudio().then(() => {
      console.log({ status: "Pause initiated" });
    }).catch(error => {
      console.error("Error initiating pause from message:", error);
      console.log({ status: "Error initiating pause", error: error.message });
    });
  }
  else { 
    const dataJsonUrl = 'https://raw.githubusercontent.com/gabrielruiz/chromeApp-GambaOnline/master/data.json';

    try {
      const response = await fetch(dataJsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error fetching data.json! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && data.streamUrl) {
        // You can add logic here to choose between streamUrl and streamUrl2 if needed
        // For example, try streamUrl, if it fails, try streamUrl2, or based on a setting.
        console.log("Attempting to play streamUrl.");
        await playAudio(data.streamUrl);
      } else if (data && data.streamUrl2) {
        // Fallback to streamUrl2 if streamUrl is not present
        console.warn("streamUrl not found in data.json, attempting to play streamUrl2.");
        await playAudio(data.streamUrl2);
      } else {
        console.error("No valid stream URL (streamUrl or streamUrl2) found in fetched data.json:", data);
        // Optionally, notify the user or play a hardcoded fallback if any
      }
    } catch (error) {
      console.error("Error fetching or processing data.json:", error);
      // Handle error, maybe play a default/fallback URL or notify the user
      // For example: await playAudio("YOUR_FALLBACK_STREAM_URL_HERE");
    }
  }
  
});

// Listen for messages, perhaps from options page or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'service-worker') {
    switch (message.type) {
      case 'playerReady':
        console.log("Player ready!");
        sendResponse({ status: "Player Ready Msg received" });
        break;
      case 'play':
      // Assuming message.data.url contains the stream URL
        playAudio(message.data.url).then(() => {
          sendResponse({ status: "Playing initiated" });
        }).catch(error => {
          console.error("Error initiating play from message:", error);
          sendResponse({ status: "Error initiating play", error: error.message });
        });
        break;
      case 'pause':
        pauseAudio().then(() => {
          sendResponse({ status: "Pause initiated" });
        }).catch(error => {
          console.error("Error initiating pause from message:", error);
          sendResponse({ status: "Error initiating pause", error: error.message });
        });
        break;
      case 'settingsUpdated':
        // setVolume is already async
        setVolume(message.data.volume); // Assuming message.data.volume contains the volume level
        // Consider a more accurate response status, e.g., "Settings applied"
        sendResponse({ status: "Settings update processed" });
        break;
      case 'playerStatusUpdate': // Example: Message from offscreen_player_logic.js
        console.log("Received player status update from offscreen:", message.data);
        if (typeof message.data.isPlaying === 'boolean') {
          updateIcon(message.data.isPlaying);
        }
        sendResponse({ status: "Player status acknowledged" });
        break;
      default:
        console.warn("Received unknown message type for service-worker:", message.type);
        sendResponse({ status: "Unknown message type", type: message.type });
        break;
    }
    return true; // Indicates you wish to send a response asynchronously
  }
});

// Keep alive for audio playback (basic example, might need more robust handling)
// This is a common challenge. The offscreen document playing audio should keep it alive.
// If not, alarms can be used.
// For now, the offscreen document itself playing audio is the primary keep-alive mechanism.

// Set initial icon on startup (e.g., to default/paused)
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started up.");
});

console.log("Gamba FM Service Worker started.");
