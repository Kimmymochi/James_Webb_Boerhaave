const THREE = require('three');
const TWEEN = require('@tweenjs/tween.js')
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import model from '../models/jwst.gltf'
import textData from '../data/text.json';

//ui DOM
const ui = document.getElementById("js--ui");

//chapters
const infraredText = textData.text.infrared.chapters;
let currentChapterIndex = 0;

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
    camera.position.set(-4, 0, 4);

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
    camera.rotation.set(0,0,0);

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
    //controls.update();
    TWEEN.update(time);
    render();
}

function render() {
    renderer.render(scene, camera);
}


function chapterControl(chapter) {
    let cameraPosition = new THREE.Vector3(chapter.cameraPosition.x, chapter.cameraPosition.y, chapter.cameraPosition.z);
    tweenCamera(cameraPosition, 2000);

    setUIPanel(chapter.title, chapter.text);
}


function setupInfrared() {
    window.addEventListener("keydown", function(event) {
        if (event.keyCode === 32) {
            chapterControl(infraredText[Object.keys(infraredText)[currentChapterIndex]]);

            if (Object.keys(infraredText).length - 1 == currentChapterIndex) {
                //end
            } else {
                currentChapterIndex++;
            }
        }
    });

    controls.enabled = false;

    let dashedLine = new THREE.LineBasicMaterial( {
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
    //createLine([{x:-2, y:-2, z:0}, {x:2, y:-2, z:0}, {x:0, y:2, z:0}, {x:-2, y:-2, z:0}]);
    //lightsource
    createLine([{x:-15, y:0, z:0}, {x:0, y:0, z:0}], dashedLine);
    //color rays
    let originPoint = new THREE.Vector3(0,0,0);
    createLine([originPoint, {x:10, y:4, z:0}, {x:15, y:4, z:0}, {x:16, y:3.5, z:0}, {x:15, y:3, z:0}, {x:10, y:3, z:0}, originPoint], dashedLine_red);
	createLine([{x:16, y:3.5, z:0}, {x:20, y:3.5, z:0}], dashedLine);
    createLine([originPoint, {x:7.5, y:1.5, z:0}, {x:7.5, y:1, z:0}, originPoint], dashedLine_yellow);
    createLine([originPoint, {x:6.5, y:0, z:0}, {x:6.5, y:-0.5, z:0}, originPoint], dashedLine_green);
    createLine([originPoint, {x:5, y:-1, z:0}, {x:5, y:-1.5, z:0}, originPoint], dashedLine_blue);
    createLine([originPoint, {x:2.5, y:-1, z:0}, {x:2.5, y:-1.5, z:0}, originPoint], dashedLine_purple);
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
    document.getElementById("js--panel-close").removeAttribute("disabled");
}


//closes UI panel
function closePanel() {
    //get DOM element
    let panelDOM = document.querySelector('#js--ui #js--ui-panel');
    //close ui panel
    panelDOM.classList.remove("open");

    //disable close button to prevent any bugs on reopening panel next time
    document.getElementById("js--panel-close").setAttribute("disabled", true);
}
//bind to button
document.getElementById("js--panel-close").onclick = function(){closePanel()};

//collapses UI panel
function toggleCollapsePanel() {
    //get DOM element
    let panelDOM = document.querySelector('#js--ui #js--ui-panel');
    let panelLabel = document.querySelector('#js--ui #js--panel-label');
    //close ui panel
    panelDOM.classList.toggle("collapsed");

    //set text
    panelLabel.innerHTML = panelDOM.classList.contains("collapsed") ? textData.text.ui.collapseLabel.collapsed : textData.text.ui.collapseLabel.open;
}
//bind to button
document.getElementById("js--panel-collapse").onclick = function(){toggleCollapsePanel()};

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
