var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var bodyParser = require('body-parser')

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));
app.use( bodyParser.json() );       // to support JSON-encoded bodies


// Default chat rooms and messages
var rooms = [
    {
        name: 'Venice',
        messages: [
                    {'content': 'The beach is very nice', 'timestamp': "2015-03-30T23:59:05-07:00"},
                    {'content': 'I agree, who wants to go out!', 'timestamp': "2015-03-30T22:59:05-07:00"},
                    {'content': 'I do!!! ', 'timestamp': "2015-03-30T22:59:05-07:00"},
                    {'content': 'Take me with you guys!', 'timestamp': "2015-03-30T23:59:05-07:00"},
        ]
    },
    {
        name: 'Office',
        messages: [
                    {'content': 'Who\'s ready for lunchtime!', 'timestamp': "2015-03-30T23:59:05-07:00"},
                    {'content': 'I am, what are we having today?', 'timestamp': "2015-03-30T23:59:05-07:00"},
                    {'content': 'I think some of that mystery meat. ', 'timestamp': "2015-03-30T23:59:05-07:00"},
                    {'content': 'Uh oh....', 'timestamp': "2015-03-30T23:59:05-07:00"},
        ]
    },
    {
        name: 'School',
        messages: [
            {'content': 'Spring break is here!', 'timestamp': "2015-03-30T23:59:05-07:00"},
            {'content': 'Yeah that\'s cool', 'timestamp': "2015-03-30T23:59:05-07:00"},
            {'content': 'Let\'s go out!!! ', 'timestamp': "2015-03-30T23:59:05-07:00"},
        ]
    }
];


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// GET request from rooms, return all rooms
app.route('/rooms').get(function(req, res) {
  
    res.send(rooms);

// POST. Create a new room
}).post(function(req, res) {

    var room = { 
                    name: req.body.name,
                    messages: []
                };

    rooms.push(room);

    res.send(rooms);

});

// PUT. Create a new message for a room
app.put('/rooms/:id', function(req, res) {

    rooms[req.params.id].messages.push(req.body.message);
    
    res.send(rooms);
});


io.on('connection', function (socket) {
    console.log('connection is made');

    socket.on('updatedRooms', function(){
        console.log("socket io rooms updated");
        io.emit('updatedRooms', rooms);
    });

    socket.on('messageCreate', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});

