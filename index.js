/**
 * PA2 – Matrix Transformations and Perspective
 * Course:     AR/VR/XR Applications (AIB), 6B04103 AI Business, 3rd year
 * Student:    Alinur S.
 * Student ID: 240014
 * 
 * Variant Parameters (ID 240014):
 *   - Last digit = 4: Assigned Solid = Two-step staircase (PA1 solid, 60 vertices)
 *   - Last digit = 4: Orbit Period T = 6 + 4 = 10.0 s
 *   - 2nd-to-last = 1: Cube Spin Axis = 1 mod 3 = 1 → y-axis [0, 1, 0]
 *   - 3rd-to-last = 0: Orbit Plane = 0 mod 3 = 0 → horizontal (around y-axis)
 *   - 4th-to-last = 0: Camera = 0 mod 2 = 0 → eye (0, 2.5, 7), FOV 45°
 * 
 * Fixed Parameters:
 *   - Cube spin speed: 1.2 rad/s
 *   - Orbit radius:    2.5 units from cube center
 *   - Solid self-spin: 2.0 rad/s around its own y-axis
 *   - Solid pulse:     s(t) = 0.65 + 0.15 * sin(2πt / 3)
 *   - Camera target:   (0, 0, 0), Up: (0, 1, 0)
 */

"use strict";

main();

