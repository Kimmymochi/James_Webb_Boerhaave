const THREE = require('three');
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelBin from '../models/scene.bin'
import model from '../models/scene.gltf'

//ui DOM
const ui = document.getElementById("js--ui");
// this is the distance the annotation will have from the annotation fixture point
const annotationOffset = 5;
// turn this bool to true if you want annotations to have "visibilityLowered" class when behind telescope
// wont work amazingly with depthCheck because of the complexity of the telescope model
const checkForAnnotationDepth = false;
// this is the distance the annotation title will have from the line
const annotationTextOffset = {
    x: 0,
    y: -10
};

// array with annotation points
// id used to link with text HTML later
const annotationsData = [
    {
    id: 1,
    location: new THREE.Vector3(0,2,-2),
    title: "Test annotation Title",
    },
    {
    id: 2,
    location: new THREE.Vector3(2,2,0),
    title: "Test annotation Title",
    },
    {
    id: 3,
    location: new THREE.Vector3(2,0,0),
    title: "Test annotation Title",
    },
];
//annotation color
const annotationcolor = 0xffffff;
//annotation line material
const annotationMaterial = new THREE.LineBasicMaterial({
        color: annotationcolor,
    });
//annotation sphere material
const annotationSphereMaterial = new THREE.MeshBasicMaterial( { color: annotationcolor } );
const annotationSphereRadius = 0.1;

// three.js
let telescope;
let nodes;
let camera;
let controls;
let scene;
let renderer;
let sprite;
let spriteBehindObject;

init();
animate();

function init() {

    // Camera

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
    camera.position.set(4, 0, 20);
    // Scene

    scene = new THREE.Scene();

    //lighting
    //sun lighting
    const sun = new THREE.PointLight( 0xffffff , 1, 500 );
    sun.position.set( 20, -20, 0 );
    sun.castShadow = true;
    sun.shadow.radius = 2;
    scene.add( sun );
    const sun2 = new THREE.PointLight( 0xffffff , 1, 500 );
    sun2.position.set( 20, 10, 0 );
    sun2.castShadow = true;
    sun2.shadow.radius = 2;
    scene.add( sun2 );
    //general lighting
    const sceneLight = new THREE.AmbientLight(0xffffb8, 0.2);
    scene.add(sceneLight);

	//model
	const gltfLoader = new GLTFLoader();

	gltfLoader.load( model, function ( gltf ) {
        gltf.scene.castShadow = true;
		gltf.scene.receiveShadow = true;

	    scene.add( gltf.scene );

        //assign var for later
        telescope = gltf.scene;

        // bit dirty till model improved
        // sets shadows on telescope
        nodes = telescope.children[0].children[0].children[0].children[0].children;
		for (let i = 0; i < nodes.length; i++) {
			nodes[i].castShadow = true;
			nodes[i].receiveShadow = true;
			nodes[i].material.transparent = true;
		}

	}, undefined, function ( error ) {
	    console.error( error );
	} );


    // Renderer

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x333333, 1);
    document.body.appendChild(renderer.domElement);

    // Controls

	controls = new OrbitControls( camera, renderer.domElement );
    //controls.enableZoom = false;

     //setup all the annotations
    setupAnnotations(annotationsData);

    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    updateAnnotationLocations(annotationTextOffset.x, annotationTextOffset.y)

    render();
}

function render() {
    renderer.render(scene, camera);
}


// create and add annotations
function setupAnnotations (annotations) {
    //walk through array of annotations
    for (let i = 0; i < annotations.length; i++) {
        let annotation = annotations[i];

        //get location
        let location = new THREE.Vector3();
        location.copy(annotation.location);

        //calculate offset
        let annotationOffsetPosition = calculateAnnotationOffset(annotation.location);

        //create line and add it to scene
        let annotationLine = generateAnnotationLine(location, annotationOffsetPosition);
        scene.add(annotationLine);

        //add little ball on ends of line
        let geometry = new THREE.SphereGeometry( annotationSphereRadius, 16, 16 );
        let sphereStart = new THREE.Mesh( geometry, annotationSphereMaterial );
        let sphereEnd = new THREE.Mesh( geometry, annotationSphereMaterial );
        sphereStart.position.set(location.x, location.y, location.z);
        scene.add( sphereStart );
        sphereEnd.position.set(annotationOffsetPosition.x, annotationOffsetPosition.y, annotationOffsetPosition.z);
        scene.add( sphereEnd );

        //generate text for annotation
        generateAnnotationText(annotationOffsetPosition, annotation, annotationTextOffset.x, annotationTextOffset.y);
    }

    //rerender when setup done
    render();
}

