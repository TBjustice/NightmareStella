/*
This file includes Game object.
It MUST be independent from other programs (except libraries, initials.js and note.js)
*/

const Game = {
  notes:[],
  delay:0,
  judgeDelta:0,
  start:0,
  touchHistory:[],
  judgeOpacity:0,
  judgeDisplayed:-1,
  camera:Matrix4x4.eye(),
  displayRange:[-5,100],
  updateCamera:function(near = 1){
    const aspect = painter.getAspect();
    const Sx1 = savedData.settings.laneUpperWidth + (1-savedData.settings.laneUpperWidth)*(savedData.settings.laneAppearPlace + savedData.settings.laneJudgementPlace)/(savedData.settings.laneAppearPlace + 1);
    const Sy1 = -savedData.settings.laneJudgementPlace;
    const Sx2 = savedData.settings.laneUpperWidth;
    const Sy2 = savedData.settings.laneAppearPlace;

    const sinb = Math.sin(savedData.settings.cameraBeta * Math.PI / 180);
    const cosb = Math.sqrt(1-sinb * sinb);
    const depth = 6 * (Sy2/Sx2 - Sy1/Sx1) / (sinb * aspect);
    this.visibleTime = depth / savedData.settings.noteSpeed;

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
  },
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
        if(note.connectTo < 0)console.error("Connection not found!", note.connectTime, note.connectPlace);
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
    drawFloor(this.camera);
    // Draw long note floor
    for (const note of this.notes) {
      if(note.hasLongnoteFloor()){
        let start = (note.time - time) * savedData.settings.noteSpeed;
        let end = start + (note.connectTime - note.time) * savedData.settings.noteSpeed;
        if(start < this.displayRange[1] && end > this.displayRange[0]){
          drawLongNoteFloor(note.type == NOTETYPE_TAP ? NOTESKIN_LONG : NOTESKIN_FLICK, note.width, note.place, start, end, this.camera);
        }
      }
    }
    // Draw notes
    painter.useProgram(drawImage);
    for (const note of this.notes) {
      let z = (note.time - time) * savedData.settings.noteSpeed;
      if(z < this.displayRange[1] && z > this.displayRange[0]){
        if(note.state != NOTESTATE_DONE) drawNote(note.getSkin(), note.widthModified, note.placeModified, z, this.camera);
      }
    }
    // Draw Flick note
    for (const note of this.notes) {
      let z = (note.time - time) * savedData.settings.noteSpeed;
      if(z < this.displayRange[1] && z > this.displayRange[0]){
        if(note.needFlickIcon()){
          drawFlick(note.flickDirection, note.widthModified, note.placeModified, z, this.camera)
        }
      }
    }
    painter.flush();

    for(let i=0;i<10;i++) {
      if(this.touchHistory[i].time == 0)continue;
      if(this.touchHistory[i].bind.length == 0){
        let idx = this.findNote(time + savedData.settings.judgeDelta, this.touchHistory[i].x, this.touchHistory[i].y, true);
        if(idx >= 0)this.onTap(time + savedData.settings.judgeDelta, i, idx);
      }
      for(const bind of this.touchHistory[i].bind){
        if(this.notes[bind].state == NOTESTATE_DONE)continue;
        const judge = this.notes[bind].keep(time + savedData.settings.judgeDelta);
        this.showJudge(judge);
      }
    }

    if(this.judgeDisplayed != JUDGE_UNKNOWN){
      judge_display.innerText = judgeText[this.judgeDisplayed];
      judge_display.style.opacity = this.judgeOpacity;
      if(this.judgeOpacity < 0.1)this.judgeOpacity = 0;
      else this.judgeOpacity-=0.03;
    }
    
    for (const note of this.notes) {
      if(note.state == NOTESTATE_DONE)continue;
      if((time + savedData.settings.judgeDelta) - note.time > savedData.settings.judgeTiming[3]){
        const judge = note.release(time);
        this.showJudge(judge);
      }
    }

    if(time + savedData.settings.judgeDelta - this.notes[this.notes.length - 1].time > 3000)return false;
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
    let idx = this.findNote(time + savedData.settings.judgeDelta, x, y);
    if(idx >= 0) this.onTap(time + savedData.settings.judgeDelta, id, idx);
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
      let idx = this.findNote(time + savedData.settings.judgeDelta, this.touchHistory[id].x, this.touchHistory[id].y, true);
      if(idx >= 0)this.onTap(time + savedData.settings.judgeDelta, id, idx);
    }
    for(const bind of this.touchHistory[id].bind){
      if(this.notes[bind].state == NOTESTATE_DONE)continue;
      const judge = this.notes[bind].keep(time + savedData.settings.judgeDelta);
      this.showJudge(judge);
    }

    if(Math.sqrt(dx * dx + dy * dy) / dt > 0.5){
      for(const bind of this.touchHistory[id].bind){
        if(this.notes[bind].state == NOTESTATE_DONE)continue;
        const judge = this.notes[bind].flick(time + savedData.settings.judgeDelta);
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
