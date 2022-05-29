const THREE = require('three');
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelBin from '../models/scene.bin'
import model from '../models/scene.gltf'
import font from '../fonts/Prata_Regular.json'

//test: alternative annotation mechanics
// this is the distance the annotation will have from the annotation fixture point
const annotationOffset = 5;
// array with annotation points
const annotationsData = [
    {
    id: 1,
    location: new THREE.Vector3(0,2,-2),
    title: "Test annotation Title",
    text: "lorem lorem ippy summ"
    },
    {
    id: 2,
    location: new THREE.Vector3(2,2,0),
    title: "Test annotation Title",
    text: "lorem lorem ippy summ"
    },
    {
    id: 3,
    location: new THREE.Vector3(2,0,0),
    title: "Test annotation Title",
    text: "lorem lorem ippy summ"
    },
];
//annotation line material
const annotationMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
    });
//font loader
const loader = new FontLoader();

// three.js
let telescope;
let nodes;
let camera;
let controls;
let scene;
let renderer;
let sprite;
let spriteBehindObject;

// test positions
const positions = [
    [0, 5, 2],
    [0, -1, 7],
    [0, -2, 0]
]

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
    render();
}

function render() {
    renderer.render(scene, camera);
}


function setupAnnotations (annotations) {
    //walk through array of annotations
    for (let i = 0; i < annotations.length; i++) {
        let annotation = annotations[i];

        let location = new THREE.Vector3();
        location.copy(annotation.location);

        let annotationOffsetPosition = calculateAnnotationOffset(annotation.location);

        let annotationLine = generateAnnotationLine(location, annotationOffsetPosition);
        scene.add(annotationLine);
    }
    render();
}

// calculate and return annotation offset
function calculateAnnotationOffset (annotationFixtureLocation) {
    if (!annotationFixtureLocation.isVector3) {
        console.error("calculateAnnotationOffset requires THREE.Vector3 but has been given incorrect type!");
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
        console.error("drawAnnotationLine requires THREE.Vector3 but has been given incorrect type(s)!");
        return;
    }

    //create array with points & cast geometry
    let points = [annotationFixtureLocation, annotationLocation];
    let annotationLineGeometry = new THREE.BufferGeometry().setFromPoints( points );

    //create line with geometry and material;
    let line = new THREE.Line( annotationLineGeometry, annotationMaterial );
    return line;
}


function generateAnnotationText (annotationLocation, title, text) {
    if (!annotationLocation.isVector3) {
        console.error("generateAnnotationText requires THREE.Vector3 but has been given incorrect type!");
        return;
    }

    loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

    	let text = new TextGeometry( title, {
    		font: font,
    		size: 80,
    		height: 5,
    		curveSegments: 12,
    		bevelEnabled: true,
    		bevelThickness: 10,
    		bevelSize: 8,
    		bevelOffset: 0,
    		bevelSegments: 5
    	} );
        text.position.set(0,10,0)
        text.lookAt(camera.position);
        scene.add(text);
        console.log(text);
        render();
    } );
}
generateAnnotationText(new THREE.Vector3(0,0,0), "test", "testext")
