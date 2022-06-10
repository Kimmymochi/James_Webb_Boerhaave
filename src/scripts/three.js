const THREE = require('three');

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3, 50);
dirLight.position.set(1, 2, -1);
scene.add(dirLight);
dirLight.castShadow = true;

const loader = new FontLoader();
const font = loader.load(
	'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',

	function ( font ) {
		const geometry = new TextGeometry('Hi\nHow are you?', {
			font: font,
			size: 6,
			height: 2,
		});

		const textMesh = new THREE.Mesh(geometry, [
			new THREE.MeshPhongMaterial({ color: 0xad4000 }),
			new THREE.MeshPhongMaterial({ color: 0x5c2301 }),
		]);

		textMesh.castShadow = true;
		textMesh.position.y += 15;
		textMesh.position.z -= 40;
		textMesh.position.x = -8;
		textMesh.rotation.y = -0.50;

		scene.add(textMesh);
	}
);




function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();



