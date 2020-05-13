const { app, Menu, webContents, session, ipcMain, protocol } = require('electron')
const path = require('path')
const url = require('url')
const { spawn } = require('child_process')

const mainMenu = require('./main/MainMenu')
const shortcuts = require('./main/Shortcuts')
const TrayMenu = require('./main/TrayMenu')
const PlaybackActions = require('./main/PlaybackActions')
const AppActions = require('./main/AppActions')
const MainWindow = require('./main/MainWindow');

const YOUTUBE_AD_REGEX = /(doubleclick\.net)|(adservice\.google\.)|(youtube\.com\/api\/stats\/ads)|(&ad_type=)|(&adurl=)|(-pagead-id.)|(doubleclick\.com)|(\/ad_status.)|(\/api\/ads\/)|(\/googleads)|(\/pagead\/gen_)|(\/pagead\/lvz?)|(\/pubads.)|(\/pubads_)|(\/securepubads)|(=adunit&)|(googlesyndication\.com)|(innovid\.com)|(tubemogul\.com)|(youtube\.com\/pagead\/)|(google\.com\/pagead\/)|(flashtalking\.com)|(googleadservices\.com)|(s0\.2mdn\.net\/ads)|(www\.youtube\.com\/ptracking)|(www\.youtube\.com\/pagead)|(www\.youtube\.com\/get_midroll_)|(www\.youtube\.com\/api\/stats)/

let mainWindow, playbackActions, appActions, trayMenu;

app.on('ready', init)

function init() {
  createWindow()
  createMenu()
  createTrayMenu()
  registerGlobalShortcuts()
  // launchEngine();
}

function createWindow () {
//  require('electron-debug')();
  
  mainWindow = new MainWindow();

    session.defaultSession.webRequest.onBeforeRequest(['*://*./*'], function(details, callback) {
        if(YOUTUBE_AD_REGEX.test(details.url)){
            console.log('blocked', details.url)
            callback({cancel: true});
        }else{
            callback({cancel: false})
        }
    });

  //blockWindowAds(mainWindow, options)
}

function createMenu() {
  mainMenu.createMenu(getPlaybackActions());
}

function createTrayMenu() {
  trayMenu = new TrayMenu(getPlaybackActions(), getAppActions());
  trayMenu.createTrayMenu();
}
function registerGlobalShortcuts() {
  shortcuts.registerGlobalShortcuts(getPlaybackActions());
}

function getPlaybackActions() {
  if (playbackActions == null) {
      playbackActions = new PlaybackActions(mainWindow.webContents);
  }
  return playbackActions;
}

function getAppActions() {
  if (appActions == null) {
      appActions = new AppActions(mainWindow);
  }
  return appActions;
}

function launchEngine() {
    var script = spawn("node", [path.join(__dirname, 'main', 'api/engine.js')], { env: process.env });

    script.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    script.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    script.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    global.engine = script;
}

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow == null) {
    init()
  }
})

app.on('before-quit', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // debugger;
  // console.log('global.engine', global.engine.pid);
  // global.engine.kill();
  // spawn('kill', ['-QUIT', '-$(ps opgid= '+global.engine.pid+')']);
})
