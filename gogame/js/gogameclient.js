(function () {
  let playerNow; //现在下棋的一方
  let player = 0; //操作的一方
  var isFisihed = true; //判断比赛是否结束
  var chessBoard = new Array(10); //棋盘情况
  var startBtn = document.getElementById('start'); //开始按钮
  var boards = document.getElementById('board'); //整个棋盘
  var board = document.getElementsByClassName('board')[0]; //下棋部分
  var downed = document.getElementById("location"); //下棋后的红色定位
  var spanX = document.getElementById("x"); //X坐标轴
  var spanY = document.getElementById("y"); //Y坐标轴
  var nowChess = document.getElementById('now'); //可视化当前是谁在下棋
  let matching = document.getElementById('matching');  // 匹配对手的标签
  let $msg = document.getElementById('msg');
  var chesses; //所有棋子
  let ws = null;  // 创建websocket
  let waiting = false;

  /** 下棋方法 **/
  function down(e) {
    if (isFisihed) {
      alert("游戏结束，请重新开始游戏");
      return;
    }
    if (player != playerNow) {
      alert('当前你不可下棋');
      return;
    }
    var x = Math.floor((e.layerX + 78) / 78) - 1;
    var y = Math.floor((e.layerY + 78) / 78) - 1;
    if (chessBoard[x][y] !== 0) {
      alert('此处已有棋子，不可下棋');
      return;
    }
    ws.send(JSON.stringify({
      player,
      x,
      y,
    }));
  }

  /** 棋盘显示 **/
  function renderBoard() {
    chesses.innerHTML = "";
    nowChess.style.backgroundColor = (playerNow === 1) ? "black" : "white";
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (chessBoard[x][y] === 0) {
          continue;
        }
        let chess = document.createElement('div');
        chess.className = "chess";
        //下棋的位置
        chess.style.left = x * 78 + "px";
        chess.style.top = y * 78 + 25 + "px";
        if (chessBoard[x][y] === 1) {
          chess.style.backgroundColor = "black";
        } else {
          chess.style.backgroundColor = "white";
        }
        chesses.appendChild(chess);
      }
    }
  }

  /** 移动下棋指示框并显示 **/
  function move(e) {
    if (isFisihed) {
      return;
    }
    var x = Math.floor((e.layerX + 78) / 78) - 1;
    var y = Math.floor((e.layerY + 78) / 78) - 1;
    if (chessBoard[x][y] !== 0) {
      return;
    }
    spanX.innerHTML = x;
    spanY.innerHTML = y;
    board.style.background = "url('images/location1.png') no-repeat " + (x * 78 - 26) + "px " + (y * 78 - 26) + "px";
  }

  /** 初始化棋盘 **/
  function init() {
    isFisihed = false;
    waiting = false;
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
    $msg.style.display = "block";
    // board.addEventListener("mousemove", move);
    // board.addEventListener("click", down);
  }


  /** 开始游戏 **/
  startBtn.onclick = function (e) {
    if (waiting || isFisihed === false) {
      return;
    }
    if (confirm("是否开始游戏？")) {
      ws = new WebSocket("ws:" + window.location.href.split("http:")[1]);
      // ws = new WebSocket("ws://localhost")
      waiting = true;
      $msg.style.display = "none";
      ws.onopen = function (e) {
        console.log("连接成功");
      }
      ws.onmessage = function (e) {
        let data = JSON.parse(e.data);
        if (data.start) {
          playerNow = data.playerNow;
          chessBoard = data.chessBoard;
          player = data.player || player;
          matching.style.display = "none";
          if (player === playerNow) {
            $msg.innerHTML = "到你下棋了";
          } else if (player === 0) {
            $msg.innerHTML = "已经有两人在下棋了，你是观众";
          } else {
            $msg.innerHTML = "等待对手下棋...";
          }
          if (data.msg == undefined) {
            init();
          } else {
            renderBoard();
            // 提示当前下棋点
            downed.style.left = data.x * 78 + "px";
            downed.style.top = data.y * 78 + 25 + "px";
            if (data.finished) {
              isFisihed = true;
              $msg.innerHTML = data.msg;
            }
          }
        } else {
          if (data.msg) {
            $msg.style.display = "none";
            isFisihed = true;
            waiting = true;
            alert(data.msg);
          }
          matching.style.display = "block";
        }
      }
    }
  }

}())
