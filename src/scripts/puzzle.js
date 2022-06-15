const THREE = require('three');

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import backpanel from '../models/backpanel.gltf'
import BUS from '../models/BUS.gltf'
import goldPlating from '../models/gold_plating.gltf'
import ISIS from '../models/ISIS.gltf'
import secondaryMirror from '../models/secondary_mirror.gltf'
import solarPanels from '../models/solar_panels.gltf'
import sunscreens from '../models/sunscreens.gltf'

import DragControls from 'three-dragcontrols'

const scene = new THREE.Scene();

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
// renderer.setClearColor( 0x000000,1 );
document.body.appendChild( renderer.domElement );


// CAMERA
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
const orbitControls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 20, 100 );
orbitControls.update();


// LIGHTS
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3, 50);
dirLight.position.set(1, 2, -1);
scene.add(dirLight);
dirLight.castShadow = true;


import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';


const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

const finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        defines: {}
    } ), 'baseTexture'
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );

bloomComposer.renderToScreen = true;
render();


function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}


// STARS BACKROUND

const starColors = [0x6487C7, 0xD1C0A4, 0xB5754F, 0xFCFBF9];


for (let i = 0; i < 25; i++)
{
    // top
    createStar(
        getRandomNumber(-300, 300), // x
        getRandomNumber(200, 300), // y
        getRandomNumber(-300, 300)  // z
    );

    // bottom
    createStar(
        getRandomNumber(-300, 300), // x
        getRandomNumber(-200, -300), // y
        getRandomNumber(-300, 300)  // z
    );

    // right
    createStar(
        getRandomNumber(200, 300), // x
        getRandomNumber(-200, 300), // y
        getRandomNumber(-300, 300)  // z
    );

    // left
    createStar(
        getRandomNumber(-200, -300), // x
        getRandomNumber(-200, 300), // y
        getRandomNumber(-300, 300)  // z
    );
}

function createStar(x, y, z)
{
    let starColor = starColors[getRandomNumber(0, starColors.length)];

    const star = new THREE.Mesh(
        new THREE.SphereGeometry(getRandomNumber(0.3, 1)),
        new THREE.MeshPhongMaterial({color: starColor})
    );

    star.material.emissive.set( starColor )
    star.material.emissiveIntensity = 5;

    star.position.set(x, y, z);

    scene.add(star);
}

function animate()
{
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}
animate();