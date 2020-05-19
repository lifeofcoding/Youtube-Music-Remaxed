const { Menu } = require("electron");

function createMenu(playbackActions, appActions) {
  const topLevelItems = [
    {
      label: "Application",
      submenu: [
        {
          label: "Quit Youtube Music",
          accelerator: "CmdOrCtrl+Q",
          click() {
            appActions.quitApp();
          },
        },
      ],
    },
    {
      label: "Actions",
      submenu: [
        {
          label: "Toggle Play (Pause)",
          click() {
            playbackActions.playPause();
          },
        },
        {
          label: "Next",
          click() {
            playbackActions.next();
          },
        },
        {
          label: "Previous",
          click() {
            playbackActions.previous();
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(topLevelItems));
}

module.exports.createMenu = createMenu;
