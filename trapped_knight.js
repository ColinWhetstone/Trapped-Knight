// Trapped Knight visualization in p5.js
// Generates a square spiral, runs a greedy knight walk,
// draws a faint board underneath, and animates the knight one move at a time.

const N = 3000;   // number of squares to generate in spiral
const SCALE = 6;  // pixels per grid unit

let coordOf = {};
let numAt = new Map();
let path = [];

function coordKey(x, y) {
  return x + "," + y;
}

function generateSpiral(N) {
  coordOf = {};
  numAt = new Map();

  let x = 0, y = 0, n = 1;
  coordOf[n] = [x, y];
  numAt.set(coordKey(x, y), n);

  const dirs = [
    [1, 0],   // right
    [0, 1],   // up
    [-1, 0],  // left
    [0, -1]   // down
  ];
  let stepLen = 1;

  while (n < N) {
    for (let dirIdx = 0; dirIdx < dirs.length; dirIdx++) {
      const [dx, dy] = dirs[dirIdx];

      for (let s = 0; s < stepLen && n < N; s++) {
        x += dx;
        y += dy;
        n += 1;
        coordOf[n] = [x, y];
        numAt.set(coordKey(x, y), n);
      }

      if (dirIdx % 2 === 1) stepLen += 1;
      if (n >= N) break;
    }
  }

  return { coordOf, numAt };
}

function knightOffsets() {
  return [
    [2, 1], [1, 2], [-1, 2], [-2, 1],
    [-2, -1], [-1, -2], [1, -2], [2, -1]
  ];
}

function reachableNumbers(x, y, numAtMap) {
  const offsets = knightOffsets();
  const out = [];
  for (const [dx, dy] of offsets) {
    const k = coordKey(x + dx, y + dy);
    if (numAtMap.has(k)) out.push(numAtMap.get(k));
  }
  return out;
}

function greedyKnightWalk(numAtMap, coordMap) {
  if (!coordMap[1]) return [];

  const visited = new Set([1]);
  const seq = [1];
  let cur = coordMap[1];

  while (true) {
    const reachable = reachableNumbers(cur[0], cur[1], numAtMap);
    const unvisited = reachable
      .filter(r => !visited.has(r))
      .sort((a, b) => a - b);

    if (unvisited.length === 0) break;

    const nxt = unvisited[0];
    seq.push(nxt);
    visited.add(nxt);
    cur = coordMap[nxt];
  }

  return seq;
}

// --- Animation controls ---
let drawIndex = 0;
let speed = 1;       // moves per frame (1 = one-by-one)
let paused = false;

// Board display settings
const BOARD_MARGIN = 2;  // extra squares around visible area
const MAX_GRID_R = 75;   // cap so we don't draw a huge grid

function setup() {
  createCanvas(900, 900);
  colorMode(HSB, 360, 100, 100);
  textSize(14);
  textAlign(LEFT, TOP);

  const res = generateSpiral(N);
  coordOf = res.coordOf;
  numAt = res.numAt;
  path = greedyKnightWalk(numAt, coordOf);

  background(0);
}

function drawBoard(cx, cy, gridR) {
  // faint checkerboard
  noStroke();
  for (let gx = -gridR; gx <= gridR; gx++) {
    for (let gy = -gridR; gy <= gridR; gy++) {
      const px = cx + gx * SCALE;
      const py = cy + gy * SCALE;

      // alternate dark shades
      const isLight = (gx + gy) % 2 === 0;
      if (isLight) fill(0, 0, 12);  // slightly lighter
      else fill(0, 0, 6);          // slightly darker

      rect(px - SCALE / 2, py - SCALE / 2, SCALE, SCALE);
    }
  }
}

function draw() {
  if (paused) return;

  background(0);
  const cx = width / 2;
  const cy = height / 2;

  // Determine visible grid radius based on current knight location
  const curCoord = coordOf[path[min(drawIndex, path.length - 1)]];
  const maxAbs = max(abs(curCoord[0]), abs(curCoord[1])) + BOARD_MARGIN;
  const gridR = min(MAX_GRID_R, maxAbs);

  // 1) draw faint board underneath
  drawBoard(cx, cy, gridR);

  // 2) draw all visited points up to drawIndex
  for (let i = 0; i <= drawIndex && i < path.length; i++) {
    const num = path[i];
    const g = coordOf[num];
    const px = cx + g[0] * SCALE;
    const py = cy + g[1] * SCALE;

    const hue = map(i, 0, path.length, 0, 360);
    fill(hue, 90, 100);
    noStroke();
    ellipse(px, py, 6, 6);

    // faint line between moves
    if (i > 0) {
      const prevNum = path[i - 1];
      const pg = coordOf[prevNum];
      const ppx = cx + pg[0] * SCALE;
      const ppy = cy + pg[1] * SCALE;
      stroke(hue, 50, 90);
      strokeWeight(1);
      line(ppx, ppy, px, py);
      noStroke();
    }
  }

  // 3) draw moving "knight" marker with icon
  if (drawIndex < path.length) {
    const curNum2 = path[drawIndex];
    const cg = coordOf[curNum2];
    const kx = cx + cg[0] * SCALE;
    const ky = cy + cg[1] * SCALE;

    // base marker (white circle)
    fill(0, 0, 100);
    stroke(0);
    strokeWeight(2);
    ellipse(kx, ky, 16, 16);
    noStroke();

    // knight glyph on top (fallback still looks fine)
    fill(0, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("♞", kx, ky + 0.5);
    textAlign(LEFT, TOP);
    textSize(14);
  }

  // advance one move per frame
  drawIndex += speed;

  // stop & show stats at the end
  if (drawIndex >= path.length) {
    drawIndex = path.length - 1;
    noLoop();

    const last = coordOf[path[path.length - 1]];
    fill(0, 100, 100);
    ellipse(cx + last[0] * SCALE, cy + last[1] * SCALE, 18, 18);

    fill(0, 0, 100);
    textAlign(LEFT, TOP);
    text(`N = ${N}`, 10, 10);
    text(`Visited = ${path.length}`, 10, 28);
    text(`Moves = ${path.length - 1}`, 10, 46);
    text(`Final = ${path[path.length - 1]}`, 10, 64);
  }
}

// Keyboard controls:
// Space = pause/play
// + = faster
// - = slower
function keyPressed() {
  if (key === " ") paused = !paused;
  if (key === "+") speed = min(speed + 1, 50);
  if (key === "-") speed = max(speed - 1, 1);
}
