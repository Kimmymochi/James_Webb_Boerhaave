const THREE = require('three')
const TWEEN = require('@tweenjs/tween.js')

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import modelControlroom from '../models/controlroom.gltf'
import modelButton from '../models/button.gltf'
import launchVideo from '../media/launch.mp4'
import staticVideo from '../media/static.mp4'
import launchAudio from '../media/launch.wav'

export function createLaunch(renderer, camera) {
    const launchTitle = document.getElementById("js--launchTitle");
    const launchCircle = document.getElementById("js--launchCircle");
    const body = document.querySelector('body');

    let scene;
    let button;
    let pushAnimation;
    let video;
    let sound;
    let clickTarget;
    let hoverTarget = null;

    let mixer = new THREE.AnimationMixer();
    let clock = new THREE.Clock();
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let listener = new THREE.AudioListener();

    let hasLaunched = false;

    // CAMERA
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0.1, 0, 0 );
    camera.add( listener );
    
    // SCENE
    scene = new THREE.Scene();
    
    // LIGHTS
    const ambientLight = new THREE.AmbientLight( 0x9698ff , 0.5 );
    scene.add( ambientLight );

    const spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 0, 3, 3 );
    spotLight.castShadow = true;
    scene.add( spotLight );

    // MODELS
    // Button Model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load( modelButton, function ( gltf ) {
        button = gltf.scene;
        button.castShadow = true;
        button.receiveShadow = true;
        button.scale.set( 0.1, 0.1, 0.1 );
        button.position.set( 0.25, -0.25, -0.75 )
        button.rotateX( 0.2 );
    
        // Set animation
        const animations = gltf.animations;
        mixer = new THREE.AnimationMixer( button );
        pushAnimation = mixer.clipAction( animations[0] ).setLoop( THREE.LoopOnce );
        
        scene.add( button );

    }, undefined, function ( error ) {
        console.error( error );
    });

    // Controlroom Model
    gltfLoader.load( modelControlroom, function ( gltf ) {

        //Set new material to screens
        let screenMaterial = new THREE.MeshPhongMaterial( { 
            color: 0x000000,
            specular: 0x6c5bf1,
            shininess: 100,
        } ) 

        let screens = gltf.scene.children[0].children[0].children[7];
        screens.material = screenMaterial;

        gltf.scene.position.set(-2.5, -1.5, 0)
        gltf.scene.rotateX(0.5);
        scene.add( gltf.scene );

        
    
    }, undefined, function ( error ) {
        console.error( error );
    } );

    // VIDEO
    // Set the video element
    video = document.createElement( 'video' );
    video.src = staticVideo;
    video.loop = true;
    video.muted = true;  
    video.load();
    video.play();

    // Add video to texture
    let videoTexture = new THREE.VideoTexture( video );
    videoTexture.needsUpdate = true;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    let videoMaterial = new THREE.MeshBasicMaterial( {map: videoTexture, side: THREE.FrontSide, toneMapped: false} );
    
    // Create small video object
    let smallVideoPLane = new THREE.PlaneGeometry( 0.45, 0.3 );
    let smallVideoMesh = new THREE.Mesh( smallVideoPLane, videoMaterial );
    smallVideoMesh.position.set( -0.14, 0.04, -0.95 );;
    smallVideoMesh.rotateX(0.16);
    scene.add(smallVideoMesh)

    // Create big video object
    let bigVideoPlane = new THREE.PlaneGeometry( 10, 7.5 );
    let bigVideoMesh = new THREE.Mesh( bigVideoPlane, videoMaterial );
    bigVideoMesh.position.set( -6, 6.5, -6.3 );
    scene.add(bigVideoMesh)


    // AUDIO
    // TODO: user gesture is needed to play audio, maybe add start screen where input is needed
    sound = new THREE.Audio( listener );
    let audioLoader = new THREE.AudioLoader();
    audioLoader.load( launchAudio, function ( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
    })

    animate();

    // Event Listeners
    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('pointermove', onMouseMove, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate(time) {
        requestAnimationFrame(animate);
        let mixerUpdateDelta = clock.getDelta();
        mixer.update(mixerUpdateDelta);
        TWEEN.update(time);
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

    function onMouseMove(event) {
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(scene, true);
        if (intersects.length > 0) {
            hoverTarget = intersects[0].object.name;
            
            if( (hoverTarget == "Button" || hoverTarget == "Text") && !hasLaunched) {
                body.style.cursor = "pointer";
            } else {
                body.style.cursor = "default";
            }
        }
    }

    function onMouseDown(event) {
        event.preventDefault();
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
    
        let intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            clickTarget = intersects[0].object.name;
            // Event when button is clicked
            if (clickTarget == "Button" && !hasLaunched) {  
                window.removeEventListener('mousedown', onMouseDown);
                window.removeEventListener('pointermove', onMouseMove);
                pushAnimation.play();
                sound.setVolume( 0.2 );
                hasLaunched = true;         
                video.src = launchVideo;
                video.loop = false;
                video.muted = false;
                video.load();
                video.play();

                let newPosition = new THREE.Vector3( -0.2, 0, -0.4 );
                let duration = 15000;
                tweenCamera( newPosition, duration );
            }
        }
    }

    // Animates the camera to given target
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
                showTitle();
            })
            .start();
    }

    // Fades out screen and shows title
    function showTitle() {
        launchTitle.style.display = "flex";
        launchTitle.classList.add('fadeIn');
        launchCircle.classList.add('rotate');
        sound.setVolume( 0 );
    }

    return scene;
}