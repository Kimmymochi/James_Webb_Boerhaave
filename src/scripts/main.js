const THREE = require('three');
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createQuotes } from './quotes.js';
import { createCredits } from './credits.js';

let camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
let controls; 

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333, 1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

let scene
let currentScene;
let quotesScene;
let creditsScene;

init();
animate();

function init() {
    
    // loads first scene
    quotesScene = createQuotes(renderer, camera);
    scene = quotesScene
    currentScene ="quotes"

    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls( camera, renderer.domElement );

    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

// change scene on click, bind to button
function changeScene() {
    if( currentScene === "quotes" ) {
        creditsScene = createCredits(renderer, camera);
        scene = creditsScene;
        currentScene = "credits";

        orbitController( false );
    }
}
document.getElementById("js--sceneChanger").onclick = function(){changeScene()};

// turn on / off the OrbitControls
function orbitController( canUse ) {
    controls.enableRotate = canUse;
    controls.enableZoom = canUse;
    controls.enablePan = canUse;
}