Trapped Knight visualization in p5.js
// Generates a square spiral, runs a greedy knight walk, and displays the path.

const N = 3000; // number of squares to generate in spiral
const S//CALE = 6; // pixels per grid unit
let coordOf = {};
let numAt = new Map();
let path = [];

function key(x, y) {
  return x + ',' + y;
}

function generateSpiral(N) {
  coordOf = {};
  numAt = new Map();
  let x = 0, y = 0, n = 1;
  coordOf[n] = [x, y];
  numAt.set(key(x, y), n);

  const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // right, up, left, down
  let stepLen = 1;

  while (n < N) {
    for (let dirIdx = 0; dirIdx < dirs.length; dirIdx++) {
      const [dx, dy] = dirs[dirIdx];
      for (let s = 0; s < stepLen && n < N; s++) {
        x += dx;
        y += dy;
        n += 1;
        coordOf[n] = [x, y];
        numAt.set(key(x, y), n);
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
    const k = key(x + dx, y + dy);
    if (numAtMap.has(k)) out.push(numAtMap.get(k));
  }
  return out;
}

function greedyKnightWalk(numAtMap, coordMap) {
  if (!coordMap[1]) return [];
  const visited = new Set([1]);
  const path = [1];
  let cur = coordMap[1];

  while (true) {
    const reachable = reachableNumbers(cur[0], cur[1], numAtMap);
    const unvisited = reachable.filter(r => !visited.has(r)).sort((a, b) => a - b);
    if (unvisited.length === 0) break;
    const nxt = unvisited[0];
    path.push(nxt);
    visited.add(nxt);
    cur = coordMap[nxt];
  }
  return path;
}

let drawIndex = 0;
let perFrame = 500; // how many points to draw per frame

function setup() {
  createCanvas(900, 900);
  colorMode(HSB, 360, 100, 100);
  background(0);
  noStroke();

  // generate spiral and path
  const res = generateSpiral(N);
  coordOf = res.coordOf;
  numAt = res.numAt;
  path = greedyKnightWalk(numAt, coordOf);

  // center
  textSize(14);
  fill(0, 0, 100);
}

function draw() {
  const cx = width / 2;
  const cy = height / 2;

  // draw incremental points for animation
  for (let i = 0; i < perFrame && drawIndex < path.length; i++, drawIndex++) {
    const num = path[drawIndex];
    const g = coordOf[num];
    const px = cx + g[0] * SCALE;
    const py = cy + g[1] * SCALE;
    const hue = map(drawIndex, 0, path.length, 0, 360);
    fill(hue, 90, 100);
    ellipse(px, py, 6, 6);
  }

  // when done, draw start/finish markers and stats
  if (drawIndex >= path.length) {
    noLoop();
    // start marker (white)
    const start = coordOf[path[0]];
    fill(0, 0, 100);
    stroke(0);
    strokeWeight(1);
    ellipse(cx + start[0] * SCALE, cy + start[1] * SCALE, 12, 12);

    // final marker (red)
    const last = coordOf[path[path.length - 1]];
    fill(0, 100, 100);
    noStroke();
    ellipse(cx + last[0] * SCALE, cy + last[1] * SCALE, 14, 14);

    // print stats
    fill(0, 0, 100);
    textAlign(LEFT, TOP);
    const stats = [
      `N = ${N}`,
      `Visited = ${path.length}`,
      `Moves = ${Math.max(0, path.length - 1)}`,
      `Final = ${path[path.length - 1]}`
    ];
    let y = 10;
    for (const s of stats) {
      text(s, 10, y);
      y += 18;
    }
  }
}
