(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global = global || self, global.Painter = factory());
}(this, (function () {
  'use strict';

  function Painter(canvas) {
    this.canvas = canvas;
    if (this.canvas && "getContext" in this.canvas) {
      this.framesize = [canvas.width, canvas.height];
      this.gl = this.canvas.getContext("webgl");
      if (this.gl) {
        this.clearColor(0, 0, 0, 0);
        this.clearDepth(1);
        this.enableDepthTest();
        this.enableBlend();
        this.currentprogram = null;
      }
      else {
        console.error("WebGL is not supported.");
      }
    }
    else {
      console.error("Painter must be initialized with canvas element.");
    }
  }

  Painter.prototype.resizeCanvas = function (w, h, detail = 1.5) {
    this.canvas.setAttribute("width", "" + w * detail + "px");
    this.canvas.setAttribute("height", "" + h * detail + "px");
    this.canvas.style.width = "" + w + "px";
    this.canvas.style.height = "" + h + "px";
    this.framesize[0] = w * detail;
    this.framesize[1] = h * detail;
    this.gl.viewport(0, 0, w * detail, h * detail);
  }

  Painter.prototype.getAspect = function () {
    return this.framesize[0] / this.framesize[1];
  }

  //********************************************************************

  Painter.prototype.viewport = function (x, y, w, h) {
    this.gl.viewport(x * this.framesize[0], y * this.framesize[1], w * this.framesize[0], h * this.framesize[1]);
  }
  Painter.prototype.clearColor = function (r, g, b, a) {
    this.gl.clearColor(r, g, b, a);
  }
  Painter.prototype.clearDepth = function (depth) {
    this.gl.clearDepth(depth);
  }
  Painter.prototype.enableDepthTest = function (fun = "LEQUAL") {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl[fun.toUpperCase()]);
  }
  Painter.prototype.disableDepthTest = function () {
    this.gl.disable(this.gl.DEPTH_TEST);
  }
  Painter.prototype.enableBlend = function (fun1 = "SRC_ALPHA", fun2 = "ONE_MINUS_SRC_ALPHA") {
    const gl = this.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl[fun1.toUpperCase()], gl[fun2.toUpperCase()]);
  }
  Painter.prototype.disableBlend = function () {
    this.gl.disable(this.gl.BLEND);
  }
  Painter.prototype.enableCullFace = function (cw = false) {
    const gl = this.gl;
    gl.enable(gl.CULL_FACE);
    if (cw) gl.frontFace(gl.CW);
    else gl.frontFace(gl.CCW);
  }
  Painter.prototype.disableCullFace = function () {
    this.gl.disable(this.gl.CULL_FACE);
  }
  Painter.prototype.clear = function (color = true, depth = true, stencil = false) {
    const gl = this.gl;
    let mask = 0;
    if (color) mask |= gl.COLOR_BUFFER_BIT;
    if (depth) mask |= gl.DEPTH_BUFFER_BIT;
    if (stencil) mask |= gl.STENCIL_BUFFER_BIT;
    gl.clear(mask);
  }
  Painter.prototype.flush = function () {
    this.gl.flush()
  }

  function PainterBuffer(gl, data, type, edittype) {
    this.gl = gl;
    this.type = type;
    if (type == gl.INT) this.data = new Int32Array(data);
    else if (type == gl.UNSIGNED_INT) this.data = new Uint32Array(data);
    else {
      this.data = new Float32Array(data);
      this.type = gl.FLOAT;
    }
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data, edittype);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  PainterBuffer.prototype.edit = function (i, value) {
    this.data[i] = value;
  }
  PainterBuffer.prototype.apply = function () {
    let gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  Painter.prototype.createBuffer = function (data, edittype = "static_draw") {
    return new PainterBuffer(this.gl, data, this.gl.FLOAT, this.gl[edittype.toUpperCase()]);
  }

  Painter.prototype.createIndexBuffer = function (data, type = "static") {
    const ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.gl[type.toUpperCase() + "_DRAW"]);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }

  Painter.prototype.createProgram = function (source) {
    const gl = this.gl;
    const program = {
      program: null,
      uniLoc: {},
      uniType: {},
      uniSize: {},
      attLoc: {},
      attType: {},
      attSize: {},
      attStride: {}
    };
    const vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vshader, source[0]);
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
      console.error("Painter Error:An error occurred compiling the vertext shader : " + gl.getShaderInfoLog(vshader));
      gl.deleteShader(vshader);
      return null;
    }
    const fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, source[1]);
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
      console.error("Painter Error:An error occurred compiling the fragment shader : " + gl.getShaderInfoLog(fshader));
      gl.deleteShader(fshader);
      return null;
    }
    program.program = gl.createProgram();
    gl.attachShader(program.program, vshader);
    gl.attachShader(program.program, fshader);
    gl.linkProgram(program.program);
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      console.error("Painter Error:Unable to initialize the program : " + gl.getProgramInfoLog(program.program));
      gl.deleteShader(vshader);
      gl.deleteShader(fshader);
      program.program = null;
      return null;
    }
    gl.useProgram(program.program);
    const numAttribs = gl.getProgramParameter(program.program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; ++i) {
      const info = gl.getActiveAttrib(program.program, i);
      program.attLoc[info.name] = gl.getAttribLocation(program.program, info.name);
      program.attType[info.name] = info.type;
      program.attSize[info.name] = info.size;
      if (info.type == gl.FLOAT) program.attStride[info.name] = 1;
      else if (info.type == gl.FLOAT_VEC2) program.attStride[info.name] = 2;
      else if (gl.FLOAT_VEC3 == info.type) program.attStride[info.name] = 3;
      else if (gl.FLOAT_VEC4 == info.type || gl.FLOAT_MAT2 == info.type) program.attStride[info.name] = 4;
      else if (gl.FLOAT_MAT3 == info.type) program.attStride[info.name] = 9;
      else if (gl.FLOAT_MAT4 == info.type) program.attStride[info.name] = 16;
      else {
        console.error("Painter Warning:Unknown attribute type, " + info.name);
      }
    }
    const numUniforms = gl.getProgramParameter(program.program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; ++i) {
      const info = gl.getActiveUniform(program.program, i);
      program.uniLoc[info.name] = gl.getUniformLocation(program.program, info.name);
      program.uniType[info.name] = info.type;
      program.uniSize[info.name] = info.size;
    }
    gl.useProgram(null);
    return program;
  }
  Painter.prototype.useProgram = function (program) {
    if (program == this.currentprogram) return;
    if (program == null) {
      this.currentprogram = null;
      this.gl.useProgram(null);
    }
    else if ("program" in program && program.program != 0) {
      this.currentprogram = program;
      this.gl.useProgram(program.program);
    }
    else {
      this.currentprogram = null;
      this.gl.useProgram(null);
      console.error("Painter Warning:The program you tried to set is null.");
    }
  }

  Painter.prototype.setVBO = function (name, VBO) {
    if (!(name in this.currentprogram.attLoc)) {
      console.error("Painter Warning:Current program has no attribute named \"" + name + "\"");
      return;
    }
    if (this.currentprogram == null) {
      console.error("Painter Warning:You have tried to set VBO to a null program.");
      return;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, VBO.buffer);
    this.gl.enableVertexAttribArray(this.currentprogram.attLoc[name]);
    this.gl.vertexAttribPointer(this.currentprogram.attLoc[name], this.currentprogram.attStride[name], VBO.type, false, 0, 0);
  }
  Painter.prototype.setIBO = function (IBO) {
    if (this.currentprogram == null) {
      console.error("Painter Warning:You have tried to set IBO to a null program.");
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, IBO);
  }

  Painter.prototype.setUniform = function (name, data) {
    if (this.currentprogram == null) {
      console.error("Painter Warning:You have tried to set Uniform to a null program.");
      return;
    }
    if (!(name in this.currentprogram.uniLoc)) {
      console.error("Painter Warning:Current program has no uniform named \"" + name + "\"");
      return;
    }
    switch (this.currentprogram.uniType[name]) {
      case this.gl.BOOL:
      case this.gl.INT:
        if (typeof data == "number") {
          if (this.currentprogram.uniSize[name] == 1) {
            this.gl.uniform1i(this.currentprogram.uniLoc[name], data);
          }
          else {
            console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of 1");
          }
        }
        else {
          if (this.currentprogram.uniSize[name] == data.length) {
            this.gl.uniform1iv(this.currentprogram.uniLoc[name], data);
          }
          else {
            console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
          }
        }
        break;
      case this.gl.FLOAT:
        if (typeof data == "number") {
          if (this.currentprogram.uniSize[name] == 1) {
            this.gl.uniform1f(this.currentprogram.uniLoc[name], data);
          }
          else {
            console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of 1");
          }
        }
        else {
          if (this.currentprogram.uniSize[name] == data.length) {
            this.gl.uniform1fv(this.currentprogram.uniLoc[name], data);
          }
          else {
            console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
          }
        }
        break;
      case this.gl.FLOAT_VEC2:
        if (this.currentprogram.uniSize[name] * 2 == data.length) this.gl.uniform2fv(this.currentprogram.uniLoc[name], data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.FLOAT_VEC3:
        if (this.currentprogram.uniSize[name] * 3 == data.length) this.gl.uniform3fv(this.currentprogram.uniLoc[name], data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.FLOAT_VEC4:
        if (this.currentprogram.uniSize[name] * 4 == data.length) this.gl.uniform4fv(this.currentprogram.uniLoc[name], data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.INT_VEC2:
      case this.gl.BOOL_VEC2:
        if (this.currentprogram.uniSize[name] * 2 == data.length) this.gl.uniform2iv(this.currentprogram.uniLoc[name], data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.INT_VEC3:
      case this.gl.BOOL_VEC3:
        if (this.currentprogram.uniSize[name] * 3 == data.length) this.gl.uniform3iv(this.currentprogram.uniLoc[name], data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.INT_VEC4:
      case this.gl.BOOL_VEC4:
        if (this.currentprogram.uniSize[name] * 4 == data.length) this.gl.uniform4iv(this.currentprogram.uniLoc[name], data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.FLOAT_MAT2:
        if (this.currentprogram.uniSize[name] * 4 == data.length) this.gl.uniformMatrix4fv(this.currentprogram.uniLoc[name], false, data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.FLOAT_MAT3:
        if (this.currentprogram.uniSize[name] * 9 == data.length) this.gl.uniformMatrix4fv(this.currentprogram.uniLoc[name], false, data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.FLOAT_MAT4:
        if (this.currentprogram.uniSize[name] * 16 == data.length) this.gl.uniformMatrix4fv(this.currentprogram.uniLoc[name], false, data);
        else console.error("Painter Error:uniform \"" + name + "\" has size of " + this.currentprogram.uniSize[name] + ", but the givven array has length of " + data.length);
        break;
      case this.gl.SAMPLER_2D:
      case this.gl.GL_SAMPLER_CUBE:
        this.gl.uniform1i(this.currentprogram.uniLoc[name], data);
        break;
    }
  }

  Painter.prototype.setTexture2D = function (name, texture, id = 0) {
    this.gl.activeTexture(this.gl["TEXTURE" + id]);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.setUniform(name, id);
  }

  //********************************************************************

  Painter.prototype.loadImage = function (src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }
  Painter.prototype.loadImageAsTexture = async function (src) {
    let img = await this.loadImage(src).catch(e => {
      console.error('Cannot load image,', e);
    });
    let gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  //********************************************************************

  Painter.prototype.drawArrays = function (count, type = "TRIANGLES", first = 0) {
    this.gl.drawArrays(this.gl[type.toUpperCase()], first, count);
  }
  Painter.prototype.drawElements = function (count, type = "TRIANGLES", offset = 0) {
    this.gl.drawElements(this.gl[type.toUpperCase()], count, this.gl.UNSIGNED_SHORT, offset);
  }

  return Painter;
})));