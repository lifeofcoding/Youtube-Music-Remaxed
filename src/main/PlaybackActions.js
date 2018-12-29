const {session} = require('electron');

class PlaybackActions {
	constructor(webContents) {
      
          //require('electron-dl')();


		// const id = 'HQmmM_qwG4k' // "Whole Lotta Love" by Led Zeppelin.
		// const file = 'whole-lotta-love.mp3'
		// console.log(`Downloading ${id} into ${file}...`)
		// yas.downloader
		//   .onSuccess(({id, file}) => {
		//     console.log(`Yay! Audio (${id}) downloaded successfully into "${file}"!`)
		//   })
		//   .onError(({id, file, error}) => {
		//     console.error(`Sorry, an error ocurred when trying to download ${id}`, error)
		//   })
		//   .download({id, file})


		// let browser = session.defaultSession
		//
		// // Modify the user agent for all requests to the following urls.
		// const filter = {
		// 	urls: [
		// 		'*://*.googlevideo.com.*',
		// 		'*://*.googlevideo.com/videoplayback?*'
		// 	]
		// }
		//
		// var redirectUrl = "http://127.0.0.1:8080/";
		// browser.webRequest.onBeforeRequest(filter, (details, callback) => {
		// 	debugger;
		// 	console.log('webContents', webContents.brow)
		// 	var body = webContents.webContents.querySelector('body');
		//
		// 	var player = `
		// 		<audio id="player" src="http://127.0.0.1:8080/YnQXEm4xPo8" autoplay="true"></audio>
		// 	`;
		//
		// 	body.find('#player').remove();
		//
		// 	body.prepend(player);
		// 	return {cancel: false, redirectUrl: redirectUrl};
		// 	// callback({cancel: false, requestHeaders: details.requestHeaders})
		// })

		// //match pattern for the URLs to redirect
		// var pattern = "*://*.googlevideo.com/videoplayback?*";
		//
		// //URL we will redirect to
		// var redirectUrl = "http://127.0.0.1:8080/";
		//
		// function cancel(requestDetails) {
		//   console.log("Canceling: " + requestDetails.url);
		//
		//   return {cancel: false, redirectUrl: redirectUrl};
		// }
		//
		// // add the listener,
		// // passing the filter argument and "blocking"
		// browser.webRequest.onBeforeRequest(
		//   cancel,
		//   {urls: [pattern]}
		// );
		// //match pattern for the URLs to redirect
		// var pattern = "*://*.googlevideo.com/videoplayback?*";
		//
		// //URL we will redirect to
		// var redirectUrl = "http://127.0.0.1:8080/";
		//
		// function cancel(requestDetails) {
		//   console.log("Canceling: " + requestDetails.url);
		//
		//   return {cancel: false, redirectUrl: redirectUrl};
		// }
		//
		// // add the listener,
		// // passing the filter argument and "blocking"
		// browser.webRequest.onBeforeRequest(
		//   cancel,
		//   {urls: [pattern]}
		// );

		let browser = session.defaultSession;

	  // match pattern for the URLs to redirect
	  var filter = {
			urls: [
				'http://google.com/',
				//'https://music.youtube.com/*'
				'*://*.googlevideo.com/videoplayback?*',
			],
			//type:["XHR"]
		};
			//'https://music.youtube.com/*-*-*-*-*',
			// 'https://music.youtube.com/*'

	  // redirect function
	  // returns an object with a property `redirectURL`
	  // set to the new URL
	  function redirect(requestDetails) {
			console.log(requestDetails);
	    console.log("Redirecting: " + requestDetails.url);
          webContents.send('action' , {action:'play'});
			//requestDetails.url = 'http://localhost:7331/UYwF-jdcVjY'

			//return {cancel: false, details: requestDetails};

			//session.defaultSession.webContents.executeJavaScript(`document.getElementsByClassName('.')[0].click()`);

	    return {
				cancel: true,
				details: requestDetails
	      //redirectUrl: 'http://localhost:7331/UYwF-jdcVjY'
	    };
	  }

	  // add the listener,
	  // passing the filter argument and "blocking"
	  //session.defaultSession.webRequest.onBeforeRequest(
	   // filter,
	   // redirect,
	    // ["blocking"]
	  //);

		this.webContents = webContents;
	}

	playPause() {
		this.webContents.executeJavaScript(`document.getElementsByClassName('play-pause-button')[0].click()`);
	}

	next() {
		this.webContents.executeJavaScript(`document.getElementsByClassName('next-button')[0].click()`)
	}

	previous() {
		this.webContents.executeJavaScript(`document.getElementsByClassName('previous-button')[0].click()`)
	}
}

module.exports = PlaybackActions
