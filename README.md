Chrome extension APP
======

This chrome extension app was made to use it as complement in Chrome to listen Gamba FM Online easily and quickly.

![Gamba FM APP Online](https://raw.githubusercontent.com/gabrielruiz/chromeApp-GambaOnline/master/img/gambaFmChromeApp.png)

Information
======

The chrome extension was made with JQuery 1.11.2 and JPlayer 2.9.2.

Quickstart:
======

The following steps are needed to add the official latest version published in Chrome Web Store.

1) Go to [Gamba 106.3 FM Online - Chrome Web Store](https://chrome.google.com/webstore/detail/gamba-1063-fm-online/fkfjmigadmikjjjgikhnnenojifcgffb)

2) Add the Gamba FM chrome extension.

3) The app icon should be available on the app bar. Click on it to play or pause the radio.

![Gamba FM APP Online icon](https://raw.githubusercontent.com/gabrielruiz/chromeApp-GambaOnline/master/img/clickOnGambaApp.gif)

4) Adjust the volume app doing right click on the app icon and select Options.

![Gamba FM APP Options](https://raw.githubusercontent.com/gabrielruiz/chromeApp-GambaOnline/master/img/clickOnOptions.gif)

5) Configure the volmen app as you want applying it both locally or globally synchronously in all the chrome browsers where the app is installed.

![Gamba FM APP Settings](https://raw.githubusercontent.com/gabrielruiz/chromeApp-GambaOnline/master/img/settingGambaApp.gif)

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

+ **1.4.0**:
  - Upgrade code to support Manifest v3.

+ **1.3.3**:
  - Fix Maximum call stack size exceeded error.

+ **1.3.2**:
  - Manage the data externally.

+ **1.3.1**:
  - Minor fix when the app is used by first time saving default data in local storage.
  - Code improves reducing lines.

+ **1.3.0**:
  - Adjust volume by the user in options page.
  - Show volume value in options page.
  - Allow to set the volume value locally or globally in all the chrome browsers where the app is installed.
  - Translate improves.
  - Implement css and js minification.
  - Move external libraries in a new components folder improving the project structure.

+ **1.2.1**:
  - Fix Spanish language issue.

+ **1.2.0**: 
  - Support multi-languages (Spanish and English) used in App status icon and logs. 
  - Implement HTML5 player instead of flash. 
  - Optimize App avoiding preloads unnecessarily when the player is not used and start buffering when the user starting to play.
  - Increment reconnection attempts and reduce the timeout to wait after end the reconnection attempts to try again.
  - Add improves cleaning the buffer when the user pause streaming avoiding possible desynchronization when it is played again.

+ **1.1.1**: 
  - Fix minor issues.
  - Simplify and optimize code lines. 
  - Restructure code in folders to improve file organization.

+ **1.1.0**: 
  - First Gamba FM APP Online stable version streaming quickly with simple features.
  - Play and pause streaming in one click over the app icon.

Future Features:
======

+ Allow keyboard shortcuts to play, pause and adjust the volume by the user.
