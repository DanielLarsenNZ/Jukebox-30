app.controller('jukeboxController', ['$scope', '$http', '$location', '$timeout', '$routeParams', 'socket',  
    function ($scope, $http, $location, $timeout, $routeParams, socket) {
    console.log($scope);

    $scope.loading = true;
    $scope.playlistsLoading = false;
    $scope.chooseMusic = false;
    $scope.choosePlaylists = false;
    $scope.finished = false;
    $scope.track = null;
    $scope.startsIn = 0;
    $scope.playing = false;
    $scope.playlists = [];

    $scope.jukebox = {};
    $scope.spotify = { userId: null, playlists: null };

    var audioContext;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext === undefined) {
      $scope.error = "Your browser does not support Web Audio";
      $scope.loading = false;
    } 
    else {
      audioContext = new AudioContext();

      $http.get('/api/jukeboxes/' + $routeParams.jukeboxId).success(function(data) {
          $scope.jukebox = data[0];
          $scope.spotify = { userId: $scope.jukebox.spotifyUsername, playlists: null };
          
          $scope.loading = false;
          
          if ($scope.spotify.userId) {
              $scope.getPlaylists();
          }
          
      }).error(function(data) {
          $scope.error = data;
          $scope.loading = false;
      });
  
      // socket.io
      socket.on('play', function(track) {
          play(audioContext, track);
      });
  
      socket.on('jukebox:data', function(data) {
          $scope.jukebox.trackCount = data.trackCount;
          $scope.jukebox.listenerCount = data.listenerCount;
      });
    }
        
    // SERVER TIME OFFSET ///////////////////////    
    // this is the difference between the clocks on client and server. Positive value means client is fast (ahead of server)
    var serverTimeOffset = 0;
            
    // initiates the server time offset measurement request. 
    var getServerTimeOffset = function (){
        socket.emit('system:getTimeOffset', new Date().getTime());
    };
        
    // callback from request for server time
    // measure the difference between client and server clocks using the Christian algorithm.
    socket.on('system:timeOffset', function (clientTime, serverTime) {
        var now = new Date().getTime();
            
        // christian algorithm
        var offset = (now - clientTime) / 2;
        serverTimeOffset = now - (serverTime + offset);
            
        console.log("getServerTimeOffset: The difference in time between client and server is %d ms.", serverTimeOffset);
    });
    
    // gets the current time on the server in milliseconds.
    var getServerTime = function(){
        return new Date().getTime() - serverTimeOffset;
    };
    // SERVER TIME OFFSET (end) ///////////////////////        
        
        
    // PLAYER ///////////////////////////////////////
    
      // https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Using_HTML5_Audio_Video.pdf
      // https://developer.mozilla.org/en/docs/Web/API/AudioContext

      var loadAudio = function (context, url, callback){
        // Loads an AudioBufferSourceNode ready for playback.
        //  context: An AudioContext instance
        //  url: The URL of the audio file to load.
        //  callback: A function to call once the audio has been loaded. `callback(error:Error, source:AudioBufferSourceNode)`
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        
        request.onload = function bufferSound(event) {
          var request = event.target;
          var source = context.createBufferSource();
  
          // async decodes the encoded buffer.
          context.decodeAudioData(request.response, 
            function(buffer){
              source.buffer = buffer;
              source.connect(context.destination);
              callback(null, source);
            }, 
            function(error){
              callback(error);
            });
        };
        
        request.send();
      };
          
    
    var startsInTimeout;
    var sources = [];

    var play = function (context, track) {
        // plays an audio track from url starting at cue
        if (!$scope.playing) return;
        console.log("play", track);
        
        loadAudio(context, track.url, function(error, source){
          if (error){
              throw error;
          }
          
          if (!$scope.playing) return;
          
          // set source to play at track.startTime;
          var now = getServerTime();
          var startTime = new Date(track.startTime);
          console.log("startTime", startTime);
          
          // timeout is the difference between the time on the server and when the server said to start the track.
          var timeout = Math.max(0, startTime.getTime()) - now;
          
          // start the audio exactly at track.startTime, a calculated offset relative to now.
          // TODO: Seek to catchup if track does not load in time.
          if (timeout < 0) timeout = 0;
          source.start(context.currentTime + (timeout / 1000));
          console.log("playing in ", timeout);
          
          source.onended = function(e){
            console.log("onended: ", e.target);
            stop(e.target);
          };
          
          // keep a registry of sources for clean-up when stopping.
          sources.push(source);
          
          // countdown and track display logic ///////////////
          var remainTimeout;
          
          $timeout(function () {
              if (!$scope.playing) {
                  $timeout.cancel(remainTimeout);
                  return;
              }
              
              if (remainTimeout) $timeout.cancel(remainTimeout);
              
              track.remain = parseInt(source.buffer.duration);
              $scope.track = track;
              
              // start the remaining countdown
              remainTimeout = $timeout(function countdown () {
                  track.remain--;
                  if (track.remain > 0) {
                      remainTimeout = $timeout(countdown, 1000);
                  }
              }, 1000);
          }, timeout);
  
          // startsIn countdown timer
          $scope.startsIn = parseInt(timeout/1000);
          startsInTimeout = $timeout(function startsInCountdown() {
              $scope.startsIn--;
              if ($scope.startsIn > 0) {
                  startsInTimeout = $timeout(startsInCountdown, 1000);
              }
          }, 1000);        
        });
    };

    var stop = function (source) {
        if (source != null) {
            console.log("stopping", source);
            
            try {
                source.stop(0);    
            } catch (error) {
                console.log(error.message);
            }
            
            delete sources[source];
        }
    };
     
    // PLAYER (end) ///////////////////////////////////////

    $scope.start = function() {
        console.log("playButton.click");
        socket.emit('join', $scope.jukebox.id);
        getServerTimeOffset();
        $scope.playing = true;
    };

    $scope.stop = function() {
        //socket.emit('stop', $scope.jukebox.id);
        for (var source in sources) {
            stop(sources[source]);
        }
        $scope.track = null;
        $scope.playing = false;
    };

    $scope.getPlaylists = function() {
        $scope.error = null;
        $scope.playlistsLoading = true;
        var offset = 0;

        if ($scope.spotify.playlists) {
            offset = $scope.spotify.playlists.offset + $scope.spotify.playlists.limit;
        }

        $http.get('/api/playlists?username=' + $scope.spotify.userId + '&offset=' + offset).success(function(data) {
            $scope.spotify.playlists = data;
            $scope.playlists = $scope.playlists.concat(data.items);
            $scope.playlistsLoading = false;
            $scope.choosePlaylists = true;
        }).error(function(data) {
            $scope.error = data.error.message;
            $scope.playlistsLoading = false;
        });
    };

    $scope.addPlaylist = function(playlist) {
        playlist.Add = true;
        playlist.Loading = true;

        // POST /api/jukeboxes/:id/tracks {"username":"xxxx", "playlistId":"xxxx"}
        $http.post('/api/jukeboxes/'+ $scope.jukebox.id + '/tracks', { username: playlist.owner.id, playlistId: playlist.id })
            .success(function() {
                playlist.Loading = false;
            }).error(function(data) {
                $scope.error = data.error.message;
                playlist.Loading = false;
            });
    };
}]);
