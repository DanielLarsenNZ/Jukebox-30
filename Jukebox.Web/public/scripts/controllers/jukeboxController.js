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
    $scope.audios = [];
    $scope.playlists = [];

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
        

    // plays an audio track from url starting at cue
    // For an advanced player implementation see 
    // https://github.com/possan/webapi-player-example/blob/master/services/playback.js
    // http://www.w3schools.com/tags/ref_av_dom.asp
    
    var startsInTimeout;

    var play = function (track) {
        if (!$scope.playing) return;
        console.log("play", track);

        var audio = new Audio(track.url);
        audio.id = track.id;
        audio.controls = "controls";
        $scope.audios[audio.id] = audio;
        //$('#player').append(audio);
        
        audio.addEventListener('loadedmetadata', function() {
            console.log('audio loadedmetadata');
        }, false);

        audio.addEventListener('canplay', function() {
            console.log('audio canplay', audio.currentTime);            
        }, false);

        audio.addEventListener('ended', function () {
            console.log('audio ended', audio);
            stop(audio);
        }, false);
        
        // set timer to push play at track.startTime;
        var now = getServerTime();
        var startTime = new Date(track.startTime);
        console.log("startTime", startTime);
        
        // if startTime has passed, just play. TODO: Seek to catchup.
        var timeout = Math.max(0, startTime.getTime()) - now;
        console.log("playing in ", timeout);
        var remainTimeout;
        
        $timeout(function () {
            if (remainTimeout) $timeout.cancel(remainTimeout);
            track.remain = 30;
            $scope.track = track;
            audio.play();
            
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
    };

    // /socket.io

    var stop = function (audio) {
        console.log("stopping", audio);
        if (audio != null) {
            audio.pause();
            //audio.stop();
            //$scope.tracks.shift();
            //$('#' + track.id).detach();
            delete $scope.audios[audio.id];
            delete (audio);
            audio = null;
        }
    };

    $scope.start = function() {
        console.log("playButton.click");
        socket.emit('join', $scope.jukebox.id);
        getServerTimeOffset();
        $scope.playing = true;
    };

    $scope.stop = function() {
        //socket.emit('stop', $scope.jukebox.id);
        for (var audio in $scope.audios) {
            stop($scope.audios[audio]);
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
