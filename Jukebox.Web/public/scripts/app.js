var app = angular.module('jukebox', []);

// http://stackoverflow.com/a/21712550
// 1e32 is enogh for working with 32-bit
// 1e8 for 8-bit (100000000)
// in your case 1e4 (aka 10000) should do it
app.filter('numberFixedLen', function () {
    return function (a, b) {
        return (1e4 + a + "").slice(-b)
    }
});
