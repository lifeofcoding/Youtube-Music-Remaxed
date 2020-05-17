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
  const clear = (() => {
    console.log("trying ad removal method 2");
    const defined = (v) => v !== null && v !== undefined;
    const timeout = setInterval(() => {
      const ad = [...document.querySelectorAll(".ad-showing")][0];
      if (defined(ad)) {
        console.log("method2: found ad");
        const video = document.querySelector("video");
        if (defined(video) && video.duration) {
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
