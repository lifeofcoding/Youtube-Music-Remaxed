const { Tray, Menu, nativeImage } = require("electron");
const platform = require("os").platform();
const imageFolder = __dirname + "/assets/icons";

class TrayMenu extends Tray {
  constructor(playbackActions, appActions) {
    super(getTrayIcon());

    this.playbackActions = playbackActions;
    this.appActions = appActions;
  }

  createTrayMenu() {
    if (platform == "darwin") {
      this.setPressedImage(imageFolder + "/osx/icon.png");
    }
    this.setToolTip("YouTube Music Desktop - Pwnd");
    this.setContextMenu(getTrayMenu(this.playbackActions, this.appActions));
  }
}

function getTrayIcon() {
  return nativeImage.createFromPath(getTrayIconPath());
}

function getTrayIconPath() {
  if (platform == "darwin" || platform == "linux") {
    // *nix: mac & linux
    return imageFolder + "/osx/icon.png";
  } else {
    // windows
    return imageFolder + "/win/tray.ico";
  }
}

function getTrayMenu(playbackActions, appActions) {
  return Menu.buildFromTemplate([
    {
      label: "Play/Pause",
      click() {
        playbackActions.playPause();
      },
    },
    {
      label: "Next Track",
      click() {
        playbackActions.next();
      },
    },
    {
      label: "Previous Track",
      click() {
        playbackActions.previous();
      },
    },

    { type: "separator" },

    {
      label: "Show Window",
      click() {
        appActions.showWindow();
      },
    },

    { type: "separator" },

    {
      label: "Quit Youtube Music",
      click: function () {
        appActions.quitApp();
      },
    },
  ]);
}

module.exports = TrayMenu;
