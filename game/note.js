/*
This file includes Note function.
It MUST be independent from other programs (except initials.js)
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
    if(delta < -savedData.settings.judgeTiming[2])return JUDGE_FAST;
    else if(delta < -savedData.settings.judgeTiming[1])return JUDGE_GOOD_FAST;
    else if(delta < -savedData.settings.judgeTiming[0])return JUDGE_PERFECT_FAST;
    else if(delta < savedData.settings.judgeTiming[0])return JUDGE_SUPER;
    else if(delta < savedData.settings.judgeTiming[1])return JUDGE_PERFECT_SLOW;
    else if(delta < savedData.settings.judgeTiming[2])return JUDGE_GOOD_SLOW;
    else return JUDGE_SLOW;
  }
  else if(this.judgeType == NOTETYPE_TAPINKEEP){
    if(delta < -savedData.settings.judgeTiming[0]){
      this.state = NOTESTATE_WAIT;
      if(delta < -savedData.settings.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -savedData.settings.judgeTiming[1])this.tempJudge =  JUDGE_GOOD_FAST;
      else if(delta < -savedData.settings.judgeTiming[0])this.tempJudge =  JUDGE_PERFECT_FAST;
      else this.tempJudge = JUDGE_SUPER;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(delta < savedData.settings.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < savedData.settings.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < savedData.settings.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  else if(this.judgeType == NOTETYPE_LONGEND) {
    if(delta < -savedData.settings.judgeTiming[0]){
      this.state = NOTESTATE_WAIT;
      if(delta < -savedData.settings.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -savedData.settings.judgeTiming[1])this.tempJudge =  JUDGE_GOOD_FAST;
      else if(delta < -savedData.settings.judgeTiming[0])this.tempJudge =  JUDGE_PERFECT_FAST;
      else this.tempJudge = JUDGE_SUPER;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(delta < savedData.settings.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < savedData.settings.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < savedData.settings.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  else if(this.judgeType == NOTETYPE_FLICK){
    this.state = NOTESTATE_WAITFLICK;
    if(delta < -savedData.settings.judgeTiming[2])this.tempJudge = JUDGE_FAST;
    else if(delta < -savedData.settings.judgeTiming[1])this.tempJudge = JUDGE_GOOD_FAST;
    else if(delta < -savedData.settings.judgeTiming[0])this.tempJudge = JUDGE_PERFECT_FAST;
    else if(delta < savedData.settings.judgeTiming[0])this.tempJudge = JUDGE_SUPER;
    else if(delta < savedData.settings.judgeTiming[1])this.tempJudge = JUDGE_PERFECT_SLOW;
    else if(delta < savedData.settings.judgeTiming[2])this.tempJudge = JUDGE_GOOD_SLOW;
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
  if(Math.abs(delta) > savedData.settings.judgeTiming[3])return JUDGE_UNKNOWN;
  if(this.judgeType == NOTETYPE_TAPINKEEP){
    if(delta < -savedData.settings.judgeTiming[0]){
      this.state = NOTESTATE_WAIT;
      if(delta < -savedData.settings.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -savedData.settings.judgeTiming[1])this.tempJudge =  JUDGE_GOOD_FAST;
      else if(delta < -savedData.settings.judgeTiming[0])this.tempJudge =  JUDGE_PERFECT_FAST;
      else this.tempJudge = JUDGE_SUPER;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(this.tempJudge != JUDGE_UNKNOWN)return JUDGE_SUPER;
      else if(delta < savedData.settings.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < savedData.settings.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < savedData.settings.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  else if(this.judgeType == NOTETYPE_LONGEND) {
    if(delta < -savedData.settings.judgeTiming[0]){
      this.state = NOTESTATE_WAIT;
      if(delta < -savedData.settings.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -savedData.settings.judgeTiming[1])this.tempJudge = JUDGE_GOOD_FAST;
      else if(delta < -savedData.settings.judgeTiming[0])this.tempJudge = JUDGE_PERFECT_FAST;
      else this.tempJudge = JUDGE_SUPER;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(this.tempJudge != JUDGE_UNKNOWN)return JUDGE_SUPER;
      else if(delta < savedData.settings.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < savedData.settings.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < savedData.settings.judgeTiming[2])return JUDGE_GOOD_SLOW;
      else return JUDGE_SLOW;
    }
  }
  return JUDGE_UNKNOWN;
};
Note.prototype.flick = function(time){
  let delta = time - this.time;
  if(Math.abs(delta) > savedData.settings.judgeTiming[3])return JUDGE_UNKNOWN;
  if(this.judgeType == NOTETYPE_FLICK) {
    this.state = NOTESTATE_DONE;
    if(delta < -savedData.settings.judgeTiming[2])return JUDGE_FAST;
    else if(delta < -savedData.settings.judgeTiming[1]){
      return this.tempJudge < JUDGE_GOOD_FAST ? this.tempJudge:JUDGE_GOOD_FAST;
    }
    else if(delta < -savedData.settings.judgeTiming[0]){
      return this.tempJudge < JUDGE_PERFECT_FAST ? this.tempJudge:JUDGE_PERFECT_FAST;
    }
    else if(delta < savedData.settings.judgeTiming[0]){
      return this.tempJudge < JUDGE_SUPER ? this.tempJudge:JUDGE_SUPER;
    }
    else if(delta < savedData.settings.judgeTiming[1])return JUDGE_PERFECT_SLOW;
    else if(delta < savedData.settings.judgeTiming[2])return JUDGE_GOOD_SLOW;
    else return JUDGE_SLOW;
  }
  else if(this.judgeType == NOTETYPE_FLICKINKEEP || this.judgeType == NOTETYPE_LONGFLICKEND) {
    if(delta < -savedData.settings.judgeTiming[0]){
      this.state = NOTESTATE_FLICKING;
      if(delta < -savedData.settings.judgeTiming[2])this.tempJudge = JUDGE_FAST;
      else if(delta < -savedData.settings.judgeTiming[1])this.tempJudge =  JUDGE_GOOD_FAST;
      else this.tempJudge =  JUDGE_PERFECT_FAST;
      return JUDGE_UNKNOWN;
    }
    else{
      this.state = NOTESTATE_DONE;
      if(this.tempJudge != JUDGE_UNKNOWN)return JUDGE_SUPER;
      else if(delta < savedData.settings.judgeTiming[0])return JUDGE_SUPER;
      else if(delta < savedData.settings.judgeTiming[1])return JUDGE_PERFECT_SLOW;
      else if(delta < savedData.settings.judgeTiming[2])return JUDGE_GOOD_SLOW;
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
