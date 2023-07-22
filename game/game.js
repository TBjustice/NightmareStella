/*
Nightmare Stellaのルール

1 ノーツの扱い
  Nightmare Scriptではノーツを8種類(Tap, Flick, LongStart, TapInKeep, LongEnd, FlickInKeep, LongFlickStart, LongFlickEnd)に分けています。
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

/**
 * 
 * @param {Number} time time in ms
 * @param {Number} place Notes' x-position (from 0 to 12)
 * @param {Number} width Notes' width (from 1 to 12)
 * @param {Number} type Note's type (NOTETYPE_TAP or NOTETYPE_FLICK)
 * @param {Number} connectTime Note connection in time [ms]
 * @param {Number} connectPlace Note connection in time x-position (from 0 to 12)
 * @param {Number} flickDirection Flick direction. (FLICK_BOTH, FLICK_LEFT, or FLICK_RIGHT)
 */
function Note(time, place, width, type, connectTime = null, connectPlace = null, flickDirection = FLICK_BOTH){
  this.time = time;
  this.place = place;
  this.width = width;
  this.placeModified = place;
  this.widthModified = width;
  this.type = type;
  this.connectTime = connectTime;
  this.connectPlace = connectPlace;
  this.flickDirection = flickDirection;
  /** Connected ID */
  this.connectTo = -1;
  this.connectFrom = -1;
  /** Either NOTETYPE_TAP, NOTETYPE_FLICK, NOTETYPE_LONGSTART, NOTETYPE_LONGEND, NOTETYPE_KEEP2FLICK, NOTETYPE_FLICKINKEEP, NOTETYPE_LONGFLICKSTART */
  this.judgeType = 0;
  this.tempJudge = JUDGE_UNKNOWN;
  /** Either NOTESTATE_NONE, NOTESTATE_WAITFLICK, NOTESTATE_FLICKING, or NOTESTATE_DONE */
  this.state = NOTESTATE_NONE;
}
Note.prototype.hasLongnoteFloor = function(){
  return this.connectTo >= 0;
};
Note.prototype.getSkin = function(){
  if(this.type == NOTETYPE_FLICK)return NOTESKIN_FLICK;
  if(this.connectTo >= 0 || this.connectFrom >= 0)return NOTESKIN_LONG;
  return NOTESKIN_TAP;
};
Note.prototype.needFlickIcon = function(){
  if(this.type == NOTETYPE_TAP)return false;
  if(this.connectFrom >= 0)return true;
  return this.connectTo < 0;
};
Note.prototype.tap = function(time){
  let delta = time - this.time;
  if(this.judgeType == NOTETYPE_TAP || this.judgeType == NOTETYPE_LONGSTART || this.judgeType == NOTETYPE_LONGFLICKSTART) {
    this.state = NOTESTATE_DONE;
    if(delta < -GameSetting.judgeTiming[2])return JUDGE_FAST;
    else if(delta < -GameSetting.judgeTiming[1])return JUDGE_GOOD_FAST;
    else if(delta < -GameSetting.judgeTiming[0])return JUDGE_PERFECT_FAST;
    else if(delta < GameSetting.judgeTiming[0])return JUDGE_SUPER;
    else if(delta < GameSetting.judgeTiming[1])return JUDGE_PERFECT_SLOW;
    else if(delta < GameSetting.judgeTiming[2])return JUDGE_GOOD_SLOW;
    else return JUDGE_SLOW;
  }
  else if(this.judgeType == NOTETYPE_TAPINKEEP){
    if(delta < -GameSetting.judgeTiming[0]){
      this.state = NOTESTATE_WAIT;
      if(delta < -GameSetting.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -GameSetting.judgeTiming[1])this.tempJudge =  JUDGE_GOOD_FAST;
      else if(delta < -GameSetting.judgeTiming[0])this.tempJudge =  JUDGE_PERFECT_FAST;
      else this.tempJudge = JUDGE_SUPER;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(delta < GameSetting.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < GameSetting.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < GameSetting.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  else if(this.judgeType == NOTETYPE_LONGEND) {
    if(delta < -GameSetting.judgeTiming[0]){
      this.state = NOTESTATE_WAIT;
      if(delta < -GameSetting.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -GameSetting.judgeTiming[1])this.tempJudge =  JUDGE_GOOD_FAST;
      else if(delta < -GameSetting.judgeTiming[0])this.tempJudge =  JUDGE_PERFECT_FAST;
      else this.tempJudge = JUDGE_SUPER;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(delta < GameSetting.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < GameSetting.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < GameSetting.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  else if(this.judgeType == NOTETYPE_FLICK){
    this.state = NOTESTATE_WAITFLICK;
    if(delta < -GameSetting.judgeTiming[2])this.tempJudge = JUDGE_FAST;
    else if(delta < -GameSetting.judgeTiming[1])this.tempJudge = JUDGE_GOOD_FAST;
    else if(delta < -GameSetting.judgeTiming[0])this.tempJudge = JUDGE_PERFECT_FAST;
    else if(delta < GameSetting.judgeTiming[0])this.tempJudge = JUDGE_SUPER;
    else if(delta < GameSetting.judgeTiming[1])this.tempJudge = JUDGE_PERFECT_SLOW;
    else if(delta < GameSetting.judgeTiming[2])this.tempJudge = JUDGE_GOOD_SLOW;
    else this.tempJudge = JUDGE_SLOW;
    return JUDGE_UNKNOWN;
  }
  else if(this.judgeType == NOTETYPE_FLICKINKEEP || this.judgeType == NOTETYPE_LONGFLICKEND) {
    this.state = NOTESTATE_WAITFLICK;
    return JUDGE_UNKNOWN;
  }
};
Note.prototype.keep = function(time){
  let delta = time - this.time;
  if(Math.abs(delta) > GameSetting.judgeTiming[3])return JUDGE_UNKNOWN;
  if(this.judgeType == NOTETYPE_TAPINKEEP){
    if(delta < -GameSetting.judgeTiming[0]){
      this.state = NOTESTATE_WAIT;
      if(delta < -GameSetting.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -GameSetting.judgeTiming[1])this.tempJudge =  JUDGE_GOOD_FAST;
      else if(delta < -GameSetting.judgeTiming[0])this.tempJudge =  JUDGE_PERFECT_FAST;
      else this.tempJudge = JUDGE_SUPER;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(this.tempJudge != JUDGE_UNKNOWN)return JUDGE_SUPER;
      else if(delta < GameSetting.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < GameSetting.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < GameSetting.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  else if(this.judgeType == NOTETYPE_LONGEND) {
    if(delta < -GameSetting.judgeTiming[0]){
      this.state = NOTESTATE_WAIT;
      if(delta < -GameSetting.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -GameSetting.judgeTiming[1])this.tempJudge = JUDGE_GOOD_FAST;
      else if(delta < -GameSetting.judgeTiming[0])this.tempJudge = JUDGE_PERFECT_FAST;
      else this.tempJudge = JUDGE_SUPER;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(this.tempJudge != JUDGE_UNKNOWN)return JUDGE_SUPER;
      else if(delta < GameSetting.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < GameSetting.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < GameSetting.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  return JUDGE_UNKNOWN;
};
Note.prototype.flick = function(time){
  let delta = time - this.time;
  if(Math.abs(delta) > GameSetting.judgeTiming[3])return JUDGE_UNKNOWN;
  if(this.judgeType == NOTETYPE_FLICK) {
    this.state = NOTESTATE_DONE;
    if(delta < -GameSetting.judgeTiming[2])return JUDGE_FAST;
    else if(delta < -GameSetting.judgeTiming[1]){
      return this.tempJudge < JUDGE_GOOD_FAST ? this.tempJudge:JUDGE_GOOD_FAST;
    }
    else if(delta < -GameSetting.judgeTiming[0]){
      return this.tempJudge < JUDGE_PERFECT_FAST ? this.tempJudge:JUDGE_PERFECT_FAST;
    }
    else if(delta < GameSetting.judgeTiming[0]){
      return this.tempJudge < JUDGE_SUPER ? this.tempJudge:JUDGE_SUPER;
    }
    else if(delta < GameSetting.judgeTiming[1])return JUDGE_PERFECT_SLOW;
    else if(delta < GameSetting.judgeTiming[2])return JUDGE_GOOD_SLOW;
    else return JUDGE_SLOW;
  }
  else if(this.judgeType == NOTETYPE_FLICKINKEEP || this.judgeType == NOTETYPE_LONGFLICKEND) {
    if(delta < -GameSetting.judgeTiming[0]){
      this.state = NOTESTATE_FLICKING;
      if(delta < -GameSetting.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -GameSetting.judgeTiming[1])this.tempJudge =  JUDGE_GOOD_FAST;
      else this.tempJudge =  JUDGE_PERFECT_FAST;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(this.tempJudge != JUDGE_UNKNOWN)return JUDGE_SUPER;
      else if(delta < GameSetting.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < GameSetting.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < GameSetting.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  return JUDGE_UNKNOWN;
};
Note.prototype.release = function(){
  let state = this.state;
  this.state = NOTESTATE_DONE;
  switch(state){
    case NOTESTATE_NONE:
    case NOTESTATE_WAITFLICK:
      return JUDGE_MISS;
    case NOTESTATE_WAIT:
    case NOTESTATE_FLICKING:
      return this.tempJudge;
    default:
      return JUDGE_UNKNOWN;
  }
}

const GameSetting = {
  /** place[m] = speed[m/ms] * time[ms] */
  speed:0.050,
  /** lane degree */
  upper:1/7,
  /** place of judge-line */
  judge:0.6,
  /** place of notes-appear place */
  appear:1.0,
  /** note visible time[ms] */
  visibleTime:1,
  /** Camera beta */
  beta:28,
  /** judgements */
  judgeTiming:[20, 40, 120, 160],
  // Others
  displayRange:[-5, 100],
  camera:Matrix4x4.eye(),
  update:function(near){
    const aspect = painter.getAspect();
    const Sx1 = this.upper + (1-this.upper)*(this.appear + this.judge)/(this.appear + 1);
    const Sy1 = -this.judge;
    const Sx2 = this.upper;
    const Sy2 = this.appear;

    const sinb = Math.sin(this.beta * Math.PI / 180);
    const cosb = Math.sqrt(1-sinb * sinb);
    const depth = 6 * (Sy2/Sx2 - Sy1/Sx1) / (sinb * aspect);
    this.visibleTime = depth / this.speed;

    const far=depth / cosb;
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
};

const Game = {
  notes:[],
  delay:0,
  judgeDelta:0,
  start:0,
  touchHistory:[],
  judgeElement:document.getElementById("judge"),
  judgeOpacity:0,
  judgeDisplayed:-1,
  setNotes:function(notes){
    this.notes = notes;
    this.notes.sort((a, b)=>a.time - b.time);
    for (const note of this.notes) {
      note.connectTo = -1;
      note.connectFrom = -1;
      note.judgeType = 0;
      note.tempJudge = JUDGE_UNKNOWN;
      note.state = NOTESTATE_NONE;
    }
    let nnotes = this.notes.length;
    for(let idx=0;idx<nnotes;idx++){
      const note = this.notes[idx];
      if(note.connectTime !== null){
        note.connectTo = -1;
        for (let idx2=idx+1;idx2<nnotes;idx2++) {
          const it = this.notes[idx2];
          if(it.time == note.connectTime && it.place == note.connectPlace){
            note.connectTo = idx2;
            it.connectFrom = idx;
            it.placeModified = Math.min(it.place, note.place);
            it.widthModified = Math.max(it.place + it.width, note.place + note.width) - it.placeModified;
            if(it.place < note.place && it.place + it.width <= note.place + note.width)it.flickDirection = FLICK_LEFT;
            else if(it.place >= note.place && it.place + it.width > note.place + note.width)it.flickDirection = FLICK_RIGHT;
            else it.flickDirection = FLICK_BOTH;
            break;
          }
        }
        if(note.connectTo < 0)console.error("Connection not found!");
      }
      
      if(note.connectTo >= 0){
        if(note.connectFrom < 0) note.judgeType = note.type == NOTETYPE_TAP ? NOTETYPE_LONGSTART : NOTETYPE_LONGFLICKSTART;
        else note.judgeType = note.type == NOTETYPE_TAP ? NOTETYPE_TAPINKEEP : NOTETYPE_FLICKINKEEP;
      }
      else{
        if(note.connectFrom < 0) note.judgeType = note.type;
        else note.judgeType = note.type == NOTETYPE_TAP ? NOTETYPE_LONGEND : NOTETYPE_LONGFLICKEND;
      }
    }
  },
  findNote:function(time, x, y, interrupt = false){
    let nnotes = this.notes.length;
    let touch = x*12;
    for(let idx=0;idx<nnotes;idx++){
      const note = this.notes[idx];
      if(note.state != NOTESTATE_NONE)continue;
      if(Math.abs(time - note.time) < GameSetting.judgeTiming[3]){
        let xMin = note.placeModified;
        let xMax = note.placeModified + note.widthModified;
        if(note.widthModified == 1){
          xMin-=1;
          xMax+=1;
        }
        else if(note.widthModified == 2){
          xMin-=0.5;
          xMax+=0.5;
        }
        if(xMin < touch && touch < xMax && (!interrupt || canInterrupt(note.judgeType))) return idx;
      }
    }
    return -1;
  },
  onTap:function(time, id, idx){
    const judge = this.notes[idx].tap(time);
    
    this.touchHistory[id].bind.push(idx);
    while(this.notes[idx].connectTo >= 0){
      idx = this.notes[idx].connectTo;
      this.touchHistory[id].bind.push(idx);
    }

    this.showJudge(judge);
  },
  draw:function(){
    const time = performance.now() - this.start - this.delay;
    painter.clear();
    painter.useProgram(drawPolygon);
    // Draw floor
    drawFloor(GameSetting.camera);
    // Draw long note floor
    for (const note of this.notes) {
      if(note.hasLongnoteFloor()){
        let start = (note.time - time) * GameSetting.speed;
        let end = start + (note.connectTime - note.time) * GameSetting.speed;
        if(start < GameSetting.displayRange[1] && end > GameSetting.displayRange[0]){
          drawLongNoteFloor(note.type == NOTETYPE_TAP ? NOTESKIN_LONG : NOTESKIN_FLICK, note.width, note.place, start, end, GameSetting.camera);
        }
      }
    }
    // Draw notes
    painter.useProgram(drawImage);
    for (const note of this.notes) {
      let z = (note.time - time) * GameSetting.speed;
      if(z < GameSetting.displayRange[1] && z > GameSetting.displayRange[0]){
        if(note.state != NOTESTATE_DONE) drawNote(note.getSkin(), note.widthModified, note.placeModified, z, GameSetting.camera);
      }
    }
    // Draw Flick note
    for (const note of this.notes) {
      let z = (note.time - time) * GameSetting.speed;
      if(z < GameSetting.displayRange[1] && z > GameSetting.displayRange[0]){
        if(note.needFlickIcon()){
          drawFlick(note.flickDirection, note.widthModified, note.placeModified, z, GameSetting.camera)
        }
      }
    }
    painter.flush();

    for(let i=0;i<10;i++) {
      if(this.touchHistory[i].time == 0)continue;
      if(this.touchHistory[i].bind.length == 0){
        let idx = this.findNote(time + this.judgeDelta, this.touchHistory[i].x, this.touchHistory[i].y, true);
        if(idx >= 0)this.onTap(time + this.judgeDelta, i, idx);
      }
      for(const bind of this.touchHistory[i].bind){
        if(this.notes[bind].state == NOTESTATE_DONE)continue;
        const judge = this.notes[bind].keep(time + this.judgeDelta);
        this.showJudge(judge);
      }
    }

    if(this.judgeDisplayed != JUDGE_UNKNOWN){
      this.judgeElement.innerText = judgeText[this.judgeDisplayed];
      this.judgeElement.style.opacity = this.judgeOpacity;
      if(this.judgeOpacity < 0.1)this.judgeOpacity = 0;
      else this.judgeOpacity-=0.03;
    }
    
    
    for (const note of this.notes) {
      if(note.state == NOTESTATE_DONE)continue;
      if((time + this.judgeDelta) - note.time > GameSetting.judgeTiming[3]){
        const judge = note.release(time);
        this.showJudge(judge);
      }
    }

    if(time + this.judgeDelta - this.notes[this.notes.length - 1].time > 3000)return false;
    return true;
  },
  initTouchHistory:function(){
    for(let i=0;i<10;i++) this.touchHistory.push({x:0,y:0,time:0,bind:[]});
  },
  showJudge:function(judge){
    if(judge == JUDGE_UNKNOWN)return;
    this.judgeOpacity = 1;
    this.judgeDisplayed = judge;
  },
  onTouchStart:function(id, x, y){
    const ct = performance.now();
    this.touchHistory[id].x = x;
    this.touchHistory[id].y = y;
    this.touchHistory[id].time = ct;
    
    const time = performance.now() - this.start - this.delay;
    let idx = this.findNote(time + this.judgeDelta, x, y);
    if(idx >= 0) this.onTap(time + this.judgeDelta, id, idx);
  },
  onTouchMove:function(id, x, y){
    const ct = performance.now();
    const dx = x - this.touchHistory[id].x;
    const dy = y - this.touchHistory[id].y;
    const dt = (ct - this.touchHistory[id].time) / 1000;
    const time = ct - this.start - this.delay;

    this.touchHistory[id].x = x;
    this.touchHistory[id].y = y;
    this.touchHistory[id].time = ct;

    if(this.touchHistory[id].bind.length == 0){
      let idx = this.findNote(time + this.judgeDelta, this.touchHistory[id].x, this.touchHistory[id].y, true);
      if(idx >= 0)this.onTap(time + this.judgeDelta, id, idx);
    }
    for(const bind of this.touchHistory[id].bind){
      if(this.notes[bind].state == NOTESTATE_DONE)continue;
      const judge = this.notes[bind].keep(time + this.judgeDelta);
      this.showJudge(judge);
    }

    if(Math.sqrt(dx * dx + dy * dy) / dt > 0.05){
      for(const bind of this.touchHistory[id].bind){
        if(this.notes[bind].state == NOTESTATE_DONE)continue;
        const judge = this.notes[bind].flick(time + this.judgeDelta);
        this.showJudge(judge);
      }
    }
  },
  onTouchEnd:function(id, x, y){
    for(const bind of this.touchHistory[id].bind){
      if(this.notes[bind].state == NOTESTATE_DONE)continue;
      const judge = this.notes[bind].release();
      this.showJudge(judge);
    }
    this.touchHistory[id].x = 0;
    this.touchHistory[id].y = 0;
    this.touchHistory[id].time = 0;
    this.touchHistory[id].bind = [];
  }
}
Game.initTouchHistory();

function draw() {
  if(Game.draw()) requestAnimationFrame(draw);
  else gameEnd();
}

function onWindowResized() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  gametouch_dummyelement.style.width = width + "px";
  gametouch_dummyelement.style.height = height + "px";
  painter.resizeCanvas(width, height);
  GameSetting.update(1);
}
window.addEventListener("resize", onWindowResized);
onWindowResized();

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

function gameStart(){
  main_home.hidden = true;
  main_editor.hidden = true;
  main_game.hidden = false;
  Game.setNotes([
    new Note(0, 0, 1, NOTETYPE_TAP),
    new Note(500, 2, 2, NOTETYPE_TAP),
    new Note(1000, 3, 3, NOTETYPE_FLICK),
    new Note(1000, 9, 3, NOTETYPE_TAP),
    new Note(1500, 6, 3, NOTETYPE_TAP),
    new Note(2000, 6, 6, NOTETYPE_FLICK),
    new Note(3000, 6, 3, NOTETYPE_FLICK, 4000, 6),
    new Note(4000, 6, 3, NOTETYPE_FLICK, 5000, 9),
    new Note(5000, 9, 3, NOTETYPE_FLICK, 5500, 6),
    new Note(5500, 6, 3, NOTETYPE_FLICK, 6000, 6),
    new Note(6000, 6, 3, NOTETYPE_FLICK),
    new Note(3000, 0, 3, NOTETYPE_TAP, 5000, 0),
    new Note(5000, 0, 3, NOTETYPE_TAP),
    new Note(5500, 0, 6, NOTETYPE_TAP),
    new Note(6000, 0, 6, NOTETYPE_TAP)
  ]);
  Game.delay = 3000;
  Game.start = performance.now();
  draw();
}

function gameEnd(){
  main_home.hidden = false;
  main_editor.hidden = true;
  main_game.hidden = true;
}
