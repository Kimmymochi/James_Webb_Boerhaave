const THREE = require('three');

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import lato from '../fonts/Lato_Regular.json';


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
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set( 0, 20, 100 );
const orbitControls = new OrbitControls( camera, renderer.domElement );
// orbitControls.enableZoom = false;
orbitControls.update();


// RESIZE HANDLER
// ----------------------------------------------------------------------
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);


// LIGHTS
// ----------------------------------------------------------------------
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3, 50);
dirLight.position.set(1, 2, -1);
scene.add(dirLight);
dirLight.castShadow = true;


// TEXT
// ----------------------------------------------------------------------
const fontLoader = new FontLoader();
var textMeshes = [];

const headerFontURL = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';

const headerMaterials = [
    new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
    new THREE.MeshPhongMaterial({ color: 0xC6C6C6 }) // side
];

const paragraphMaterials = [
    new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
    new THREE.MeshPhongMaterial({ color: 0xC6C6C6 }) // side
];

let headerGeometryParameters = {
    font: null,
    size: 6,
    height: 1,
    curveSegments: 10,
    bevelEnabled: false,
    bevelOffset: 0,
    bevelSegments: 1,
    bevelSize: 0.3,
    bevelThickness: 1
}

let paragraphGeometryParameters = {
    font: null,
    size: 4,
    height: 1,
    curveSegments: 10,
    bevelEnabled: false,
    bevelOffset: 0,
    bevelSegments: 1,
    bevelSize: 0.3,
    bevelThickness: 1
}

let previousContributionPos = null;

function addContribution(headerText, contributors)
{
    fontLoader.load(
        headerFontURL,

        function (font) {

            // HEADER
            headerGeometryParameters.font = font;
            paragraphGeometryParameters.font = font;
            const headerGeometry = new TextGeometry(headerText, headerGeometryParameters);

            for (let i = 0; i < contributors.length; i++)
            {
                const paragraphGeometry = new TextGeometry(headerText, paragraphGeometryParameters);

            }


            let headerTextMesh = new THREE.Mesh(headerGeometry, headerMaterials);

            headerTextMesh.castShadow = true;

            if (previousContributionPos === null) headerTextMesh.position.y = -100;
            else headerTextMesh.position.y = previousContributionPos.y + 20;

            headerTextMesh.position.z = -50;
            headerTextMesh.position.x = -35;
            // textMesh.rotation.x = - Math.PI / 4;

            previousContributionPos = headerTextMesh.position;

            scene.add(headerTextMesh);

            textMeshes.push(headerTextMesh);

        }
    );
}


function addTextMesh(fontURL, text, materials, geometryParameters)
{
    fontLoader.load(
        fontURL,
        function (font) {
            geometryParameters.font = font;
            const geometry = new TextGeometry(headerText, geometryParameters);
            let textMesh = new THREE.Mesh(geometry, materials);
            textMesh.castShadow = true;
            return textMesh;
        }
    );
}

init();

function init()
{
    addContribution("Developers", ["Kim Hoogland", "Tijs Ruigrok", "Lukas Splinter"]);
    addContribution("Developers", ["Kim Hoogland", "Tijs Ruigrok", "Lukas Splinter"]);
    addContribution("Developers", ["Kim Hoogland", "Tijs Ruigrok", "Lukas Splinter"]);
    addContribution("Developers", ["Kim Hoogland", "Tijs Ruigrok", "Lukas Splinter"]);
    addContribution("Developers", ["Kim Hoogland", "Tijs Ruigrok", "Lukas Splinter"]);

    animate();
}


// ANIMATE
function animate()
{
    for (let i = 0; i < textMeshes.length; i++)
    {
        textMeshes[i].position.y += 0.05;
        textMeshes[i].position.z -= 0.05;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

