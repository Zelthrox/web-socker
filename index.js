const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var socketIdSeq = 0;

const clients = {};

const ball = {
  x: 0,
  y: 0
};

io.on('connection', function (socket) {

  const socketId = socketIdSeq;
  socketIdSeq += 1;

  clients[socketId] = {x: 0, y: 0};

  io.emit('new client', {
    id: socketId
  });

  socket.on('move', function (data) {
    io.emit('someone moved', {
      x: data.x,
      y: data.y,
      id: socketId
    });

    clients[socketId].x = data.x;
    clients[socketId].y = data.y;

    var num = 0;
    var sumX = 0;
    var sumY = 0;
    Object.keys(clients).forEach(function (clientId) {
      const c = clients[clientId];
      if (c && c.x && c.y) {
        num++;
        sumX += c.x;
        sumY += c.y;
      }
    });
    ball.x = sumX / num;
    ball.y = sumY / num;

    io.emit('ball moved', ball);
  });

  socket.on('disconnect', function () {
    io.emit('client left', {id: socketId});
    delete clients[socketId];
  });

});


http.listen(3000, function () {
  console.log('listening on *:3000');
});
