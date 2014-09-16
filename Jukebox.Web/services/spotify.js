var baseUrl = 'https://api.spotify.com/v1';
var $http = require('../services/httpjson.js');

// returns playlists[]
module.exports.getPlaylists = function (username, callback) {

    getAuthToken(function(error, token) {
        if (error) {callback(error); return; }

        $http.get(baseUrl + '/users/' + encodeURIComponent(username.toLowerCase()) + '/playlists', {
            headers: { 'Authorization': 'Bearer ' + token }
        }, function(error, response) {
            if (error) { callback(error); return; }

            console.log('got playlists', response);
            callback(null, response);
        });
    });
};

















var authToken = { token:null, expires:null };

var getAuthToken = function (callback) {
    var now = new Date();
    
    if (process.env.SpotifyApiClientId == undefined || process.env.SpotifyApiClientSecret == undefined) {
        callback(new Error("spotify.js requires environment vars \"SpotifyApiClientId\" and \"SpotifyApiClientSecret\"."));
        return;
    }

    if (authToken.expires == null || authToken.expires < now) {
        var authEncoded = new Buffer(process.env.SpotifyApiClientId + ':' + process.env.SpotifyApiClientSecret).toString('base64');

        // get a new token
        $http.post('https://accounts.spotify.com/api/token', "grant_type=client_credentials", 
            { headers: { 'Authorization': 'Basic ' + authEncoded } },
            function(error, response) {
            if (error) {
                callback(error);
                return;
            }
            console.log('got auth token', response);
                var expires = new Date(now.getTime() + response.expires_in * 60000);
                authToken = { token: response.access_token, expires: expires };
                callback(null, authToken.token);
                return;
        });
        return;
    }
    
    callback(null, authToken.token);
};
