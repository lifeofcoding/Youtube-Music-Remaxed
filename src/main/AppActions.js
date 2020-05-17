const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const os = require("os");
process.env.KEY = "AIzaSyC3_5fN3lbGKuTWCC0Dwhd0hJ_X6wh8kXw";

const sh = require("shelljs");
const notifier = require("electron-notifications");
const ffbinaries = require("ffbinaries");
const dest = app.getPath("appData");

const YoutubeMp3Downloader = require("youtube-mp3-downloader");

var pathToStore, ffmpegPath, ffmpegFilename;
class AppActions {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    const changeOutputFolder = this.changeOutputFolder.bind(this);
    ffbinaries.downloadBinaries(
      ["ffmpeg"],
      { platform: os.platform(), quiet: true, destination: dest },
      function (error, results) {
        console.log(
          "Downloaded ffplay and ffprobe binaries for linux-64 to " + dest + "."
        );

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
      callback(pathToStore);
    }
  }

  showWindow() {
    this.mainWindow.show();
  }
}

module.exports = AppActions;
