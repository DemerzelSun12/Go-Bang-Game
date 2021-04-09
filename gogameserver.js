const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const WebSocket = require('ws');
const server = http.Server(app);
app.use('/gogame', express.static(path.join(__dirname, 'gogame')));

server.listen(4345, () => {
  console.log('服务器已启动');
});

const ws = new WebSocket.Server({ server });

// 存放对局的两个玩家
let clientArr = [];
// 存放棋盘的数组
let chessBoard = (new Array(10)).fill(0);
// 判断当前是谁下棋
let playerNow = 1;

/** 判断输赢 **/
function judgeFinish(board, x, y) {
  var count = 0;
  var i, j;
  var chess = board[x][y];
  for (i = x - 4; i <= x + 5; i++) {
    if (count == 5) {
      return true;
    }
    if (i < 0 || i > 9 || chess != board[i][y]) {
      count = 0;
      continue;
    }
    count++;
  }
  count = 0;
  for (j = y - 4; j <= y + 5; j++) {
    if (count == 5) {
      return true;
    }
    if (j < 0 || j > 9 || chess != board[x][j]) {
      count = 0;
      continue;
    }
    count++;
  }
  count = 0;
  for (i = x - 4, j = y + 4; i <= x + 5; i++, j--) {
    if (count == 5) {
      return true;
    }
    if (i < 0 || j < 0 || j > 9 || i > 9 || chess != board[i][j]) {
      count = 0;
      continue;
    }
    count++;
  }
  count = 0;
  for (i = x - 4, j = y - 4; i <= x + 5; i++, j++) {
    if (count == 5) {
      return true;
    }
    if (i < 0 || j < 0 || j > 9 || i > 9 || chess != board[i][j]) {
      count = 0;
      continue;
    }
    count++;
  }
  return false;
}

ws.on('connection', client => {
  if (clientArr.length < 2) {
    clientArr.push(client);
    if (clientArr.length === 2) {
      chessBoard = chessBoard.map(ele => {
        return ele = (new Array(10)).fill(0);
      })
      // 角色随机
      clientArr.sort(() => (Math.random() - 0.5));

      clientArr[0].send(JSON.stringify({
        player: 1,
        start: true,
        chessBoard,
        playerNow
      }));
      clientArr[1].send(JSON.stringify({
        player: 2,
        start: true,
        chessBoard,
        playerNow
      }));
    } else {
      client.send(JSON.stringify({
        start: false,
      }));
    }
  } else {
    client.send(JSON.stringify({
      player: 0,
      start: true,
      chessBoard,
      playerNow
    }));
  }

  client.on('message', function (data) {
    let { player, x, y } = JSON.parse(data);
    let msg = '';
    if (player != playerNow) {
      return;
    }
  playerNow = playerNow == 1 ? 2 : 1;
    chessBoard[x][y] = player;
    let finished = judgeFinish(chessBoard, x, y);
    if (finished) {
      msg = `游戏结束,${player == 1 ? '黑棋' : '白棋'}胜利`;
    }
    ws.clients.forEach(item => {
      item.send(JSON.stringify({
        start: true,
        chessBoard,
        playerNow,
        msg,
        finished,
        x, y
      }));
    })
    if (finished) {
      clientArr = [];
      ws.clients.clear();
    }
  })

  client.on('close', function () {
    let index = clientArr.indexOf(client);
    if (index !== -1) {
      clientArr.splice(index, 1);
      ws.clients.forEach(item => {
        item.send(JSON.stringify({
          start: false,
          msg: "对手断开连接，游戏中断"
        }));
      })
    }
  })
})