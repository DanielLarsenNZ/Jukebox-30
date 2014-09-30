function jukeboxController($scope, $http, $location) {

    $scope.loading = true;
    $scope.chooseMusic = false;
    $scope.choosePlaylists = false;
    $scope.finished = false;

    $scope.jukebox = {};
    $scope.spotify = { userId: null, playlists: [] };

//    var search = $location.search("id", "foo");
//    console.log(search);
//    console.log(search.toString());

    $http.get('/api/jukeboxes/' + $location.search().id).success(function (data) {
        $scope.jukebox = data[0];
        $scope.spotify = { userId: $scope.jukebox.spotifyUsername, playlists: [] };
        if ($scope.spotify.userId) {
            $scope.getPlaylists();
        } else {
            $scope.loading = false;    
        }
    }).error(function (data) {
        $scope.error = data;
        $scope.loading = false;
    });

    $scope.getPlaylists = function () {
        $scope.error = null;
        $scope.loading = true;

        $http.get('/api/playlists?username=' + $scope.spotify.userId).success(function (data) {
            $scope.spotify.playlists = data.items;
            $scope.loading = false;
            $scope.choosePlaylists = true;
        }).error(function (data) {
            $scope.error = data.error.message;
            $scope.loading = false;
        });
    };

    $scope.addPlaylist = function(playlist) {
        playlist.Add = true;
        playlist.Loading = true;

        // POST /api/jukeboxes/:id/tracks {"username":"xxxx", "playlistId":"xxxx"}

        $http.post('/api/jukeboxes/codecamp2014/tracks', { username: playlist.owner.id, playlistId: playlist.id })
            .success(function () {
            playlist.Loading = false;
        }).error(function(data) {
            $scope.error = data.error.message;
            playlist.Loading = false;
        });
    };
}
