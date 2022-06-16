const THREE = require('three');
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createQuotes } from './quotes.js';
import { createCredits } from './credits.js';
import { createExplore } from './three.js';

let camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
let controls;

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333, 1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;


let scene
let creditsScene = createCredits(renderer, camera);
// let quotesScene = createQuotes(renderer, camera); 
// let exploreScene = createExplore(renderer, camera);



init();
animate();

function init() {
    scene = creditsScene
    document.body.appendChild(renderer.domElement);

    
	controls = new OrbitControls( camera, renderer.domElement );
    controls.enableRotate = false;

    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    // controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}
