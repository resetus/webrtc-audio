const http = require('http');
const express = require('express');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

const port = 3000;
server.listen(port, () => {
    console.log(`server listening on port ${port}!`);
});

io.on('connection', socket => {
    socket.on('message', function (message) {
        socket.broadcast.emit('message', message); // should be room only
    });
});