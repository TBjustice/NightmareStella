/*
FFFfffTTT---,FFFfff---TTT,FFFfff---TTTFFF---fffTTT,
0:0:4:0,6:0:4:6
120:0,160:100
*/

const Editor = {
  notes:[],
  connections:[],
  BPM:[],
  decode:function(text){
    this.notes = [];
    let lines = text.split("\n");
    if(lines.length < 3)return;
    let notedata = lines[0].split(",");
    for(let notedatam of notedata){
      while(notedatam.length < 24)notedatam+="-";
      let buf1 = [];
      let buf2 = [];
      for(let i=0;i<12;i++){
        if(notedatam[i] == "T") buf1.push(1);
        else if(notedatam[i] == "t") buf1.push(2);
        else if(notedatam[i] == "F") buf1.push(3);
        else if(notedatam[i] == "f") buf1.push(4);
        else buf1.push(0);
        if(notedatam[i+12] == "T") buf2.push(1);
        else if(notedatam[i+12] == "t") buf2.push(2);
        else if(notedatam[i+12] == "F") buf2.push(3);
        else if(notedatam[i+12] == "f") buf2.push(4);
        else buf2.push(0);
      }
      this.notes.push(buf1);
      this.notes.push(buf2);
    }
    let connectiondata = lines[1].split(",");
    for(const connectiondatam of connectiondata){
      let buf = connectiondatam.split(":");
      if(buf.length < 4)continue;
      this.connections.push({fromTime:parseInt(buf[0]),fromPlace:parseInt(buf[1]),toTime:parseInt(buf[2]),toPlace:parseInt(buf[3])});
    }
    let BPMdata = lines[2].split(",");
    for(const BPMdatam of BPMdata){
      let buf = BPMdatam.split(":");
      if(buf.length < 2)continue;
      this.BPM.push({BPM:parseInt(buf[0]), fromTime:parseInt(buf[1])});
    }
    this.draw();
  },
  encode:function(){
    let text = "";
    if(this.notes.length > 0){
      for(let note of this.notes){
        for(let i=0;i<12;i++){
          if(note[i] == 0)text+="-";
          else if(note[i] == 1)text+="T";
          else if(note[i] == 2)text+="t";
          else if(note[i] == 3)text+="F";
          else if(note[i] == 4)text+="f";
        }
        text+=","
      }
      text = text.substring(0, text.length - 1);
    }
    text+="\n";
    if(this.connections.length > 0){
      for(const connection of this.connections){
        text += "" + connection.fromTime + ":" + connection.fromPlace + ":" + connection.toTime + ":" + connection.toPlace + ",";
      }
      text = text.substring(0, text.length - 1);
    }
    text+="\n";
    if(this.BPM.length > 0){
      for(const bpm of this.BPM){
        text+=""+bpm.BPM+":"+bpm.fromTime+",";
      }
      text = text.substring(0, text.length - 1);
    }
    return text;
  },
  context:null,
  draw:function(){
    const width = editor_canvas.width;
    const cellsize = (width-120) / 12;
    const height = editor_canvas.height;
    const ctx = this.context;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffaaaa";
    ctx.fillRect(width-60, 0, 60, height/2);
    ctx.fillStyle = "#aaaaff";
    ctx.fillRect(width-60, height/2, 60, height/2);
    for(let t = 0; t < height / cellsize; t++){
      let y = height - cellsize * (t + 1);
      ctx.fillStyle = "#000000";
      ctx.fillText("" + ((t + this.offset)/2), width-110, y + cellsize/2);
      let data = [0,0,0,0,0,0,0,0,0,0,0,0];
      if(t + this.offset < this.notes.length){
        data = this.notes[t + this.offset];
      }
      ctx.strokeStyle = "#000000";
      for(let i=0;i<12;i++){
        if(data[i] == 1) ctx.fillStyle = "#ff0000";
        else if(data[i] == 2) ctx.fillStyle = "#ff8888";
        else if(data[i] == 3) ctx.fillStyle = "#0000ff";
        else if(data[i] == 4) ctx.fillStyle = "#8888ff";
        else ctx.fillStyle = "#ffffff";
        ctx.fillRect(cellsize*i, y, cellsize, cellsize);
        ctx.strokeRect(cellsize*i, y, cellsize, cellsize);
      }
    }
  },
  touchHistory:{x:0,y:0},
  touchStart:function(x, y) {
    this.touchHistory.x = x;
    this.touchHistory.y = y;
  },
  touchEnd:function(x, y) {
    const width = editor_canvas.width;
    const cellsize = (width-120) / 12;
    const height = editor_canvas.height;
    if(this.touchHistory.x > width-60){
      if(y < height / 2)this.offset++;
      else this.offset=this.offset!=0?this.offset-1:0;
    }
    else if(this.touchHistory.x > width-120){
      //To Do
    }
    else{
      let x1 = Math.floor(this.touchHistory.x / cellsize);
      let x2 = Math.floor(x / cellsize);
      let y1 = this.offset + Math.floor((height - this.touchHistory.y) / cellsize);
      let y2 = this.offset + Math.floor((height - y) / cellsize);
      if(y1==y2){
        while(this.notes.length <= y1)this.notes.push([0,0,0,0,0,0,0,0,0,0,0,0]);
        if(x1 == x2){
          this.notes[y1][x1]++;
          this.notes[y1][x1]%=5;
        }
        else{
          for(let i = Math.min(x1, x2); i<= Math.max(x1, x2); i++){
            this.notes[y1][i] = this.notes[y1][x1];
          }
        }
      }
      else{
        // To do
        console.log(x1, x2, y1, y2);
      }
    }
    this.draw();
  }
}
Editor.context = editor_canvas.getContext("2d");
Editor.offset = 0;

function onTouchEditorStart(event){
  Editor.touchStart(event.pageX, event.pageY);
}
function onTouchEditorEnd(event){
  Editor.touchEnd(event.pageX, event.pageY);
}
editor_canvas.addEventListener("touchstart", onTouchEditorStart);
editor_canvas.addEventListener("touchend", onTouchEditorEnd);
editor_canvas.addEventListener("mousedown", onTouchEditorStart);
editor_canvas.addEventListener("mouseup", onTouchEditorEnd);

function editStart(){
  main_home.hidden = true;
  main_editor.hidden = false;
  main_game.hidden = true;
  Editor.draw();
}

function onWindowResized() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  gametouch_dummyelement.style.width = width + "px";
  gametouch_dummyelement.style.height = height + "px";
  editor_canvas.style.width = width + "px";
  editor_canvas.style.height = height + "px";
  editor_canvas.setAttribute("width", width);
  editor_canvas.setAttribute("height", height);
  painter.resizeCanvas(width, height);
  Editor.draw();
  GameSetting.update(1);
}
window.addEventListener("resize", onWindowResized);
onWindowResized();
