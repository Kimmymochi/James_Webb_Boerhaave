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
const meshes = [backpanel, BUS, goldPlating, ISIS, secondaryMirror, solarPanels, sunscreens];

// for (let i = 0; i < meshes.length; i++)
// {
//     let draggableObject = addDraggablePart(meshes[i]);
//     scene.add(draggableObject);
//     draggableObjects.push(draggableObject);
// }

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

        const hitBoxWidth = meshSize.x + 20;
        const hitBoxHeight = meshSize.y + 20;
        const hitBoxDepth = meshSize.z + 20;
        const hitBox = drawBox(hitBoxWidth, hitBoxHeight, hitBoxDepth, hitBoxMaterial);

        group.add(hitBox);
        group.name = "part";
        hitBox.add(mesh);

        hitBox.position.set(
            getRandomNumber(-50, 50),
            getRandomNumber(-50, 50),
            getRandomNumber(-50, 50));

    });
    return group;
}


// DROP CONTAINER
const dropContainerMaterial = new THREE.MeshBasicMaterial(
    {color: 0xffffff, transparent: true,
        opacity: 0.2, depthTest: false
    });




// CUBE 2
const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({color: 0x0000ff})
);
cube2.position.set(-3, 0, 0);

let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube2BB.setFromObject(cube2);

cube2.geometry.computeBoundingBox();


// SNAPPING POINT
const snappingPointRadius = 0.5;

const snappingPointMesh = new THREE.Mesh(
    new THREE.SphereGeometry(snappingPointRadius),
    new THREE.MeshPhongMaterial({color: 0xffffff})
);

snappingPointMesh.material.transparent = true;
snappingPointMesh.material.opacity = 0.5;

snappingPointMesh.position.set(0, 0, 0);

let snappingPointBB = new THREE.Sphere(snappingPointMesh.position, snappingPointRadius);

scene.add(cube2, snappingPointMesh);
draggableObjects.push(cube2);


let hasCollided = false;
function checkCollisions()
{
    if (cube2BB.intersectsSphere(snappingPointBB))
    {
        const snappingPointPos = snappingPointBB.center;

        if (!hasCollided)
        {
            hasCollided = true;
            cube2.position.set(snappingPointPos.x, snappingPointPos.y, snappingPointPos.z);

            // TODO: find better way
            dragControls.enabled = false;
            setTimeout(enableDragControls, 1000);
        }
    }
    else
    {
        hasCollided = false;
    }
}

function enableDragControls()
{
    dragControls.enabled = true;
}

function animate()
{
    cube2BB.copy(cube2.geometry.boundingBox).applyMatrix4(cube2.matrixWorld);

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