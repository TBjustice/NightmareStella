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
    text+="<header>";
    text += "<div class=\"gamename\">"+game.name+"</div>";
    text += "<div class=\"delbutton\" onclick=\"deleteGame(" + i + ")\">×</div>";
    text+="</header>";
    text+="<p>"+game.description+"</p>";
    text+="<div class=\"buttons\">";
    text+="<button onclick=\"editStart(" + i + ")\">Edit</button>";
    text+="<button onclick=\"gameStart(" + i + ")\">Play</button>";
    text+="</div>";
    text+="</div>";
  }
  game_list.innerHTML = text;
}
updateGameList();

function onToggleFullscreen(){
  if(toggle_fullscreen.checked){
    if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen();
    else if(document.documentElement.webkitRequestFullscreen)document.documentElement.webkitRequestFullscreen();
    else if(document.documentElement.msRequestFullscreen)document.documentElement.msRequestFullscreen();
    else alert("Fullscreen not supported!");
  }
  else{
    if(document.exitFullscreen)document.exitFullscreen();
    else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
    else if(document.msExitFullscreen)document.msExitFullscreen();
  }
}

function setGameCanvasSize() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  gametouch_dummyelement.style.width = width + "px";
  gametouch_dummyelement.style.height = height + "px";
  painter.resizeCanvas(width, height);
  Game.updateCamera();

  editor_canvas.style.width = (width - 80) + "px";
  editor_canvas.style.height = height + "px";
  editor_canvas.setAttribute("width", (width-80)  + "px");
  editor_canvas.setAttribute("height", height + "px");
  Editor.draw();
}
window.addEventListener("resize", setGameCanvasSize);
setGameCanvasSize()


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


function editStart(id) {
  main_home.hidden = true;
  main_editor.hidden = false;
  main_game.hidden = true;
  Editor.load(id);
}


function deleteGame(id){
  if(id >= savedData.games.length)return;
  let a = confirm("Are you sure to delete a project?");
  if(a){
    savedData.games.splice(id, 1);
    updateGameList();
  }
}

function addNewGame(){
  let name = prompt("Enter the title of new game");
  if(name === null || name.length == 0)return;
  let description = prompt("Enter the description of new game");
  if(description === null)description = name;
  savedData.games.push({
    "name":name,
    "description":description,
    "notescript":"\n\n120:0"
  });
  editStart(savedData.games.length - 1);
}

