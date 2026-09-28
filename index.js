// PA1 – 3D Shapes in WebGL
// Student: Alinur S.   ID: 240014
// Variant: last digit 4 → Two-step staircase (60 vertices)
//          second-to-last digit 1 → 1 mod 4 = 1 → offset (-0.15, +0.15)
//          Visible faces: FRONT, TOP, LEFT

main();

function main() {

  /*========== Create a WebGL Context ==========*/
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error("WebGL unavailable – check browser support.");
    document.getElementById("status").textContent = "WebGL unavailable";
    return;
  }

  /*========== Define and Store the Geometry ==========*/

  // -----------------------------------------------------------------------
  // DEPTH ILLUSION RULE (Ch.3 style, no matrices)
  // ID 240014: second-to-last digit = 1, 1 mod 4 = 1 → (o_x, o_y) = (-0.15, +0.15)
  // xdraw = x + o_x * (z + 0.5)
  // ydraw = y + o_y * (z + 0.5)
  // Front vertices (z = -0.5) → factor = 0 → no shift
  // Back  vertices (z = +0.5) → factor = 1 → full shift
  // -----------------------------------------------------------------------
  const OX = -0.15;
  const OY = +0.15;

  /**
   * Apply the depth-illusion shift to a raw vertex [x, y, z].
   * Returns [xdraw, ydraw, z] — z is kept for depth testing.
   */
  function shift(x, y, z) {
    const factor = z + 0.5;          // 0 at front (z=-0.5), 1 at back (z=+0.5)
    return [x + OX * factor, y + OY * factor, z];
  }

  // -----------------------------------------------------------------------
  // TASK B – FULL CUBE (36 vertices, 12 triangles, 6 faces)
  // Size: 0.5 × 0.5 in x and y; depth z ∈ [-0.5, +0.5]
  // Placed in the LEFT half (all drawn x < 0)
  // Raw corners (before shift):
  //   Front: z = -0.5   fBL(-0.75,-0.25), fBR(-0.25,-0.25), fTR(-0.25,+0.25), fTL(-0.75,+0.25)
  //   Back:  z = +0.5   bBL(-0.75,-0.25), bBR(-0.25,-0.25), bTR(-0.25,+0.25), bTL(-0.75,+0.25)
  //          after shift: bBL(-0.90,-0.10), bBR(-0.40,-0.10), bTR(-0.40,+0.40), bTL(-0.90,+0.40)
  // -----------------------------------------------------------------------

  // Raw (unshifted) corner positions
  const fBL = [-0.75, -0.25, -0.5];
  const fBR = [-0.25, -0.25, -0.5];
  const fTR = [-0.25, +0.25, -0.5];
  const fTL = [-0.75, +0.25, -0.5];
  const bBL = [-0.75, -0.25, +0.5];
  const bBR = [-0.25, -0.25, +0.5];
  const bTR = [-0.25, +0.25, +0.5];
  const bTL = [-0.75, +0.25, +0.5];

  // Shifted corners
  const sfBL = shift(...fBL), sfBR = shift(...fBR);
  const sfTR = shift(...fTR), sfTL = shift(...fTL);
  const sbBL = shift(...bBL), sbBR = shift(...bBR);
  const sbTR = shift(...bTR), sbTL = shift(...bTL);

  /**
   * Build two CCW triangles from 4 corners forming a quad.
   * v0,v1,v2,v3 are the 4 corners in order (e.g. bottom-left, bottom-right, top-right, top-left).
   */
  function quad(v0, v1, v2, v3) {
    return [
      ...v0, ...v1, ...v2,   // triangle 1
      ...v0, ...v2, ...v3    // triangle 2
    ];
  }

  // 6 faces × 2 triangles × 3 vertices = 36 vertices
  const cubePositions = [
    // Front face  (z = -0.5)  – facing viewer
    ...quad(sfBL, sfBR, sfTR, sfTL),
    // Back face   (z = +0.5)  – facing away
    ...quad(sbBR, sbBL, sbTL, sbTR),
    // Top face    (y = +0.25) – visible with offset (-0.15,+0.15)
    ...quad(sfTL, sfTR, sbTR, sbTL),
    // Bottom face (y = -0.25)
    ...quad(sbBL, sbBR, sfBR, sfBL),
    // Left face   (x = -0.75) – visible with offset (-0.15,+0.15)
    ...quad(sbBL, sfBL, sfTL, sbTL),
    // Right face  (x = -0.25)
    ...quad(sfBR, sbBR, sbTR, sfTR),
  ];
  console.assert(cubePositions.length === 36 * 3,
    `Cube position array: expected ${36*3}, got ${cubePositions.length}`);

  // -----------------------------------------------------------------------
  // TASK C – TWO-STEP STAIRCASE (60 vertices, variant digit = 4)
  // Profile in x-y plane, extruded along z ∈ [-0.5, +0.5]
  // Placed in RIGHT half (all drawn x > 0)
  //
  // Raw profile (before shift):
  //   Bottom step: x ∈ [0.15, 0.65], y ∈ [-0.30, -0.05]
  //   Top step:    x ∈ [0.15, 0.40], y ∈ [-0.05, +0.30]
  //
  //  y
  //  +0.30  ┌──────┐
  //         │ top  │
  //  -0.05  │      └──────────┐
  //         │    bottom       │
  //  -0.30  └─────────────────┘
  //         x=0.15  x=0.40   x=0.65
  //
  // Faces:
  //  1. Front face  (z=-0.5): 4 triangles to fill L-shape = 12 vertices
  //  2. Back face   (z=+0.5): same L-shape, shifted        = 12 vertices
  //  3-8. 6 rectangular side faces × 6 vertices each       = 36 vertices
  //  Total = 60 ✓
  // -----------------------------------------------------------------------

  // Raw profile corners (L-shape, front face z=-0.5)
  // Named by position around the L outline clockwise from bottom-left
  // Profile shifted right by 0.05 vs original so that after depth-illusion
  // back-face shift of -0.15 the leftmost drawn x is 0.20-0.15 = 0.05 > 0 ✓
  const s_A = [0.20, -0.30, -0.5];   // bottom-left
  const s_B = [0.70, -0.30, -0.5];   // bottom-right
  const s_C = [0.70, -0.05, -0.5];   // inner-right (step corner)
  const s_D = [0.45, -0.05, -0.5];   // inner notch-right
  const s_E = [0.45, +0.30, -0.5];   // top-right
  const s_F = [0.20, +0.30, -0.5];   // top-left

  // Back face raw profile (same x,y, z=+0.5)
  const s_A2 = [0.20, -0.30, +0.5];
  const s_B2 = [0.70, -0.30, +0.5];
  const s_C2 = [0.70, -0.05, +0.5];
  const s_D2 = [0.45, -0.05, +0.5];
  const s_E2 = [0.45, +0.30, +0.5];
  const s_F2 = [0.20, +0.30, +0.5];

  // Shifted versions
  const ssA  = shift(...s_A),  ssB  = shift(...s_B),  ssC  = shift(...s_C);
  const ssD  = shift(...s_D),  ssE  = shift(...s_E),  ssF  = shift(...s_F);
  const ssA2 = shift(...s_A2), ssB2 = shift(...s_B2), ssC2 = shift(...s_C2);
  const ssD2 = shift(...s_D2), ssE2 = shift(...s_E2), ssF2 = shift(...s_F2);

  // Front L-face: triangulate into 4 triangles (12 vertices)
  // Split: main rect (A,B,C,D intermediate?), need fan or explicit split
  // L-shape vertices in order: A(bot-left), B(bot-right), C(step-right), D(notch-right), E(top-right), F(top-left)
  // Fan from A: A-B-C, A-C-D, A-D-E, A-E-F
  const stairFront = [
    ...ssA, ...ssB, ...ssC,
    ...ssA, ...ssC, ...ssD,
    ...ssA, ...ssD, ...ssE,
    ...ssA, ...ssE, ...ssF,
  ]; // 12 vertices

  // Back L-face: same, wound opposite for correct face (B2->A2 order)
  const stairBack = [
    ...ssB2, ...ssA2, ...ssF2,
    ...ssB2, ...ssF2, ...ssE2,
    ...ssB2, ...ssE2, ...ssD2,
    ...ssB2, ...ssD2, ...ssC2,
  ]; // 12 vertices

  // Side faces (6 rectangular faces, each 2 triangles = 6 vertices):
  // 1. Bottom face: A→B (front) and B2→A2 (back)  [y = -0.30]
  const stairBottom   = quad(ssA2, ssB2, ssB, ssA);      // 6 verts

  // 2. Right face of bottom step: B→C [x = 0.65, y = -0.30 to -0.05]
  const stairRight    = quad(ssB, ssB2, ssC2, ssC);      // 6 verts (front to back)

  // 3. Step horizontal top (notch): C→D [y = -0.05, x = 0.40 to 0.65]
  const stairNotchH   = quad(ssC2, ssC, ssD, ssD2);      // 6 verts

  // 4. Step vertical (inner): D→E [x = 0.40, y = -0.05 to +0.30]
  const stairNotchV   = quad(ssD, ssD2, ssE2, ssE);      // 6 verts

  // 5. Top face of top step: E→F [y = +0.30]
  const stairTop      = quad(ssE, ssE2, ssF2, ssF);      // 6 verts

  // 6. Left face: F→A [x = 0.15]
  const stairLeft     = quad(ssF2, ssA2, ssA, ssF);      // 6 verts

  const stairPositions = [
    ...stairFront,
    ...stairBack,
    ...stairBottom,
    ...stairRight,
    ...stairNotchH,
    ...stairNotchV,
    ...stairTop,
    ...stairLeft,
  ];
  console.assert(stairPositions.length === 60 * 3,
    `Stair position array: expected ${60*3}, got ${stairPositions.length}`);

  // -----------------------------------------------------------------------
  // Combined position buffer: cube (36 verts) then staircase (60 verts)
  // -----------------------------------------------------------------------
  const positions = [...cubePositions, ...stairPositions];
  const CUBE_VERT_COUNT  = cubePositions.length  / 3;   // 36
  const STAIR_VERT_COUNT = stairPositions.length / 3;   // 60
  console.assert(CUBE_VERT_COUNT  === 36, "Cube vertex count check");
  console.assert(STAIR_VERT_COUNT === 60, "Stair vertex count check");

  // -----------------------------------------------------------------------
  // TASK D – COLOURS
  // Every face: distinct flat colour; no two adjacent faces the same.
  // Exactly ONE visible face per solid has a gradient (≥3 different vertex colours).
  //
  // CUBE colours (per face, 6 vertices each):
  //   Front  → GRADIENT (red→orange→yellow – the most visible face)
  //   Back   → dark grey
  //   Top    → cyan / teal  (visible)
  //   Bottom → brown
  //   Left   → lime green   (visible)
  //   Right  → dark blue
  //
  // STAIRCASE colours (per-face section):
  //   Front  → GRADIENT (purple→magenta→pink)
  //   Back   → dark navy
  //   Bottom → deep orange
  //   Right  → steel blue
  //   NotchH → olive
  //   NotchV → hot pink
  //   Top    → gold
  //   Left   → forest green
  // -----------------------------------------------------------------------

  /**
   * Returns an array of n × 4 float values all equal to [r,g,b,a].
   */
  function flatColor(n, r, g, b, a = 1.0) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(r, g, b, a);
    return arr;
  }

  // CUBE colour arrays (6 vertices per face)
  const cubeFront_colors = [
    // Gradient: triangle 1 – red, orange, yellow
    1.0, 0.0, 0.0, 1.0,   // BL – red
    1.0, 0.5, 0.0, 1.0,   // BR – orange
    1.0, 1.0, 0.0, 1.0,   // TR – yellow
    // triangle 2
    1.0, 0.0, 0.0, 1.0,   // BL – red
    1.0, 1.0, 0.0, 1.0,   // TR – yellow
    1.0, 0.6, 0.2, 1.0,   // TL – light-orange
  ];
  const cubeBack_colors   = flatColor(6, 0.20, 0.20, 0.20);  // dark grey
  const cubeTop_colors    = flatColor(6, 0.00, 0.90, 0.85);  // teal/cyan
  const cubeBottom_colors = flatColor(6, 0.50, 0.25, 0.00);  // brown
  const cubeLeft_colors   = flatColor(6, 0.20, 0.80, 0.20);  // lime green
  const cubeRight_colors  = flatColor(6, 0.10, 0.10, 0.70);  // dark blue

  const cubeColors = [
    ...cubeFront_colors,
    ...cubeBack_colors,
    ...cubeTop_colors,
    ...cubeBottom_colors,
    ...cubeLeft_colors,
    ...cubeRight_colors,
  ];
  console.assert(cubeColors.length === 36 * 4,
    `Cube color array: expected ${36*4}, got ${cubeColors.length}`);

  // STAIRCASE colour arrays
  // Front = gradient (12 vertices, 4 triangles fan)
  const stairFront_colors = [
    // tri 1: A,B,C – purple→magenta→deep pink
    0.55, 0.00, 0.80, 1.0,
    0.90, 0.00, 0.60, 1.0,
    1.00, 0.10, 0.90, 1.0,
    // tri 2: A,C,D
    0.55, 0.00, 0.80, 1.0,
    1.00, 0.10, 0.90, 1.0,
    0.85, 0.00, 1.00, 1.0,
    // tri 3: A,D,E
    0.55, 0.00, 0.80, 1.0,
    0.85, 0.00, 1.00, 1.0,
    0.70, 0.00, 0.90, 1.0,
    // tri 4: A,E,F
    0.55, 0.00, 0.80, 1.0,
    0.70, 0.00, 0.90, 1.0,
    0.60, 0.00, 0.85, 1.0,
  ]; // 12 × 4 = 48 floats

  const stairBack_colors   = flatColor(12, 0.05, 0.05, 0.25);  // dark navy
  const stairBottom_colors = flatColor(6,  0.85, 0.35, 0.00);  // deep orange
  const stairRight_colors  = flatColor(6,  0.27, 0.51, 0.71);  // steel blue
  const stairNotchH_colors = flatColor(6,  0.50, 0.50, 0.00);  // olive
  const stairNotchV_colors = flatColor(6,  1.00, 0.08, 0.58);  // hot pink
  const stairTop_colors    = flatColor(6,  1.00, 0.84, 0.00);  // gold
  const stairLeft_colors   = flatColor(6,  0.13, 0.55, 0.13);  // forest green

  const stairColors = [
    ...stairFront_colors,
    ...stairBack_colors,
    ...stairBottom_colors,
    ...stairRight_colors,
    ...stairNotchH_colors,
    ...stairNotchV_colors,
    ...stairTop_colors,
    ...stairLeft_colors,
  ];
  console.assert(stairColors.length === 60 * 4,
    `Stair color array: expected ${60*4}, got ${stairColors.length}`);

  // Combined colour buffer (same order as positions)
  const colors = [...cubeColors, ...stairColors];
  const TOTAL_VERTS = CUBE_VERT_COUNT + STAIR_VERT_COUNT; // 96
  console.assert(colors.length === TOTAL_VERTS * 4,
    `Total color array: expected ${TOTAL_VERTS*4}, got ${colors.length}`);

  // -----------------------------------------------------------------------
  // Initialise GPU buffers
  // -----------------------------------------------------------------------
  const buffers = initBuffers(gl, positions, colors);
  if (!buffers) return;

  /*========== Shaders ==========*/

  /*====== Define shader source ======*/
  const vsSource = `
    attribute vec4 aPosition;
    attribute vec4 aVertexColor;
    varying lowp vec4 vColor;
    void main() {
      gl_Position  = aPosition;
      gl_PointSize = 6.0;
      vColor       = aVertexColor;
    }
  `;

  const fsSource = `
    precision mediump float;
    varying lowp vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `;

  /*====== Create shaders ======*/
  const vertexShader   = createShader(gl, gl.VERTEX_SHADER,   vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return;

  /*====== Create shader program ======*/
  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return;

  /*====== Connect the attribute with the vertex shader ======*/

  // Position attribute
  const posAttribLoc   = gl.getAttribLocation(program, "aPosition");
  // Colour attribute
  const colorAttribLoc = gl.getAttribLocation(program, "aVertexColor");

  // Bind position buffer → tell GPU how to read it
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(posAttribLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posAttribLoc);

  // Bind colour buffer → tell GPU how to read it
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(colorAttribLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorAttribLoc);

  // Verify buffer sizes (Task E6 support)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  console.log(`Position buffer size: ${gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE)} bytes` +
    ` (expected ${TOTAL_VERTS * 3 * 4})`);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  console.log(`Color buffer size: ${gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE)} bytes` +
    ` (expected ${TOTAL_VERTS * 4 * 4})`);
  console.log(`Total vertices N = ${TOTAL_VERTS}`);

  /*========== Drawing ==========*/

  // Application state
  const MODE_NAMES = {
    [gl.TRIANGLES]:      "gl.TRIANGLES",
    [gl.LINE_LOOP]:      "gl.LINE_LOOP",
    [gl.LINES]:          "gl.LINES",
    [gl.LINE_STRIP]:     "gl.LINE_STRIP",
    [gl.POINTS]:         "gl.POINTS",
    [gl.TRIANGLE_STRIP]: "gl.TRIANGLE_STRIP",
  };
  const state = {
    mode:      gl.TRIANGLES,
    depth:     true,
    cubeFirst: true,
  };

  /*====== Draw the points to the screen ======*/
  function render() {
    // Clear
    gl.clearColor(0.13, 0.13, 0.15, 1.0);
    if (state.depth) {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    } else {
      gl.disable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    const mode  = state.mode;
    const cube  = { first: 0,                 count: CUBE_VERT_COUNT  };
    const stair = { first: CUBE_VERT_COUNT,   count: STAIR_VERT_COUNT };

    if (state.cubeFirst) {
      gl.drawArrays(mode, cube.first,  cube.count);
      gl.drawArrays(mode, stair.first, stair.count);
    } else {
      gl.drawArrays(mode, stair.first, stair.count);
      gl.drawArrays(mode, cube.first,  cube.count);
    }

    // Update status label
    const orderStr = state.cubeFirst ? "Cube → Staircase" : "Staircase → Cube";
    document.getElementById("status").textContent =
      `ID: 240014 | Alinur S.\n` +
      `Mode:  ${MODE_NAMES[mode]}\n` +
      `Depth: ${state.depth ? "ON" : "OFF"}\n` +
      `Order: ${orderStr}\n` +
      `[1-6] mode  [D] depth  [S] swap order`;
  }

  // Keyboard handler
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "1": state.mode = gl.TRIANGLES;      break;
      case "2": state.mode = gl.LINE_LOOP;       break;
      case "3": state.mode = gl.LINES;           break;
      case "4": state.mode = gl.LINE_STRIP;      break;
      case "5": state.mode = gl.POINTS;          break;
      case "6": state.mode = gl.TRIANGLE_STRIP;  break;
      case "d": case "D": state.depth = !state.depth; break;
      case "s": case "S": state.cubeFirst = !state.cubeFirst; break;
      default: return; // ignore other keys
    }
    render(); // single redraw per change — no animation loop
  });

  render(); // initial draw
}

// -------------------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------------------

/**
 * createShader – compile one shader; check COMPILE_STATUS; log on failure.
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
 * createProgram – attach shaders, link, check LINK_STATUS; useProgram on success.
 */
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Program link error:\n${gl.getProgramInfoLog(program)}`);
    return null;
  }

  gl.useProgram(program);
  return program;
}

/**
 * initBuffers – create and populate the position and colour buffers.
 * Returns { position, color } or null on failure.
 */
function initBuffers(gl, positions, colors) {
  // Position buffer
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) { console.error("Failed to create position buffer"); return null; }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Colour buffer
  const colorBuffer = gl.createBuffer();
  if (!colorBuffer) { console.error("Failed to create colour buffer"); return null; }
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return { position: positionBuffer, color: colorBuffer };
}
