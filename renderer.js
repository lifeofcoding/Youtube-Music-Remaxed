
const $webview = webview = document.querySelector('webview');
const $loader = document.querySelector('.loader');
const {ipcMain, ipcRenderer} = require('electron');

let isInitialLoad = true;

var player, currentlyPlaying;

function YouTubeGetID(url){
 var id = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{10,12})\b/);
  
  if (id) {
    return id[1];
  } else {
    return null;
  }
}

var currentlyPlaying, webView, webContents
ipcRenderer.on('action' , function(event , data){
  var webContents, webView;
  
  
  webView = webView || document.querySelector('webview');
  webContents = webContents || webView.getWebContents().webContents;
  
    if (!player) {
        player = document.getElementById('player');
    }
  
    let video_id = YouTubeGetID(document.querySelector('webview').src);
  
    if (data.action === 'play' && currentlyPlaying !== video_id) {
      console.log(JSON.stringify(data));
      currentlyPlaying = video_id;
//      player.src = 'http://127.0.0.1:7331/' + video_id;
//      player.load();
//      player.play();
//      videoEl = videoEl || webContents.executeJavaScript(`document.getElementById('movie_player')`);
      webContents.executeJavaScript(`document.getElementById("movie_player").src = "http://127.0.0.1:7331/${video_id}"`);
      webContents.executeJavaScript(`document.getElementById("movie_player").load();`);
      webContents.executeJavaScript(`document.getElementById("movie_player").play();`);
      console.log(`webContents.executeJavaScript("document.getElementById("movie_player").src");`, webContents.executeJavaScript('document.getElementById("movie_player").src'));
//      videoEl.src = 'http://127.0.0.1:7331/' + video_id + '&type=mp4';
//      videoEl.play();
    }
});



function createFragment(htmlStr) {
  var frag = document.createDocumentFragment(),
      temp = document.createElement('div');

  temp.innerHTML = htmlStr;

  while(temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }

  return  frag;
}

$webview.addEventListener('did-stop-loading', () => {
  let video_id = YouTubeGetID(document.querySelector('webview').src);
  
  if (video_id) {
    $('.openNav').css({ 
      transition: '-webkit-transform 250ms ease-in',
      transform: 'rotate(360deg)'
    });
    
    $('.openNav').fadeIn();
  } else if ($('.openNav').is(':visible')) {
    $('.openNav').css({ 
      transition: '-webkit-transform 250ms ease-in',
      transform: 'rotate(360deg)'
    });
    
    $('.openNav').fadeOut();
  }
});

$webview.addEventListener('did-start-loading', () => {
  // we use client side rendering so the loader is only needed on the first page load
  if(isInitialLoad) {
    $webview.classList.add('hide');
    $loader.classList.remove('loader-hide');
    isInitialLoad = false;
  }
});

$webview.addEventListener('dom-ready', () => {
  var downloadBtn = document.getElementById('downloadBtn');
  $(downloadBtn).on('click', () => {
    $('.openNav').trigger('click');
    
    const ipcRenderer = require('electron').ipcRenderer;
    let video_id = YouTubeGetID(document.querySelector('webview').src);
//    let title = webContents.executeJavaScript(`document.getElementById("movie_player").src = "http://127.0.0.1:7331/${video_id}"`);
    ipcRenderer.send('download', {url: 'http://127.0.0.1:7331/' + video_id});
  });
  
  $webview.classList.remove('hide');
  // have to delay in order for the webview show/resize to settle
  setTimeout(() => {
    $loader.classList.add('loader-hide');
  }, 100);
});

let firstShotReloaded = false

const attachDebugger = () => {
  const debug = $webview.getWebContents().debugger
  debug.attach('1.1')
  debug.on('message', (event, method, params) => {
    if (!firstShotReloaded && method === 'Network.responseReceived') {
      // XXX did not find any other way for first page load
      firstShotReloaded = true
      $webview.reload()
    }
    if (method === 'Network.requestWillBeSent') {
      if (params.request.url === $webview.getURL()) {
        debug.sendCommand('Network.getResponseBody', { requestId: params.requestId }, (err, data) => {
          if (err.code === undefined) {
            // XXX may check data.base64encoded boolean and decode ? Maybe not here...
            // if (data.base64encoded) ... Buffer.from(data.body, 'base64');
            this.$store.dispatch('updateStaticSource', data.body)
          }
        })
      }
    }
  })
  debug.sendCommand('Network.enable')
  webview.removeEventListener('did-start-loading', attachDebugger)
}
$webview.addEventListener('did-start-loading', attachDebugger)

// this is just for development convenience
window.openWebviewDevTools = () => {
  $webview.getWebContents().openDevTools();
};
