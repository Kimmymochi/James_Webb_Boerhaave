const THREE = require('three');

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import DragControls from 'three-dragcontrols'


const scene = new THREE.Scene();

// RENDERER
// ----------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );


// CAMERA
// ----------------------------------------------------------------------

// Ortographic camera
// const frustumSize = 100;
// const aspect = window.innerWidth / window.innerHeight;
// let camera = new THREE.OrthographicCamera(
//     frustumSize * aspect / - 2,
//     frustumSize * aspect / 2,
//     frustumSize / 2,
//     frustumSize / - 2, 1, 1000
// );
// camera.position.set( - 200, 200, 200 );




// Regular camera
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set( 0, 20, 100 );

const orbitControls = new OrbitControls( camera, renderer.domElement );
orbitControls.enableZoom = false;
orbitControls.update();


// LIGHTS
// ----------------------------------------------------------------------
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3, 50);
dirLight.position.set(1, 2, -1);
scene.add(dirLight);
dirLight.castShadow = true;


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

// Updates the location of parts bounding box so it will
// stay in the right position when it is dragged
function updatePartsBBLocation()
{
    for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
    {
        partsData[partsIndex].boundingBox.copy(partsData[partsIndex].mesh.geometry.boundingBox)
            .applyMatrix4(partsData[partsIndex].mesh.matrixWorld);
    }
}

// Makes parts float like they would in space
function partsFloatAnimation()
{
    for (let i = 0; i < draggableParts.length; i++)
    {
        const position = draggableParts[i].position;
        const speed = 0.002;
        if(position.x < 100) position.set(position.x + speed, position.y + speed, position.z + speed);
    }
}