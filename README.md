# PA1 – 3D Shapes in WebGL

| Field | Value |
|---|---|
| **Student** | Alinur S. |
| **Student ID** | 240014 |
| **Course** | AR/VR/XR Applications (AIB), 6B04103 AI Business, 3rd year |
| **Assignment** | PA1 — 3D Shapes in WebGL |

---

## My Variant

- **Last digit of ID = 4 → Assigned solid: Two-step staircase**
  (step profile in the x–y plane, extruded along z; reference vertex count = 60)

- **Second-to-last digit = 1 → 1 mod 4 = 1 → Offset (o_x, o_y) = (−0.15, +0.15)**
  Visible side faces: **TOP** and **LEFT**

### Depth-illusion formula applied
```
xdraw = x + (−0.15) × (z + 0.5)
ydraw = y + (+0.15) × (z + 0.5)
```
Front vertices (z = −0.5): no shift. Back vertices (z = +0.5): full shift (−0.15, +0.15).

---

## How to Run

Serve from a local web server (do **not** open `index.html` directly as a `file://` URL):

```bash
# Option 1 – Python (built-in)
python -m http.server 8000
# Then open: http://localhost:8000

# Option 2 – Node http-server
npx http-server -p 8000

# Option 3 – VS Code Live Server
# Install "Live Server" extension, right-click index.html → Open with Live Server
```

Open **Chrome** or **Firefox**. The scene loads immediately on page open.

---

## Key Map

| Key | Effect |
|---|---|
| `1` | Drawing mode: `gl.TRIANGLES` (default) |
| `2` | Drawing mode: `gl.LINE_LOOP` |
| `3` | Drawing mode: `gl.LINES` |
| `4` | Drawing mode: `gl.LINE_STRIP` |
| `5` | Drawing mode: `gl.POINTS` (point size = 6 px) |
| `6` | Drawing mode: `gl.TRIANGLE_STRIP` |
| `D` | Toggle depth testing ON / OFF |
| `S` | Swap draw order: Cube first ↔ Staircase first |

The status label (top-left of canvas) shows the current mode, depth state and draw order.

---

## File Structure

```
PA1_240014_AlinurS/
├── index.html    – Canvas (900×900), status div, <script src="index.js">
├── index.js      – All WebGL/GLSL code (Ch.3 template structure, named functions)
├── README.md     – This file
└── writeup.pdf   – E1–E6 write-up with screenshots
```

---

## Geometry Summary

### Cube (Task B) — 36 vertices
- Placed in the **left half** (drawn x < 0)
- Front face: x ∈ [−0.75, −0.25], y ∈ [−0.25, +0.25], z = −0.5
- All 6 faces present; depth test reveals: **front, top, left**

### Two-step Staircase (Task C) — 60 vertices
- Placed in the **right half** (drawn x > 0)
- L-shaped profile: bottom step x ∈ [0.15, 0.65], top step x ∈ [0.15, 0.40]
- 8 faces: front, back, bottom, right, notch-H, notch-V, top, left
- Same position buffer as cube (`first = 36`, `count = 60`)

### Colours (Task D)
- Each face has a distinct flat colour; no two adjacent faces share a colour
- **Gradient face (cube):** front face (red → orange → yellow)
- **Gradient face (staircase):** front face (purple → magenta → pink)
