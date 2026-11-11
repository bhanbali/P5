let particles = [];

let rotateXValue = 0;
let rotateYValue = 0;

let previousMouseX;
let previousMouseY;

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


// ==========================================
// SETUP
// ==========================================

function setup() {

  createCanvas(windowWidth, windowHeight, WEBGL);

  // CREATE FIVE DIFFERENT LAYERS

  for (let layer = 0; layer < 5; layer++) {

    for (let i = 0; i < layerCounts[layer]; i++) {

      let fragment = floor(random(4));

      let center = centers[fragment];

      let spread = layerSizes[layer];

      let angle = random(TWO_PI);

      let distanceFromCenter =
        sqrt(random()) * 75 * spread;

      let x =
        center[0] * spread +
        cos(angle) * distanceFromCenter;

      let z =
        center[2] * spread +
        sin(angle) * distanceFromCenter +
        layerDepths[layer];

      // ORGANIC TERRAIN SURFACE

      let terrain =
        sin(x * 0.025) * 13 +
        cos(z * 0.03) * 12 +
        sin((x + z) * 0.025) * 8;

      let y =
        center[1] * spread +
        terrain +
        layerHeights[layer];

      // MAKE THE LOWER LAYERS MORE FRAGMENTED

      let detachedChance = 0.05;

      if (layer == 3) {
        detachedChance = 0.10;
      }

      if (layer == 4) {
        detachedChance = 0.25;
      }

      let particle = {

        x: x,
        y: y,
        z: z,

        originalX: x,
        originalY: y,
        originalZ: z,

        size: random(1.3, 2.8),

        driftX: random(-0.15, 0.15),
        driftY: random(-0.12, 0.12),
        driftZ: random(-0.15, 0.15),

        detached: random() < detachedChance,

        fragment: fragment,
        layer: layer,

        shade: random(0.8, 1.2)

      };

      particles.push(particle);

    }

  }

}


// ==========================================
// DRAW
// ==========================================

function draw() {

  background(23, 27, 24);

  // CAMERA MOVEMENT

  if (insideView) {
    targetCameraDistance = 100;
  } else {
    targetCameraDistance = 650;
  }

  cameraDistance = lerp(
    cameraDistance,
    targetCameraDistance,
    0.035
  );

  camera(
    0, 0, cameraDistance,
    0, 0, 0,
    0, 1, 0
  );

  // LIGHTING

  ambientLight(110);

  directionalLight(
    190, 190, 165,
    -1, -1, -1
  );

  pointLight(
    190, 175, 145,
    0, -100, 250
  );

  // ROTATION

  rotateY(rotateYValue);
  rotateX(rotateXValue);

  noStroke();

  // DRAW PARTICLES

  for (let p of particles) {

    // NATURAL MOVEMENT

    if (p.detached) {

      p.x += p.driftX;
      p.y += p.driftY;
      p.z += p.driftZ;

    } else {

      p.x = p.originalX +
        sin(frameCount * 0.008 + p.originalY) * 1.2;

      p.y = p.originalY +
        sin(frameCount * 0.01 + p.originalZ) * 1.8;

      p.z = p.originalZ +
        cos(frameCount * 0.008 + p.originalX) * 1.2;

    }

    // LAYER COLORS

    let colorChoice = layerColors[p.layer];

    if (p.detached) {

      fill(
        177,
        157,
        125,
        170
      );

    } else {

      fill(
        colorChoice[0] * p.shade,
        colorChoice[1] * p.shade,
        colorChoice[2] * p.shade,
        230
      );

    }

    push();

    translate(p.x, p.y, p.z);

    sphere(p.size, 5, 4);

    pop();

  }

  // GRADUAL DISPLACEMENT

  if (frameCount % 90 == 0) {

    let particleNumber =
      floor(random(particles.length));

    particles[particleNumber].detached = true;

  }

}


// ==========================================
// CLICK TO ENTER OR EXIT
// ==========================================

function mouseClicked() {

  insideView = !insideView;

  return false;

}


// ==========================================
// MOUSE ROTATION
// ==========================================

function mousePressed() {

  previousMouseX = mouseX;
  previousMouseY = mouseY;

}


function mouseDragged() {

  let movementX = mouseX - previousMouseX;
  let movementY = mouseY - previousMouseY;

  rotateYValue += movementX * 0.01;
  rotateXValue += movementY * 0.01;

  previousMouseX = mouseX;
  previousMouseY = mouseY;

}


// ==========================================
// RESIZE
// ==========================================

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

}
