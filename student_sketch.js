let particles = [];

let rotateXValue = 0;
let rotateYValue = 0;

let previousMouseX;
let previousMouseY;
let isDragging = false;
let dragDist = 0;

// CAMERA
let insideView = false;
let cameraDistance = 650;
let targetCameraDistance = 650;

// FIVE LANDSCAPE LAYERS
let layerHeights = [-115, -60, 0, 75, 145];
let layerDepths = [-170, -90, 0, 85, 165];
let layerSizes = [1.8, 1.4, 1, 1.1, 0.75];

let layerColors = [
  [48, 67, 48],       // distant dark green
  [75, 96, 65],       // muted olive
  [112, 119, 83],     // moss
  [143, 119, 87],     // earthy brown
  [83, 72, 57]        // dark sediment
];

let layerCounts = [700, 850, 1100, 800, 750];

// FOUR ORIGINAL LANDSCAPE CENTERS
let centers = [
  [-115, -35, 0],
  [80, -75, 45],
  [120, 40, -35],
  [-70, 70, 45]
];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  for (let layer = 0; layer < 5; layer++) {
    for (let i = 0; i < layerCounts[layer]; i++) {
      let fragment = floor(random(4));
      let center = centers[fragment];
      let spread = layerSizes[layer];
      let angle = random(TWO_PI);
      let distanceFromCenter = sqrt(random()) * 75 * spread;

      let x = center[0] * spread + cos(angle) * distanceFromCenter;
      let z = center[2] * spread + sin(angle) * distanceFromCenter + layerDepths[layer];

      let terrain =
        sin(x * 0.025) * 13 +
        cos(z * 0.03) * 12 +
        sin((x + z) * 0.025) * 8;

      let y = center[1] * spread + terrain + layerHeights[layer];

      let detachedChance = 0.05;
      if (layer === 3) detachedChance = 0.10;
      if (layer === 4) detachedChance = 0.25;

      particles.push({
        x: x,
        y: y,
        z: z,
        originalX: x,
        originalY: y,
        originalZ: z,
        size: random(1.5, 3.2),
        driftX: random(-0.15, 0.15),
        driftY: random(-0.12, 0.12),
        driftZ: random(-0.15, 0.15),
        detached: random() < detachedChance,
        fragment: fragment,
        layer: layer,
        shade: random(0.8, 1.2)
      });
    }
  }
}

function draw() {
  background(23, 27, 24);

  // CAMERA
  targetCameraDistance = insideView ? 100 : 650;
  cameraDistance = lerp(cameraDistance, targetCameraDistance, 0.035);
  camera(0, 0, cameraDistance, 0, 0, 0, 0, 1, 0);

  // ROTATION
  rotateY(rotateYValue);
  rotateX(rotateXValue);

  // Render particles as 3D points (maintains smooth 60 FPS)
  strokeWeight(2.5);
  beginShape(POINTS);

  for (let p of particles) {
    if (p.detached) {
      p.x += p.driftX;
      p.y += p.driftY;
      p.z += p.driftZ;
      stroke(177, 157, 125, 170);
    } else {
      // Fixed: changed - 1.2 to * 1.2
      p.x = p.originalX + sin(frameCount * 0.008 + p.originalY) * 1.2;
      p.y = p.originalY + sin(frameCount * 0.010 + p.originalZ) * 1.8;
      p.z = p.originalZ + cos(frameCount * 0.008 + p.originalX) * 1.2;

      let c = layerColors[p.layer];
      stroke(c[0] * p.shade, c[1] * p.shade, c[2] * p.shade, 230);
    }

    vertex(p.x, p.y, p.z);
  }
  endShape();

  // GRADUAL DISPLACEMENT
  if (frameCount % 90 === 0 && particles.length > 0) {
    let idx = floor(random(particles.length));
    particles[idx].detached = true;
  }
}

// Fixed drag vs click disambiguation
function mousePressed() {
  previousMouseX = mouseX;
  previousMouseY = mouseY;
  dragDist = 0;
}

function mouseDragged() {
  let moveX = mouseX - previousMouseX;
  let moveY = mouseY - previousMouseY;

  dragDist += abs(moveX) + abs(moveY);

  rotateYValue += moveX * 0.01;
  rotateXValue += moveY * 0.01;

  previousMouseX = mouseX;
  previousMouseY = mouseY;
}

function mouseClicked() {
  // Only toggle camera zoom if the user clicked without dragging
  if (dragDist < 5) {
    insideView = !insideView;
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
