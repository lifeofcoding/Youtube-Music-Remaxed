!function(){"use strict";console.log("YSAT");var n="on",o="",i="on",r=r||[];function t(){var e=document.getElementsByClassName("video-stream")[0]||!1;e&&(u(),c(),e.onprogress=e.ontimeupdate=function(){u(),c()})}function u(){var e=[".videoAdUiSkipButton.videoAdUiAction.videoAdUiFixedPaddingSkipButton",".ytp-ad-skip-button"];for(var t in e)s(e[t])}function c(){var e=["ytp-ad-overlay-close-button"];for(var t in e){var n=document.getElementsByClassName(e[t]);0<n.length&&a(n)}}function a(e){if("off"===n)return!1;if("off"===i)return!1;for(var t=0;t<e.length;t++)f(e[t],"click")}function s(t){!1!==d(t)&&setTimeout(function(){var e;!1!==d(t)&&(setTimeout(function(){document.querySelector(t).click()},"skip_after_30_secs"===o?3e4:1),function(){var e=".ytp-ad-button-text";if(0==document.querySelectorAll(e).length)return;var t=document.querySelector(e).innerText;r.push(["_trackEvent","ad_btn_text",t])}(),e=t,r.push(["_trackEvent",e,"clicked"]))},100)}function d(e){if("off"===n)return!1;if(0==document.querySelectorAll(e).length)return!1;if("skip_never"===o)return!1;if("skip_immediately"===o)return!0;if("skip_after_countdown"===o){var t=".ytp-ad-skip-button-slot";return 0!=document.querySelectorAll(t).length&&"none"!==window.getComputedStyle(document.querySelector(t)).display}if("skip_after_30_secs"===o){t=".ytp-ad-skip-button-slot";return 0!=document.querySelectorAll(t).length}}function f(e,t){if(e)if(e.fireEvent)e.fireEvent("on"+t);else{var n=document.createEvent("Events");n.initEvent(t,!0,!1),e.dispatchEvent(n)}}!function(){function e(){t()}t(),document.addEventListener("spfdone",function(){t()}),document.addEventListener("transitionend",function(e){t()}),document.addEventListener("DOMContentLoaded",function(){t()}),window.addEventListener("popstate",function(){t()}),"onhashchange"in window&&(window.onhashchange=e);window.document.onload=e,window.onload=e,setTimeout(function(){t()},1e3)}(),r.push(["_setAccount","UA-57562361-4"]),r.push(["_trackPageview"]),function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://ssl.google-analytics.com/ga.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)}(),chrome.storage.sync.get(["youtube_ad_skip_trigger_config"],function(e){n=!1===e.youtube_ad_skip_trigger_config.status?"off":"on",o=e.youtube_ad_skip_trigger_config.skip_video_ad||"skip_after_countdown",i=!1===e.youtube_ad_skip_trigger_config.close_ad_banner?"off":"on"}),chrome.storage.onChanged.addListener(function(e,t){n=!1===e.youtube_ad_skip_trigger_config.newValue.status?"off":"on",o=e.youtube_ad_skip_trigger_config.newValue.skip_video_ad||"skip_after_countdown",i=!1===e.youtube_ad_skip_trigger_config.newValue.close_ad_banner?"off":"on"})}();