const express = require('express')
const http = require('http')
const app = express()
const path = require('path')
const WebSocket = require('ws')
const server = http.Server(app)
app.use('/public', express.static(path.join(__dirname, 'public')))

server.listen(4444 , () => {
  console.log('服务器已开启');
})

const ws = new WebSocket.Server({ server })

// 存放对局的两个玩家
let clientArr = []
// 存放棋盘的数组
let chessBoard = (new Array(15)).fill(0)
// 当前是谁下棋
let now = 1;

/**判断输赢 */
function judgeFinish(board, x, y) {
  var count = 0;
  var i, j;
  var chess = board[x][y];
  for (i = x - 4; i <= x + 5; i++) {
    if (count == 5)
      return true;
    if (i < 0 || i > 14 || chess != board[i][y]) {
      count = 0;
      continue;
    }
    count++;
  }
  count = 0;
  for (j = y - 4; j <= y + 5; j++) {
    if (count == 5)
      return true;
    if (j < 0 || j > 14 || chess != board[x][j]) {
      count = 0;
      continue;
    }
    count++;
  }
  count = 0;
  for (i = x - 4, j = y - 4; i <= x + 5; i++ , j++) {
    if (count == 5)
      return true;
    if (i < 0 || j < 0 || j > 14 || i > 14 || chess != board[i][j]) {
      count = 0;
      continue;
    }
    count++;
  }
  count = 0;
  for (i = x - 4, j = y + 4; i <= x + 5; i++ , j--) {
    if (count == 5)
      return true;
    if (i < 0 || j < 0 || j > 14 || i > 14 || chess != board[i][j]) {
      count = 0;
      continue;
    }
    count++;
  }
  return false;
}

ws.on('connection', client => {
  if (clientArr.length < 2) {
    clientArr.push(client)
    if (clientArr.length === 2) {
      chessBoard = chessBoard.map(ele => {
        return ele = (new Array(15)).fill(0)
      })
      // 角色随机
      clientArr.sort(() => (Math.random() - 0.5))

      clientArr[0].send(JSON.stringify({
        player: 1,
        start: true,
        chessBoard,
        now
      }))
      clientArr[1].send(JSON.stringify({
        player: 2,
        start: true,
        chessBoard,
        now
      }))
    } else {
      client.send(JSON.stringify({
        start: false,
      }))
    }
  } else {
    client.send(JSON.stringify({
      player: 0,
      start: true,
      chessBoard,
      now
    }))
  }
  client.on('message', function (data) {
    let { player, x, y } = JSON.parse(data)
    let msg = ''
    if (player != now) {
      return
    }
    now = now == 1 ? 2 : 1
    chessBoard[x][y] = player
    let finished = judgeFinish(chessBoard, x, y)
    if (finished) {
      msg = `游戏结束,${player == 1 ? '黑棋' : '白棋'}胜利`
    }
    ws.clients.forEach(item => {
      item.send(JSON.stringify({
        start: true,
        chessBoard,
        now,
        msg,
        finished,
        x, y
      }))
    })
    if (finished) {
      clientArr = []
      ws.clients.clear()
    }
  })

  client.on('close', function () {
    let index = clientArr.indexOf(client)
    if (index !== -1) {
      clientArr.splice(index, 1)
      ws.clients.forEach(item => {
        item.send(JSON.stringify({
          start: false,
          msg: "对手断开连接"
        }))
      })
    }
  })
})