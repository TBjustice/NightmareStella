/*
Nightmare Scriptの書き方

1 ノーツの扱い
  Nightmare Scriptではノーツを7種類(Tap, LongStart, LongEnd, Flick, Keep2Flick, FlickInKeep, LongFlickStart)に分けています。
  1.1 Tap
    タップノーツです。判定は画面を押した瞬間になされます。
  
  1.2 LongStart / LongEnd
    ロングノーツです。タップした後、指を離さずにキープしなくてはいけません。
    開始部分の判定は画面を押した瞬間になされます。終了部分は、指を離したタイミングが早過ぎた時にGoodやBadになります。
  
  1.3 Flick
    フリックノーツです。このノーツは画面をはじくように触る必要があります。
    タップ、指を動かす、という一連の動作を判定時間内に行う必要があります。

  1.4 Keep2Flick
    フリックノーツの内、タップ開始の判定が無い物です。
    指を一定以上のスピードで動かしたタイミングで判定されます。

  1.5 FlickInKeep
    フリックノーツの内、指を離す必要が無い物です。ロングノーツ中のフリックなどがこれに当てはまります。
    指を一定以上のスピードで動かしたタイミングで判定されます。

  1.6 LongFlickStart
  　名前の通り、フリックのロングノーツの開始部分を意味します。
    これはフリック判定は無く、タップだけに判定があります。

*/


function Note(time, place, size, type, flick = FLICK_BOTH, length = 0){
  this.time = time;
  this.place = place;
  this.size = size;
  this.type = type;
  this.flick = flick;
  this.length = length;
}

function Chart(notes){
  this.notes = notes;
  this.delay = 0;
  this.speed = 50;
  this.displayRange = [-5, 100];
}
Chart.prototype.draw = function(time, camera){
  time -= this.delay;
  painter.clear();
  painter.useProgram(drawPolygon);
  // Draw floor
  drawFloor(camera);
  // Draw long note floor
  for (const note of this.notes) {
    if(note.type == NOTETYPE_LONGSTART || note.type == NOTETYPE_LONGFLICKSTART){
      let start = (note.time - time) * this.speed;
      let end = start + note.length * this.speed;
      if(start < this.displayRange[1] && end > this.displayRange[0]){
        drawLongNoteFloor(note.type == NOTETYPE_LONGSTART ? NOTEVIEW_LONG : NOTEVIEW_FLICK, note.size, note.place, start, end, camera);
      }
    }
  }

  // Draw notes
  painter.useProgram(drawImage);

  for (const note of this.notes) {
    let z = (note.time - time) * this.speed;
    if(z < this.displayRange[1] && z > this.displayRange[0]){
      if(note.type == NOTETYPE_TAP) drawNote(NOTEVIEW_TAP, note.size, note.place, z, camera);
      else if(note.type == NOTETYPE_LONGSTART || note.type == NOTETYPE_LONGEND) drawNote(NOTEVIEW_LONG, note.size, note.place, z, camera);
      else drawNote(NOTEVIEW_FLICK, note.size, note.place, z, camera);
    }
  }

  // Draw Flick note

  for (const note of this.notes) {
    let z = (note.time - time) * this.speed;
    if(z < this.displayRange[1] && z > this.displayRange[0]){
      if(note.type == NOTETYPE_FLICK || note.type == NOTETYPE_KEEP2FLICK || note.type == NOTETYPE_FLICKINKEEP){
        drawFlick(note.flick, note.size, note.place, z, camera)
      }
    }
  }
  painter.flush();
}

let chart = new Chart([
  new Note(0, 0, 1, NOTETYPE_TAP),
  new Note(1, 0, 2, NOTETYPE_TAP),
  new Note(2, 0, 3, NOTETYPE_FLICK),
  new Note(0, 11, 1, NOTETYPE_TAP),
  new Note(1, 10, 2, NOTETYPE_TAP),
  new Note(2, 9, 3, NOTETYPE_FLICK),
  new Note(3, 6, 3, NOTETYPE_LONGFLICKSTART, null, 2),
  new Note(4, 6, 3, NOTETYPE_FLICKINKEEP),
  new Note(5, 6, 3, NOTETYPE_KEEP2FLICK),
  new Note(3, 0, 3, NOTETYPE_LONGSTART, null, 2),
  new Note(5, 0, 3, NOTETYPE_LONGEND),
]);
chart.delay = 3;

let start = performance.now();
let camera = Matrix4x4.createPMatrix(45, painter.getAspect(), 1, 180);
Matrix4x4.mul(camera, Matrix4x4.createVMatrix([0, 6, 5], 0, 27, 4));

function draw() {
  let time = (performance.now() - start) * 0.001;

  chart.draw(time, camera);
  if(time > 10) start = performance.now();
  requestAnimationFrame(draw);
}
draw();

function onTouchStart(event){
  event.preventDefault();
}
function onTouchMove(event){
  event.preventDefault();
}
function onTouchEnd(event){
  event.preventDefault();
}

canvas.addEventListener("touchstart", onTouchStart);
canvas.addEventListener("touchmove", onTouchMove);
canvas.addEventListener("touchend", onTouchEnd);
