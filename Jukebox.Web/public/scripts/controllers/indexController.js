function indexController($scope, $http) {
    $scope.loading = true;
    
    $http.get('/api/jukeboxes').success(function (data) {
        $scope.jukeboxes = data;
        $scope.loading = false;
    }).error(function (data) {
        $scope.error = data;
        $scope.loading = false;
    });

    $scope.createJukebox = function () {
        $scope.error = null;
        $scope.loading = true;
        
        $http.post('/api/jukeboxes', { name: $scope.name, spotifyUsername: $scope.spotifyUsername }).success(function (data) {
            
            $scope.loading = false;
            //$scope.jukeboxes.push(data);

            document.location = '/jukebox.html?id=' + data.RowKey;

        }).error(function (data) {
            $scope.error = data;
            $scope.loading = false;
        });
    };

}
