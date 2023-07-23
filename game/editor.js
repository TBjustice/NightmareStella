/*
FFFfffTTT---,FFFfff---TTT,FFFfff---TTTFFF---fffTTT,
0:0:4:0,6:0:4:6
120:0,160:100
*/

const Editor = {
  notes: [],
  connections: [],
  BPM: [],
  decode: function (text) {
    this.notes = [];
    this.connections = [];
    this.BPM = [];
    let lines = text.split("\n");
    if (lines.length < 3) return;
    let notedata = lines[0].split(",");
    for (let notedatam of notedata) {
      let buf = [];
      for (let i = 0; i < notedatam.length; i++) {
        if (i == 12) break;
        if (notedatam[i] == "T") buf.push(1);
        else if (notedatam[i] == "t") buf.push(2);
        else if (notedatam[i] == "F") buf.push(3);
        else if (notedatam[i] == "f") buf.push(4);
        else buf.push(0);
      }
      this.notes.push(buf);
    }
    let connectiondata = lines[1].split(",");
    for (const connectiondatam of connectiondata) {
      let buf = connectiondatam.split(":");
      if (buf.length < 4) continue;
      this.connections.push({ fromTime: parseInt(buf[0]), fromPlace: parseInt(buf[1]), toTime: parseInt(buf[2]), toPlace: parseInt(buf[3]) });
    }
    let BPMdata = lines[2].split(",");
    for (const BPMdatam of BPMdata) {
      let buf = BPMdatam.split(":");
      if (buf.length < 2) continue;
      this.BPM.push({ BPM: parseInt(buf[0]), fromTime: parseInt(buf[1]) });
    }
    this.draw();
  },
  encode: function () {
    let text = "";
    if (this.notes.length > 0) {
      for (let note of this.notes) {
        for (let i = 0; i < 12; i++) {
          if (note[i] == 0) text += "-";
          else if (note[i] == 1) text += "T";
          else if (note[i] == 2) text += "t";
          else if (note[i] == 3) text += "F";
          else if (note[i] == 4) text += "f";
        }
        text += ","
      }
      text = text.substring(0, text.length - 1);
    }
    text += "\n";
    if (this.connections.length > 0) {
      for (const connection of this.connections) {
        text += "" + connection.fromTime + ":" + connection.fromPlace + ":" + connection.toTime + ":" + connection.toPlace + ",";
      }
      text = text.substring(0, text.length - 1);
    }
    text += "\n";
    if (this.BPM.length > 0) {
      for (const bpm of this.BPM) {
        text += "" + bpm.BPM + ":" + bpm.fromTime + ",";
      }
      text = text.substring(0, text.length - 1);
    }
    return text;
  },
  toNotes: function () {
    let data = [];
    for (let t = 0; t < this.notes.length; t++) {
      const note = this.notes[t];
      for (let i = 0; i < 12; i++) {
        if (note[i] != 0) {
          let j = i;
          while (i + 1 < 12 && note[j] == note[i + 1]) i++;
          if(note[j] == 1 || note[j] == 2){
            data.push(new Note(Math.floor(t * (60 / this.BPM[0].BPM) * 0.5 * 1000), j, i-j+1,NOTETYPE_TAP));
          }
          else{
            data.push(new Note(Math.floor(t * (60 / this.BPM[0].BPM) * 0.5 * 1000), j, i-j+1,NOTETYPE_FLICK));
          }
        }
      }
    }
    return data;
  },
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
      if (t + this.offset < this.notes.length) {
        data = this.notes[t + this.offset];
      }
      ctx.strokeStyle = "#000000";
      for (let i = 0; i < 12; i++) {
        if (data[i] == 1) ctx.fillStyle = "#ff0000";
        else if (data[i] == 2) ctx.fillStyle = "#ff8888";
        else if (data[i] == 3) ctx.fillStyle = "#0000ff";
        else if (data[i] == 4) ctx.fillStyle = "#8888ff";
        else ctx.fillStyle = "#ffffff";
        ctx.fillRect(cellsize * i, y, cellsize, cellsize);
        ctx.strokeRect(cellsize * i, y, cellsize, cellsize);
      }
    }

    ctx.strokeStyle = "#000000";
    for (const connection of this.connections) {
      let x1 = connection.fromPlace * cellsize;
      let y1 = height - (connection.fromTime - this.offset) * cellsize;
      let x2 = connection.toPlace * cellsize;
      let y2 = height - (connection.toTime - this.offset) * cellsize;
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
      //To Do
    }
    else {
      let x1 = Math.floor(this.touchHistory.x / cellsize);
      let x2 = Math.floor(x / cellsize);
      let y1 = this.offset + Math.floor((height - this.touchHistory.y) / cellsize);
      let y2 = this.offset + Math.floor((height - y) / cellsize);
      if (x1 >= 12 || x2 >= 12) return;
      if (y1 == y2) {
        while (this.notes.length <= y1) this.notes.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        if (x1 == x2) {
          this.notes[y1][x1]++;
          this.notes[y1][x1] %= 5;
        }
        else {
          for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) {
            this.notes[y1][i] = this.notes[y1][x1];
          }
        }
      }
      else {
        this.connections.push({ fromTime: y1, fromPlace: x1, toTime: y2, toPlace: x2 });
      }
    }
    this.draw();
  }
}
Editor.context = editor_canvas.getContext("2d");
Editor.offset = 0;

function onEditorTouchStart(event) {
  Editor.touchStart(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
}
function onEditorTouchEnd(event) {
  Editor.touchEnd(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
}
editor_canvas.addEventListener("touchstart", onEditorTouchStart);
editor_canvas.addEventListener("touchend", onEditorTouchEnd);
function onEditorMouseDown(event) {
  Editor.touchStart(event.pageX, event.pageY);
}
function onEditorMouseUp(event) {
  Editor.touchEnd(event.pageX, event.pageY);
}
editor_canvas.addEventListener("mousedown", onEditorMouseDown);
editor_canvas.addEventListener("mouseup", onEditorMouseUp);

function editStart() {
  main_home.hidden = true;
  main_editor.hidden = false;
  main_game.hidden = true;
  Editor.draw();
}

function setEditorCanvasSize(event) {
  let width = window.innerWidth;
  let height = window.innerHeight;
  editor_canvas.style.width = width + "px";
  editor_canvas.style.height = height + "px";
  editor_canvas.setAttribute("width", width + "px");
  editor_canvas.setAttribute("height", height + "px");
  Editor.draw();
}
window.addEventListener("resize", setEditorCanvasSize)
setEditorCanvasSize();

