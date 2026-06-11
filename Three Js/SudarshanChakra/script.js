import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const goldMat = new THREE.MeshStandardMaterial({
  color: 0xC8960C,
  metalness: 0.6,
  roughness: 0.55,
});

const chakra = new THREE.Group();

// --- Concentric Rings lying FLAT on XZ plane ---
const ringData = [
  { radius: 2.8, tube: 0.10, spikes: 40, spikeLen: 0.55, spikeBase: 0.07 },
  { radius: 2.1, tube: 0.09, spikes: 34, spikeLen: 0.40, spikeBase: 0.06 },
  { radius: 1.55, tube: 0.08, spikes: 28, spikeLen: 0.30, spikeBase: 0.055 },
  { radius: 1.05, tube: 0.07, spikes: 20, spikeLen: 0.22, spikeBase: 0.05 },
  { radius: 0.60, tube: 0.06, spikes: 14, spikeLen: 0.16, spikeBase: 0.04 },
];

ringData.forEach(({ radius, tube, spikes, spikeLen, spikeBase }) => {

  // Torus lying flat — rotate X by 90 degrees so it's horizontal
  const torusGeo = new THREE.TorusGeometry(radius, tube, 20, 120);
  const torus = new THREE.Mesh(torusGeo, goldMat);
  torus.rotation.x = Math.PI / 2; // <-- KEY FIX: flat on XZ plane
  chakra.add(torus);

  // Vertical cylindrical wall between rings
  const wallGeo = new THREE.CylinderGeometry(radius, radius, 0.18, 120, 1, true);
  const wall = new THREE.Mesh(wallGeo, goldMat);
  chakra.add(wall);

  // Spikes radiating outward in XZ plane
  for (let i = 0; i < spikes; i++) {
    const angle = (i / spikes) * Math.PI * 2;

    const spikeGeo = new THREE.ConeGeometry(spikeBase, spikeLen, 4);
    const spike = new THREE.Mesh(spikeGeo, goldMat);

    // Position spike at edge of ring, in XZ plane
    spike.position.set(
      Math.cos(angle) * (radius + spikeLen / 2),
      0,
      Math.sin(angle) * (radius + spikeLen / 2)
    );

    // Rotate spike to point outward radially (lying flat)
    spike.rotation.z = Math.PI / 2;  // lay cone on its side
    spike.rotation.y = -angle;       // rotate to face outward

    chakra.add(spike);
  }
});

// --- Center hole ring (flat) ---
const centerRingGeo = new THREE.TorusGeometry(0.22, 0.05, 16, 80);
const centerRing = new THREE.Mesh(centerRingGeo, goldMat);
centerRing.rotation.x = Math.PI / 2;
chakra.add(centerRing);

// --- Radial spokes lying flat in XZ plane ---
const spokeCount = 40;
for (let i = 0; i < spokeCount; i++) {
  const angle = (i / spokeCount) * Math.PI * 2;
  const spokeLength = 2.55; // from center to just inside outer ring
  const spokeGeo = new THREE.CylinderGeometry(0.02, 0.02, spokeLength, 6);
  const spoke = new THREE.Mesh(spokeGeo, goldMat);

  // Place spoke flat — cylinder runs along Y by default, rotate to run along X
  spoke.rotation.z = Math.PI / 2;  // lay it flat
  spoke.rotation.y = angle;         // rotate around Y to spread radially

  // Position at midpoint along its direction
  spoke.position.set(
    Math.cos(angle) * (spokeLength / 2),
    0,
    Math.sin(angle) * (spokeLength / 2)
  );

  chakra.add(spoke);
}

scene.add(chakra);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xFFE4A0, 2.5);
keyLight.position.set(5, 6, 4);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xaaccff, 0.6);
fillLight.position.set(-5, 2, -3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xFFD580, 1.0);
rimLight.position.set(0, -4, -5);
scene.add(rimLight);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 18);
camera.lookAt(0, 0, 0);

// --- Renderer ---
const target = document.querySelector(".wbgl");
const renderer = new THREE.WebGLRenderer({ canvas: target, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- OrbitControls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 15;

// --- Animation ---
const tick = () => {
  chakra.rotation.y += 0.5;
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});