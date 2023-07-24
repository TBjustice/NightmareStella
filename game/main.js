/*
Nightmare Stellaのルール

1 ノーツの扱い
  Nightmareではノーツを8種類(Tap, Flick, LongStart, TapInKeep, LongEnd, FlickInKeep, LongFlickStart, LongFlickEnd)に分けています。
  1.1 Tap
    タップノーツです。判定は画面を押した瞬間になされます。
  
  1.2 Flick
    フリックノーツです。このノーツは画面をはじくように触る必要があります。
    タップ、指を動かす、という一連の動作を判定時間内に行う必要があります。
  
  1.3 LongStart /TapInKeep / LongEnd
    ロングノーツです。タップした後、指を離さずにキープしなくてはいけません。
    開始部分の判定は画面を押した瞬間になされます。
    途中部分は、指が乗っていればオーケーです。
    終了部分は、指を離したタイミングが早過ぎた時にGoodやBadになります。

  1.4 FlickInKeep
    フリックノーツの内、指を離す必要が無い物です。ロングノーツ中のフリックなどがこれに当てはまります。
    指定時間内に指を一定以上のスピードで動かした場合、判定がなされます。

  1.6 LongFlickStart
  　名前の通り、フリックのロングノーツの開始部分を意味します。
    これはフリック判定は無く、タップだけに判定があります。

  1.4 LongFlickEnd
  　名前の通り、フリックのロングノーツの終了部分を意味します。
    フリックノーツの内、タップ開始の判定が無い物です。
    指を一定以上のスピードで動かしたタイミングで判定されます。

2 ノーツの判定に関する詳細
  2.1 Tap
    Game.prototype.tapが呼ばれた瞬間に判定を行います。
  2.2 LongStart
    Game.prototype.tapが呼ばれた瞬間に判定を行います。
  2.3 LongEnd
    Game.prototype.releaseが呼ばれた瞬間に判定を行います。離さなくても問題ないです。
  2.4 Flick
    Game.prototype.tapが呼ばれた時に判定フラグを立て、その後にGame.prototype.flickが呼ばれた時点で判定を行います。
  2.5 FlickInKeep
  　Game.prototype.flickが呼ばれた時点で判定を行います。ただし、上書きが可能で、Perfectになるまでは判定が生きています。
  2.6 LongFlickStart
    Game.prototype.tapが呼ばれた瞬間に判定を行います。
  2.7 LongFlickEnd
  　Game.prototype.flickが呼ばれた時点で判定を行います。ただし、上書きが可能で、Perfectになるまでは判定が生きています。

3 ノーツの横の判定
  3.1 幅1のノーツ
    左右1マスに判定があります。
  3.2 幅2のノーツ
    左右0.5マスに判定があります。
  3.3 幅3以上のノーツ
    範囲内にのみ判定があります。

*/

function updateGameList(){
  let text = "";
  for(let i=0;i<savedData.games.length;i++){
    let game = savedData.games[i]
    text += "<div>";
    text+="<header>" + game.name + "</header>";
    text+="<p>"+game.description+"</p>";
    text+="<div>";
    text+="<button onclick=\"editStart(" + i + ")\">Edit</button>";
    text+="<button onclick=\"gameStart(" + i + ")\">Play</button>";
    text+="</div>";
    text+="</div>";
  }
  game_list.innerHTML = text;
}
updateGameList();

function gameloop() {
  if(Game.draw()) requestAnimationFrame(gameloop);
  else gameEnd();
}

function onTouchStart(event){
  event.preventDefault();
  const changes = event.changedTouches;
  for(const change of changes){
    const id=change.identifier;
    const x = change.pageX / painter.framesize[0];
    const y = (painter.framesize[1] - change.pageY) / painter.framesize[0];
    Game.onTouchStart(id, x, y);
  }
}
function onTouchMove(event){
  event.preventDefault();
  const changes = event.changedTouches;
  for(const change of changes){
    const id=change.identifier;
    const x = change.pageX / painter.framesize[0];
    const y = (painter.framesize[1] - change.pageY) / painter.framesize[0];
    Game.onTouchMove(id, x, y);
  }
}
function onTouchEnd(event){
  event.preventDefault();
  const changes = event.changedTouches;
  for(const change of changes){
    const id=change.identifier;
    const x = change.pageX / painter.framesize[0];
    const y = (painter.framesize[1] - change.pageY) / painter.framesize[0];
    Game.onTouchEnd(id, x, y);
  }
}
gametouch_dummyelement.addEventListener("touchstart", onTouchStart);
gametouch_dummyelement.addEventListener("touchmove", onTouchMove);
gametouch_dummyelement.addEventListener("touchend", onTouchEnd);

function setGameCanvasSize() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  gametouch_dummyelement.style.width = width + "px";
  gametouch_dummyelement.style.height = height + "px";
  painter.resizeCanvas(width, height);
  Game.updateCamera();
}
window.addEventListener("resize", setGameCanvasSize);
setGameCanvasSize();

function gameStart(id){
  if(id >= savedData.games.length)return;
  GameChart.decode(savedData.games[id].notescript);
  let notes = GameChart.toNotes();
  if(notes.length == 0){
    alert("There are no notes in this game.");
    return;
  }
  main_home.hidden = true;
  main_editor.hidden = true;
  main_game.hidden = false;
  Game.setNotes(notes);
  Game.delay = 3000;
  Game.start = performance.now();
  gameloop();
}

function gameEnd(){
  main_home.hidden = false;
  main_editor.hidden = true;
  main_game.hidden = true;
}
