const canvas = document.getElementById("canvas");
const painter = new Painter(canvas);
painter.disableCullFace();

const TAP_NOTES = 0;
const LONG_NOTES = 1;
const FLICK_NOTES = 2;
const FLICK_BOTH = 0;
const FLICK_LEFT = 1;
const FLICK_RIGHT = 2;

/* Canvas Setup */

function onWindowResized() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  painter.resizeCanvas(width, height);
}
window.addEventListener("resize", onWindowResized)
onWindowResized();

/* Shader Setup */

let drawImage = painter.createProgram([`
attribute vec2 position;
attribute vec2 uv;
uniform mat4 cameraMatrix;
uniform mat4 modelMatrix;
varying vec2 vuv;
void main(){
  gl_Position = cameraMatrix * modelMatrix * vec4(position, 0.0, 1.0);
  vuv = uv;
}`
  ,
  `precision highp float;
uniform float global_alpha;
uniform sampler2D image;
varying vec2 vuv;
void main() {
  vec4 color=texture2D(image, vuv);
  if(color.a <= 0.1)discard;
  else gl_FragColor = vec4(color.xyz, color.w*global_alpha);
}`]
);

let drawPolygon = painter.createProgram([`
attribute vec3 position;
attribute float alpha;
uniform mat4 cameraMatrix;
uniform mat4 modelMatrix;
varying float valpha;
void main(){
  valpha = alpha;
  gl_Position = cameraMatrix * modelMatrix * vec4(position, 1.0);
}`
  ,
  `precision highp float;
varying float valpha;
uniform vec3 color;
void main() {
  gl_FragColor = vec4(color, valpha);
}`]
);

/* Object Setup */

const notes = {
  textures: {
    note_bg: null,
    note_tap: null,
    note_long: null,
    note_flick: null
  },
  positions: [],
  uv: painter.createBuffer([
    0.0, 1.0, 0.5, 1.0, 0.5, 1.0, 1.0, 1.0,
    1.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.0]),
  ibo: painter.createIndexBuffer([0, 1, 7, 6, 7, 1, 1, 2, 6, 5, 6, 2, 2, 3, 5, 4, 5, 3])
};
for (let idx = 1; idx <= 12; idx++) {
  notes.positions.push(painter.createBuffer([
    0.0, -0.5, 0.5, -0.5, idx - 0.5, -0.5, idx, -0.5,
    idx, 0.5, idx - 0.5, 0.5, 0.5, 0.5, 0.0, 0.5]));
}

function drawNote(type, size, offset, z, camera) {
  size-=1;
  offset -= 6;

  painter.setVBO("position", notes.positions[size]);
  painter.setVBO("uv", notes.uv);
  painter.setIBO(notes.ibo);
  painter.setUniform("cameraMatrix", camera);
  painter.setUniform("global_alpha", 1.0);

  painter.setUniform("modelMatrix", Matrix4x4.times(Matrix4x4.translation(offset, 0.01, -z), Matrix4x4.rotationX(-90)));
  painter.setTexture2D("image", notes.textures.note_bg);
  painter.drawElements(18);

  painter.setUniform("modelMatrix", Matrix4x4.times(Matrix4x4.translation(offset, 0.07, -z), Matrix4x4.rotationX(-90)));
  if (type == TAP_NOTES) painter.setTexture2D("image", notes.textures.note_tap);
  else if (type == LONG_NOTES) painter.setTexture2D("image", notes.textures.note_long);
  else if (type == FLICK_NOTES) painter.setTexture2D("image", notes.textures.note_flick);
  painter.drawElements(18);
}

const flickarrow = {
  texture: null,
  position: painter.createBuffer([-0.25, -0.25, 0.25, -0.25, 0.25, 0.25, -0.25, 0.25]),
  uv: painter.createBuffer([0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0]),
  ibo: painter.createIndexBuffer([0, 1, 2, 2, 3, 0])
}

function drawFlick(type, size, offset, z, camera) {
  offset -= 6;
  painter.setVBO("position", flickarrow.position);
  painter.setVBO("uv", flickarrow.uv);
  painter.setIBO(flickarrow.ibo);
  painter.setUniform("cameraMatrix", camera);
  painter.setTexture2D("image", flickarrow.texture);
  for (let i = 0; i < 2 * size; i++) {
    painter.setUniform("global_alpha", 0.2);
    let model = Matrix4x4.translation(offset + i * 0.25 + 0.125, 0.4, -z);
    if(type != FLICK_RIGHT)Matrix4x4.mul(model, Matrix4x4.rotationY(180));
    painter.setUniform("modelMatrix", model);
    painter.drawElements(6);
  }
  for (let i = 2 * size; i < 4 * size; i++) {
    painter.setUniform("global_alpha", 0.2);
    let model = Matrix4x4.translation(offset + i * 0.25 + 0.125, 0.4, -z);
    if(type == FLICK_LEFT) Matrix4x4.mul(model, Matrix4x4.rotationY(180));
    painter.setUniform("modelMatrix", model);
    painter.drawElements(6);
  }
}

