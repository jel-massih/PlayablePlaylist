// a global variable that will hold a reference to the api swf once it has loaded
var apiswf = null;

$(document).ready(function() {
  // on page load use SWFObject to load the API swf into div#apiswf
  var flashvars = {
    'playbackToken': "GA5SjEFF_____2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbmplbC1tYXNzaWguY29tBBy3P0wE7KZu2lIgOXKPpw==", // from token.js
    'domain': "jel-massih.com", // from token.js
    'listener': 'callback_object' // the global name of the object that will receive callbacks from the SWF
    };
  var params = {
    'allowScriptAccess': 'always'
  };
  var attributes = {};
  swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
      'apiswf', // the ID of the element that will be replaced with the SWF
      1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
});


var callback_object = {};

callback_object.ready = function ready(user) {
  apiswf = $('#apiswf').get(0);
}

var timeoutReference;

callback_object.playingTrackChanged = function playingTrackChanged(playingTrack, sourcePos) {
  if (sourcePos != "-1" && timeoutReference)  {clearTimeout(timeoutReference);} else {
  timeoutReference = setTimeout(function() {
    trackEnded();
    console.log("fail");
  }, 1000);
}

}

function playTrack(key) {
  apiswf.rdio_play(key);
}