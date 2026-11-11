let backLeaves = [];
let middleLeaves = [];
let frontLeaves = [];
let backBranches = [];
let frontBranches = [];

function setup() {
  createCanvas(600, 800);
  angleMode(DEGREES);

  // Stop un-synced 60Hz loop; xr_harness will call redraw() synchronously with the Quest refresh rate
  noLoop();

  // Leaves in the back
  for (let i = 0; i < 180; i++) {
    backLeaves.push({
      x: random(-50, width + 50),
      y: random(-50, height + 50),
      w: random(20, 42),
      h: random(25, 48),
      angle: random(0, 360),
      shade: random(-15, 15)
    });
  }

  // Leaves in the middle
  for (let i = 0; i < 140; i++) {
    middleLeaves.push({
      x: random(-50, width + 50),
      y: random(-50, height + 50),
      w: random(25, 48),
      h: random(30, 55),
      angle: random(0, 360),
      shade: random(-15, 15)
    });
  }

  // Large leaves in front
  for (let i = 0; i < 80; i++) {
    frontLeaves.push({
      x: random(-50, width + 50),
      y: random(-50, height + 50),
      w: random(30, 58),
      h: random(35, 65),
      angle: random(0, 360),
      shade: random(-15, 15)
    });
  }

  // Branches in back
  for (let i = 0; i < 18; i++) {
    backBranches.push({
      x1: random(0, width),
      y1: random(0, height),
      x2: random(0, width),
      y2: random(0, height),
      thickness: random(2, 7)
    });
  }

  // Solid branches in front
  frontBranches = [
    [100, 800, 200, 450, 15],
    [200, 450, 260, 230, 12],
    [200, 450, 65, 350, 8],
    [260, 230, 390, 100, 8],
    [260, 230, 420, 300, 7],
    [150, 620, 350, 540, 9],
    [260, 230, 170, 120, 6],
    [350, 540, 470, 430, 6],
    [65, 350, 20, 240, 5]
  ];
}

function draw() {
  background(225, 229, 205);

  let backMove = map(mouseX, 0, width, -15, 15);
  let middleMove = map(mouseX, 0, width, -30, 30);
  let frontMove = map(mouseX, 0, width, -50, 50);

  // 1. Back Branches
  stroke(91, 64, 45, 55);
  for (let branch of backBranches) {
    strokeWeight(branch.thickness);
    line(branch.x1 + backMove, branch.y1, branch.x2 + backMove, branch.y2);
  }

  // 2. Back Leaves
  drawLeaves(backLeaves, backMove, 75, 75, 48, 95);

  // 3. Middle Leaves
  drawLeaves(middleLeaves, middleMove, 85, 125, 65, 165);

  // 4. Solid Branches
  stroke(91, 64, 45, 220);
  for (let branch of frontBranches) {
    strokeWeight(branch[4]);
    line(branch[0], branch[1], branch[2], branch[3]);
  }

  // 5. Front Leaves
  drawLeaves(frontLeaves, frontMove, 100, 155, 75, 235);
}

function drawLeaves(leaves, movement, red, green, blue, alpha) {
  noStroke();
  for (let leaf of leaves) {
    push();
    translate(leaf.x + movement, leaf.y);
    rotate(leaf.angle);
    fill(red + leaf.shade, green + leaf.shade, blue + leaf.shade, alpha);

    beginShape();
    vertex(0, -leaf.h / 2);
    vertex(leaf.w * 0.28, -leaf.h * 0.32);
    vertex(leaf.w / 2, -leaf.h * 0.18);
    vertex(leaf.w * 0.36, 0);
    vertex(leaf.w / 2, leaf.h * 0.22);
    vertex(leaf.w * 0.18, leaf.h * 0.38);
    vertex(0, leaf.h / 2);
    vertex(-leaf.w * 0.18, leaf.h * 0.38);
    vertex(-leaf.w / 2, leaf.h * 0.22);
    vertex(-leaf.w * 0.36, 0);
    vertex(-leaf.w / 2, -leaf.h * 0.18);
    vertex(-leaf.w * 0.28, -leaf.h * 0.32);
    endShape(CLOSE);
    pop();
  }
}