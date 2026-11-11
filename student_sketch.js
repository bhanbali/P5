window.addEventListener('load', () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x052d46);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 0); // Average standing eye height

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Hook into the p5 canvas element as a live dynamic texture
  const p5Canvas = document.getElementById('defaultCanvas0');
  if (!p5Canvas) {
    console.error("p5 canvas not found!");
    return;
  }
  const texture = new THREE.CanvasTexture(p5Canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Render the underwater world onto a large curved or flat viewing screen
  const screenGeo = new THREE.PlaneGeometry(3.2, 1.8);
  const screenMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  const displayScreen = new THREE.Mesh(screenGeo, screenMat);
  displayScreen.position.set(0, 1.6, -2.0); // 2 meters in front of player
  scene.add(displayScreen);

  // Controller interaction (VR pointers simulate mouse drag/clicks on the canvas)
  const c0 = renderer.xr.getController(0);
  scene.add(c0);

  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3();
  const rayDir = new THREE.Vector3();

  renderer.setAnimationLoop(() => {
    // Controller raycasting to send coordinates to p5 mouseX / mouseY
    c0.getWorldPosition(rayOrigin);
    c0.getWorldDirection(rayDir);
    rayDir.negate();
    raycaster.set(rayOrigin, rayDir);

    const hits = raycaster.intersectObject(displayScreen);
    if (hits.length > 0 && hits[0].uv) {
      if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
        mouseX = hits[0].uv.x * width;
        mouseY = (1 - hits[0].uv.y) * height;
      }
    }

    // Refresh p5 canvas texture into VR headset
    texture.needsUpdate = true;
    renderer.render(scene, camera);
  });

  // VR Session Activation
  const vrBtn = document.getElementById('vr-btn');
  if (navigator.xr) {
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
