const THREE = require('three');

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


// SCENE
const scene = new THREE.Scene();

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// INIT CAMERA
camera.position.z = 45;
camera.position.x = 3;
camera.position.y = 20;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true

document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0, -40);
controls.update();

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// INIT HEMISPHERE LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 1.0));

// SCENE
scene.background = new THREE.Color(0x000000);

// TEXT
const fontLoader = new FontLoader();

var starWarsText = THREE.Mesh;
fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',

    function (font) {

        const lorem = 'three.js\n3D Text Example\nYou can do cool stuff\nwith three.js fonts\n{ - } - $ - *\n% - # - +\n....\n...\n..\n.'

        const geometry = new TextGeometry(lorem, {
            font: font,
            size: 4,
            height: 1,
            curveSegments: 10,
            bevelEnabled: false,
            bevelOffset: 0,
            bevelSegments: 1,
            bevelSize: 0.3,
            bevelThickness: 1
        });
        const materials = [
            new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
            new THREE.MeshPhongMaterial({ color: 0x999999 }) // side
        ];
        starWarsText = new THREE.Mesh(geometry, materials);
        starWarsText.castShadow = true
        // starWarsText.position.z = -50
        // starWarsText.position.y = -10
        // starWarsText.position.x = -35
        // starWarsText.rotation.x = - Math.PI / 4
        scene.add(starWarsText);
        scene.updateMatrixWorld(true)
    }
);


// ANIMATE
function animate() {
    
    starWarsText.position.set(
        starWarsText.position.x,
        starWarsText.position.y + 0.05,
        starWarsText.position - 0.05
    );


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

