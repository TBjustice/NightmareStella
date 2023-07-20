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

const GameSetting = {
  // place[m] = speed[m/s] * time[s]
  speed:50,
  // note visible time[s]
  visibleTime:1,
  // lane degree
  upper:1/7,
  // place of judge-line
  judge:0.7,
  // place of notes-appear place
  appear:0.9,
  // 
  displayRange:[-5, 100],
  camera:Matrix4x4.eye(),
  update:function(near){
    const aspect = painter.getAspect();
    const Sx1 = this.upper + (1-this.upper)*(this.appear + this.judge)/(this.appear + 1);
    const Sy1 = -this.judge;
    const Sx2 = this.upper;
    const Sy2 = this.appear;
    const depth = this.speed * this.visibleTime;
    const far=depth;
    const sinb = 6 * (Sy2/Sx2 - Sy1/Sx1) / (depth * aspect);
    const cosb = Math.sqrt(1-sinb * sinb);
    const tan_halffovy = 6 * (1/Sx2 - 1/Sx1) / (depth * cosb);
    const a = -6/(tan_halffovy*Sx1);
    const b = 6*Sy1/(aspect * Sx1);
    const Ty = sinb * a + cosb * b;
    const Tz = (a - Ty*sinb)/cosb;
    this.camera = [
      1/tan_halffovy, 0, 0, 0,
      0,aspect*cosb/tan_halffovy,-sinb*(near+far)/(far-near),-sinb,
      0,-aspect*sinb/tan_halffovy,-cosb*(near+far)/(far-near),-cosb,
      0,
      aspect*(Ty*cosb-Tz*sinb)/tan_halffovy,
      (-2*far*near-(far+near)*(Ty*sinb+Tz*cosb))/(far-near),
      -Ty*sinb-Tz*cosb
    ];
    this.displayRange[1] = far;
  }
}

function Game(notes){
  this.notes = notes;
  this.delay = 0;
}
Game.prototype.draw = function(time, camera){
  time -= this.delay;
  painter.clear();
  painter.useProgram(drawPolygon);
  // Draw floor
  drawFloor(camera);
  // Draw long note floor
  for (const note of this.notes) {
    if(note.type == NOTETYPE_LONGSTART || note.type == NOTETYPE_LONGFLICKSTART){
      let start = (note.time - time) * GameSetting.speed;
      let end = start + note.length * GameSetting.speed;
      if(start < GameSetting.displayRange[1] && end > GameSetting.displayRange[0]){
        drawLongNoteFloor(note.type == NOTETYPE_LONGSTART ? NOTEVIEW_LONG : NOTEVIEW_FLICK, note.size, note.place, start, end, camera);
      }
    }
  }
  // Draw notes
  painter.useProgram(drawImage);
  for (const note of this.notes) {
    let z = (note.time - time) * GameSetting.speed;
    if(z < GameSetting.displayRange[1] && z > GameSetting.displayRange[0]){
      if(note.type == NOTETYPE_TAP) drawNote(NOTEVIEW_TAP, note.size, note.place, z, camera);
      else if(note.type == NOTETYPE_LONGSTART || note.type == NOTETYPE_LONGEND) drawNote(NOTEVIEW_LONG, note.size, note.place, z, camera);
      else drawNote(NOTEVIEW_FLICK, note.size, note.place, z, camera);
    }
  }
  // Draw Flick note
  for (const note of this.notes) {
    let z = (note.time - time) * GameSetting.speed;
    if(z < GameSetting.displayRange[1] && z > GameSetting.displayRange[0]){
      if(note.type == NOTETYPE_FLICK || note.type == NOTETYPE_KEEP2FLICK || note.type == NOTETYPE_FLICKINKEEP){
        drawFlick(note.flick, note.size, note.place, z, camera)
      }
    }
  }
  painter.flush();
}

let chart = new Game([
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

function draw() {
  let time = (performance.now() - start) * 0.001;

  let aspect = painter.getAspect();
  let camera = Matrix4x4.createPMatrix2(45, aspect, 1, 100);
  Matrix4x4.mul(camera, Matrix4x4.createVMatrix([0, 5.0, 5.0], 0, 20, 10));

  GameSetting.update(1);
  chart.draw(time, GameSetting.camera);

  if(time > 10) {
    start = performance.now();
  }
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
