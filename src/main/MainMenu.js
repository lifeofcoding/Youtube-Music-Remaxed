const { Menu } = require("electron");

function createMenu(playbackActions) {
  const topLevelItems = [
    {
      label: "Application",
      submenu: [
        {
          label: "Quit Youtube Music",
          accelerator: "CmdOrCtrl+Q",
          role: "quit",
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
