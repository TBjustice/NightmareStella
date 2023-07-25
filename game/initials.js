/*
This file includes
1. Constant variables, which is used to write easy-to-understand code.
2. Functions that is closely related to constant variables.
3. LUTs(Look up tables).
4. HTML elements.
5. Variable contains saved-data, which is loaded from localStorage at first, and saved before unload page.
*/

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

/**
 * 
 * @param {Number} notetype 
 * @returns Whether a note-type can be bound with touch-event which is fired sometime before.
 */
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

/** LUT of name of judgements. */
const judgeText = ["Fast", "Good fast", "Perfect", "Super", "Perfect", "Good slow", "Slow", "Miss"];

const main_home = document.getElementById("main_home");
const game_list = document.getElementById("game_list");

const main_editor = document.getElementById("main_editor");
const editor_canvas = document.getElementById("editor_canvas");

const main_game = document.getElementById("main_game");
const canvas = document.getElementById("canvas");
const judge_display = document.getElementById("judge_display");
const gametouch_dummyelement = document.getElementById("gametouch_dummyelement");
const toggle_fullscreen = document.getElementById("toggle_fullscreen");

/** Contains all saved-data, include games and game-settings */
let savedData = localStorage.getItem("NightmareStella");
if(savedData !== null)savedData = JSON.parse(savedData);
else savedData={ games:[], settings:{} };
/** Note speed[m/ms] */
if(!("noteSpeed" in savedData.settings))savedData.settings["noteSpeed"] = 0.050;
/** Width[portion:0<portion<1] at top of lane */
if(!("laneUpperWidth" in savedData.settings))savedData.settings["laneUpperWidth"] = 1/7;
/** Height[portion:0<=portion<=1] of judgement place */
if(!("laneJudgementPlace" in savedData.settings))savedData.settings["laneJudgementPlace"] = 0.6;
/** Height[portion:0<=portion<=1] where notes appear */
if(!("laneAppearPlace" in savedData.settings))savedData.settings["laneAppearPlace"] = 1.0;
/** Camera beta[deg] */
if(!("cameraBeta" in savedData.settings))savedData.settings["cameraBeta"] = 28;
/** judgements[ms] */
if(!("judgeTiming" in savedData.settings))savedData.settings["judgeTiming"] = [20, 40, 120, 160];
/** Adjust judgement timing[ms] */
if(!("judgeDelta" in savedData.settings))savedData.settings["judgeDelta"] = 0.050;

addEventListener("beforeunload", (event) => {
  localStorage.setItem("NightmareStella", JSON.stringify(savedData));
});

