
const windowStateManager = require('electron-window-state');
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindowState;

const loadFile = filePath => win.loadURL(`file://${path.resolve(electron.app.getAppPath(), filePath)}`);

class MainWindow extends BrowserWindow {

  constructor() {
    mainWindowState = windowStateManager(getWindowDefaults())

    super({
      width: mainWindowState.width,
      height: mainWindowState.height,
      x: mainWindowState.x,
      y: mainWindowState.y,
      minWidth: 800,
      minHeight: 600,
      backgroundColor: '#181818',
      icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
      webPreferences: {
        nodeIntegration: true,
        preload: "preload.js"
      }
    });

    mainWindowState.manage(this)
    
    this.loadURL(`file://${path.resolve(app.getAppPath(), '../../../../../index.html')}`);
    this.openDevTools({ mode: 'bottom' });
//    this.loadFile('../../../../../index.html');
  }
}

function getWindowDefaults() {
  return { defaultWidth: 1024, defaultHeight: 768 }
}

module.exports = MainWindow
