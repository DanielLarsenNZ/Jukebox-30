app.factory('servertime', ['socket', function (socket) {
  "use strict";
  
  // <summary>servertime uses socket.io to query the server for the current time and calculates the difference in time between client and server.</summary>
  
  var serverTimeOffset = 0;

  socket.on('system:timeOffset', function (clientTime, serverTime) {
    // callback from request for server time.
    var now = new Date().getTime();
        
    // christian algorithm.
    var offset = (now - clientTime) / 2;
    serverTimeOffset = now - (serverTime + offset);          
    console.log("serverTime: The difference in time between client and server is %d ms.", serverTimeOffset);
  });
  
  return {
    getOffset: function(){ 
      // <summary>gets the last measured server time offset.</summary>
      // <remarks>this is the difference between the clocks on client and server. Positive value means client is fast (ahead of server).</remarks>
      return serverTimeOffset; 
    },
    
    measureOffset: function(){
      // <summary>measure the difference between client and server clocks using the Christian algorithm.</summary>
      socket.emit('system:getTimeOffset', new Date().getTime());
    },
    
    getServerTime: function() {
      // <summary>Use the offset to calculate the current time on the server in milliseconds.</summary>
      return new Date().getTime() - serverTimeOffset;
    }    
  };
     
}]);