function main() {
  /*========== 1. Create WebGL Context (once) ==========*/
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error("WebGL unavailable – check browser support.");
    const statusEl = document.getElementById("status");
    if (statusEl) statusEl.textContent = "Error: WebGL 1.0 unavailable in this browser.";
    return;
  }

  /*========== 2. Define and Store Geometry (once) ==========*/

  // Helper: Build 2 triangles (6 vertices) from 4 corners of a quad
  function quad(v0, v1, v2, v3) {
    return [
      ...v0, ...v1, ...v2,
      ...v0, ...v2, ...v3
    ];
  }

  // -------------------------------------------------------------------------
  // CUBE GEOMETRY (36 vertices)
  // Re-modelled from -0.5 to +0.5 on all 3 axes, centred on origin (0, 0, 0)
  // -------------------------------------------------------------------------
  const cFLB = [-0.5, -0.5,  0.5]; // Front-Left-Bottom
  const cFRB = [ 0.5, -0.5,  0.5]; // Front-Right-Bottom
  const cFRT = [ 0.5,  0.5,  0.5]; // Front-Right-Top
  const cFLT = [-0.5,  0.5,  0.5]; // Front-Left-Top
  const cBLB = [-0.5, -0.5, -0.5]; // Back-Left-Bottom
  const cBRB = [ 0.5, -0.5, -0.5]; // Back-Right-Bottom
  const cBRT = [ 0.5,  0.5, -0.5]; // Back-Right-Top
  const cBLT = [-0.5,  0.5, -0.5]; // Back-Left-Top

  const cubePositions = [
    // Front face (z = +0.5)
    ...quad(cFLB, cFRB, cFRT, cFLT),
    // Back face (z = -0.5)
    ...quad(cBRB, cBLB, cBLT, cBRT),
    // Top face (y = +0.5)
    ...quad(cFLT, cFRT, cBRT, cBLT),
    // Bottom face (y = -0.5)
    ...quad(cBLB, cBRB, cFRB, cFLB),
    // Left face (x = -0.5)
    ...quad(cBLB, cFLB, cFLT, cBLT),
    // Right face (x = +0.5)
    ...quad(cFRB, cBRB, cBRT, cFRT)
  ];
  console.assert(cubePositions.length === 36 * 3, `Cube pos: expected 108, got ${cubePositions.length}`);

  // -------------------------------------------------------------------------
  // TWO-STEP STAIRCASE GEOMETRY (60 vertices, PA1 Solid for last digit = 4)
  // Centred on its own origin so it fits inside a 1 × 1 × 1 box [-0.5, +0.5]^3
  // Profile in xy:
  //   Bottom step: x in [-0.5, +0.5], y in [-0.5,  0.0]
  //   Top step:    x in [-0.5,  0.0], y in [ 0.0, +0.5]
  // Extruded along z in [-0.5, +0.5]
  // -------------------------------------------------------------------------
  // Profile corners on front plane (z = +0.5)
  const pA = [-0.5, -0.5,  0.5]; // Bottom-Left
  const pB = [ 0.5, -0.5,  0.5]; // Bottom-Right
  const pC = [ 0.5,  0.0,  0.5]; // Step-Tread-Right
  const pD = [ 0.0,  0.0,  0.5]; // Step-Inner-Corner
  const pE = [ 0.0,  0.5,  0.5]; // Top-Step-Right
  const pF = [-0.5,  0.5,  0.5]; // Top-Step-Left

  // Corresponding profile corners on back plane (z = -0.5)
  const pA2 = [-0.5, -0.5, -0.5];
  const pB2 = [ 0.5, -0.5, -0.5];
  const pC2 = [ 0.5,  0.0, -0.5];
  const pD2 = [ 0.0,  0.0, -0.5];
  const pE2 = [ 0.0,  0.5, -0.5];
  const pF2 = [-0.5,  0.5, -0.5];

  // Front L-face (z = +0.5): 4 triangles fan from pA = 12 vertices
  const stairFront = [
    ...pA, ...pB, ...pC,
    ...pA, ...pC, ...pD,
    ...pA, ...pD, ...pE,
    ...pA, ...pE, ...pF
  ];

  // Back L-face (z = -0.5): 4 triangles wound for opposite facing = 12 vertices
  const stairBack = [
    ...pB2, ...pA2, ...pF2,
    ...pB2, ...pF2, ...pE2,
    ...pB2, ...pE2, ...pD2,
    ...pB2, ...pD2, ...pC2
  ];

  // 6 side rectangular faces (2 triangles each = 6 vertices each, total 36 verts)
  const stairBottom = quad(pA2, pB2, pB, pA);   // y = -0.5
  const stairRight  = quad(pB, pB2, pC2, pC);   // x = +0.5, y in [-0.5, 0.0]
  const stairNotchH = quad(pC2, pC, pD, pD2);   // y = 0.0,  x in [0.0, 0.5]
  const stairNotchV = quad(pD, pD2, pE2, pE);   // x = 0.0,  y in [0.0, 0.5]
  const stairTop    = quad(pE, pE2, pF2, pF);   // y = +0.5, x in [-0.5, 0.0]
  const stairLeft   = quad(pF2, pA2, pA, pF);   // x = -0.5, y in [-0.5, 0.5]

  const stairPositions = [
    ...stairFront,
    ...stairBack,
    ...stairBottom,
    ...stairRight,
    ...stairNotchH,
    ...stairNotchV,
    ...stairTop,
    ...stairLeft
  ];
  console.assert(stairPositions.length === 60 * 3, `Stair pos: expected 180, got ${stairPositions.length}`);

  // Combined position array (one buffer, two separate draw calls)
  const positions = [...cubePositions, ...stairPositions];
  const CUBE_VERT_COUNT = 36;
  const STAIR_VERT_COUNT = 60;
  const TOTAL_VERTS = CUBE_VERT_COUNT + STAIR_VERT_COUNT; // 96

  // -------------------------------------------------------------------------
  // PER-VERTEX COLOURS (from PA1)
  // Distinct flat colours per face, gradient on front face
  // -------------------------------------------------------------------------
  function flatColor(numVerts, r, g, b, a = 1.0) {
    const res = [];
    for (let i = 0; i < numVerts; i++) res.push(r, g, b, a);
    return res;
  }

  // Cube colors (36 verts)
  const cubeFrontColors = [
    // Gradient on front face (red -> orange -> yellow)
    1.0, 0.0, 0.0, 1.0,   // BL
    1.0, 0.5, 0.0, 1.0,   // BR
    1.0, 1.0, 0.0, 1.0,   // TR
    1.0, 0.0, 0.0, 1.0,   // BL
    1.0, 1.0, 0.0, 1.0,   // TR
    1.0, 0.6, 0.2, 1.0    // TL
  ];
  const cubeBackColors   = flatColor(6, 0.20, 0.20, 0.20); // Dark grey
  const cubeTopColors    = flatColor(6, 0.00, 0.90, 0.85); // Teal / cyan
  const cubeBottomColors = flatColor(6, 0.50, 0.25, 0.00); // Brown
  const cubeLeftColors   = flatColor(6, 0.20, 0.80, 0.20); // Lime green
  const cubeRightColors  = flatColor(6, 0.10, 0.10, 0.70); // Dark blue

  const cubeColors = [
    ...cubeFrontColors,
    ...cubeBackColors,
    ...cubeTopColors,
    ...cubeBottomColors,
    ...cubeLeftColors,
    ...cubeRightColors
  ];

  // Staircase colors (60 verts)
  const stairFrontColors = [
    // Gradient on front L-face (purple -> magenta -> pink, 12 verts)
    0.55, 0.00, 0.80, 1.0, 0.90, 0.00, 0.60, 1.0, 1.00, 0.10, 0.90, 1.0,
    0.55, 0.00, 0.80, 1.0, 1.00, 0.10, 0.90, 1.0, 0.85, 0.00, 1.00, 1.0,
    0.55, 0.00, 0.80, 1.0, 0.85, 0.00, 1.00, 1.0, 0.70, 0.00, 0.90, 1.0,
    0.55, 0.00, 0.80, 1.0, 0.70, 0.00, 0.90, 1.0, 0.60, 0.00, 0.85, 1.0
  ];
  const stairBackColors   = flatColor(12, 0.05, 0.05, 0.25); // Dark navy
  const stairBottomColors = flatColor(6,  0.85, 0.35, 0.00); // Deep orange
  const stairRightColors  = flatColor(6,  0.27, 0.51, 0.71); // Steel blue
  const stairNotchHColors = flatColor(6,  0.50, 0.50, 0.00); // Olive
  const stairNotchVColors = flatColor(6,  1.00, 0.08, 0.58); // Hot pink
  const stairTopColors    = flatColor(6,  1.00, 0.84, 0.00); // Gold
  const stairLeftColors   = flatColor(6,  0.13, 0.55, 0.13); // Forest green

  const stairColors = [
    ...stairFrontColors,
    ...stairBackColors,
    ...stairBottomColors,
    ...stairRightColors,
    ...stairNotchHColors,
    ...stairNotchVColors,
    ...stairTopColors,
    ...stairLeftColors
  ];

  const colors = [...cubeColors, ...stairColors];
  console.assert(colors.length === TOTAL_VERTS * 4, `Colors: expected ${TOTAL_VERTS * 4}, got ${colors.length}`);

  // Create GPU Buffers (once)
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const colBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  /*========== 3. Shaders and Program Setup (once) ==========*/
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
    void main() {
      gl_FragColor = vColor;
    }
  `;

  const vShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vShader || !fShader) return;

  const program = createProgram(gl, vShader, fShader);
  if (!program) return;
  gl.useProgram(program);

  // Set up Attributes (once, outside loop)
  const aPositionLoc = gl.getAttribLocation(program, "aPosition");
  const aColorLoc    = gl.getAttribLocation(program, "aVertexColor");

  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPositionLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
  gl.vertexAttribPointer(aColorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColorLoc);

  // Retrieve Uniform Locations (once, outside loop)
  const uModelMatrixLoc      = gl.getUniformLocation(program, "uModelMatrix");
  const uViewMatrixLoc       = gl.getUniformLocation(program, "uViewMatrix");
  const uProjectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

  /*========== 4. State & Controls ==========*/
  const state = {
    t: 0.0,
    paused: false,
    ortho: false,
    fovDeg: 45.0,
    azimuth: 0.0, // Camera orbit angle in degrees
    // Optional overrides for write-up experiments:
    transformMode: "normal", // 'normal', 'swapA', 'swapB' for E1
    nearOverride: null,      // for E4 near clipping
    aspectOverride: null     // for E4 aspect = 1 test
  };

  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // Responsive canvas resize handling
  let aspect = 1.0;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth  = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const displayHeight = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = canvas.clientWidth / canvas.clientHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // Keyboard controls (Task E)
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "p":
      case "P":
        state.paused = !state.paused;
        break;

      case "o":
      case "O":
        state.ortho = !state.ortho;
        break;

      case "+":
      case "=":
      case "Add":
        if (!state.ortho) {
          state.fovDeg = Math.min(100.0, state.fovDeg + 5.0);
        }
        break;

      case "-":
      case "_":
      case "Subtract":
        if (!state.ortho) {
          state.fovDeg = Math.max(20.0, state.fovDeg - 5.0);
        }
        break;

      case "ArrowLeft":
        // Orbit camera eye counter-clockwise / left by 5 degrees
        state.azimuth -= 5.0;
        break;

      case "ArrowRight":
        // Orbit camera eye clockwise / right by 5 degrees
        state.azimuth += 5.0;
        break;

      case "r":
      case "R":
        // Reset camera and time to start values
        state.t = 0.0;
        state.paused = false;
        state.ortho = false;
        state.fovDeg = 45.0;
        state.azimuth = 0.0;
        state.transformMode = "normal";
        state.nearOverride = null;
        state.aspectOverride = null;
        break;

      default:
        return;
    }
  });

  /*========== 5. Animation Loop (Task D) ==========*/
  const statusEl = document.getElementById("status");
  const fpsWindow = []; // Timestamps of frames in last 1000 ms
  let then = 0;

  // Working matrices (allocated once to avoid GC pressure)
  const viewMatrix = mat4.create();
  const projMatrix = mat4.create();

  function render(nowMs) {
    const now = nowMs * 0.001;
    if (then === 0) then = now;
    const dt = Math.min(now - then, 0.1); // Task D: dt clamped to 0.1 s
    then = now;

    if (!state.paused) {
      state.t += dt;
    }

    // 1. Build View Matrix
    // Variant Camera: Eye (0, 2.5, 7), Target (0, 0, 0), Up (0, 1, 0)
    // Left/Right arrows orbit eye around y-axis by azimuth angle
    const azRad = state.azimuth * (Math.PI / 180.0);
    const eyeX = 7.0 * Math.sin(azRad);
    const eyeY = 2.5;
    const eyeZ = 7.0 * Math.cos(azRad);
    mat4.lookAt(viewMatrix, [eyeX, eyeY, eyeZ], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    gl.uniformMatrix4fv(uViewMatrixLoc, false, viewMatrix);

    // 2. Build Projection Matrix
    const currentAspect = state.aspectOverride !== null ? state.aspectOverride : aspect;
    const near = state.nearOverride !== null ? state.nearOverride : 1.0;
    const far  = 20.0;

    if (!state.ortho) {
      // Perspective projection: fov in radians
      const fovRad = state.fovDeg * (Math.PI / 180.0);
      mat4.perspective(projMatrix, fovRad, currentAspect, near, far);
    } else {
      // Orthographic projection: matched to roughly the same visual size
      // Target distance d ≈ 7.433. For FOV = 45°, halfHeight = 7.433 * tan(22.5°) ≈ 3.08
      const halfHeight = 3.1;
      const halfWidth = halfHeight * currentAspect;
      mat4.ortho(projMatrix, -halfWidth, halfWidth, -halfHeight, halfHeight, near, far);
    }
    gl.uniformMatrix4fv(uProjectionMatrixLoc, false, projMatrix);

    // 3. Clear Screen
    gl.clearColor(0.08, 0.08, 0.10, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 4. Draw Cube
    const mCube = cubeModelMatrix(state.t);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, mCube);
    gl.drawArrays(gl.TRIANGLES, 0, CUBE_VERT_COUNT);

    // 5. Draw Solid (Two-step Staircase)
    const mSolid = solidModelMatrix(state.t, state.transformMode);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, mSolid);
    gl.drawArrays(gl.TRIANGLES, CUBE_VERT_COUNT, STAIR_VERT_COUNT);

    // 6. Update FPS (rolling 1-second average)
    fpsWindow.push(now);
    while (fpsWindow.length > 0 && fpsWindow[0] <= now - 1.0) {
      fpsWindow.shift();
    }
    const fps = fpsWindow.length;

    // 7. Update Status Label
    if (statusEl) {
      const projStr = state.ortho ? "Orthographic" : "Perspective";
      const fovStr  = state.ortho ? "N/A (ortho)" : `${state.fovDeg.toFixed(0)}°`;
      const pauseStr = state.paused ? " [PAUSED]" : "";
      statusEl.textContent =
        `Student ID: 240014 | Alinur S.${pauseStr}\n` +
        `Projection: ${projStr}\n` +
        `FOV:        ${fovStr}\n` +
        `Time (t):   ${state.t.toFixed(1)} s\n` +
        `FPS:        ${fps} fps\n` +
        `Controls:   [P] Pause  [O] Ortho  [+/-] FOV  [←/→] Orbit  [R] Reset`;
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // Expose hooks for write-up verification, automated tests, and recording
  window.__PA2__ = {
    state,
    gl,
    canvas,
    viewMatrix,
    projMatrix,
    cubeModelMatrix,
    solidModelMatrix,
    positions,
    colors
  };
}

/**
 * Task B: Cube Model Matrix
 * Cube stays at the origin (0, 0, 0) and spins at 1.2 rad/s
 * around the student's variant axis: 1 mod 3 = 1 → y-axis [0, 1, 0].
 */
function cubeModelMatrix(t) {
  const m = mat4.create();
  // Cube spin speed = 1.2 rad/s around y-axis
  mat4.rotate(m, m, 1.2 * t, [0.0, 1.0, 0.0]);
  return m;
}

/**
 * Task B: Solid Model Matrix
 * Solid orbits the cube at radius 2.5 in variant plane (0 mod 3 = 0 → horizontal around y)
 * with period T = 10.0 s (6 + 4).
 * Simultaneously spins around its own y-axis at 2.0 rad/s and pulses by s(t).
 * 
 * Matrix multiplication chain:
 *   M = R_orbit * T_orbit * R_self * S_pulse
 * 
 * In glMatrix (which post-multiplies M = M * op):
 *   1. mat4.rotateY (R_orbit)
 *   2. mat4.translate (T_orbit)
 *   3. mat4.rotateY (R_self)
 *   4. mat4.scale (S_pulse)
 * 
 * Supports transformMode for Task E1 write-up experiment:
 *   - 'normal': M = R_orbit * T * R_self * S
 *   - 'swapA':  M = T * R_orbit * R_self * S (swap orbit rotation & translation)
 *   - 'swapB':  M = R_orbit * R_self * T * S (swap translation & self-spin)
 */
function solidModelMatrix(t, mode = "normal") {
  const m = mat4.create();
  const orbitAngle = (2.0 * Math.PI / 10.0) * t; // T = 10 s
  const selfAngle  = 2.0 * t;                    // 2.0 rad/s
  const s          = 0.65 + 0.15 * Math.sin((2.0 * Math.PI * t) / 3.0);

  if (mode === "swapA") {
    // Experiment E1(a): Swap orbit rotation and translation
    // M = T * R_orbit * R_self * S
    mat4.translate(m, m, [2.5, 0.0, 0.0]);
    mat4.rotate(m, m, orbitAngle, [0.0, 1.0, 0.0]);
    mat4.rotate(m, m, selfAngle,  [0.0, 1.0, 0.0]);
    mat4.scale(m, m, [s, s, s]);
  } else if (mode === "swapB") {
    // Experiment E1(b): Swap translation and self-spin
    // M = R_orbit * R_self * T * S
    mat4.rotate(m, m, orbitAngle, [0.0, 1.0, 0.0]);
    mat4.rotate(m, m, selfAngle,  [0.0, 1.0, 0.0]);
    mat4.translate(m, m, [2.5, 0.0, 0.0]);
    mat4.scale(m, m, [s, s, s]);
  } else {
    // Standard correct motion:
    // 1. Orbit rotation around world y-axis
    mat4.rotate(m, m, orbitAngle, [0.0, 1.0, 0.0]);
    // 2. Orbit translation along x-axis (radius 2.5)
    mat4.translate(m, m, [2.5, 0.0, 0.0]);
    // 3. Self-spin around object's own local y-axis
    mat4.rotate(m, m, selfAngle,  [0.0, 1.0, 0.0]);
    // 4. Uniform scaling pulse
    mat4.scale(m, m, [s, s, s]);
  }

  return m;
}

/**
 * Helper: compile a WebGL shader with status check and error reporting
 */
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const typeName = type === gl.VERTEX_SHADER ? "vertex" : "fragment";
    console.error(`${typeName} shader compile error:\n${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Helper: create and link a WebGL program with link status check
 */
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Program link error:\n${gl.getProgramInfoLog(program)}`);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
