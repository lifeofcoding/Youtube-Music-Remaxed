const $webview = (webview = document.querySelector("webview"));
const $loader = document.querySelector(".loader");
const { ipcMain, ipcRenderer, remote } = require("electron");

const pippyJS =
  "\n(async () => {\n  const sourcesArray = Array.from(document.querySelectorAll('video')).filter(video => video.readyState != 0).filter(video => video.disablePictureInPicture == false).sort((v1, v2) => {\n    const v1Rect = v1.getClientRects()[0];\n    const v2Rect = v1.getClientRects()[0];\n    return ((v2Rect.width * v2Rect.height) - (v1Rect.width * v1Rect.height));\n  });\n  if (sourcesArray.length === 0)\n    return;\n  const video = sourcesArray[0];\n  if (video.hasAttribute('pippystatus')) {\n    await document.exitPictureInPicture();\n  } else {\n    await video.requestPictureInPicture();\n    video.setAttribute('pippystatus', true);\n    video.addEventListener('leavepictureinpicture', event => {\n      video.removeAttribute('pippystatus');\n    }, { once: true });\n  }\n})();\n    ";

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

ipcRenderer.on("downloadProgress", function (event, data) {
  window.setDownloadProgress(data / 100);
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

  $webview.getWebContents().on("will-navigate", function (event, url) {
    let video_id = YouTubeGetID(url);

    if (video_id) {
      console.log("is video url");
      console.log("trying ad removal method 1");
      $webview.getWebContents().executeJavaScript(`
          console.log("trying ad removal method 1");
          var player = document.getElementById("movie_player");
          var clean_player = player.cloneNode(true);
          var flash_vars = player.getAttribute("flashvars");
          flash_vars = flash_vars.replace(/&ad[^&]+/g, "");
          clean_player.setAttribute("flashvars", flash_vars);
          player.parentNode.replaceChild(clean_player, player);
      `);
    }
  });

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
    ipcRenderer.send("download", { id: video_id });
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

  $webview.getWebContents().executeJavaScript(pippyJS);
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
