// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.115/build/three.module.js';
// import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.115/examples/jsm/controls/OrbitControls.js';
// import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.115/examples/jsm/loaders/GLTFLoader.js';
// import {DragControls} from "https://cdn.jsdelivr.net/npm/three@0.115/examples/jsm/controls/DragControls.js";

// SCENE SETUP ---------------------------

const THREE = require('three');

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelBin from '../models/scene.bin'
import model from '../models/scene.gltf'
import DragControls from 'three-dragcontrols'

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x1f1f1f,1 );
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
const orbitControls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 20, 100 );
orbitControls.update();

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();

const objects = [];

const gltfLoader = new GLTFLoader();


gltfLoader.load( model, function ( gltf ) {
    objects.push(gltf.scene);
    scene.add( gltf.scene );
}, undefined, function ( error ) {
    console.error( error );
} );


// DRAG & DROP ---------------------------

const controls = new DragControls( objects, camera, renderer.domElement );

controls.addEventListener( 'dragstart', function ( event ) {
    orbitControls.enabled = false;
    event.object.material.emissive.set( 0xaaaaaa );
} );

controls.addEventListener( 'dragend', function ( event ) {
    orbitControls.enabled = true;
    event.object.material.emissive.set( 0x000000 );
} );