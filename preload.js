// in preload scripts, we have access to node.js and electron APIs
// the remote web app will not, so this is safe
const { ipcRenderer: ipc, remote } = require("electron");

function createFragment(htmlStr) {
  var frag = document.createDocumentFragment(),
    temp = document.createElement("div");

  temp.innerHTML = htmlStr;

  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }

  return frag;
}

function init() {
  (function (fn) {
    if (document.readyState == "loading") {
      addEventListener("DOMContentLoaded", fn, false);
    } else {
      fn();
    }
  })(function () {
    try {
      // these variables are loaded into flashVars
      var o = yt.playerConfig.args;
      for (var i in o) {
        if (o.hasOwnProperty(i) && /^(afv_)?ad/.test(i)) {
          delete o[i];
        }
      }
    } catch (e) {}
    var player = document.getElementById("movie_player");
    var clean_player = player.cloneNode(true);
    var flash_vars = player.getAttribute("flashvars");
    flash_vars = flash_vars.replace(/&ad[^&]+/g, "");
    clean_player.setAttribute("flashvars", flash_vars);
    player.parentNode.replaceChild(clean_player, player);
  });

  const clear = (() => {
    const defined = (v) => v !== null && v !== undefined;
    const timeout = setInterval(() => {
      const ad = [...document.querySelectorAll(".ad-showing")][0];
      if (defined(ad)) {
        const video = document.querySelector("video");
        if (defined(video)) {
          video.currentTime = video.duration;
        }
      }
    }, 500);
    return function () {
      clearTimeout(timeout);
    };
  })();

  document.addEventListener("DOMNodeInserted", function (get_id_and_class) {
    console.warn("DOMNodeInserted");
    var element_id = get_id_and_class.target.id;
    var element_class = get_id_and_class.target.className;

    if (element_class != "" && class_hashmap[element_class] != undefined) {
      hide_elements_class(element_class);
    }

    if (element_id != "" && id_hashmap[element_id] != undefined) {
      hide_elements_id(element_id);
    }

    var n = "on",
      o = "",
      i = "on",
      r = r || [];
    function t() {
      var e = document.getElementsByClassName("video-stream")[0] || !1;
      e &&
        (u(),
        c(),
        (e.onprogress = e.ontimeupdate = function () {
          u(), c();
        }));
    }
    function u() {
      var e = [
        ".videoAdUiSkipButton.videoAdUiAction.videoAdUiFixedPaddingSkipButton",
        ".ytp-ad-skip-button",
      ];
      for (var t in e) s(e[t]);
    }
    function c() {
      var e = ["ytp-ad-overlay-close-button"];
      for (var t in e) {
        var n = document.getElementsByClassName(e[t]);
        0 < n.length && a(n);
      }
    }
    function a(e) {
      if ("off" === n) return !1;
      if ("off" === i) return !1;
      for (var t = 0; t < e.length; t++) f(e[t], "click");
    }
    function s(t) {
      !1 !== d(t) &&
        setTimeout(function () {
          var e;
          !1 !== d(t) &&
            (setTimeout(
              function () {
                document.querySelector(t).click();
              },
              "skip_after_30_secs" === o ? 3e4 : 1
            ),
            (function () {
              var e = ".ytp-ad-button-text";
              if (0 == document.querySelectorAll(e).length) return;
              var t = document.querySelector(e).innerText;
              r.push(["_trackEvent", "ad_btn_text", t]);
            })(),
            (e = t),
            r.push(["_trackEvent", e, "clicked"]));
        }, 100);
    }
    function d(e) {
      if ("off" === n) return !1;
      if (0 == document.querySelectorAll(e).length) return !1;
      if ("skip_never" === o) return !1;
      if ("skip_immediately" === o) return !0;
      if ("skip_after_countdown" === o) {
        var t = ".ytp-ad-skip-button-slot";
        return (
          0 != document.querySelectorAll(t).length &&
          "none" !== window.getComputedStyle(document.querySelector(t)).display
        );
      }
      if ("skip_after_30_secs" === o) {
        t = ".ytp-ad-skip-button-slot";
        return 0 != document.querySelectorAll(t).length;
      }
    }
    function f(e, t) {
      if (e)
        if (e.fireEvent) e.fireEvent("on" + t);
        else {
          var n = document.createEvent("Events");
          n.initEvent(t, !0, !1), e.dispatchEvent(n);
        }
    }
    !(function () {
      function e() {
        t();
      }
      t(),
        document.addEventListener("spfdone", function () {
          t();
        }),
        document.addEventListener("transitionend", function (e) {
          t();
        }),
        document.addEventListener("DOMContentLoaded", function () {
          t();
        }),
        window.addEventListener("popstate", function () {
          t();
        }),
        "onhashchange" in window && (window.onhashchange = e);
      (window.document.onload = e),
        (window.onload = e),
        setTimeout(function () {
          t();
        }, 1e3);
    })();
  });

  document.addEventListener("DOMSubtreeModified", function (get_id_and_class) {
    console.warn("DOMSubtreeModified");
    var element_id = get_id_and_class.target.id;
    var element_class = get_id_and_class.target.className;

    if (element_class != "" && class_hashmap[element_class] != undefined) {
      hide_elements_class(element_class);
    }

    if (element_id != "" && id_hashmap[element_id] != undefined) {
      hide_elements_id(element_id);
    }
  });

  function hide_elements_class(element_class) {
    if (element_class) {
      var appBanners = document.getElementsByClassName(element_class);
      [].forEach.call(appBanners, function (appBanner) {
        appBanner.style.display = "none";
        console.log("hided the class" + element_class);
      });
    }
  }

  function hide_elements_id(element_id) {
    document.getElementById(element_id).style.display = "none";
    console.log("hided the id" + element_id);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var allElements = document.getElementsByTagName("*");
    for (var i = 0; i < allElements.length; i++) {
      if (
        allElements[i].id != "" &&
        id_hashmap[allElements[i].id] != undefined
      ) {
        hide_elements_id(allElements[i].id);
      }

      if (
        allElements[i].className != "" &&
        class_hashmap[allElements[i].className] != undefined
      ) {
        hide_elements_class(allElements[i].className);
      }
    }
  });

  var class_hashmap = { ad1: "ad1", ad2: "ad2" };
  var id_hashmap = { adid1: "adid1", adid2: adid2 };
}

init();
