
(function () {
  // 你是哪一方
  let player = 0
  //现在是谁在下
  let now;

  var isFisihed = true;//是否结束
  var chessBoard = new Array(15);//棋盘情况
  var startBtn = document.getElementById('start');//开始按钮
  var boards = document.getElementById('board');//整个棋盘
  var board = document.getElementsByClassName('board')[0];//下棋部分
  var spanX = document.getElementById("x");//X坐标轴
  var spanY = document.getElementById("y");//Y坐标轴
  var downed = document.getElementById("location");//下棋后的红色定位
  var chesses;//所有棋子
  var nowChess = document.getElementById('now');//可视化当前是谁在下棋
  // 匹配对手的标签
  let matching = document.getElementById('matching')

  let $msg = document.getElementById('msg')

  // 创建websocket
  let ws = null

  let waiting = false;

  /**下棋 */
  function down(e) {
    if (isFisihed) {
      alert("请重新开始游戏");
      return;
    }
    var x = Math.floor((e.layerX + 50) / 50) - 1;
    var y = Math.floor((e.layerY + 25) / 50) - 1;

    if (player != now) {
      alert('当前不是你下棋')
      return
    }

    if (chessBoard[x][y] !== 0) {
      return
    }


    ws.send(JSON.stringify({
      player,
      x,
      y,
    }))
  }


  function renderBoard() {
    chesses.innerHTML = ""
    nowChess.style.backgroundColor = (now === 1) ? "black" : "white"
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        if (chessBoard[x][y] === 0) {
          continue
        }
        let chess = document.createElement('div');
        chess.className = "chess";
        //下棋的位置
        chess.style.top = y * 50 + 25 + "px";
        chess.style.left = x * 50 + "px";
        if (chessBoard[x][y] === 1) {
          chess.style.backgroundColor = "black";
        } else {
          chess.style.backgroundColor = "white";
        }
        chesses.appendChild(chess);
      }
    }
  }

  /**移动事件 */
  function move(e) {
    if (isFisihed) {
      return
    }
    var x = Math.floor((e.layerX + 50) / 50) - 1;
    var y = Math.floor((e.layerY + 25) / 50) - 1;
    if (chessBoard[x][y] !== 0) {
      return;
    }
    spanX.innerHTML = x;
    spanY.innerHTML = y;
    board.style.background = "url('images/location1.png') no-repeat " + (x * 50 - 26) + "px " + (y * 50 - 26) + "px";

  }

  /**初始化棋盘 */
  function init() {

    waiting = false
    isFisihed = false;
    if (chesses) {
      boards.removeChild(chesses);
    }
    nowChess.style.backgroundColor = "black";
    chesses = document.createElement('div');
    chesses.id = 'chess-container';
    boards.appendChild(chesses);
    board.onclick = down;
    board.onmousemove = move;
    startBtn.innerHTML = "重新开始";
    downed.style.top = "-500px";
    $msg.style.display = "block"
    // board.addEventListener("mousemove", move);
    // board.addEventListener("click", down);
  }


  /**开始游戏 */
  startBtn.onclick = function (e) {
    if (waiting || isFisihed === false) {
      return;
    }
    if (confirm("是否开始?")) {
      waiting = true
      $msg.style.display = "none"
      ws = new WebSocket("ws:" + window.location.href.split("http:")[1])
      // ws = new WebSocket('ws://localhost')
      ws.onopen = function (e) {
        console.log("连接成功")
      }
      ws.onmessage = function (e) {
        let data = JSON.parse(e.data)

        if (data.start) {
          chessBoard = data.chessBoard
          player = data.player || player
          now = data.now
          matching.style.display = "none"
          if (player === now) {
            $msg.innerHTML = "到你下棋了"
          } else if (player === 0) {
            $msg.innerHTML = "有两人在下棋了，你是观众"
          } else {
            $msg.innerHTML = "等待对手下棋..."
          }
          if (data.msg === undefined) {
            init()
          } else {
            renderBoard()
            //提示当前下棋点
            downed.style.top = data.y * 50 + 25 + "px";
            downed.style.left = data.x * 50 + "px";
            if (data.finished) {
              isFisihed = true
              $msg.innerHTML = data.msg
            }
          }
        } else {
          if (data.msg) {
            $msg.style.display = "none"
            isFisihed = true
            waiting = true
            alert(data.msg)
          }
          matching.style.display = "block"
        }

      }
    }
  }

}())
