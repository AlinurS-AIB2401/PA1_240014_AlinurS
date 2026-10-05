# PA2 — Matrix Transformations and Perspective

| Field | Value |
|---|---|
| **Student** | Alinur S. |
| **Student ID** | 240014 |
| **Group** | AIB-2401 |
| **Course** | AR/VR/XR Applications (AIB), 6B04103 AI Business, 3rd year |
| **Assignment** | PA2 — Matrix Transformations and Perspective |
| **Repository** | https://github.com/AlinurS-AIB2401/PA1_240014_AlinurS |

---

## 1. Personal Variant Parameters (ID: 240014)

Reading digits from the right:
- **Last digit = 4**:
  - **Assigned Solid:** Two-step staircase (PA1 solid, extruded along z, 60 vertices).
  - **Orbit Period T:** $6 + 4 = \mathbf{10.0\text{ s}}$ per full orbit ($\omega_{\text{orbit}} = 0.2\pi \approx 0.6283\text{ rad/s}$).
- **2nd-to-last digit = 1**:
  - **Cube Spin Axis:** $1 \bmod 3 = 1 \implies \mathbf{y\text{-axis}}\ [0, 1, 0]$ (spin speed: $1.2\text{ rad/s}$).
- **3rd-to-last digit = 0**:
  - **Orbit Plane:** $0 \bmod 3 = 0 \implies \mathbf{horizontal\text{ plane}}$ (around world y-axis, orbit radius $R = 2.5$).
- **4th-to-last digit = 0**:
  - **Camera Setup:** $0 \bmod 2 = 0 \implies \mathbf{eye}\ (0, 2.5, 7)$, $\mathbf{target}\ (0, 0, 0)$, $\mathbf{up}\ (0, 1, 0)$, $\mathbf{FOV}\ 45^\circ$.

### Fixed Parameters for Everyone:
- **Cube Spin Speed:** $1.2\text{ rad/s}$ around y-axis.
- **Orbit Radius:** $2.5\text{ units}$ from cube center.
- **Solid Self-Spin:** $2.0\text{ rad/s}$ around its own local y-axis.
- **Solid Scale Pulse:** $s(t) = 0.65 + 0.15 \cdot \sin(2\pi t / 3)$, with $t$ in seconds.
- **Camera Target & Up:** Target $(0, 0, 0)$, Up $(0, 1, 0)$.

---

## 2. How to Run

Serve the project folder from a local web server (do **not** open via `file://` URL due to browser security restrictions on WebGL and scripts):

```bash
# Option 1 — Python 3 (built-in)
python -m http.server 8000
# Then navigate to: http://localhost:8000

# Option 2 — Node.js npx http-server
npx http-server -p 8000

# Option 3 — VS Code Live Server
# Right click index.html -> "Open with Live Server"
```

Open **Google Chrome** or **Mozilla Firefox**. The 3D animated WebGL scene starts running immediately on page load.

---

## 3. Interactive Keyboard Controls (Task E)

| Key | Action / Effect |
|---|---|
| `P` | **Pause / Resume:** Freezes simulated time $t$. Resuming continues smoothly from the exact same pose without jumping. |
| `O` | **Toggle Projection:** Switches between **Perspective** (FOV 45°) and **Orthographic** (half-height 3.1) of matching visual size. |
| `+` or `=` | **Zoom In (FOV +5°):** Increases vertical FOV up to a limit of $100^\circ$ (Perspective mode only). Accepts both `+` and `=` (no Shift required). |
| `-` or `_` | **Zoom Out (FOV -5°):** Decreases vertical FOV down to a limit of $20^\circ$ (Perspective mode only). |
| `←` (ArrowLeft) | **Camera Orbit Left:** Orbits camera eye around world y-axis by $-5^\circ$ per press. |
| `→` (ArrowRight) | **Camera Orbit Right:** Orbits camera eye around world y-axis by $+5^\circ$ per press. |
| `R` | **Reset:** Restores camera eye, azimuth, FOV ($45^\circ$), projection (Perspective), and simulation time ($t = 0$) to initial values. |

### Status Overlay:
The top-left status label displays live application state:
1. **Student ID & Name:** `240014 | Alinur S.` (with `[PAUSED]` indicator when paused)
2. **Projection Type:** `Perspective` or `Orthographic`
3. **Field of View:** Current FOV in degrees (or `N/A (ortho)` when orthographic is active)
4. **Simulated Time (t):** Current simulation time to one decimal place (`X.X s`)
5. **Frame Rate (FPS):** Accurate rolling average FPS over the last 1.0 second
6. **Key Control Legend:** Quick shortcut reminder

---

## 4. Technical Architecture & Implementation Summary

- **Task A (Setup & Structure):**
  - glMatrix 2.8.1 is loaded via `<script>` before `index.js`.
  - All shaders, buffers, attribute pointers, and uniform locations are initialized **once** during startup outside the render loop.
  - The canvas dynamically resizes with `window.devicePixelRatio`, correctly calling `gl.viewport` and updating the projection aspect ratio on resize.
- **Task B (Model Transformations):**
  - Cube re-modeled centered on origin $[-0.5, +0.5]^3$ (36 vertices).
  - Two-step staircase centered on its own origin $[-0.5, +0.5]^3$ (60 vertices).
  - Both shapes reside in a single position buffer and are drawn using separate `gl.drawArrays` calls (`first=0, count=36` and `first=36, count=60`).
  - Model matrices built via dedicated functions `cubeModelMatrix(t)` and `solidModelMatrix(t)` using `mat4.translate`, `mat4.rotate`, and `mat4.scale`.
  - Transformation order: $M = R_{\text{orbit}} \cdot T \cdot R_{\text{self}} \cdot S$.
- **Task C (Camera & Projection):**
  - Three uniforms with exact vertex shader line: `gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;`.
  - View matrix generated with `mat4.lookAt(view, eye, target, up)`.
  - Perspective projection generated with `mat4.perspective(proj, fovRad, aspect, 1.0, 20.0)`.
  - Orthographic projection generated with `mat4.ortho(proj, -halfWidth, halfWidth, -halfHeight, halfHeight, 1.0, 20.0)` where `halfHeight = 3.1`.
  - Depth testing enabled with `gl.enable(gl.DEPTH_TEST)` and `gl.depthFunc(gl.LEQUAL)`.
- **Task D (Animation & Frame-Rate Independence):**
  - Driven by `requestAnimationFrame(render)` computing $\Delta t = \min(\text{now} - \text{then}, 0.1)$.
  - Time $t$ is incremented by $\Delta t$; motions are functions of $t$ rather than frame count.
  - $\Delta t$ is clamped to 0.1 s to prevent animation jumps when switching browser tabs.
- **Task E (Controls & Diagnostics):**
  - Complete keyboard navigation with bounds checking and status feedback.

---

## 5. File Structure of Submission

```
PA2_240014_AlinurS.zip
├── index.html        – Fullscreen canvas, glMatrix 2.8.1 tag, status overlay, index.js
├── index.js          – Complete WebGL application and transformation logic
├── README.md         – This documentation and variant guide
├── writeup.pdf       – 3-page illustrated write-up answering E1–E6 with development log
└── demo.webm         – 25-second HD video recording of orbit and all key controls
```
