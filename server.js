'use strict';
// Dependencies
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// app.use(express.static('./public'));
app.use(express.static('./build'));
const port = process.env.PORT || 80;


app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname + '/index.html'));
});



const maxScore = 50;
const game = { score: 0 };
// Game Sockets

io.on('connection', socket => {
  console.log('Players Connected:', socket.server.engine.clientsCount);
  socket.emit('player:count', socket.server.engine.clientsCount);
  io.on('disconnect', socket => {
    io.emit('player:count', socket.server.engine.clientsCount);
  });
  
  socket.on('game:action', data => {
    //Handle input from clients about score updates
    console.log(data)
    if (data.answer) {
      game.score += data.weight;
    } else {
      if (game.score - data.weight > 0) {
        game.score -= data.weight;
        
      } else {
        game.score = 0;
      }
    }
    io.emit('game:score', game.score);
  });
  
});
server.listen(port, () => console.log(`App listening on port ${port}!`));
