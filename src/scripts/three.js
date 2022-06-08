const THREE = require('three');
const TWEEN = require('@tweenjs/tween.js')
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import model from '../models/jwst.gltf'
import textData from '../data/text.json';

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
const annotationsData = textData.text.JWSTParts;
//annotation color
const annotationcolor = 0xffffff;
const annotationcolorSelected = 0xE56528;
//annotation line material
const annotationMaterial = new THREE.LineBasicMaterial({
        color: annotationcolor,
    });
const annotationMaterialSelected = new THREE.LineBasicMaterial({
        color: annotationcolorSelected,
    });
//annotation sphere material
const annotationSphereMaterial = new THREE.MeshBasicMaterial( { color: annotationcolor } );
const annotationSphereMaterialSelected = new THREE.MeshBasicMaterial( { color: annotationcolorSelected } );
const annotationSphereRadius = 0.1;

// three.js
let telescope;
let camera;
let controls;
let scene;
let renderer;
let annotationLines = [];

init();
animate();

function init() {

    // Camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
    camera.position.set(4, 0, 20);

    // Scene
    scene = new THREE.Scene();

    // Lighting
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

	// Model
	const gltfLoader = new GLTFLoader();

	gltfLoader.load( model, function ( gltf ) {
        gltf.scene.castShadow = true;
		gltf.scene.receiveShadow = true;

	    scene.add( gltf.scene );

        telescope = gltf.scene;

        // traverse checks all children of model
        telescope.traverse( function ( object ) {
            if ( object.isMesh ) {

                // set shadows on telescope
                object.castShadow = true;
                object.receiveShadow = true;

                // resets material, important for correct transparency
                let clonedMaterial = object.material.clone();
                object.material = clonedMaterial;
            }
        })

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

    // EventListeners
    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    requestAnimationFrame(animate);
    controls.update();
    updateAnnotationLocations(annotationTextOffset.x, annotationTextOffset.y)
    TWEEN.update(time);
    render();
}

function render() {
    renderer.render(scene, camera);
}

// create and add annotations
function setupAnnotations (annotations) {

    //get keys of JSON object
    let keys = Object.keys(annotations);

    //walk through array of annotations
    for (let i = 0; i < keys.length; i++) {
        let annotation = annotations[keys[i]];

        //get location
        let location = new THREE.Vector3(
            annotation.location.x,
            annotation.location.y,
            annotation.location.z
        );

        //calculate offset
        let annotationOffsetPosition = calculateAnnotationOffset(new THREE.Vector3(
            annotation.location.x,
            annotation.location.y,
            annotation.location.z
        ));

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

        //add meshes to array
        annotationLines.push({
                id: annotation.id,
                sphereStart: sphereStart,
                sphereEnd: sphereEnd,
                line: annotationLine
            })

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

    //walk through UI annotations
    for (let i = 0; i < annotationsInUi.length; i++) {

        //var to set to corresponding annotation data
        let annotationData;
        //get keys of JSON object
        let keys = Object.keys(annotationsData);

        //walk through array of annotations
        for (let j = 0; j < keys.length; j++) {
            let annotation = annotationsData[keys[j]];

            // if id matches, set annotation data var
            if (annotation.id == annotationsInUi[i].getAttribute("data-id")) {
                annotationData = annotation;
            }
        }
        //calculate new screenposition
        let location = new THREE.Vector3(
            annotationData.location.x,
            annotationData.location.y,
            annotationData.location.z
        );
        let updatedPosition = generateScreenSpaceCoords(calculateAnnotationOffset(location));

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
    //reset all previous active classes
    let annotationsInUi = document.querySelectorAll('#js--ui .js--ui-annotation');
    for (let i = 0; i < annotationsInUi.length; i++) {
        annotationsInUi[i].classList.remove("active");
    }
    //then add active class to clicked annotation
    event.target.classList.add("active");

    //add (in)active color to material of selected line
    for (let i = 0; i < annotationLines.length; i++) {
        //change material to selected/active color
        if (annotationLines[i].id == event.target.getAttribute("data-id")) {
            annotationLines[i].sphereStart.material = annotationSphereMaterialSelected;
            annotationLines[i].sphereEnd.material = annotationSphereMaterialSelected;
            annotationLines[i].line.material = annotationMaterialSelected;
        }
        else {
            annotationLines[i].sphereStart.material = annotationSphereMaterial;
            annotationLines[i].sphereEnd.material = annotationSphereMaterial;
            annotationLines[i].line.material = annotationMaterial;
        }
    }

    //get corresponding annotation data
    let annotationData;
    //get keys
    let keys = Object.keys(annotationsData);

    //make entire model transparent
    telescope.traverse( function ( object ) {
        if ( object.isMesh ) {
            object.material.transparent = true;
            object.material.opacity = 0.05;
        }
    });

    //walk through array of annotations
    for (let i = 0; i < keys.length; i++) {
        let item = annotationsData[keys[i]];

        //check if JSON id is same as clicked element ID
        if (item.id == event.target.getAttribute("data-id")) {
            annotationData = item;

            //get part of model that is clicked
            let part = telescope.getObjectByName(item.model).children;

            //make all materials of part visible
            for (let i = 0; i < part.length; i++) {
                part[i].material.transparent = false;
                part[i].material.opacity = 1;
            }

            //zoom in on clicked item
            let newPosition = new THREE.Vector3( camera.position.x, item.location.y, camera.position.z );
            let duration = 1000;
            tweenCamera( newPosition, duration );
        }
    }

    //set ui panel with data from correct annotation
    setUIPanel(annotationData.title, annotationData.description)
}


//function for setting data in UI panel
function setUIPanel (title, text) {
    //get DOM elements
    let panelDOM = document.querySelector('#js--ui #js--ui-panel');
    let titleDOM = document.querySelector('#js--ui #js--ui-panel .textPanel .title');
    let textDOM = document.querySelector('#js--ui #js--ui-panel .textPanel .text');

    //set text values
    titleDOM.innerHTML = title;
    textDOM.innerHTML = text;

    //open ui panel
    panelDOM.classList.add("open");
}


//closes UI panel
function closePanel() {
    //get DOM element
    let panelDOM = document.querySelector('#js--ui #js--ui-panel');
    //close ui panel
    panelDOM.classList.remove("open");

    //remove all active tags on UI annotations
    let annotationsInUi = document.querySelectorAll('#js--ui .js--ui-annotation');
    for (let i = 0; i < annotationsInUi.length; i++) {
        annotationsInUi[i].classList.remove("active");
    }

    //set default/inactive color to all annotation lines
    for (let i = 0; i < annotationLines.length; i++) {
            annotationLines[i].sphereStart.material = annotationSphereMaterial;
            annotationLines[i].sphereEnd.material = annotationSphereMaterial;
            annotationLines[i].line.material = annotationMaterial;
    }

    //make entire model visible again
    telescope.traverse( function ( object ) {
        if ( object.isMesh ) {
            object.material.transparent = false;
            object.material.opacity = 1;
        }
    })

    // set target to it's original position
    let newPosition = new THREE.Vector3( 4, 0, 20 );
    let duration = 2000;
    tweenCamera( newPosition, duration);
}

//bind to button
document.getElementById("js--panel-close").onclick = function(){closePanel()};

// animates the camera to given target
function tweenCamera( targetPos, duration ) {
    let pos = new THREE.Vector3().copy( camera.position );
    const tween = new TWEEN.Tween( pos )
        .to( targetPos, duration )
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate( function () {
            camera.position.copy( pos );
        } )
        .onComplete( function () {
            camera.position.copy ( targetPos);
        })
        .start();
}
