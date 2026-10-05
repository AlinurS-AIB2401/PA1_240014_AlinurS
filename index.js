/**
 * PA2 – Matrix Transformations and Perspective
 * Course:     AR/VR/XR Applications (AIB), 6B04103 AI Business, 3rd year
 * Student:    Alinur S.
 * Student ID: 240014
 * 
 * Task C & E: Orthographic projection, camera orbiting, and keyboard controls.
 */

"use strict";

main();

function main() {
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext("webgl");
  if (!gl) { console.error("WebGL unavailable"); return; }

  function quad(v0, v1, v2, v3) {
    return [...v0, ...v1, ...v2, ...v0, ...v2, ...v3];
  }

  // Centered Cube [-0.5, 0.5]^3
  const cFLB = [-0.5, -0.5,  0.5], cFRB = [ 0.5, -0.5,  0.5];
  const cFRT = [ 0.5,  0.5,  0.5], cFLT = [-0.5,  0.5,  0.5];
  const cBLB = [-0.5, -0.5, -0.5], cBRB = [ 0.5, -0.5, -0.5];
  const cBRT = [ 0.5,  0.5, -0.5], cBLT = [-0.5,  0.5, -0.5];

  const cubePositions = [
    ...quad(cFLB, cFRB, cFRT, cFLT),
    ...quad(cBRB, cBLB, cBLT, cBRT),
    ...quad(cFLT, cFRT, cBRT, cBLT),
    ...quad(cBLB, cBRB, cFRB, cFLB),
    ...quad(cBLB, cFLB, cFLT, cBLT),
    ...quad(cFRB, cBRB, cBRT, cFRT)
  ];

  // Centered Staircase [-0.5, 0.5]^3
  const pA = [-0.5, -0.5,  0.5], pB = [ 0.5, -0.5,  0.5], pC = [ 0.5,  0.0,  0.5];
  const pD = [ 0.0,  0.0,  0.5], pE = [ 0.0,  0.5,  0.5], pF = [-0.5,  0.5,  0.5];
  const pA2 = [-0.5, -0.5, -0.5], pB2 = [ 0.5, -0.5, -0.5], pC2 = [ 0.5,  0.0, -0.5];
  const pD2 = [ 0.0,  0.0, -0.5], pE2 = [ 0.0,  0.5, -0.5], pF2 = [-0.5,  0.5, -0.5];

  const stairPositions = [
    ...pA, ...pB, ...pC, ...pA, ...pC, ...pD, ...pA, ...pD, ...pE, ...pA, ...pE, ...pF,
    ...pB2, ...pA2, ...pF2, ...pB2, ...pF2, ...pE2, ...pB2, ...pE2, ...pD2, ...pB2, ...pD2, ...pC2,
    ...quad(pA2, pB2, pB, pA),
    ...quad(pB, pB2, pC2, pC),
    ...quad(pC2, pC, pD, pD2),
    ...quad(pD, pD2, pE2, pE),
    ...quad(pE, pE2, pF2, pF),
    ...quad(pF2, pA2, pA, pF)
  ];

  const positions = [...cubePositions, ...stairPositions];
  const CUBE_VERT_COUNT = 36;
  const STAIR_VERT_COUNT = 60;

  function flatColor(n, r, g, b) {
    const a = [];
    for (let i = 0; i < n; i++) a.push(r, g, b, 1.0);
    return a;
  }
  const cubeColors = [
    1,0,0,1, 1,0.5,0,1, 1,1,0,1, 1,0,0,1, 1,1,0,1, 1,0.6,0.2,1,
    ...flatColor(6, 0.2, 0.2, 0.2), ...flatColor(6, 0.0, 0.9, 0.85),
    ...flatColor(6, 0.5, 0.25, 0.0), ...flatColor(6, 0.2, 0.8, 0.2),
    ...flatColor(6, 0.1, 0.1, 0.7)
  ];
  const stairColors = [
    0.55, 0.0, 0.8, 1, 0.9, 0.0, 0.6, 1, 1.0, 0.1, 0.9, 1,
    0.55, 0.0, 0.8, 1, 1.0, 0.1, 0.9, 1, 0.85, 0.0, 1.0, 1,
    0.55, 0.0, 0.8, 1, 0.85, 0.0, 1.0, 1, 0.7, 0.0, 0.9, 1,
    0.55, 0.0, 0.8, 1, 0.7, 0.0, 0.9, 1, 0.6, 0.0, 0.85, 1,
    ...flatColor(12, 0.05, 0.05, 0.25), ...flatColor(6, 0.85, 0.35, 0.0),
    ...flatColor(6, 0.27, 0.51, 0.71), ...flatColor(6, 0.5, 0.5, 0.0),
    ...flatColor(6, 1.0, 0.08, 0.58), ...flatColor(6, 1.0, 0.84, 0.0),
    ...flatColor(6, 0.13, 0.55, 0.13)
  ];
  const colors = [...cubeColors, ...stairColors];

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const colBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const vsSource = `
    attribute vec4 aPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main() {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
      vColor = aVertexColor;
    }
  `;
  const fsSource = `
    precision mediump float;
    varying lowp vec4 vColor;
    void main() { gl_FragColor = vColor; }
  `;
  const prog = createProgram(gl, createShader(gl, gl.VERTEX_SHADER, vsSource), createShader(gl, gl.FRAGMENT_SHADER, fsSource));
  gl.useProgram(prog);

  const aPos = gl.getAttribLocation(prog, "aPosition");
  const aCol = gl.getAttribLocation(prog, "aVertexColor");
  const uModel = gl.getUniformLocation(prog, "uModelMatrix");
  const uView  = gl.getUniformLocation(prog, "uViewMatrix");
  const uProj  = gl.getUniformLocation(prog, "uProjectionMatrix");

  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPos);

  gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
  gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aCol);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  const state = {
    t: 0,
    paused: false,
    ortho: false,
    fovDeg: 45,
    azimuth: 0
  };

  let aspect = 1.0;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = canvas.clientWidth / canvas.clientHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "p": case "P": state.paused = !state.paused; break;
      case "o": case "O": state.ortho = !state.ortho; break;
      case "+": case "=": case "Add":
        if (!state.ortho) state.fovDeg = Math.min(100, state.fovDeg + 5);
        break;
      case "-": case "_": case "Subtract":
        if (!state.ortho) state.fovDeg = Math.max(20, state.fovDeg - 5);
        break;
      case "ArrowLeft": state.azimuth -= 5; break;
      case "ArrowRight": state.azimuth += 5; break;
      case "r": case "R":
        state.t = 0; state.paused = false; state.ortho = false;
        state.fovDeg = 45; state.azimuth = 0;
        break;
    }
  });

  const view = mat4.create();
  const proj = mat4.create();

  function render() {
    if (!state.paused) state.t += 0.016;

    // View: lookAt with azimuth orbit
    const rad = state.azimuth * Math.PI / 180.0;
    const eyeX = 7.0 * Math.sin(rad);
    const eyeZ = 7.0 * Math.cos(rad);
    mat4.lookAt(view, [eyeX, 2.5, eyeZ], [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(uView, false, view);

    // Projection: perspective vs ortho (Fix: positive forward distances near=1.0, far=20.0)
    const near = 1.0, far = 20.0;
    if (!state.ortho) {
      mat4.perspective(proj, state.fovDeg * Math.PI / 180.0, aspect, near, far);
    } else {
      const halfHeight = 3.1;
      const halfWidth = halfHeight * aspect;
      mat4.ortho(proj, -halfWidth, halfWidth, -halfHeight, halfHeight, near, far);
    }
    gl.uniformMatrix4fv(uProj, false, proj);

    gl.clearColor(0.08, 0.08, 0.10, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Cube
    gl.uniformMatrix4fv(uModel, false, cubeModelMatrix(state.t));
    gl.drawArrays(gl.TRIANGLES, 0, CUBE_VERT_COUNT);

    // Solid
    gl.uniformMatrix4fv(uModel, false, solidModelMatrix(state.t));
    gl.drawArrays(gl.TRIANGLES, CUBE_VERT_COUNT, STAIR_VERT_COUNT);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function cubeModelMatrix(t) {
  const m = mat4.create();
  mat4.rotate(m, m, 1.2 * t, [0, 1, 0]);
  return m;
}

function solidModelMatrix(t) {
  const m = mat4.create();
  mat4.rotate(m, m, (2 * Math.PI / 10.0) * t, [0, 1, 0]);
  mat4.translate(m, m, [2.5, 0, 0]);
  mat4.rotate(m, m, 2.0 * t, [0, 1, 0]);
  const s = 0.65 + 0.15 * Math.sin((2 * Math.PI * t) / 3.0);
  mat4.scale(m, m, [s, s, s]);
  return m;
}

function createShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function createProgram(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  return p;
}
