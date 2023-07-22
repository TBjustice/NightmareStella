const NOTESKIN_TAP = 0;
const NOTESKIN_LONG = 1;
const NOTESKIN_FLICK = 2;

const NOTETYPE_TAP = 0;
const NOTETYPE_FLICK = 1;
const NOTETYPE_LONGSTART = 2;
const NOTETYPE_LONGFLICKSTART = 3;
const NOTETYPE_TAPINKEEP = 4;
const NOTETYPE_LONGEND = 5;
const NOTETYPE_FLICKINKEEP = 6;
const NOTETYPE_LONGFLICKEND = 7;

function canInterrupt(notetype){
  return notetype >= NOTETYPE_TAPINKEEP;
}

const FLICK_BOTH = 0;
const FLICK_LEFT = 1;
const FLICK_RIGHT = 2;

const NOTESTATE_NONE = 0;
const NOTESTATE_WAIT = 1;
const NOTESTATE_WAITFLICK = 2;
const NOTESTATE_FLICKING = 3;
const NOTESTATE_DONE = 4;

const JUDGE_UNKNOWN = -1;
const JUDGE_FAST = 0;
const JUDGE_GOOD_FAST = 1;
const JUDGE_PERFECT_FAST = 2;
const JUDGE_SUPER = 3;
const JUDGE_PERFECT_SLOW = 4;
const JUDGE_GOOD_SLOW = 5;
const JUDGE_SLOW = 6;
const JUDGE_MISS = 7;

const judgeText = ["Fast", "Good fast", "Perfect", "Super", "Perfect", "Good slow", "Slow", "Miss"];

const main_home = document.getElementById("main_home");
const main_editor = document.getElementById("main_editor");
const main_game = document.getElementById("main_game");
const gametouch_dummyelement = document.getElementById("gametouch_dummyelement");

const canvas = document.getElementById("canvas");

const editor_canvas = document.getElementById("editor_canvas");

