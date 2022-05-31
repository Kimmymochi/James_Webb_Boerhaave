const THREE = require('three');
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelControlroom from '../models/controlroom.gltf'
import modelButton from '../models/button.gltf'
import launch from '../media/launch.mp4'

let scene, camera, renderer, geometry, material, cylinder, button, target, push, video;
let mixer = new THREE.AnimationMixer();
let clock = new THREE.Clock();


init();
animate();

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function init() {

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);

    // Scene
    scene = new THREE.Scene();

    
    //lighting
    //sun lighting
    const sun = new THREE.PointLight( 0xffffff , 1, 500 );
    sun.position.set( 0, 10, 0 );
    sun.castShadow = true;
    sun.shadow.radius = 2;
    scene.add( sun );
    const sun2 = new THREE.PointLight( 0xffffff , 1, 500 );
    sun2.position.set( 0, 0, -1 );
    sun2.castShadow = true;
    sun2.shadow.radius = 2;
    scene.add( sun2 );
    // general lighting
    const sceneLight = new THREE.AmbientLight(0xffffb8, 0.2);
    scene.add(sceneLight);

	// Model
	const gltfLoader = new GLTFLoader();

	gltfLoader.load( modelButton, function ( gltf ) {
        button = gltf.scene;
        button.castShadow = true;
		button.receiveShadow = true;

        const animations = gltf.animations;
        mixer = new THREE.AnimationMixer( button );
        push = mixer.clipAction( animations[0]).setLoop(THREE.LoopOnce);
        button.callback = function () {
           
        };
	    scene.add( button );

	}, undefined, function ( error ) {
	    console.error( error );
	} );

    // gltfLoader.load( modelControlroom, function ( gltf ) {
    //     gltf.scene.castShadow = true;
	// 	gltf.scene.receiveShadow = true;
    //     gltf.scene.position.set(-3, -1, 5.5)
	//     scene.add( gltf.scene );

	// }, undefined, function ( error ) {
	//     console.error( error );
	// } );

    video = document.createElement('video');
    video.src = launch;
    video.load();
    
    // let videoCanvas = document.createElement('canvas');
    // let videoCtx = videoCanvas.getContext('2d');
    // videoCanvas.width = 640;
    // videoCanvas.height = 480;
    // videoCtx.fillStyle = '#000000';
    // videoCtx.fillRect(0, 0, 640, 480);

    let videoTexture = new THREE.VideoTexture(video);
    videoTexture.needsUpdate = true;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    // videoTexture.format= THREE.RGBFormat;
    videoTexture.crossOrigin = 'anonymous';

    let videoMaterial = new THREE.MeshBasicMaterial( {map: videoTexture, side: THREE.DoubleSide});
    let videoPlane = new THREE.PlaneGeometry(4, 2);
    let videoMesh = new THREE.Mesh(videoPlane, videoMaterial);

    videoMesh.position.set(0, 1.5, -1.5 );


    scene.add(videoMesh)

    // Button
    geometry = new THREE.CylinderGeometry(1.1, 1.1, 0.2);
    material = new THREE.MeshBasicMaterial({color: 0x000000});
    cylinder = new THREE.Mesh( geometry, material);
    cylinder.position.set(0, -0.1, 0 );

    scene.add(cylinder);

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);


    
    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    let mixerUpdateDelta = clock.getDelta();
    mixer.update(mixerUpdateDelta);

    render();
}

function render() {
    // if(video.readyState === video.HAVE_ENOGUH_DATA) {
    //     videoCtx.drawImage(video, 0, 0);
       
    // }

    renderer.render(scene, camera);
}

function onMouseDown(event) {
    event.preventDefault();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        target = intersects[0].object.name;
        target == "Cylinder" ?  push.play().reset(): console.log('niet'); 
        video.play();       
    }

}

window.addEventListener('mousedown', onMouseDown, false);
