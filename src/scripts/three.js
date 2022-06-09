import lato from '../fonts/Lato_Regular.json';

const THREE = require('three');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const fontLoader = new THREE.FontLoader();

fontLoader.load(lato, function (font: THREE.Font) {
	const geometry = new THREE.TextGeometry('Hi\nHow are you?', {
		font: font,
		size: 6,
		height: 2,
	});

	const textMesh = new THREE.Mesh(geometry, [
		new THREE.MeshPhongMaterial({ color: 0xad4000 }),
		new THREE.MeshPhongMaterial({ color: 0x5c2301 }),
	]);

	textMesh.castShadow = true;

}) ;


function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();



