const THREE = require('three');

import { createQuotes } from './quotes.js';
import { createCredits } from './credits.js';
import { createPuzzle } from './puzzle.js';

let camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);

// NOTE: using renderer more than once will result in multiple canvases
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333, 1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

let scene = new THREE.Scene();
let currentScene;
let puzzleScene;
let quotesScene;
let creditsScene;

init();
animate();

function init() {
    currentScene = "start";
    camera.position.set(0, 0, 0);
    document.body.appendChild(renderer.domElement);
    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}

// change scene on click, bind to button
function changeScene() {
    console.log(currentScene);

    if ( currentScene === "start" ) {
        puzzleScene = createPuzzle(renderer, camera);
        scene = puzzleScene;
        currentScene = "puzzle";
    
    } else if ( currentScene === "puzzle" ) {
        quotesScene = createQuotes(renderer, camera);
        scene = quotesScene
        currentScene ="quotes"

    } else if ( currentScene === "quotes" ) {
        creditsScene = createCredits(renderer, camera);
        scene = creditsScene;
        currentScene = "credits";

    }
}
document.getElementById( "js--sceneChanger" ).onclick = function() { changeScene() };

// // turn on / off the OrbitControls
// function orbitController( canUse ) {
//     controls.enableRotate = canUse;
//     controls.enablePan = canUse;
// }