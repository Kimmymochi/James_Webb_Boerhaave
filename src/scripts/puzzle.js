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

// DRAG & DROP
const draggableObjects = [];
// const meshes = [backpanel, BUS, goldPlating, ISIS, secondaryMirror, solarPanels, sunscreens];
const meshes = [sunscreens];

for (let i = 0; i < meshes.length; i++)
{
    let draggableObject = addDraggablePart(meshes[i]);
    scene.add(draggableObject);
    draggableObjects.push(draggableObject);
}

const dragControls = new DragControls( draggableObjects, camera, renderer.domElement );

dragControls.addEventListener( 'dragstart', function ( event ) {
    orbitControls.enabled = false;
    // event.object.material.emissive.set( 0xaaaaaa );
} );

dragControls.addEventListener( 'dragend', function ( event ) {
    orbitControls.enabled = true;
    // event.object.material.emissive.set( 0x000000 );
} );

function drawBox(objectWidth, objectHeight, objectDepth, material)
{
    let geometry, box;

    geometry = new THREE.BoxGeometry(objectWidth,objectHeight,objectDepth);

    box = new THREE.Mesh(geometry, material);
    draggableObjects.push(box);
    box.position.set(0, 0, 0);

    return box;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

const hitBoxMaterial = new THREE.MeshBasicMaterial(
    {color: 0xffffff, transparent: true,
        opacity: 0.1, depthTest: false, wireframe: true
    });

let parts = [];

function addDraggablePart(mesh)
{
    let group = new THREE.Group();
    const gltfLoader = new GLTFLoader();

    gltfLoader.load( mesh, ( gltf ) =>
    {
        let mesh = gltf.scene;
        mesh.scale.set( 3, 3, 3);

        // TODO: shadows not working
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const boundingBox = new THREE.Box3().setFromObject( mesh );

        let meshSize = new THREE.Vector3();
        let meshPosition = new THREE.Vector3();
        boundingBox.getSize(meshSize);
        boundingBox.getCenter(meshPosition)

        mesh.position.set(-meshPosition.x, -meshPosition.y, -meshPosition.z);

        const hitBox = drawBox(meshSize.x, meshSize.y, meshSize.z, hitBoxMaterial);
        hitBox.geometry.computeBoundingBox();

        group.add(hitBox);
        hitBox.add(mesh);

        parts.push({
            mesh: hitBox,
            boundingBox: boundingBox
        });

        hitBox.position.set(
            getRandomNumber(20, 50),
            getRandomNumber(20, 50),
            getRandomNumber(20, 50));
    });
    return group;
}

let snappingPoints = [];

// SNAPPING POINT
const snappingPointRadius = 4;

const snappingPointMesh = new THREE.Mesh(
    new THREE.SphereGeometry(snappingPointRadius),
    new THREE.MeshPhongMaterial({color: 0xffffff})
);

snappingPointMesh.material.transparent = true;
snappingPointMesh.material.opacity = 0.5;

snappingPointMesh.position.set(-30, 0, 0);

let snappingPointBB = new THREE.Sphere(snappingPointMesh.position, snappingPointRadius);

scene.add(snappingPointMesh);

snappingPoints.push({
    mesh: snappingPointMesh,
    boundingBox: snappingPointBB,
    snappedObject: null,
    hasRecentlyCollided: false,
})

function checkCollisions()
{
    for (let partsIndex = 0; partsIndex < parts.length; partsIndex++)
    {
        let isIntersecting = parts[partsIndex].boundingBox.intersectsSphere(snappingPointBB);

        if (isIntersecting || snappingPoints[0].hasRecentlyCollided)
        {
            snappingPoints[0].snappedObject = parts[partsIndex].mesh;
            const snappingPointPos = snappingPoints[0].boundingBox.center;

            if (!snappingPoints[0].hasRecentlyCollided)
            {
                parts[partsIndex].mesh.position.set(snappingPointPos.x, snappingPointPos.y, snappingPointPos.z);

                dragControls.enabled = false;
                setTimeout(function ()
                {
                    dragControls.enabled = true;
                }, 1000);
            }
            snappingPoints[0].hasRecentlyCollided = true;
        }
        if(!isIntersecting)
        {
            snappingPoints[0].hasRecentlyCollided = false;
            snappingPoints[0].snappedObject = null;
        }
    }
}

const starColors = [0x6487C7, 0xD1C0A4, 0xB5754F, 0xFCFBF9];

// STARS BACKROUND
for (let i = 0; i < 25; i++)
{
    createStar(
        getRandomNumber(-300, 300), // x
        getRandomNumber(200, 300), // y
        getRandomNumber(-300, 300)  // z
    );
}

// for (let i = 0; i < 25; i++)
// {
//     createStar(
//         getRandomNumber(-200, -300), // x
//         getRandomNumber(-200, -300), // y
//         getRandomNumber(-200, -300)  // z
//     );
// }

createStar(0, 0, 0);

function createStar(x, y, z)
{
    // let starColor = starColors[getRandomNumber(0, starColors.length)];

    const star = new THREE.Mesh(
        new THREE.SphereGeometry(getRandomNumber(0.3, 1)),
        new THREE.MeshPhongMaterial({color: 0x6487C7})
    );

    star.material.emissive.set( 0x6487C7 )
    star.material.emissiveIntensity = 5;

    star.position.set(x, y, z);

    scene.add(star);
}


function animate()
{
    for (let partsIndex = 0; partsIndex < parts.length; partsIndex++)
    {
        parts[partsIndex].boundingBox.copy(parts[partsIndex].mesh.geometry.boundingBox)
            .applyMatrix4(parts[partsIndex].mesh.matrixWorld);
    }


    checkCollisions();

    renderer.render( scene, camera );
    requestAnimationFrame( animate );

    // for (let i = 0; i < draggableObjects.length; i++)
    // {
    //     const position = draggableObjects[i].position;
    //     const speed = 0.002;
    //     if(position.x < 100) position.set(position.x + speed, position.y + speed, position.z + speed);
    // }
}
animate();