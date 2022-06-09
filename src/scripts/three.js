const THREE = require('three');
const TWEEN = require('@tweenjs/tween.js')
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import model from '../models/jwst.gltf'
import textData from '../data/text.json';

//ui DOM
const ui = document.getElementById("js--ui");


const infraredText = textData.text.infrared;

// three.js
let telescope;
let camera;
let controls;
let scene;
let renderer;


init();
animate();

function init() {

    // Camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
    camera.position.set(0, 0, 20);

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

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x333333, 1);
    document.body.appendChild(renderer.domElement);

    // Controls
	controls = new OrbitControls( camera, renderer.domElement );
    //controls.enableZoom = false;


    //setup infrared
    setupInfrared();

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

    render();
}

function render() {
    renderer.render(scene, camera);
}


function setupInfrared() {
    controls.enabled = false;

    let dashedLine = new THREE.LineDashedMaterial( {
    	color: 0xffffff,
    	linewidth: 1,
    	scale: 1,
    	dashSize: .1,
    	gapSize: .1,
    });
    let dashedLine_red = dashedLine.clone();
    dashedLine_red.color.setHex(0xff0000);
    let dashedLine_yellow = dashedLine.clone();
    dashedLine_yellow.color.setHex(0xffff00);
    let dashedLine_green = dashedLine.clone();
    dashedLine_green.color.setHex(0x00ff00);
    let dashedLine_blue = dashedLine.clone();
    dashedLine_blue.color.setHex(0x0000ff);
    let dashedLine_purple = dashedLine.clone();
    dashedLine_purple.color.setHex(0xA020F0);
    //triangle
    createLine([{x:-2, y:-2, z:0}, {x:2, y:-2, z:0}, {x:0, y:2, z:0}, {x:-2, y:-2, z:0}]);
    //lightsource
    createLine([{x:-15, y:0, z:0}, {x:-1, y:0, z:0}], dashedLine);
    //color rays
    let originPoint = new THREE.Vector3(0,0,0)
    createLine([originPoint, {x:10, y:4, z:0}, {x:10, y:3, z:0}, originPoint], dashedLine_red);
    createLine([originPoint, {x:5, y:1, z:0}, {x:5, y:0.5, z:0}, originPoint], dashedLine_yellow);
    createLine([originPoint, {x:5, y:0, z:0}, {x:5, y:-0.5, z:0}, originPoint], dashedLine_green);
    createLine([originPoint, {x:5, y:-1, z:0}, {x:5, y:-1.5, z:0}, originPoint], dashedLine_blue);
    createLine([originPoint, {x:5, y:-2, z:0}, {x:5, y:-2.5, z:0}, originPoint], dashedLine_purple);
}


//function for creating lines
function createLine(points = [], material = new THREE.LineBasicMaterial({color: 0xffffff})) {
    let pointsArr = [];

    //seed points array
    for (let i = 0; i < points.length; i++) {
        pointsArr.push(new THREE.Vector3(points[i].x, points[i].y, points[i].z));
    }

    let geometry = new THREE.BufferGeometry().setFromPoints( pointsArr );

    let line = new THREE.Line( geometry, material );
    line.computeLineDistances();

    scene.add(line);

    return line;
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
}
//bind to button
document.getElementById("js--panel-close").onclick = function(){closePanel()};
