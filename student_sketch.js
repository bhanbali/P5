var bubbles = [];
var bags = [];
var bagModel;
var plasticTexture;
var modelLoaded = false;
var textureLoaded = false;

// Zoom / Fear parameter (can be toggled or animated)
var fearLevel = 0.5;

function preload() {
  // Preloading ensures assets are ready before the WebXR session starts
  bagModel = loadModel("test_model.obj", true, 
    () => { modelLoaded = true; },
    (err) => { console.log("Model load error:", err); }
  );

  plasticTexture = loadImage("test_texture.jpg",
    () => { textureLoaded = true; },
    (err) => { console.log("Texture load error:", err); }
  );
}

function setup() {
  // Create WebXR-enabled canvas (falls back gracefully to standard WebGL if no VR)
  createVRCanvas();

  // Populate floating underwater bubbles around the player (in meters)
  for (var i = 0; i < 45; i++) {
    bubbles.push({
      x: random(-6, 6),
      y: random(-4, 4),
      z: random(-6, 6),
      size: random(0.02, 0.06),
      speed: random(0.005, 0.015)
    });
  }

  // Position bags distributed around the viewer at eye level
  var positions = [
    { x: 0,    y: 0,    z: -3.0 },
    { x: -2.5, y: -0.5, z: -2.0 },
    { x: 2.2,  y: -0.8, z: -2.5 },
    { x: -3.0, y: 1.0,  z: -1.2 },
    { x: 2.8,  y: 0.9,  z: -1.5 },
    { x: -1.2, y: 1.8,  z: -2.8 },
    { x: 1.0,  y: -1.8, z: -2.2 }
  ];

  for (var i = 0; i < positions.length; i++) {
    bags.push(createBag(positions[i].x, positions[i].y, positions[i].z, i));
  }
}

function createBag(x, y, z, index) {
  var bag = {
    x: x,
    y: y,
    z: z,
    size: random(0.85, 1.15),
    rotation: random(-PI, PI),
    rotationX: random(-0.25, 0.25),
    rotationZ: random(-0.35, 0.35),
    speed: random(0.002, 0.006),
    fold: random(1000),
    eyes: []
  };

  // Add default eyes
  if (index < 4) {
    bag.eyes.push({ x: -0.075, y: 0.32, z: -0.23, nx: 0, ny: 0, nz: -1 });
    bag.eyes.push({ x: 0.075,  y: 0.32, z: -0.23, nx: 0, ny: 0, nz: -1 });
  } else {
    bag.eyes.push({ x: 0,      y: 0.32, z: -0.23, nx: 0, ny: 0, nz: -1 });
  }

  return bag;
}

function draw() {
  // Deep underwater ocean background
  background(5, 45, 70);

  // Lighting setup for VR stereoscopic depth
  ambientLight(100, 110, 120);
  directionalLight(220, 235, 245, -0.5, -1, -0.5);
  pointLight(120, 190, 220, 0, 2, 0);

  drawBubbles();

  if (modelLoaded) {
    for (var i = 0; i < bags.length; i++) {
      drawBag(bags[i], fearLevel);
    }
  }
}

function drawBubbles() {
  push();
  noStroke();
  ambientMaterial(170, 220, 235);
  for (var i = 0; i < bubbles.length; i++) {
    var b = bubbles[i];
    push();
    translate(b.x, b.y, b.z);
    sphere(b.size);
    pop();

    // Float upwards
    b.y += b.speed;
    if (b.y > 4) {
      b.y = -4;
      b.x = random(-6, 6);
      b.z = random(-6, 6);
    }
  }
  pop();
}

function getBagRotationX(bag) {
  return sin(frameCount * 0.012 + bag.fold) * 0.08 + bag.rotationX;
}

function getBagRotationZ(bag) {
  return sin(frameCount * 0.01 + bag.fold) * 0.08 + bag.rotationZ;
}

function getBagRotationY(bag) {
  return bag.rotation + frameCount * bag.speed;
}

function drawBag(bag, fear) {
  push();
  translate(bag.x, bag.y, bag.z);
  rotateY(getBagRotationY(bag));
  rotateX(getBagRotationX(bag));
  rotateZ(getBagRotationZ(bag));
  rotateX(PI); // Invert OBJ orientation if exported upside down

  // VR meter scale factor
  scale(0.85 * bag.size);

  noStroke();
  if (fear < 0.45) {
    ambientMaterial(25, 35, 40);
    model(bagModel);
  } else {
    if (textureLoaded) {
      texture(plasticTexture);
    } else {
      ambientMaterial(12, 17, 20);
    }
    model(bagModel);
  }

  if (fear > 0.45) {
    for (var j = 0; j < bag.eyes.length; j++) {
      drawEye(bag.eyes[j]);
    }
  }
  pop();
}

function drawEye(eye) {
  push();
  var offset = 0.012;
  translate(
    eye.x + eye.nx * offset,
    eye.y + eye.ny * offset,
    eye.z + eye.nz * offset
  );
  noStroke();
  ambientMaterial(255, 255
