app.controller('indexController', ['$scope', '$http', '$location',
    function($scope, $http, $location) {
        $scope.loading = true;
        $scope.offlineMode = false;

        $http({
        url: '/api/jukeboxes',
        params: { 'requestid': new Date().getTime() }
        }).success(function(data) {
            $scope.jukeboxes = data;
            $scope.loading = false;
        }).error(function(data, status) {
            if (status === 503) $scope.offlineMode = true;
            $scope.error = data;
            $scope.loading = false;
        });

        $scope.createJukebox = function() {
            $scope.error = null;
            $scope.loading = true;

            $http.post('/api/jukeboxes', { name: $scope.name, spotifyUsername: $scope.spotifyUsername }).success(function(data) {

                $scope.loading = false;
                $scope.jukeboxes.push(data);
                $location.path('/jukebox/' + data.RowKey);

        }).error(function (data) {
                if (status === 503) $scope.offlineMode = true;
                $scope.error = data;
                $scope.loading = false;
            });
        };

    }
]);


