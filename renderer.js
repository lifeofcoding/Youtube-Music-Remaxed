const $webview = (webview = document.querySelector("webview"));
const $loader = document.querySelector(".loader");
const { ipcMain, ipcRenderer, remote } = require("electron");

let isInitialLoad = true;

var player, currentlyPlaying;

function YouTubeGetID(url) {
  var id = url.match(
    /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{10,12})\b/
  );

  if (id) {
    return id[1];
  } else {
    return null;
  }
}

var currentlyPlaying, webView, webContents;
ipcRenderer.on("action", function (event, data) {
  var webContents, webView;

  webView = webView || document.querySelector("webview");
  webContents = webContents || webView.getWebContents().webContents;

  if (!player) {
    player = document.getElementById("player");
  }

  let video_id = YouTubeGetID(document.querySelector("webview").src);

  if (data.action === "play" && currentlyPlaying !== video_id) {
    console.log(JSON.stringify(data));
    currentlyPlaying = video_id;
    //      player.src = 'http://127.0.0.1:7331/' + video_id;
    //      player.load();
    //      player.play();
    //      videoEl = videoEl || webContents.executeJavaScript(`document.getElementById('movie_player')`);
    webContents.executeJavaScript(
      `document.getElementById("movie_player").src = "http://127.0.0.1:7331/${video_id}"`
    );
    webContents.executeJavaScript(
      `document.getElementById("movie_player").load();`
    );
    webContents.executeJavaScript(
      `document.getElementById("movie_player").play();`
    );
    console.log(
      `webContents.executeJavaScript("document.getElementById("movie_player").src");`,
      webContents.executeJavaScript(
        'document.getElementById("movie_player").src'
      )
    );
    //      videoEl.src = 'http://127.0.0.1:7331/' + video_id + '&type=mp4';
    //      videoEl.play();
  }
});

function createFragment(htmlStr) {
  var frag = document.createDocumentFragment(),
    temp = document.createElement("div");

  temp.innerHTML = htmlStr;

  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }

  return frag;
}

$webview.addEventListener("did-stop-loading", () => {
  let video_id = YouTubeGetID(document.querySelector("webview").src);

  if (video_id) {
    $(".openNav").css({
      transition: "-webkit-transform 250ms ease-in",
      transform: "rotate(360deg)",
    });

    $(".openNav").fadeIn();
  } else if ($(".openNav").is(":visible")) {
    $(".openNav").css({
      transition: "-webkit-transform 250ms ease-in",
      transform: "rotate(360deg)",
    });

    $(".openNav").fadeOut();
  }
});

$webview.addEventListener("did-start-loading", () => {
  //$webview.getWebContents().openDevTools();
  const ses = remote.session.fromPartition("persist:webview");

  let session = $webview.getWebContents().session;

  //VISITOR_INFO1_LIVE=oKckVSqvaGw; path=/; domain=.youtube.com
  const cookie = {
    url: "https://music.youtube.com",
    domain: ".youtube.com",
    path: "/",
    name: "VISITOR_INFO1_LIVE",
    value: "oKckVSqvaGw",
  };

  session.cookies.set(cookie, function () {
    () => {
      // success
      console.log("set cookie successful");
    },
      (error) => {
        console.error(error);
      };
  });

  session.cookies.get({ url: "https://music.youtube.com" }, function (
    error,
    cookies
  ) {
    console.log(cookies);
    let cookieStr = "";
    for (var i = 0; i < cookies.length; i++) {
      let info = cookies[i];
      cookieStr += `${info.name}=${info.value};`;
      console.log(info.value, info.name);
    }
    console.log(cookieStr);
  });

  // we use client side rendering so the loader is only needed on the first page load
  if (isInitialLoad) {
    $webview.classList.add("hide");
    $loader.classList.remove("loader-hide");
    isInitialLoad = false;
  }
});

$webview.addEventListener("dom-ready", () => {
  //$webview.getWebContents().openDevTools();
  var downloadBtn = document.getElementById("downloadBtn");
  $(downloadBtn).on("click", () => {
    $(".openNav").trigger("click");

    const ipcRenderer = require("electron").ipcRenderer;
    let video_id = YouTubeGetID(document.querySelector("webview").src);
    //    let title = webContents.executeJavaScript(`document.getElementById("movie_player").src = "http://127.0.0.1:7331/${video_id}"`);
    ipcRenderer.send("download", { url: "http://127.0.0.1:7331/" + video_id });
  });

  let w = window.innerWidth;
  let h = window.innerHeight;

  $webview.style.width = w;
  $webview.style.height = h;
  // have to delay in order for the webview show/resize to settle
  setTimeout(() => {
    $loader.classList.add("loader-hide");

    setTimeout(() => {
      $webview.classList.remove("hide");
      $webview.classList.add("vanishIn");
    }, 2000);
  }, 1000);
});

$webview.addEventListener("contextmenu", (event) => {
  const menu = remote.Menu.buildFromTemplate([
    {
      label: "Back",
      click() {
        $webview.getWebContents().goBack();
      },
      enabled: $webview.getWebContents().canGoBack(),
    },
    { type: "separator" },
    {
      label: "Forward",
      enabled: $webview.getWebContents().canGoForward(),
      click() {
        $webview.getWebContents().goForward();
      },
    },
    {
      label: "About",
      click() {
        toggleModal();
      },
    },
  ]);
  menu.popup(remote.getCurrentWindow());
});

// let firstShotReloaded = false

// $webview.addEventListener('did-start-loading', attachDebugger)

// this is just for development convenience
window.openWebviewDevTools = () => {
  $webview.getWebContents().openDevTools();
};
