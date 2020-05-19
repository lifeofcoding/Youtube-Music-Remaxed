const playbackActions = require("./PlaybackActions");
const appActions = require("./AppActions");
const { globalShortcut } = require("electron");

function registerGlobalShortcuts(playbackActions, appActions) {
  globalShortcut.register("MediaPlayPause", (obj) => {
    playbackActions.playPause();
  });

  globalShortcut.register("MediaNextTrack", () => {
    playbackActions.next();
  });

  globalShortcut.register("MediaPreviousTrack", () => {
    playbackActions.previous();
  });

  globalShortcut.register("CommandOrControl+P", () => {
    playbackActions.playPause();
  });

  globalShortcut.register("CommandOrControl+Q", () => {
    appActions.quitApp();
  });
}

module.exports.registerGlobalShortcuts = registerGlobalShortcuts;
