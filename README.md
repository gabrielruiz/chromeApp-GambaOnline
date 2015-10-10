Chrome extension APP
======

This chrome extension app was made to use it as complement in Chrome to listen Gamba FM Online easily and quickly.

![Gamba FM APP Online](/img/gambaFmChromeApp.png)

Information
======

The chrome extension was made with JQuery 1.11.2 and JPlayer 2.9.2.

Quickstart:
======

The following steps are needed to add the official latest version published in Chrome Web Store.

1) Go to [Gamba 106.3 FM Online - Chrome Web Store](https://chrome.google.com/webstore/detail/gamba-1063-fm-online/fkfjmigadmikjjjgikhnnenojifcgffb)

2) Add the Gamba FM chrome extension.

3) The app icon should be available on the app bar. Click on it to play or pause the radio.

![Gamba FM APP Online icon](/img/gambaFmApp.jpg)

Install the repository version using .crx file:
======

This is an alternative way to add this repository version in development:

1) Go to `chrome://extensions` url.

2) Drag and drop the file downloaded `chromeApp-GambaOnline.crx` in the list of extensions to add this app.

For Developers:
======

1) Enable the Developer Mode checking this option on the top right of the extension list. Then click in "Load unpacked extension..." button and search the folder (chromeApp-Gamba Online) that contains the repository files downloaded.

2) Once it was loaded the app in Chrome you can test your local code changes clicking in "Reload" link in the extension list in order to reload the app with the last local changes.


I'll improve this extension as soon as possible to learn more about the use of Chrome Extension and I acquire more experience on it.

Releases:
======

+ **1.1.0**: 
  - First Gamba FM APP Online stable version streaming quickly with simple features.
  - Play and pause streaming in one click over the app icon.

+ **1.1.1**: 
  - Fix minor issues.
  - Simplify and optimize code lines. 
  - Restructure code in folders to improve file organization.

Next Release:
======

+ **1.2.0**: 
  - Support multi-languages (Spanish and English) used in App status icon and logs. 
  - Implement HTML5 player instead of flash. 
  - Optimize App avoiding preloads unnecessarily when the player is not used and start buffering when the user starting to play.
  - Increment reconnection attempts and reduce the timeout to wait after end the reconnection attempts to try again.
  - Add improves cleaning the buffer when the user pause streaming avoiding possible desynchronization when it is played again.
