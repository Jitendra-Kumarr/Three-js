import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1,1,1);        
const material = new THREE.MeshBasicMaterial({color: "red"}); 
const box = new THREE.Mesh(geometry, material);
scene.add(box);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);  
camera.position.set(4, 4, 4); 
camera.lookAt(0, 0, 0);
scene.add(camera);

const target = document.querySelector(".wbgl");
const renderer = new THREE.WebGLRenderer({canvas: target});  
renderer.setSize(window.innerWidth, window.innerHeight);     


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 

const tick = () => {
  box.rotation.y += 0.05;
  controls.update(); 
  renderer.render(scene, camera);      
  window.requestAnimationFrame(tick);
}
tick();