app.controller('jukeboxController', ['$scope', '$http', '$location', '$timeout', '$routeParams', 'socket', 'servertime', 'webaudio',
    function ($scope, $http, $location, $timeout, $routeParams, socket, servertime, webaudio) {
    $scope.loading = true;
    $scope.playlistsLoading = false;
    $scope.chooseMusic = false;
    $scope.choosePlaylists = false;
    $scope.finished = false;
    $scope.track = null;
    $scope.startsIn = 0;
    $scope.playing = false;
    $scope.playlists = [];
    $scope.audioOn = false;

    $scope.jukebox = {};
    $scope.spotify = { userId: null, playlists: null };

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
        play(track);
    });

    socket.on('jukebox:data', function(data) {
        $scope.jukebox.trackCount = data.trackCount;
        $scope.jukebox.listenerCount = data.listenerCount;
    });

    // measure the time difference between client and server
    servertime.measureOffset();        
    
    // join the jukebox "room"
    socket.emit('join', $routeParams.jukeboxId);
    console.log("socket.emit('join', %s)", $routeParams.jukeboxId);
    
    // start the player
    $scope.playing = true;
    
    // PLAYER ///////////////////////////////////////
    
              
    var startsInTimeout;

    var timeUntilTrackStart = function (trackStartTime){
        var now = servertime.getServerTime();
        var startTime = new Date(trackStartTime);        
        // return the difference between the time on the server and when the server said to start the track.
        //  negative number indicates track should have already started.
        return startTime.getTime() - now;      
    };
    
    var startSource = function (track){
      if (!webaudio.isSupported) return;
      
      // todo: track service
      track.mute(false);
      
      var timeout = timeUntilTrackStart(track.startTime);
      console.log("play: playing %s in %d ms", track.name, timeout);
      
      if (timeout >= 0) {
        track.source.start(webaudio.getAudioContext().currentTime + (timeout / 1000));
      } else {
        track.source.start(webaudio.getAudioContext().currentTime, Math.abs(timeout / 1000));
      }
    };

    var play = function (track) {
      // plays an audio track from url starting at cue
      //if (!$scope.playing) return;
      console.log("play", track);
      
      track.remain = 30;
      
      if (webaudio.isSupported) {
        webaudio.loadAudio(track.url, function(error, source, gain){
          if (error){
              throw error;
          }
          
          //if (!$scope.playing) return;
          track.source = source;
          track.gain = gain;

          // todo: trackservice
          track.mute = function(muteOn){
            if (muteOn === undefined) muteOn = true;
            if (webaudio.isSupported) this.gain.gain.value = muteOn ? 0 : 1;
          }

          track.mute();
          
          track.remain = parseInt(source.buffer.duration);
          if ($scope.audioOn) startSource(track);
        });
      }
      
      // countdown and track display logic ///////////////
      var remainTimeout;
                
      $timeout(function () {
          if (!$scope.playing) {
              $timeout.cancel(remainTimeout);
              return;
          }
          
          if (remainTimeout) $timeout.cancel(remainTimeout);
          
          $scope.track = track;
          
          // start the remaining countdown
          remainTimeout = $timeout(function countdown () {
              track.remain--;
              if (track.remain > 0) {
                  remainTimeout = $timeout(countdown, 1000);
              }
          }, 1000);
      }, timeUntilTrackStart(track.startTime));

      if (!$scope.track){
        // startsIn countdown timer
        $scope.startsIn = parseInt(timeUntilTrackStart(track.startTime)/1000);
        startsInTimeout = $timeout(function startsInCountdown() {
            $scope.startsIn--;
            if ($scope.startsIn > 0) {
                startsInTimeout = $timeout(startsInCountdown, 1000);
            }
        }, 1000);
      }
      
    };

    // var stop = function (source) {
    //     if (source != null) {
    //         console.log("stopping", source);
    //         
    //         try {
    //             source.stop(0);    
    //         } catch (error) {
    //             console.log(error.message);
    //         }
    //         
    //         delete sources[source];
    //     }
    // };
     
    // PLAYER (end) ///////////////////////////////////////

    $scope.mute = function() {
        $scope.audioOn = false;
        if (webaudio.isSupported) $scope.track.mute();
    };
    
    $scope.unmute = function() {
      $scope.audioOn = true;
      if (!webaudio.isSupported) {
        $scope.error = "Web audio is not supported by this Browser.";
        return;
      } 
      
      $scope.track.mute(false);
  
      try {
        startSource($scope.track);  
      } catch (error) {
        console.error(error.message);
      }
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
