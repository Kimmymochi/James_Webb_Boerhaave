const THREE = require('three');
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelBin from '../models/scene.bin'
import model from '../models/scene.gltf'

// Number

const canvas = document.getElementById("number");
const ctx = canvas.getContext("2d");
const x = 32;
const y = 32;
const radius = 30;
const startAngle = 0;
const endAngle = Math.PI * 2;

ctx.fillStyle = "rgb(0, 0, 0)";
ctx.beginPath();
ctx.arc(x, y, radius, startAngle, endAngle);
ctx.fill();

ctx.strokeStyle = "rgb(255, 255, 255)";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.arc(x, y, radius, startAngle, endAngle);
ctx.stroke();

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.font = "32px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("1", x, y);

// three.js
let telescope;
let nodes;
let camera;
let controls;
let scene;
let renderer;
let sprite;
let spriteBehindObject;

// const annotation = document.querySelector(".annotation");
const annotations = document.querySelectorAll('.annotation');

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


    // Sprite

    const numberTexture = new THREE.CanvasTexture(
        document.querySelector("#number")
    );

    const spriteMaterial = new THREE.SpriteMaterial({
        map: numberTexture,
        alphaTest: 0.5,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    // NEW | Dynamically sets position for every sprite
    for( let i = 0; i < positions.length; i++) {
        sprite = new THREE.Sprite(spriteMaterial);
        // sprite.position.set(0,4,0);
        sprite.position.set(positions[i][0], positions[i][1], positions[i][2]);
        sprite.scale.set(60, 60, 1);
        scene.add(sprite);
    }

    // Renderer

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x333333, 1);
    document.body.appendChild(renderer.domElement);

    // Controls

	controls = new OrbitControls( camera, renderer.domElement );
    controls.enableZoom = false;

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
    updateAnnotationOpacity();

    // NEW | updateScreenPosition now sets position for each annotation in HTML
    for( let i = 0; i < annotations.length; i++) {
        updateScreenPosition(positions[i], annotations[i]);
    }
}

function updateAnnotationOpacity() {
    if(telescope == undefined) {
        return;
    }

    const meshDistance = camera.position.distanceTo(telescope.position);
    const spriteDistance = camera.position.distanceTo(sprite.position);
    spriteBehindObject = spriteDistance > meshDistance;
    sprite.material.opacity = spriteBehindObject ? 0.25 : 1;

    // Do you want a number that changes size according to its position?
    // Comment out the following line and the `::before` pseudo-element.
    sprite.material.opacity = 0;
}

function updateScreenPosition(position, annotation) {
    // const vector = new THREE.Vector3(0,4,0);
    const vector = new THREE.Vector3(position[0], position[1], position[2]);
    const canvas = renderer.domElement;

    vector.project(camera);

    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

    annotation.style.top = `${vector.y}px`;
    annotation.style.left = `${vector.x}px`;
    annotation.style.opacity = spriteBehindObject ? 0.25 : 1;
}

// NEW || Click event for toggling annotation display
for (var i = 0; i < annotations.length; i++) {
    annotations[i].addEventListener('click', function() {
      let annotationBox = this.getElementsByClassName("annotation__box")[0];
      annotationBox.style.display == "block" ? annotationBox.style.display = "none" : annotationBox.style.display = "block";
  });
}