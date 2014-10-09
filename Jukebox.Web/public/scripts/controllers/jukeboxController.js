//function jukeboxController($scope, $http, $location, socket) {
app.controller('jukeboxController', ['$scope', '$http', '$location', '$timeout', 'socket', 
    function ($scope, $http, $location, $timeout, socket) {
    console.log($scope);

    $scope.loading = true;
    $scope.playlistsLoading = false;
    $scope.chooseMusic = false;
    $scope.choosePlaylists = false;
    $scope.finished = false;

    $scope.jukebox = {};
    $scope.spotify = { userId: null, playlists: [] };

    $http.get('/api/jukeboxes/' + $location.search().id).success(function(data) {
        $scope.jukebox = data[0];
        $scope.spotify = { userId: $scope.jukebox.spotifyUsername, playlists: [] };
        
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
            console.log('play ' + track.url + ' cue = ' + getCue(track) + ' start time = ' + track.startTime + '. Duration = ' + track.duration);
            play(track);
        });

        var getCue = function(track) {
            return Math.min(new Date().getTime() - new Date(track.startTime).getTime(), track.duration);
        };

        //var audios = [];

// plays an audio track from url starting at cue
// For an advanced player implementation see 
// https://github.com/possan/webapi-player-example/blob/master/services/playback.js
// http://www.w3schools.com/tags/ref_av_dom.asp
    var play = function (track) {
        console.log("play", track);

        var audio = new Audio(track.url);
        //TODO: Attach to DOM and show controls ?
        audio.controls = "controls";

        audio.addEventListener('loadedmetadata', function() {
            console.log('audio loadedmetadata');
            //audio.play();
        }, false);

        audio.addEventListener('canplay', function() {
            console.log('audio canplay', audio.currentTime);
            //var cue = getCue(track);
            
//            if (cue > 0 && audio.currentTime == 0) {
//                audio.currentTime = cue / 1000;
//                console.log('audio canplay', cue / 1000, audio.currentTime);
//                //audio.play();
//            }
            
        }, false);

        audio.addEventListener('ended', function() {
            console.log('audio ended', audio);
            if (audio != null) {
                audio.pause();
                delete (audio);
                audio = null;
            }
            //socket.emit('next', $scope.jukebox.id);
        }, false);
        
        // set timer to push play at track.startTime;
        var now = new Date();
        var startTime = new Date(track.startTime);
        console.log("startTime", startTime);
        var timeout = Math.max(now.getTime(), startTime.getTime()) - now.getTime();
        console.log("playing in ", timeout);
        $timeout(function() { audio.play(); }, timeout);
    };


// /socket.io

        $scope.start = function() {
            console.log("playButton.click");
            socket.emit('join', $scope.jukebox.id);
        };

        $scope.getPlaylists = function() {
            $scope.error = null;
            $scope.playlistsLoading = true;

            $http.get('/api/playlists?username=' + $scope.spotify.userId).success(function(data) {
                $scope.spotify.playlists = data.items;
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
    }
]);


//}
