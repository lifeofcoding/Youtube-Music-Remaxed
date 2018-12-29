let playbackActions = require('./PlaybackActions')
let { globalShortcut } = require('electron')

function registerGlobalShortcuts(playbackActions) {
    globalShortcut.register('MediaPlayPause', (obj) => {
       playbackActions.playPause();
    });

    globalShortcut.register('MediaNextTrack', () => {
      playbackActions.next();
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      playbackActions.previous();
    });
}

module.exports.registerGlobalShortcuts = registerGlobalShortcuts
