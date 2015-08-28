app.factory('webaudio', function () {
  "use strict";

  // https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Using_HTML5_Audio_Video.pdf
  // https://developer.mozilla.org/en/docs/Web/API/AudioContext
  
  var audioContext;
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) audioContext = new AudioContext();
  
  return {
    isSupported: (audioContext !== undefined),
    
    loadAudio: function (url, callback) {
      // Loads an AudioBufferSourceNode ready for playback.
      //  url: The URL of the audio file to load.
      //  callback: A function to call once the audio has been loaded. `callback(error:Error, source:AudioBufferSourceNode, gain:GainNode)`
      if (!audioContext) {
        callback(new Error ("WebAudio API is not supported."));
        return;
      }
      
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';
      
      request.onload = function bufferSound(event) {
        var request = event.target;
        var source = audioContext.createBufferSource();
        var gain = audioContext.createGain();
        

        // async decode the encoded buffer.
        audioContext.decodeAudioData(request.response, 
          function(buffer){
            source.buffer = buffer;
            source.connect(gain);
            gain.connect(audioContext.destination);
            callback(null, source, gain);
          }, 
          function(error){
            callback(error);
          });
      };
      
      request.onerror = function (error){
        callback(error);
        return;
      };
      
      request.send();
    },
    
    getAudioContext: function(){ return audioContext; }
    
  };
});