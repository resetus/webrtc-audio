const http = require('http');
const path = require('path');
const express = require('express');
const app = express();

const server = http.Server(app);
const io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

const port = 3000;
server.listen(port, () => {
    console.log(`server listening on port ${port}!`);
});

io.on('connection', socket => {
    socket.on('eventServer', blob => {
        setTimeout(() => {
            socket.emit('eventClient', blob);
        }, 2000);
    });
});