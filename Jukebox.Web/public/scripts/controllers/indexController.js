app.controller('indexController', ['$scope', '$http', '$location',
    function($scope, $http, $location) {
        $scope.loading = true;

        $http({
        url: '/api/jukeboxes',
        params: { 'requestid': new Date().getTime() }
        }).success(function(data) {
            $scope.jukeboxes = data;
            $scope.loading = false;
        }).error(function(data) {
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

            }).error(function(data) {
                $scope.error = data;
                $scope.loading = false;
            });
        };

    }
]);


