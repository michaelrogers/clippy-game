'use strict';
// Dependencies
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const server = require('http').Server(app);
server.listen(port, () => console.log(`App listening on port ${port}!`));


const io = require('socket.io')(server);

// app.use(express.static('./public'));
app.use(express.static('./build'));


app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname + '/index.html'));
});



const maxScore = 50;
const game = { score: 0 };
// Game Sockets

io.on('connection', socket => {
  io.emit('game:score', game.score);

  console.log('Players Connected:', socket.server.engine.clientsCount);
  io.emit('player:count', socket.server.engine.clientsCount);
  io.on('disconnect', socket => {
    io.emit('player:count', socket.server.engine.clientsCount);
  });
  
  socket.on('game:action', data => {
    //Handle input from clients about score updates
    if (data.answer) {
      game.score += data.weight;
    } else {
      if (game.score - data.weight > 0) {
        game.score -= data.weight;
        
      } else {
        game.score = 0;
      }
    }
    if (game.score >= maxScore) {
      game.score = 0;
    }
    io.emit('game:score', game.score);
  });
  
});
