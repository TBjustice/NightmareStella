/*
This file includes Notes-Editor object.
It must be independent from other programs (except libraries and initials.js)
*/

// FIXME Make Editor independent from Notes function.
// TODO Data should include delay-time
// TODO Make drag to scroll

const Editor = {
  target:0,
  load:function(id){
    this.target = id;
    GameChart.decode(savedData.games[this.target].notescript);
    Editor.draw();
  },
  save:function(){
    savedData.games[this.target].notescript = GameChart.encode();
  },
  saveAs:function(name, description){
    savedData.games.push({
      "name":name,
      "description":description,
      notescript:GameChart.encode()
    });
  },
  offset:0,
  context: null,
  draw: function () {
    const width = editor_canvas.width;
    const cellsize = (width - 120) / 12;
    const height = editor_canvas.height;
    const ctx = this.context;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffaaaa";
    ctx.fillRect(width - 60, 0, 60, height / 2);
    ctx.fillStyle = "#aaaaff";
    ctx.fillRect(width - 60, height / 2, 60, height / 2);
    ctx.font = "16px serif";
    for (let t = 0; t < height / cellsize; t++) {
      let y = height - cellsize * (t + 1);
      ctx.fillStyle = "#000000";
      ctx.fillText("" + ((t + this.offset) / 2), width - 110, y + cellsize / 2);
      let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      if (t + this.offset < GameChart.notes.length) {
        data = GameChart.notes[t + this.offset];
      }
      ctx.strokeStyle = "#000000";
      for (let i = 0; i < 12; i++) {
        if (data[i] == 1) ctx.fillStyle = "#ff0000";
        else if (data[i] == 2) ctx.fillStyle = "#0000ff";
        else if (data[i] == 3) ctx.fillStyle = "#ff8888";
        else if (data[i] == 4) ctx.fillStyle = "#8888ff";
        else ctx.fillStyle = "#ffffff";
        ctx.fillRect(cellsize * i, y, cellsize, cellsize);
        ctx.strokeRect(cellsize * i, y, cellsize, cellsize);
      }
    }

    ctx.strokeStyle = "#000000";
    for (const connection of GameChart.connections) {
      let x1 = connection.fromPlace * cellsize;
      let y1 = height - (connection.fromTick - this.offset) * cellsize;
      let x2 = connection.toPlace * cellsize;
      let y2 = height - (connection.toTick - this.offset) * cellsize;
      ctx.beginPath();
      ctx.moveTo(x1 + cellsize / 2, y1 - cellsize / 2);
      ctx.lineTo(x2 + cellsize / 2, y2 - cellsize / 2);
      ctx.stroke();
    }
  },
  touchHistory: { x: 0, y: 0 },
  touchStart: function (x, y) {
    this.touchHistory.x = x;
    this.touchHistory.y = y;
  },
  touchEnd: function (x, y) {
    const width = editor_canvas.width;
    const cellsize = (width - 120) / 12;
    const height = editor_canvas.height;
    if (this.touchHistory.x > width - 60) {
      if (y < height / 2) this.offset++;
      else this.offset = this.offset != 0 ? this.offset - 1 : 0;
    }
    else if (this.touchHistory.x > width - 120) {
      // TODO Add BPM controls
    }
    else {
      let x1 = Math.floor(this.touchHistory.x / cellsize);
      let x2 = Math.floor(x / cellsize);
      let y1 = this.offset + Math.floor((height - this.touchHistory.y) / cellsize);
      let y2 = this.offset + Math.floor((height - y) / cellsize);
      if (x1 >= 12 || x2 >= 12) return;
      if (y1 == y2) {
        while (GameChart.notes.length <= y1) GameChart.notes.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        if (x1 == x2) {
          GameChart.notes[y1][x1]++;
          GameChart.notes[y1][x1] %= 5;
        }
        else {
          for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) {
            GameChart.notes[y1][i] = GameChart.notes[y1][x1];
          }
        }
      }
      else {
        GameChart.connections.push({ fromTick: y1, fromPlace: x1, toTick: y2, toPlace: x2 });
      }
    }
    this.draw();
  }
}
Editor.context = editor_canvas.getContext("2d");
Editor.offset = 0;

function onEditorTouchStart(event) {
  event.preventDefault();
  Editor.touchStart(event.changedTouches[0].pageX - 80, event.changedTouches[0].pageY);
}
function onEditorTouchEnd(event) {
  event.preventDefault();
  Editor.touchEnd(event.changedTouches[0].pageX - 80, event.changedTouches[0].pageY);
}
editor_canvas.addEventListener("touchstart", onEditorTouchStart);
editor_canvas.addEventListener("touchend", onEditorTouchEnd);
function onEditorMouseDown(event) {
  event.preventDefault();
  Editor.touchStart(event.pageX - 80, event.pageY);
}
function onEditorMouseUp(event) {
  event.preventDefault();
  Editor.touchEnd(event.pageX - 80, event.pageY);
}
editor_canvas.addEventListener("mousedown", onEditorMouseDown);
editor_canvas.addEventListener("mouseup", onEditorMouseUp);

// FIXME This should be included in other file
function editStart(id) {
  main_home.hidden = true;
  main_editor.hidden = false;
  main_game.hidden = true;
  Editor.load(id);
}

function setEditorCanvasSize(event) {
  let width = window.innerWidth;
  let height = window.innerHeight;
  editor_canvas.style.width = (width - 80) + "px";
  editor_canvas.style.height = height + "px";
  editor_canvas.setAttribute("width", (width-80)  + "px");
  editor_canvas.setAttribute("height", height + "px");
  Editor.draw();
}
window.addEventListener("resize", setEditorCanvasSize)
setEditorCanvasSize();

// FIXME This should be included in other file
function addNewGame(){
  let name = prompt("Enter the title of new game");
  if(name === null || name.length == 0)return;
  let description = prompt("Enter the title of new game");
  if(description === null)description = name;
  savedData.games.push({
    "name":name,
    "description":description,
    "notescript":"\n\n120:0"
  });
  editStart(savedData.games.length - 1);
}

function saveGame(){
  Editor.save();
  updateGameList();
  main_home.hidden = false;
  main_editor.hidden = true;
  main_game.hidden = true;
}

function saveGameAs(){
  let name = prompt("Enter the title of new game");
  if(name === null || name.length == 0){
    alert("Save canceled");
    return;
  }
  let description = prompt("Enter the title of new game");
  if(description === null)description = name;
  Editor.saveAs(name, description);
  updateGameList();
  main_home.hidden = false;
  main_editor.hidden = true;
  main_game.hidden = true;
}