const floorRectangle = {
  position: painter.createBuffer([-6.0, 0.0, 12.0, 6.0, 0.0, 12.0, 6.0, 0.0, -90.0, -6.0, 0.0, -90.0]),
  alpha: painter.createBuffer([0.9, 0.9, 0.9, 0.9]),
};
const floorLine = {
  position: [],
  alpha: [],
  idx: []
};
for(let i=0;i<=12;++i){
  floorLine.position.push(i-6,0.0,-0.5, i-6,0.0,0.5);
  floorLine.alpha.push(1,1);
  floorLine.idx.push(i*2, i*2+1);
}
floorLine.idx.push(0, 24);
floorLine.idx.push(1, 25);
floorLine.position = painter.createBuffer(floorLine.position);
floorLine.alpha = painter.createBuffer(floorLine.alpha);
floorLine.idx = painter.createIndexBuffer(floorLine.idx);

function drawFloor(camera){
  painter.setVBO("position", floorRectangle.position);
  painter.setVBO("alpha", floorRectangle.alpha);
  painter.setUniform("color", [0, 0, 0]);
  painter.setUniform("cameraMatrix", camera);
  painter.setUniform("modelMatrix", Matrix4x4.translation(0, -0.01, 0));
  painter.drawArrays(4, "triangle_fan");
  
  painter.setVBO("position", floorLine.position);
  painter.setVBO("alpha", floorLine.alpha);
  painter.setIBO(floorLine.idx);
  painter.setUniform("color", [1,1,1]);
  painter.setUniform("cameraMatrix", camera);
  painter.setUniform("modelMatrix", Matrix4x4.translation(0, -0.005, 0));
  painter.drawElements(30, "lines");
}

let longnoteRectangle = {
  position: painter.createBuffer([0, 0, 0, 0.5, 0, 0, 0.5, 0, 1, 0, 0, 1, 1, 0, 0, 0.5, 0, 0, 0.5, 0, 1, 1, 0, 1]),
  alpha: painter.createBuffer([1, 0.5, 0.5, 1, 1, 0.5, 0.5, 1]),
  ibo: painter.createIndexBuffer([0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4])
};

function drawLongNoteFloor(type, size, offset, y1, y2, camera){
  size-=1;
  offset -= 6;
  painter.setVBO("position", longnoteRectangle.position);
  painter.setVBO("alpha", longnoteRectangle.alpha);
  painter.setIBO(longnoteRectangle.ibo);
  if(type == FLICK_NOTES) painter.setUniform("color", [0.7, 0, 0.8]);
  else if(type == LONG_NOTES) painter.setUniform("color", [0, 0.8, 0.9]);
  painter.setUniform("cameraMatrix", camera);
  painter.setUniform("modelMatrix", Matrix4x4.times(Matrix4x4.translation(offset, 0, -y2), Matrix4x4.scale(size + 1, 0, y2-y1)));
  painter.drawElements(12);
}

/* Texture Setup */

async function setup() {
  notes.textures.note_bg = await painter.loadImageAsTexture("image/note_bg.png");
  notes.textures.note_tap = await painter.loadImageAsTexture("image/note_tap.png");
  notes.textures.note_flick = await painter.loadImageAsTexture("image/note_flick.png");
  notes.textures.note_long = await painter.loadImageAsTexture("image/note_long.png");
  flickarrow.texture = await painter.loadImageAsTexture("image/note_flickarrow.png");
}
setup();

let start = performance.now();
function draw() {
  painter.clear();

  let camera = Matrix4x4.createPMatrix(45, painter.getAspect(), 0.1, 180);
  Matrix4x4.mul(camera, Matrix4x4.createVMatrix([0, 4, 3], 0, 24, 4));

  painter.useProgram(drawPolygon);

  // Draw floor
  drawFloor(camera);

  // Draw long note floor
  drawLongNoteFloor(LONG_NOTES, 3, 6, 0, 6, camera);
  drawLongNoteFloor(FLICK_NOTES, 3, 9, 3, 9, camera);

  painter.useProgram(drawImage);

  // Draw notes
  drawNote(TAP_NOTES, 1, 0, 1, camera);
  drawNote(LONG_NOTES, 2, 0, 3, camera);
  drawNote(FLICK_NOTES, 2, 4, 5, camera);

  drawNote(LONG_NOTES, 3, 6, 0, camera);
  drawNote(LONG_NOTES, 3, 6, 6, camera);

  drawNote(FLICK_NOTES, 3, 9, 3, camera);
  drawNote(FLICK_NOTES, 4, 8, 9, camera);

  // Draw Flick note
  drawFlick(FLICK_BOTH, 2, 4, 5, camera)
  drawFlick(FLICK_LEFT, 4, 8, 9, camera)

  painter.flush();
  requestAnimationFrame(draw);
}
draw();
