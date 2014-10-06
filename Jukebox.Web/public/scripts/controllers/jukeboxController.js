//function jukeboxController($scope, $http, $location, socket) {
app.controller('jukeboxController', ['$scope', '$http', '$location', 'socket', function($scope, $http, $location, socket) {
        console.log($scope);

        $scope.loading = true;
        $scope.chooseMusic = false;
        $scope.choosePlaylists = false;
        $scope.finished = false;

        $scope.jukebox = {};
        $scope.spotify = { userId: null, playlists: [] };

        $http.get('/api/jukeboxes/' + $location.search().id).success(function(data) {
            $scope.jukebox = data[0];
            $scope.spotify = { userId: $scope.jukebox.spotifyUsername, playlists: [] };
            if ($scope.spotify.userId) {
                $scope.getPlaylists();
            } else {
                $scope.loading = false;
            }
        }).error(function(data) {
            $scope.error = data;
            $scope.loading = false;
        });

// socket.io

        var _track;

        socket.on('play', function(track) {
            _track = track;
            console.log('play ' + track.url + ' cue = ' + getCue(track) + ' start time = ' + track.startTime + '. Duration = ' + track.duration);
            play();
        });

        var getCue = function(track) {
            return Math.min(new Date().getTime() - new Date(track.startTime).getTime(), track.duration);
        };

        var audio = null;

// plays an audio track from url starting at cue
// For an advanced player implementation see 
// https://github.com/possan/webapi-player-example/blob/master/services/playback.js
// http://www.w3schools.com/tags/ref_av_dom.asp
        var play = function() {
            if (audio != null) {
                audio.pause();
                delete (audio);
                audio = null;
            }

            audio = new Audio(_track.url);
            //TODO: Attach to DOM and show controls ?
            audio.controls = "controls";

            audio.addEventListener('loadedmetadata', function() {
                console.log('audio loadedmetadata');
                //audio.play();
            }, false);

            audio.addEventListener('canplay', function() {
                var cue = getCue(_track);
                console.log('audio canplay', audio.currentTime);
                if (cue > 0 && audio.currentTime == 0) {
                    audio.currentTime = cue / 1000;
                    console.log('audio canplay', cue / 1000, audio.currentTime);
                    audio.play();
                }

            }, false);

            audio.addEventListener('ended', function() {
                console.log('audio ended');
                audio = null;
                socket.emit('next', $scope.jukebox.id);
            }, false);
        };

// /socket.io

        $scope.start = function() {
            console.log("playButton.click");
            socket.emit('join', $scope.jukebox.id);
        };

        $scope.getPlaylists = function() {
            $scope.error = null;
            $scope.loading = true;

            $http.get('/api/playlists?username=' + $scope.spotify.userId).success(function(data) {
                $scope.spotify.playlists = data.items;
                $scope.loading = false;
                $scope.choosePlaylists = true;
            }).error(function(data) {
                $scope.error = data.error.message;
                $scope.loading = false;
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
