var bubbles = [];
var bags = [];
var bagModel;
var plasticTexture;
var modelLoaded = false;
var textureLoaded = false;
var modelTriangles = [];
var modelRadius = 0;
var zoom = 4.2;
var minZoom = 0.65;
var maxZoom = 12;
var angleX = 0;
var angleY = 0;
var panY = 0;
var pressX = 0;
var pressY = 0;
var dragged = false;
var lastMouseX = 0;
var lastMouseY = 0;

// SETUP
function setup() {
createCanvas(windowWidth, windowHeight, WEBGL);
frameRate(30);
perspective(PI / 3, width / height, 0.1, 100000);
// LOAD ORIGINAL TRASH BAG MODEL
loadModel(
"test_model.obj",
false,
function(model) {
bagModel = model;
modelLoaded = true;
prepareModelForPicking();
console.log("TRASHBAG MODEL LOADED!");
console.log("Vertices:", bagModel.vertices.length);
console.log("Faces:", bagModel.faces.length);
console.log("Picking triangles:", modelTriangles.length);
},
function(error) {
console.log("Model loading error:", error);
}
);
// LOAD ORIGINAL PLASTIC TEXTURE
loadImage(
"test_texture.jpg",
function(img) {
plasticTexture = img;
textureLoaded = true;
console.log("TEXTURE LOADED!");
},
function(error) {
console.log("Texture loading error:", error);
}
);
// BUBBLES
for (var i = 0; i < 35; i++) {
bubbles.push({
x: random(-900, 900),
y: random(-650, 650),
z: random(-700, 700),
size: random(3, 8),
speed: random(0.3, 0.9)
});
}
// SEVEN BAGS
var positions = [
{ x: 0, y: 0, z: 0 },
{ x: -520, y: -300, z: -80 },
{ x: 450, y: -350, z: 80 },
{ x: -550, y: 200, z: 100 },
{ x: 550, y: 220, z: -100 },
{ x: -180, y: 430, z: 40 },
{ x: 180, y: -480, z: -50 }
];
for (var i = 0; i < 7; i++) {
bags.push(
createBag(
positions[i].x,
positions[i].y,
positions[i].z,
i
)
);
}
}

// PREPARE MODEL ONCE FOR FASTER CLICK DETECTION
function prepareModelForPicking() {
modelTriangles = [];
modelRadius = 0;
if (!bagModel || !bagModel.vertices || !bagModel.faces) {
return;
}
// CALCULATE MODEL BOUNDING RADIUS
for (var i = 0; i < bagModel.vertices.length; i++) {
var v = bagModel.vertices[i];
if (!v) continue;
var distance = sqrt(
v.x * v.x +
v.y * v.y +
v.z * v.z
);
if (distance > modelRadius) {
modelRadius = distance;
}
}
// STORE TRIANGLES SO WE DON'T REBUILD THEM ON EVERY CLICK
for (var j = 0; j < bagModel.faces.length; j++) {
var face = bagModel.faces[j];
if (!face || face.length < 3) continue;
var a = bagModel.vertices[face[0]];
var b = bagModel.vertices[face[1]];
var c = bagModel.vertices[face[2]];
if (!a || !b || !c) continue;
modelTriangles.push({
a: { x: a.x, y: a.y, z: a.z },
b: { x: b.x, y: b.y, z: b.z },
c: { x: c.x, y: c.y, z: c.z }
});
}
// SMALL SAFETY MARGIN AROUND THE MODEL
modelRadius = 1.05;
}

// CREATE BAG
function createBag(x, y, z, index) {
var bag = {
x: x,
y: y,
z: z,
size: random(0.9, 1.1),
rotation: random(-0.4, 0.4),
rotationX: random(-0.25, 0.25),
rotationZ: random(-0.35, 0.35),
speed: random(0.001, 0.003),
fold: random(1000),
eyes: []
};
if (index < 4) {
bag.eyes.push({
x: -0.075,
y: 0.32,
z: -0.23,
nx: 0,
ny: 0,
nz: -1
});
bag.eyes.push({
x: 0.075,
y: 0.32,
z: -0.23,
nx: 0,
ny: 0,
nz: -1
});
} else {
bag.eyes.push({
x: 0,
y: 0.32,
z: -0.23,
nx: 0,
ny: 0,
nz: -1
});
}
return bag;
}

// DRAW
function draw() {
background(5, 45, 70);
perspective(PI / 3, width / height, 0.1, 100000);
ambientLight(120);
directionalLight(220, 235, 245, -1, -1, -1);
pointLight(120, 190, 220, 0, -250, 400);
var fear = map(zoom, 1.1, 3.2, 0, 1);
fear = constrain(fear, 0, 1);
fear = fear * fear * (3 - 2 * fear);
// ROTATE THE UNDERWATER WORLD
rotateX(angleX);
rotateY(angleY);
scale(zoom);
// VERTICAL PAN
translate(0, panY / zoom, 0);
drawBubbles();
if (modelLoaded) {
for (var i = 0; i < bags.length; i++) {
drawBag(bags[i], fear);
}
}
}

