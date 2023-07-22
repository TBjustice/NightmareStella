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
const JUDGE_MISS = 0;
const JUDGE_FAST = 1;
const JUDGE_SLOW = 2;
const JUDGE_GOOD_FAST = 3;
const JUDGE_GOOD_SLOW = 4;
const JUDGE_PERFECT_FAST = 5;
const JUDGE_PERFECT_SLOW = 6;
const JUDGE_SUPER = 7;

const judgeText = ["Miss", "Fast", "Slow", "Good fast", "Good slow", "Perfect", "Perfect", "Super"];
