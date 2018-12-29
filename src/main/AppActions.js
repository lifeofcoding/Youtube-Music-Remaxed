const { app, BrowserWindow, ipcMain } = require('electron');
const DownloadManager = require("electron-download-manager");
process.env.KEY = 'AIzaSyC3_5fN3lbGKuTWCC0Dwhd0hJ_X6wh8kXw';

const notifier = require('electron-notifications');

class AppActions {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    
    ipcMain.on('download', (e, args) => {
      let id = args.url.replace('http://127.0.0.1:7331/', '');
      console.log('download', id, args.url);
      
      const yas = require('youtube-audio-server')

      yas.get(id, (err, data) => {
        var file = app.getPath("downloads") + '/' + data.items[0].snippet.title.replace(' ', '_') + '.mp3';
        console.log('file', file);
        console.log('GOT METADATA for HQmmM_qwG4k:', JSON.stringify(data) || err);
        yas.downloader
        .onSuccess(({id, file}) => {
          console.log(`Yay! Audio (${id}) downloaded successfully into "${file}"!`)
          notifier.notify('Download Finished', {
            message: data.items[0].snippet.title + ' downloaded successfully!',
            icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAD5SURBVEhL7dQ/igIxFMfx2LieQTuPsIcQcRsP4p/OVkSwEQ8kLLbu2oggeApBRAst1O8LjMT4kplhmxX8waeJ770McTLmnZdIGSMssMURa4xRxZ/SwgnXgDN6KCB35Km1oZoJcqWGC7RhIU1EU0QXv4gdS8gGwaOqYAWtMeFHq/nEU0pYQmtw+dFqdpiijns60Ip9frQa1xA2c2gFPj9aje8L9uJoP4o+0iI1Wq+YwRycBU1sk9hwsYf5cRZCtE3Shgu7QdtZiHE3yTJc2CP6QNodSMjgrMOF/ZMlctGy3IU8BniIfCrkTshrK2enNaWRvm808M6/iDE3q7H2mDvGfLUAAAAASUVORK5CYII=',
            buttons: ['Dismiss'],
          })
        })
        .onError(({id, file, error}) => {
          console.error(`Sorry, an error ocurred when trying to download ${id}`, error)
        })
        .download({id, file});
        
        notifier.notify('Download Started', {
          message: data.items[0].snippet.title + ' has started downloading...',
          icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAD5SURBVEhL7dQ/igIxFMfx2LieQTuPsIcQcRsP4p/OVkSwEQ8kLLbu2oggeApBRAst1O8LjMT4kplhmxX8waeJ770McTLmnZdIGSMssMURa4xRxZ/SwgnXgDN6KCB35Km1oZoJcqWGC7RhIU1EU0QXv4gdS8gGwaOqYAWtMeFHq/nEU0pYQmtw+dFqdpiijns60Ip9frQa1xA2c2gFPj9aje8L9uJoP4o+0iI1Wq+YwRycBU1sk9hwsYf5cRZCtE3Shgu7QdtZiHE3yTJc2CP6QNodSMjgrMOF/ZMlctGy3IU8BniIfCrkTshrK2enNaWRvm808M6/iDE3q7H2mDvGfLUAAAAASUVORK5CYII=',
          buttons: ['Dismiss'],
        })
//        DownloadManager.download({
//          url: args.url + '?title=' + data.items[0].snippet.title + '.mp3',
//          onProgress: function(progress, item) {
//            console.log('Download progress', progress);
//          }
//        }, function (error, info) {
//            if (error) {
//                console.log(error);
//                return;
//            }
//
//            console.log("DONE: " + info.url);
//        });
      })
    });
  }

  showWindow() {
      this.mainWindow.show();
  }
}

module.exports = AppActions
