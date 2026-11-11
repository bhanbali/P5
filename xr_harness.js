window.addEventListener('load', () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a24);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 1.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x333333, 1.2);
  scene.add(light);

  // Bind student's offscreen canvas as live VR texture
  const p5Canvas = document.getElementById('defaultCanvas0');
  const texture = new THREE.CanvasTexture(p5Canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Virtual showcase board (1.5m x 2.0m)
  const boardGeo = new THREE.PlaneGeometry(1.5, 2.0);
  const boardMat = new THREE.MeshBasicMaterial({ map: texture });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0, 1.5, -1.78); // Offset to avoid z-fighting
  scene.add(board);

  // Frame backing
  const frameGeo = new THREE.BoxGeometry(1.56, 2.06, 0.04);
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.set(0, 1.5, -1.82);
  scene.add(frameMesh);

  // Floor reference grid
  const grid = new THREE.GridHelper(8, 16, 0x0084ff, 0x333344);
  grid.position.y = 0;
  scene.add(grid);

  // Quest 3 Controllers & Pointer Rays
  const c0 = renderer.xr.getController(0);
  const c1 = renderer.xr.getController(1);

  function makePointer(color) {
    const g = new THREE.Group();
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), new THREE.MeshBasicMaterial({ color: color }));
    g.add(sphere);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-2.5)]),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    );
    g.add(line);
    return g;
  }
  c0.add(makePointer(0xff4444)); // Right hand (Red)
  c1.add(makePointer(0x4488ff)); // Left hand (Blue)
  scene.add(c0);
  scene.add(c1);

  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3();
  const rayDir = new THREE.Vector3();

  // Unified render loop
  renderer.setAnimationLoop(() => {
    // 1. Raycast controllers against board to update student mouseX/mouseY
    const controllers = [c0, c1];
    for (let c of controllers) {
      c.getWorldPosition(rayOrigin);
      c.getWorldDirection(rayDir);
      rayDir.negate(); // Point forward

      raycaster.set(rayOrigin, rayDir);
      const intersects = raycaster.intersectObject(board);

      if (intersects.length > 0) {
        const uv = intersects[0].uv;
        if (typeof width !== 'undefined' && typeof height !== 'undefined') {
          mouseX = uv.x * width;
          mouseY = (1 - uv.y) * height;
        }
        break;
      }
    }

    // 2. Redraw student p5 sketch in sync with headset frame pacing
    if (typeof redraw === 'function') {
      redraw();
      texture.needsUpdate = true;
    }

    renderer.render(scene, camera);
  });

  // Enter VR button setup
  const vrBtn = document.getElementById('vr-btn');
  if ('xr' in navigator) {
    navigator.xr.isSessionSupported('immersive-vr').then(supported => {
      if (supported) {
        vrBtn.style.display = 'block';
        vrBtn.addEventListener('click', () => {
          navigator.xr.requestSession('immersive-vr', {
            optionalFeatures: ['local-floor', 'bounded-floor']
          }).then(session => {
            renderer.xr.setSession(session);
            vrBtn.style.display = 'none';
          });
        });
      }
    });
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});