// BUBBLES
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
b.y -= b.speed;
if (b.y < -750) {
b.y = 750;
b.x = random(-900, 900);
b.z = random(-700, 700);
}
}
pop();
}

// BAG MOVEMENT
function getBagRotationX(bag) {
return sin(frameCount * 0.012 + bag.fold) * 0.08 +
bag.rotationX;
}
function getBagRotationZ(bag) {
return sin(frameCount * 0.01 + bag.fold) * 0.08 +
bag.rotationZ;
}
function getBagRotationY(bag) {
return bag.rotation + frameCount * bag.speed;
}

// DRAW EACH BAG
function drawBag(bag, fear) {
push();
translate(bag.x, bag.y, bag.z);
rotateY(getBagRotationY(bag));
rotateX(getBagRotationX(bag));
rotateZ(getBagRotationZ(bag));
rotateX(PI);
scale(180 * bag.size);
if (fear < 0.45) {
var alphaValue = map(fear, 0, 0.45, 0, 100);
alphaValue = constrain(alphaValue, 0, 100);
noStroke();
ambientMaterial(25, 35, 40, alphaValue);
model(bagModel);
} else {
noStroke();
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

// EYE APPEARANCE
function drawEye(eye) {
push();
var offset = 0.012;
translate(
eye.x + eye.nx * offset,
eye.y + eye.ny * offset,
eye.z + eye.nz * offset
);
noStroke();
ambientMaterial(255, 255, 255);
sphere(0.035);
translate(
eye.nx * 0.032,
eye.ny * 0.032,
eye.nz * 0.032
);
ambientMaterial(5, 5, 5);
sphere(0.016);
pop();
}

// VECTOR ROTATIONS
function rotateVectorX(v, a) {
var c = cos(a);
var s = sin(a);
return {
x: v.x,
y: v.y * c - v.z * s,
z: v.y * s + v.z * c
};
}
function rotateVectorY(v, a) {
var c = cos(a);
var s = sin(a);
return {
x: v.x * c + v.z * s,
y: v.y,
z: -v.x * s + v.z * c
};
}
function rotateVectorZ(v, a) {
var c = cos(a);
var s = sin(a);
return {
x: v.x * c - v.y * s,
y: v.x * s + v.y * c,
z: v.z
};
}
function subtractVector(a, b) {
return {
x: a.x - b.x,
y: a.y - b.y,
z: a.z - b.z
};
}
function divideVector(v, amount) {
return {
x: v.x / amount,
y: v.y / amount,
z: v.z / amount
};
}
function crossProduct(a, b) {
return {
x: a.y * b.z - a.z * b.y,
y: a.z * b.x - a.x * b.z,
z: a.x * b.y - a.y * b.x
};
}
function dotProduct(a, b) {
return a.x * b.x + a.y * b.y + a.z * b.z;
}
function normalizeVector(v) {
var length = sqrt(
v.x * v.x +
v.y * v.y +
v.z * v.z
);
if (length === 0) {
return { x: 0, y: 0, z: -1 };
}
return {
x: v.x / length,
y: v.y / length,
z: v.z / length
};
}

// RAY-SPHERE CHECK
// QUICKLY REJECT BAGS THAT CANNOT BE CLICKED
function rayHitsBoundingSphere(origin, direction, radius) {
var b = dotProduct(origin, direction);
var c = dotProduct(origin, origin) - radius * radius;
var discriminant = b * b - c;
if (discriminant < 0) {
return false;
}
var t = -b - sqrt(discriminant);
if (t < 0) {
t = -b + sqrt(discriminant);
}
return t >= 0;
}

// RAY-TRIANGLE INTERSECTION
function intersectTriangle(origin, direction, a, b, c) {
var edge1 = subtractVector(b, a);
var edge2 = subtractVector(c, a);
var h = crossProduct(direction, edge2);
var determinant = dotProduct(edge1, h);
if (abs(determinant) < 0.000001) {
return null;
}
var inverse = 1 / determinant;
var s = subtractVector(origin, a);
var u = inverse * dotProduct(s, h);
if (u < 0 || u > 1) return null;
var q = crossProduct(s, edge1);
var v = inverse * dotProduct(direction, q);
if (v < 0 || u + v > 1) return null;
var t = inverse * dotProduct(edge2, q);
if (t <= 0) return null;
var point = {
x: origin.x + direction.x * t,
y: origin.y + direction.y * t,
z: origin.z + direction.z * t
};
var normal = normalizeVector(
crossProduct(edge1, edge2)
);
if (dotProduct(normal, direction) > 0) {
normal.x = -1;
normal.y = -1;
normal.z = -1;
}
return {
t: t,
point: point,
normal: normal
};
}

// CREATE RAY FROM MOUSE POSITION
function createWorldRay(mx, my) {
var cameraZ = (height / 2) / tan(PI / 6);
var focalLength = cameraZ;
var direction = normalizeVector({
x: (mx - width / 2) / focalLength,
y: -(my - panY - height / 2) / focalLength,
z: -1
});
return {
origin: {
x: 0,
y: 0,
z: cameraZ
},
direction: direction
};
}

// TRANSFORM RAY INTO BAG LOCAL COORDINATES
function getLocalRay(bag, worldRay) {
var origin = divideVector(worldRay.origin, zoom);
var direction = worldRay.direction;
origin = rotateVectorX(origin, -angleX);
origin = rotateVectorY(origin, -angleY);
direction = rotateVectorX(direction, -angleX);
direction = rotateVectorY(direction, -angleY);
origin = subtractVector(origin, {
x: bag.x,
y: bag.y,
z: bag.z
});
origin = rotateVectorX(origin, -PI);
origin = rotateVectorZ(origin, -getBagRotationZ(bag));
origin = rotateVectorX(origin, -getBagRotationX(bag));
origin = rotateVectorY(origin, -getBagRotationY(bag));
var bagScale = 180 * bag.size;
origin = divideVector(origin, bagScale);
direction = divideVector(direction, bagScale);
return {
origin: origin,
direction: normalizeVector(direction)
};
}

// FIND CLICKED BAG SURFACE
function hitBag(bag, worldRay) {
var localRay = getLocalRay(bag, worldRay);
// FIRST CHECK THE MODEL'S BOUNDING SPHERE
if (
!rayHitsBoundingSphere(
localRay.origin,
localRay.direction,
modelRadius
)
) {
return null;
}
// ONLY CHECK TRIANGLES IF THE RAY REACHES THE BAG
var closestHit = null;
for (var i = 0; i < modelTriangles.length; i++) {
var triangle = modelTriangles[i];
var hit = intersectTriangle(
localRay.origin,
localRay.direction,
triangle.a,
triangle.b,
triangle.c
);
if (hit && (!closestHit || hit.t < closestHit.t)) {
closestHit = hit;
}
}
if (closestHit) {
closestHit.worldDistance =
closestHit.t * 180 * bag.size * zoom;
}
return closestHit;
}

// MOUSE PRESS
function mousePressed() {
pressX = mouseX;
pressY = mouseY;
lastMouseX = mouseX;
lastMouseY = mouseY;
dragged = false;
}

// MOUSE DRAG
function mouseDragged() {
var totalMovement = dist(
mouseX,
mouseY,
pressX,
pressY
);
if (totalMovement > 4) {
dragged = true;
}
var moveX = mouseX - lastMouseX;
var moveY = mouseY - lastMouseY;
// SHIFT + DRAG = VERTICAL MOVEMENT
if (keyIsDown(SHIFT)) {
panY += moveY;
} else {
// NORMAL DRAG = 3D ROTATION
angleY += moveX * 0.006;
angleX += moveY * 0.006;
}
lastMouseX = mouseX;
lastMouseY = mouseY;
}

// MOUSE RELEASE
function mouseReleased() {
if (dragged) {
return;
}
if (
!modelLoaded ||
modelTriangles.length === 0
) {
return;
}
var ray = createWorldRay(mouseX, mouseY);
var closestBag = -1;
var closestHit = null;
var closestDistance = Infinity;
for (var i = 0; i < bags.length; i++) {
var hit = hitBag(bags[i], ray);
if (
hit &&
hit.worldDistance < closestDistance
) {
closestDistance = hit.worldDistance;
closestBag = i;
closestHit = hit;
}
}
if (closestBag !== -1) {
var p = closestHit.point;
var n = closestHit.normal;
bags[closestBag].eyes.push({
x: p.x,
y: p.y,
z: p.z,
nx: n.x,
ny: n.y,
nz: n.z
});
console.log("ONE EYE ADDED TO BAG", closestBag + 1);
}
}

// SCROLL ZOOM
function mouseWheel(event) {
if (event.delta < 0) {
zoom = 1.035;
} else {
zoom = 0.965;
}
zoom = constrain(zoom, minZoom, maxZoom);
return false;
}

// KEYBOARD CONTROLS
function keyPressed() {
if (key === "+" || key === "=") {
zoom = 1.08;
}
if (key === "-") {
zoom = 0.92;
}
// MOVE UP
if (keyCode === UP_ARROW) {
panY -= 35;
return false;
}
// MOVE DOWN
if (keyCode === DOWN_ARROW) {
panY += 35;
return false;
}
zoom = constrain(zoom, minZoom, maxZoom);
}

// RESPONSIVE CANVAS
function windowResized() {
resizeCanvas(windowWidth, windowHeight);
perspective(PI / 3, width / height, 0.1, 100000);
}
