var chatApp = angular.module('chatApp', ['ngAnimate', 'ngResource']);


/*
 ____                  _               
/ ___|  ___ _ ____   _(_) ___ ___  ___ 
\___ \ / _ \ '__\ \ / / |/ __/ _ \/ __|
 ___) |  __/ |   \ V /| | (_|  __/\__ \
|____/ \___|_|    \_/ |_|\___\___||___/
*/

chatApp.service('socketService', function(){
  // Establishes a connection
    var socket = io();

    this.getSocket = function(){
        return socket;
    };
});

chatApp.service('chatService', ['$resource', 'socketService', function($resource, socketService){
    var chatServiceAPI = $resource('/rooms/:id', { id: '@id' },{
                            'update':       { method: 'PUT', isArray: true },
                            'create':       { method: 'POST', isArray: true },

    }
                         );

    var socket = socketService.getSocket();

    // Get data from chat service
    this.queryRooms = function(onSuccess){
        
        chatServiceAPI.query().$promise.then(function(data){
            console.log("Success fetching taps", data);
            onSuccess(data);
        }, function(data){
            console.log("Error fetching taps", data);
        });
    };

    this.updateRoom = function (params, onSuccess){

        chatServiceAPI.update(params).$promise.then(function(data){
            socket.emit('updatedRooms', data);
            console.log('emaitting vent');
        });
    };

    this.createRoom = function(params, onSuccess){
        chatServiceAPI.create(params).$promise.then(function(data){
            socket.emit('updatedRooms', data);
        });
    };

}]);

/*
  ____            _             _ _               
 / ___|___  _ __ | |_ _ __ ___ | | | ___ _ __ ___ 
| |   / _ \| '_ \| __| '__/ _ \| | |/ _ \ '__/ __|
| |__| (_) | | | | |_| | | (_) | | |  __/ |  \__ \
 \____\___/|_| |_|\__|_|  \___/|_|_|\___|_|  |___/
*/

chatApp.controller('MainController', ['$scope', 'chatService', 'socketService', function($scope, chatService, socketService){

        
    var socket = socketService.getSocket();

    // Model initialization
    $scope.newRoom = '';
    $scope.newMessage = '';
    $scope.rooms = [];
    $scope.selectedRoomIndex = 0;

    // Listen for updatedRooms called by server, update the rooms model
    socket.on('updatedRooms', function(data){
        $scope.$apply(function(){
            $scope.rooms = data;
        });
    });

    // Initially called to fetch rooms data
    chatService.queryRooms(function(data){
        $scope.rooms = data;
    });

    // When a room is selected, changed the selecteRoomIndex accordingly
    $scope.selectRoom = function(index){
        $scope.selectedRoomIndex =  index;
    };

    // Return messages associated with selected room
    $scope.getMessagesFromSelectedRoom = function(){
        if ($scope.rooms.length == 0 || $scope.rooms[$scope.selectedRoomIndex] == undefined){
            return;
        } else {
            return $scope.rooms[$scope.selectedRoomIndex].messages;
        }
    }

    // Creates a new chat message
    $scope.createMessage = function(message, onSuccess){
        var params = { 
                        id: $scope.selectedRoomIndex,
                        message:{
                            content: $scope.newMessage,
                            timestamp: moment(new Date()).format()
                        } 
                    };
        chatService.updateRoom(params);


        $scope.newMessage = '';
    };

    // Creates a new room
    $scope.createRoom = function(onSuccess){
        var params = { name: $scope.newRoom };
        chatService.createRoom(params);
        $scope.newRoom = '';
    };
}]);

/*
 _____ _ _ _                
|  ___(_) | |_ ___ _ __ ___ 
| |_  | | | __/ _ \ '__/ __|
|  _| | | | ||  __/ |  \__ \
|_|   |_|_|\__\___|_|  |___/
                            
*/

chatApp.filter('fromNow', function(){
    return function(input){
        return moment(new Date(input)).fromNow();
    }
});

chatApp.controller('ChatRoomCtrl', ['$scope', function($scope){
    
    // $scope.rooms = ['weggweweg', 'wegwgegwgw', 'wegwegweg'];

    // $scope.onChatRoomCreate = function(room){

    // };
}]);

chatApp.controller('ChatMessageCtrl', ['$scope', function($scope){
    
    // $scope.messages = [];
    

    // socket.on('chat message', function(msg){
    //     // Validation on dubplicat message
    //     $scope.messages.push(msg);
    // });


    //     // Emit an event
    //     socket.emit('messageCreate', $scope.chatMessage);

    //     $scope.chatMessage = '';
    //     return false;
    // };

    
}]);

