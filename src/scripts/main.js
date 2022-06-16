const THREE = require('three');

import { createLaunch } from './launch.js';
import { createInfrared } from './infrared.js';
import { createExplore } from './explore.js';
import { createPuzzle } from './puzzle.js';
import { createQuotes } from './quotes.js';
import { createCredits } from './credits.js';

let overlay = document.getElementById('js--overlay');

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// NOTE: using renderer more than once will result in multiple canvases
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333, 1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

let scene = new THREE.Scene();

let currentScene;
let launchScene;
let infraredScene;
let exploreScene;
let puzzleScene;
let quotesScene;
let creditsScene;

init();
animate();

function init() {
    camera.position.set(0, 0, 0);
    
    launchScene = createLaunch(renderer, camera);
    scene = launchScene;
    currentScene = "launch";

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

    overlay.classList.remove('firstFade');
    overlay.classList.add('fadeInOut');

    setTimeout( function () {
        overlay.classList.remove('fadeInOut');
        overlay.style.opacity = 0;
    }, "4000");

    setTimeout( function () {
        if ( currentScene === "launch" ) {
            infraredScene = createInfrared(renderer, camera);
            scene = infraredScene;
            currentScene = "infrared";
    
        } else if ( currentScene === "infrared" ) {
            exploreScene = createExplore(renderer, camera);
            scene = exploreScene;
            currentScene = "explore";
    
        } else if ( currentScene === "explore" ) {
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
    }, "1000");

    }

document.getElementById( "js--sceneChanger" ).onclick = function() { changeScene() };
document.getElementById( "js--sceneChanger" ).onkeydown = function() { false }