// calculate and return annotation offset
function calculateAnnotationOffset (annotationFixtureLocation) {
    if (!annotationFixtureLocation.isVector3) {
        console.error("calculateAnnotationOffset() requires THREE.Vector3 but has been given incorrect type!");
        return;
    }
    //get normalized vector of location for direction
    let annotationDirection = annotationFixtureLocation.normalize();

    //multiply direction of travel with annotation offset as magnitude
    let annotationVector = annotationDirection.multiplyScalar(annotationOffset);

    //now we add this vector to original fixture location of the annotation, to get the point where annotation can be written
    let annotationLocation = annotationFixtureLocation.add(annotationVector);

    return annotationLocation;
}


// generate and return line between original fixture location of the annotation and the point where annotation will be written
function generateAnnotationLine (annotationFixtureLocation, annotationLocation) {
    if (!annotationFixtureLocation.isVector3 || !annotationLocation.isVector3) {
        console.error("drawAnnotationLine() requires THREE.Vector3 but has been given incorrect type(s)!");
        return;
    }

    //create array with points & cast geometry
    let points = [annotationFixtureLocation, annotationLocation];
    let annotationLineGeometry = new THREE.BufferGeometry().setFromPoints( points );

    //create line with geometry and material;
    let line = new THREE.Line( annotationLineGeometry, annotationMaterial );

    return line;
}


//generate and create annotation text in UI DOM
function generateAnnotationText (annotationLocation, annotation, offsetX = 0, offsetY = 0) {
    if (!annotationLocation.isVector3) {
        console.error("generateAnnotationText() requires THREE.Vector3 but has been given incorrect type!");
        return;
    }

    //create span element
    let annotationElement = document.createElement('span');
    //set attributes and classes
    annotationElement.classList.add("js--ui-annotation");
    annotationElement.setAttribute("data-id", annotation.id);
    annotationElement.setAttribute("isAnnotation", true);
    //fill text
    annotationElement.innerHTML = annotation.title;

    //set annotation offset in ui canvas
    let vector = generateScreenSpaceCoords(annotationLocation);
    annotationElement.style.top = `${vector.y + offsetY}px`;
    annotationElement.style.left = `${vector.x + offsetX}px`;

    //bind onclick to annotation
    annotationElement.onclick = function(ev) {
        annotationOnclick(ev);
    }

    //append element to ui DOM
    ui.appendChild(annotationElement);
}


//calculate 2D-CSS offset for items in THREE environment, for UI overlay
function generateScreenSpaceCoords (location) {
    if (!location.isVector3) {
        console.error("generateScreenSpaceCoords() requires THREE.Vector3 but has been given incorrect type!");
        return;
    }

    //get canvas
    let canvas = renderer.domElement;

    //calculate screenspace ([-1,1], [-1,1]) for vector3
    let vector = new THREE.Vector3(0,0,0);
    vector.copy(location);
    vector.project(camera);

    //reformat -1 <-> 1 to 0 <-> screenwidth/height for css properties
    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

    return vector;
}


//update annotation locations for when camera moves
function updateAnnotationLocations (offsetX = 0, offsetY = 0) {
    //get all annotations
    let annotationsInUi = document.querySelectorAll('#js--ui .js--ui-annotation');

    for (let i = 0; i < annotationsInUi.length; i++) {

        //get corresponding annotation data
        let annotationData = annotationsData.filter(
            item => item.id == annotationsInUi[i].getAttribute("data-id")
        )[0];

        //calculate new screenposition
        let updatedPosition = generateScreenSpaceCoords(calculateAnnotationOffset(annotationData.location));

        //update screenposition
        annotationsInUi[i].style.top = `${updatedPosition.y + offsetY}px`;
        annotationsInUi[i].style.left = `${updatedPosition.x + offsetX}px`;

        //check if telescope exists because it takes time to load in
        if (checkForAnnotationDepth && telescope) {
            //get distances to annotation and telescope
            let annotationDistance = camera.position.distanceTo(annotationData.location);
            let telescopeDistance = camera.position.distanceTo(telescope.position);

            //check if annotation is behind telescope
            let isAnnotationBehindTelescope = annotationDistance > telescopeDistance;

            // add/remove visibilityLowered class when behind telescope
            if (isAnnotationBehindTelescope) {
                annotationsInUi[i].classList.add("visibilityLowered");
            } else {
                annotationsInUi[i].classList.remove("visibilityLowered");
            }
        }
    }
}


//this function is bound to annotations and will fire when clicked
function annotationOnclick (event) {

    //get corresponding annotation data
    let annotationData = annotationsData.filter(
        item => item.id == event.target.getAttribute("data-id")
    )[0];

    console.log("clicked annotation ID:" + annotationData.id);
}
