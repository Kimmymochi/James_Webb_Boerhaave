const THREE = require('three');

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

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
orbitControls.enableZoom = false;


// LIGHTS
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3, 50);
dirLight.position.set(1, 2, -1);
scene.add(dirLight);
dirLight.castShadow = true;


// import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
// import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
// import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

// STARS BACKROUND


// var radius = 1;
// var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), new THREE.MeshBasicMaterial({color: "gray", wireframe: true}));
// scene.add(sphere);
//
// var box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({color: "red", wireframe: true}));
// box.position.setFromSphericalCoords(radius + 0.1, THREE.Math.degToRad(23), THREE.Math.degToRad(45));
// box.lookAt(sphere.position);
// scene.add(box);

createStarEnvironment();

function createStarEnvironment()
{
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
}

function createStar(x, y, z)
{
    const starColors = [
        new THREE.Color(0x6487C7),
        new THREE.Color(0xD1C0A4),
        new THREE.Color(0xB5754F),
        new THREE.Color(0xFCFBF9)
    ];

    let starColor = starColors[Math.round(getRandomNumber(0, starColors.length - 1), 1)];

    const star = new THREE.Mesh(
        new THREE.SphereGeometry(getRandomNumber(0.3, 0.6)),
        new THREE.MeshPhongMaterial({color: starColor})
    );

    star.position.set(x, y, z);

    scene.add(star);
}





const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 5; //intensity of glow
bloomPass.radius = 0;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);


function animate()
{
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
    bloomComposer.render();
}
animate();