const THREE = require('three');

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import backpanel from '../models/backpanel.gltf'
import BUS from '../models/BUS.gltf'
import goldPlating from '../models/gold_plating.gltf'
// import ISIS from '../models/ISIS.gltf'
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


// INITIATION
const draggableObjects = [];
const meshes = [backpanel, BUS, goldPlating, secondaryMirror, solarPanels, sunscreens];
// const meshes = [backpanel];

let snappingPointsData = [];
let partsData = [];

const snappingPointRadius = 1;

let collisionsEnabled = false;

init();

function init() {
    // Create a draggable part for all 3D models
    for (let i = 0; i < meshes.length; i++) {
        let draggablePart = addDraggablePart(meshes[i]);
        scene.add(draggablePart);
        draggableObjects.push(draggablePart);
    }

    addSnappingPoint(snappingPointRadius, new THREE.Vector3(0.05, -10.45, -2.18)); // backpanel
    addSnappingPoint(snappingPointRadius, new THREE.Vector3(0.21, -6.34, -0.58)); // BUS
    addSnappingPoint(snappingPointRadius, new THREE.Vector3(-0.04, 10.12, 4.64)); // gold plating
    addSnappingPoint(snappingPointRadius, new THREE.Vector3(0, 11.70, 15.54)); // secondary mirror
    addSnappingPoint(snappingPointRadius, new THREE.Vector3(0.01, 0.03, -16.95)); // solar panels
    addSnappingPoint(snappingPointRadius, new THREE.Vector3(0, -0.21, 1.66)); // sunscreens

    animate();
}

let currentlyDragging = false;

// DRAG & DROP
const dragControls = new DragControls( draggableObjects, camera, renderer.domElement );

dragControls.addEventListener( 'dragstart', function ( event )
{
    orbitControls.enabled = false;
    collisionsEnabled = true;

    currentlyDragging = true;
});

dragControls.addEventListener( 'dragend', function ( event )
{
    orbitControls.enabled = true;

    currentlyDragging = false;
});

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

        const hitBoxMaterial = new THREE.MeshBasicMaterial(
            {color: 0xffffff, transparent: true,
                opacity: 0.1, depthTest: false, wireframe: true
            });

        const hitBox = drawBox(meshSize.x, meshSize.y, meshSize.z, hitBoxMaterial);
        hitBox.geometry.computeBoundingBox();

        partsData.push({
            mesh: hitBox,
            boundingBox: boundingBox,
            snappingPoint: null,
        },);

        mesh.position.set(-meshPosition.x, -meshPosition.y, -meshPosition.z);
        console.log(mesh.position);
        // console.log(mesh.position);

        group.add(hitBox);
        hitBox.add(mesh);

        // hitBox.position.set(
        //     getRandomNumber(100, 50),
        //     getRandomNumber(100, 50),
        //     getRandomNumber(100, 50));
    });
    return group;
}


// SNAPPING POINT
function addSnappingPoint(radius, pos)
{
    const snappingPointMesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius),
        new THREE.MeshPhongMaterial({color: 0xffffff})
    );

    snappingPointMesh.material.transparent = true;
    snappingPointMesh.material.opacity = 0.5;

    let snappingPointBB = new THREE.Sphere(snappingPointMesh.position, radius);
    snappingPointMesh.geometry.computeBoundingBox();

    scene.add(snappingPointMesh);
    snappingPointMesh.position.set(pos.x, pos.y, pos.z);

    snappingPointsData.push({
        mesh: snappingPointMesh,
        boundingBox: snappingPointBB,
        snappedObject: null,
        hasRecentlyCollided: false,
    });

    return snappingPointMesh;
}


const snappingDistance = 10;
const toleranceDistance = 0.1;

function checkCollisions()
{
    let closestPartDistance = 10000000;
    let closestPart = null;
    let closestSP = null;

    for (let SPIndex = 0; SPIndex < snappingPointsData.length; SPIndex++)
    {
        snappingPointsData[SPIndex].mesh.material.color.setHex(0xffffff);

        if (snappingPointsData[SPIndex].snappedObject == null )
        {
            for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
            {
                if(partsData[partsIndex].snappingPoint == null)
                {
                    const partPos = partsData[partsIndex].mesh.position;
                    const SPPos = snappingPointsData[SPIndex].mesh.position;
                    const distance = partPos.distanceTo(SPPos);

                    if(distance < closestPartDistance)
                    {
                        closestPartDistance = distance;
                        closestPart = partsData[partsIndex];
                        closestSP = snappingPointsData[SPIndex];
                    }
                }
            }
        }
        else
        {
            const partPos = snappingPointsData[SPIndex].snappedObject.mesh.position;
            const SPPos = snappingPointsData[SPIndex].mesh.position;
            const distance = partPos.distanceTo(SPPos);

            if (distance >= toleranceDistance)
            {
                snappingPointsData[SPIndex].snappedObject.snappingPoint = null;
                snappingPointsData[SPIndex].snappedObject = null;
            }
        }
    }
    if(closestPartDistance <= snappingDistance)
    {
        closestSP.mesh.material.color.setHex(0xeb4034);
        if (!currentlyDragging)
        {
            closestSP.snappedObject = closestPart;
            closestPart.snappingPoint = closestSP;

            const snappingPointPos = closestSP.mesh.position;
            closestPart.mesh.position.set(snappingPointPos.x, snappingPointPos.y, snappingPointPos.z);
        }
    }
}

// function checkCollisions()
// {
//     // Loop through all parts
//     for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
//     {
//         for (let SPIndex = 0; SPIndex < snappingPointsData.length; SPIndex++)
//         {
//             let isIntersecting = partsData[partsIndex].boundingBox.intersectsSphere(
//                 snappingPointsData[SPIndex].boundingBox);
//
//             // Check if any parts are intersecting with a snapping point
//             if (isIntersecting || snappingPointsData[SPIndex].hasRecentlyCollided)
//             {
//                 snappingPointsData[SPIndex].snappedObject = partsData[partsIndex].mesh;
//
//                 if (!snappingPointsData[SPIndex].hasRecentlyCollided)
//                 {
//                     // Place part in center of snapping point
//                     let snappingPointPos = snappingPointsData[SPIndex].boundingBox.center;
//                     partsData[partsIndex].mesh.position.set(snappingPointPos.x, snappingPointPos.y, snappingPointPos.z);
//
//                     //
//                     dragControls.enabled = false;
//                     setTimeout(function ()
//                     {
//                         dragControls.enabled = true;
//                     }, 1000);
//                 }
//                 snappingPointsData[SPIndex].hasRecentlyCollided = true;
//             }
//
//             if(!isIntersecting)
//             {
//                 snappingPointsData[SPIndex].hasRecentlyCollided = false;
//                 snappingPointsData[SPIndex].snappedObject = null;
//             }
//         }
//     }
// }

function animate()
{
    for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
    {
        partsData[partsIndex].boundingBox.copy(partsData[partsIndex].mesh.geometry.boundingBox)
            .applyMatrix4(partsData[partsIndex].mesh.matrixWorld);
    }

    if (collisionsEnabled) checkCollisions();

    renderer.render( scene, camera );
    requestAnimationFrame( animate );

    // for (let i = 0; i < draggableObjects.length; i++)
    // {
    //     const position = draggableObjects[i].position;
    //     const speed = 0.002;
    //     if(position.x < 100) position.set(position.x + speed, position.y + speed, position.z + speed);
    // }
}


