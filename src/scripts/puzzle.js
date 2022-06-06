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
const orbitControls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 20, 100 );
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


// INITIATION
// ----------------------------------------------------------------------
let draggableObjects = [];
const meshes = [backpanel, BUS, goldPlating, secondaryMirror, solarPanels, sunscreens];

let snappingPointsData = [];
let partsData = [];

const snappingPointRadius = 1;

let collisionsEnabled = false;

const partPositions = [
    new THREE.Vector3(23, -4, 20),
    new THREE.Vector3(-22, -13, 15),
    new THREE.Vector3(20, 27, -14),
    new THREE.Vector3(23, 27, 21),
    new THREE.Vector3(-16, 24, -27),
    new THREE.Vector3(-40, 0, -37),
];

// TODO: Find correct snapping points positions instead of guessing
const SPPositions = [
    new THREE.Vector3(0.60, 19.15, -0.75), // backpanel
    new THREE.Vector3(0.60, -0.23, -1.24), // BUS
    new THREE.Vector3(0.60, 18.81, 2.03), // gold plating
    new THREE.Vector3(0.60, 20.56, 12.77), // secondary mirror
    new THREE.Vector3(0.60, 5.79, -17.47), // solar panels
    new THREE.Vector3(0.60, 5.22, 1.15) // sunscreens
];

init();

function init() {

    for (let i = 0; i < meshes.length; i++) {

        // Create a draggable part for all 3D models
        let draggablePart = addDraggablePart(meshes[i], partPositions[i]);
        scene.add(draggablePart);
        draggableObjects.push(draggablePart);

        // Create a snapping point for each part
        addSnappingPoint(snappingPointRadius, SPPositions[i]);
    }

    animate();
}


// DRAG & DROP
// ----------------------------------------------------------------------
const dragControls = new DragControls( draggableObjects, camera, renderer.domElement );
let currentlyDragging = false;

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

function addDraggablePart(mesh, pos)
{
    let group = new THREE.Group();
    const gltfLoader = new GLTFLoader();

    gltfLoader.load( mesh, ( gltf ) =>
    {
        let model = gltf.scene;
        model.scale.set(3, 3, 3);

        model.castShadow = true;
        model.receiveShadow = true; // TODO: shadows not working

        const boundingBox = new THREE.Box3().setFromObject( model );
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
            model: model,
            mesh: hitBox,
            boundingBox: boundingBox,
            snappingPoint: null,
        },);

        model.position.set(-meshPosition.x, -meshPosition.y, -meshPosition.z);

        group.add(hitBox);
        hitBox.add(model);

        hitBox.position.set(pos.x, pos.y, pos.z);
    });
    return group;
}


// SNAPPING POINTS & COLLISION DETECTION
// ----------------------------------------------------------------------
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
    });

    return snappingPointMesh;
}

let closestPartDistance = 10000000;
let closestPart = null;
let closestSP = null;

const snappingDistance = 20;
const toleranceDistance = 0.1;

function checkCollisions()
{
    for (let SPIndex = 0; SPIndex < snappingPointsData.length; SPIndex++)
    {
        SPDefaultState(snappingPointsData[SPIndex]);

        if (snappingPointsData[SPIndex].snappedObject == null )
        {
            findClosestPart(snappingPointsData[SPIndex]);
        }
        else
        {
            ensureTolerableDistance(snappingPointsData[SPIndex]);
        }
    }
    if(closestPartDistance <= snappingDistance)
    {
        SPHoverState(closestSP);
        snapPartToSP();
    }

    closestPartDistance = 10000000;
    closestPart = null;
    closestSP = null;
}

function findClosestPart(snappingPointData)
{
    for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
    {
        if(partsData[partsIndex].snappingPoint == null)
        {
            const partPos = partsData[partsIndex].mesh.position;
            const SPPos = snappingPointData.mesh.position;
            const distance = partPos.distanceTo(SPPos);

            if(distance < closestPartDistance)
            {
                closestPartDistance = distance;
                closestPart = partsData[partsIndex];
                closestSP = snappingPointData;
            }
        }
    }
}

// Makes sure that snappedObjects are still located within tolerable distance of snapping point
// otherwise it will remove the link
function ensureTolerableDistance(snappingPointData)
{
    const partPos = snappingPointData.snappedObject.mesh.position;
    const SPPos = snappingPointData.mesh.position;
    const distance = partPos.distanceTo(SPPos);

    if (distance >= toleranceDistance)
    {
        snappingPointData.snappedObject.snappingPoint = null;
        snappingPointData.snappedObject = null;
    }
}

// Locks closest part to closest snapping point
function snapPartToSP()
{
    if (!currentlyDragging)
    {
        closestSP.snappedObject = closestPart;
        closestPart.snappingPoint = closestSP;

        const snappingPointPos = closestSP.mesh.position;
        closestPart.mesh.position.set(snappingPointPos.x, snappingPointPos.y, snappingPointPos.z);
    }
}

function SPHoverState(SP)
{
    SP.mesh.material.transparent = false;

    const scale = snappingPointRadius * 1.5;
    SP.mesh.scale.set(scale, scale, scale);
}

function SPDefaultState(SP)
{
    SP.mesh.material.transparent = true;

    SP.mesh.scale.set(snappingPointRadius, snappingPointRadius, snappingPointRadius);
}


//  ANIMATE
//  ----------------------------------------------------------------------
function animate()
{
    updatePartsBBLocation();
    // partsFloatAnimation();
    if (collisionsEnabled) checkCollisions();

    renderer.render( scene, camera );
    requestAnimationFrame( animate );
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
    for (let i = 0; i < draggableObjects.length; i++)
    {
        const position = draggableObjects[i].position;
        const speed = 0.002;
        if(position.x < 100) position.set(position.x + speed, position.y + speed, position.z + speed);
    }
}


document.addEventListener('keydown', logKey);

function logKey(e) {

    console.log("-----------------------------------------------------");

    for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
    {
        console.log(partsData[partsIndex].mesh.position);
    }
}





