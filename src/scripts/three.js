import lato from '../fonts/Lato_Regular.json';

const THREE = require('three');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const fontLoader = new THREE.FontLoader();
fontLoader(lato)


function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();



