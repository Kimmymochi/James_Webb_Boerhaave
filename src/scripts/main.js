import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createLaunch } from './launch.js';
import { createInfrared } from './infrared.js';
import { createExplore, removeExplore } from './explore.js';
import { createPuzzle } from './puzzle.js';
import { createQuotes } from './quotes.js';
import { createCredits } from './credits.js';


let overlay = document.getElementById('js--overlay');
let nextScene = document.getElementById('js--sceneChanger');

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// NOTE: using renderer more than once will result in multiple canvases
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0x000000,1 );
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
let creditsTimeout;

// gtlf loader for all scenes, better peformance-wise
const loader = new GLTFLoader();

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0.1, 0, 0 );

    launchScene = createLaunch(renderer, camera, loader);
    scene = launchScene;
    // currentScene = "launch";

    document.body.appendChild(renderer.domElement);
    window.addEventListener("resize", onWindowResize, false);

    currentScene = "quotes";
    quotesScene = createQuotes(renderer, camera, loader);
    scene = quotesScene;
    changeScene();

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
export function changeScene() {
        
    overlay.classList.remove('firstFade');
    overlay.classList.add('fadeInOut');

    setTimeout( function () {
        overlay.classList.remove('fadeInOut');
        overlay.style.opacity = 0;
    }, "4000");

    setTimeout( function () {

        if ( currentScene === "launch" ) {
            sceneRemover(launchScene);
            infraredScene = createInfrared(renderer, camera, loader, changeScene);
            scene = infraredScene;
            currentScene = "infrared";
            nextScene.style.display = "block";
            nextScene.classList.remove('hidden');

        } else if ( currentScene === "infrared" ) {
            sceneRemover(infraredScene);
            exploreScene = createExplore(renderer, camera, loader);
            scene = exploreScene;
            currentScene = "explore";
            nextScene.classList.remove('hidden');

        } else if ( currentScene === "explore" ) {
            sceneRemover(exploreScene);
            removeExplore();
            puzzleScene = createPuzzle(renderer, camera, loader);
            scene = puzzleScene;
            currentScene = "puzzle";

        } else if ( currentScene === "puzzle" ) {
            sceneRemover(puzzleScene);
            quotesScene = createQuotes(renderer, camera, loader);
            scene = quotesScene;
            currentScene ="quotes"
            nextScene.classList.remove('hidden');

        } else if ( currentScene === "quotes" ) {
            sceneRemover(quotesScene);
            creditsScene = createCredits(renderer, camera);
            scene = creditsScene;
            currentScene = "credits";
            nextScene.classList.remove('hidden');

            // auto-change to launch scene after some time
            // NOTES:   -   problematic when other devices animate the credits slower
            //          -   in case we do camera zoom-out animation we can change scene within tween.onComplete
            creditsTimeout =  setTimeout( () => {
                // changeScene();
                location.reload();
            }, "50000")

        } else if (currentScene === "credits" ) {

            location.reload();

            // USE THESE IN CASE KIOSK WON'T DO LOCATION RELOADS
            // when clicked on restart, remove auto-change evemt
            // clearTimeout(creditsTimeout);

            // sceneRemover(launchScene);    
            // launchScene = createLaunch(renderer, camera);
            // scene = launchScene;
            // currentScene = "launch";
        }

    }, "1000");

}

nextScene.onclick = function() { 
    changeButton.classList.add('hidden');
    changeScene() 
};

nextScene.onkeydown = function() { false }

function sceneRemover(obj) {
    while(obj.children.length > 0){
        sceneRemover(obj.children[0]);
        obj.remove(obj.children[0]);
    }

    if(obj.geometry) obj.geometry.dispose();

    if(obj.material){
      Object.keys(obj.material).forEach( prop => {
        if(!obj.material[prop]) return;

        if(obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function') {
            obj.material[prop].dispose();
        }
      });

      obj.material.dispose();
    }
  }
