const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const os = require("os");
process.env.KEY = "AIzaSyC3_5fN3lbGKuTWCC0Dwhd0hJ_X6wh8kXw";

const sh = require("shelljs");
const path = require("path");
const notifier = require("electron-notifications");
const ffbinaries = require("ffbinaries");
const dest = app.getPath("appData");
const Store = require("./Store");
const YoutubeMp3Downloader = require("youtube-mp3-downloader");

const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: "user-preferences",
  defaults: {
    // 800x600 is the default size of our window
    downloads: [],
    pathToStore: "",
  },
});

var currentVideo = {};

function createBrowserWindow(params) {
  const { screen } = require("electron");

  const displays = screen.getAllDisplays();
  var x = 0,
    y = 0;
  for (var i in displays) {
    console.log("displays[i].bounds.width", displays[i].bounds.width);
    console.log("displays[i].bounds.height", displays[i].bounds.height);
    x += displays[i].bounds.width;
    y += displays[i].bounds.height;
  }

  const width = params.width / 2;
  const height = params.height / 2;

  console.log("w and h", width, height);
  console.log("x and y", x, y);

  const win = new BrowserWindow({
    height: Math.round(height),
    width: Math.round(width),
    y: y,
    x: x,
    frame: false,
    transparent: true,
    movable: true,
    resizeable: true,
    alwaysOnTop: true,
    opacity: 0.5,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  currentVideo = params;

  win.loadURL(`file://${path.resolve(__dirname, "../../popout.html")}`);
  win.setAlwaysOnTop(true);

  ipcMain.on("closePopup", (e, args) => {
    win.close();
  });
}

var pathToStore = store.get("pathToStore"),
  ffmpegPath,
  ffmpegFilename;
class AppActions {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    const downloads = store.get("downloads");

    const changeOutputFolder = this.changeOutputFolder.bind(this);

    ipcMain.on("popout", (e, args) => {
      console.log("creating popout: ", args);
      createBrowserWindow(args);
    });

    ipcMain.on("getVideoIdAndCurrentTime", (event, args) => {
      //console.log("setVideoIdAndCurrentTime", currentVideo);
      console.log("event", event);
      event.sender.send("setVideoIdAndCurrentTime", currentVideo);
    });

    ffbinaries.downloadBinaries(
      ["ffmpeg"],
      { platform: os.platform(), quiet: true, destination: dest },
      function (error, results) {
        if (error || !results.length) {
          return console.warn("Connection Error");
        }

        ffmpegPath = results[0].path;
        ffmpegFilename = results[0].filename;

        console.log("ffmpegPath", ffmpegPath);

        ipcMain.on("download", (e, args) => {
          const { id } = args;

          console.log("download", id);

          changeOutputFolder((pathToStore) => {
            var showStarted = false;
            //Configure YoutubeMp3Downloader with your settings
            var YD = new YoutubeMp3Downloader({
              ffmpegPath: ffmpegPath + "/" + ffmpegFilename, // Where is the FFmpeg binary located?
              //outputPath: pathToStore, // Where should the downloaded and encoded files be stored?
              youtubeVideoQuality: "highest", // What video quality should be used?
              queueParallelism: 2, // How many parallel downloads/encodes should be started?
              progressTimeout: 2000, // How long should be the interval of the progress reports
            });

            //Download video and save as MP3 file
            YD.download(id);

            YD.on("finished", function (err, data) {
              var mov = sh.mv(data.file, pathToStore);
              console.log("Moved to " + mov.toString());

              console.log(JSON.stringify(data));
              const notification = notifier.notify("Download finished!", {
                message: `${data.videoTitle} has started downloading...`,
                icon: data.thumbnail,
                file: pathToStore,
                buttons: ["Dismiss", "Open"],
              });

              downloads.push(data);

              store.set("downloads", downloads);

              notification.on("buttonClicked", (text, buttonIndex, options) => {
                if (buttonIndex === 1) {
                  //open options.file
                  shell.openItem(options.file);
                }
                notification.close();
              });

              notification.on("clicked", () => {
                notification.close();
                shell.openItem(pathToStore);
              });
            });

            YD.on("error", function (error) {
              console.log(error);
              notifier.notify("Download Error", {
                message: error,
                icon:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAD5SURBVEhL7dQ/igIxFMfx2LieQTuPsIcQcRsP4p/OVkSwEQ8kLLbu2oggeApBRAst1O8LjMT4kplhmxX8waeJ770McTLmnZdIGSMssMURa4xRxZ/SwgnXgDN6KCB35Km1oZoJcqWGC7RhIU1EU0QXv4gdS8gGwaOqYAWtMeFHq/nEU0pYQmtw+dFqdpiijns60Ip9frQa1xA2c2gFPj9aje8L9uJoP4o+0iI1Wq+YwRycBU1sk9hwsYf5cRZCtE3Shgu7QdtZiHE3yTJc2CP6QNodSMjgrMOF/ZMlctGy3IU8BniIfCrkTshrK2enNaWRvm808M6/iDE3q7H2mDvGfLUAAAAASUVORK5CYII=",
                buttons: ["Dismiss"],
              });
            });

            var timeout;
            YD.on("progress", function (data) {
              console.log(JSON.stringify(data.progress));

              if (timeout) {
                clearTimeout(timeout);
              }

              let sendProgress = () => {
                console.log(
                  "data.progress.percentage",
                  data.progress.percentage
                );
                mainWindow.webContents.send(
                  "downloadProgress",
                  Math.round(data.progress.percentage)
                );
                // let newVal = Math.floor((downloaded / total) * 100);
              };

              timeout = setTimeout(sendProgress, 500);
            });

            notifier.notify("Download Started", {
              message: "MP3 has started downloading...",
              icon:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAD5SURBVEhL7dQ/igIxFMfx2LieQTuPsIcQcRsP4p/OVkSwEQ8kLLbu2oggeApBRAst1O8LjMT4kplhmxX8waeJ770McTLmnZdIGSMssMURa4xRxZ/SwgnXgDN6KCB35Km1oZoJcqWGC7RhIU1EU0QXv4gdS8gGwaOqYAWtMeFHq/nEU0pYQmtw+dFqdpiijns60Ip9frQa1xA2c2gFPj9aje8L9uJoP4o+0iI1Wq+YwRycBU1sk9hwsYf5cRZCtE3Shgu7QdtZiHE3yTJc2CP6QNodSMjgrMOF/ZMlctGy3IU8BniIfCrkTshrK2enNaWRvm808M6/iDE3q7H2mDvGfLUAAAAASUVORK5CYII=",
              buttons: ["Dismiss"],
            });
          });
        });
      }
    );
  }

  changeOutputFolder(callback) {
    if (pathToStore) {
      return callback(pathToStore);
    }
    // Create an electron open dialog for selecting folders, this will take into account platform.
    let fileSelector = dialog.showOpenDialog({
      defaultPath: pathToStore || app.getPath("downloads"),
      properties: ["openDirectory"],
      title: "Select folder to store files.",
    });

    // If a folder was selected and not just closed, set the localStorage value to that path and adjust the state.
    if (fileSelector) {
      pathToStore = fileSelector[0];
      store.set("pathToStore", pathToStore);
      callback(pathToStore);
    }
  }

  showWindow() {
    this.mainWindow.show();
  }
}

module.exports = AppActions;
