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
        
        $http.post('/api/jukeboxes', {name: $scope.name}).success(function (data) {
            $scope.jukeboxes.push(data);
            $scope.loading = false;
        }).error(function (data) {
            $scope.error = data;
            $scope.loading = false;
        });
    };

}
