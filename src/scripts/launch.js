import * as THREE from 'three';
import { InteractionManager } from "three.interactive";
import { changeScene }  from "./main.js";

import modelControlroom from '../models/controlroom.gltf'
import modelButton from '../models/button.gltf'
import launchVideo from '../media/launch.mp4'
import staticVideo from '../media/static.mp4'
import launchAudio from '../media/launch.wav'


const TWEEN = require('@tweenjs/tween.js');

export function createLaunch(renderer, camera, loader) {
    const launchTitle = document.getElementById("js--launchTitle");
    const launchCircle = document.getElementById("js--launchCircle");
    const body = document.querySelector('body');
            
    document.getElementById( "js--arrowIcon").classList.remove("hidden");
    document.getElementById( "js--restartIcon").classList.add("hidden");
    document.getElementById( "js--sceneChanger").classList.add("hidden");

    let scene;
    let controlRoom;
    let button;
    let pushAnimation;
    let video;
    let videoImage;
    let videoImageContext;
    let videoTexture;
    let sound;

    let mixer = new THREE.AnimationMixer();
    let clock = new THREE.Clock();
    let listener = new THREE.AudioListener();

    let hasLaunched = false;

    // CAMERA
    camera.position.set( 0.1, 0, 0 );
    // camera.add( listener );
    
    // SCENE
    scene = new THREE.Scene();

    // INTERACTIONMANAGER
    const interactionManager = new InteractionManager(
        renderer,
        camera,
        renderer.domElement
        );
        
    // LIGHTS
    const ambientLight = new THREE.AmbientLight( 0x9698ff , 0.5 );
    scene.add( ambientLight );

    const spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 0, 3, 3 );
    spotLight.castShadow = true;
    scene.add( spotLight );

    // MODELS
    // Button Model
    loader.load( modelButton, function ( gltf ) {
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

        // Mouse events
        button.addEventListener("mouseover", (event) => {
            body.style.cursor = "pointer";
        });

        button.addEventListener("mouseout", (event) => {
            body.style.cursor = "default";
        });
        
        button.addEventListener("click", (event) => {
            if(!hasLaunched) {
                body.style.cursor = "default";
                interactionManager.dispose();
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
        });

        scene.add( button );
        interactionManager.add(button);

    }, undefined, function ( error ) {
        console.error( error );
    });

    // Controlroom Model
    loader.load( modelControlroom, function ( gltf ) {
        controlRoom = gltf.scene;
        //Set new material to screens
        let screenMaterial = new THREE.MeshPhongMaterial( { 
            color: 0x000000,
            specular: 0x6c5bf1,
            shininess: 100,
        } ) 

        let screens = gltf.scene.children[0].children[0].children[7];
        screens.material = screenMaterial;

        controlRoom.position.set(-2.5, -1.5, 0)
        controlRoom.rotateX(0.5);
        scene.add( controlRoom );

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

    // fixes for 'WebGL: INVALID_VALUE: textImage2D: no video; 
    videoImage = document.createElement( 'canvas' );
	videoImage.width = 1920;
	videoImage.height = 1080;

	videoImageContext = videoImage.getContext( '2d' );
	videoImageContext.fillStyle = '#000000';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

    // Add video to texture
    videoTexture = new THREE.VideoTexture( videoImage );
    videoTexture.needsUpdate = true;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    let videoMaterial = new THREE.MeshBasicMaterial( {map: videoTexture, side: THREE.FrontSide, toneMapped: false} );
    
    // Create small video object
    let smallVideoPLane = new THREE.PlaneBufferGeometry( 0.45, 0.3 );
    let smallVideoMesh = new THREE.Mesh( smallVideoPLane, videoMaterial );
    smallVideoMesh.position.set( -0.14, 0.04, -0.95 );;
    smallVideoMesh.rotateX(0.16);
    scene.add(smallVideoMesh)

    // Create big video object
    let bigVideoPlane = new THREE.PlaneBufferGeometry( 10, 7.5 );
    let bigVideoMesh = new THREE.Mesh( bigVideoPlane, videoMaterial );
    bigVideoMesh.position.set( -6, 6.5, -6.3 );
    scene.add(bigVideoMesh)

    // AUDIO
    sound = new THREE.Audio( listener );
    let audioLoader = new THREE.AudioLoader();
    audioLoader.load( launchAudio, function ( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
    })

    animate();

    // WINDOW RESIZER
    window.addEventListener("resize", onWindowResize, false);

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
        interactionManager.update();
        render();
    }

    function render() {

        // fixes for 'WebGL: INVALID_VALUE: texImage2D: no video; 
        if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
            videoImageContext.drawImage( video, 0, 0 );
            if ( videoTexture ) { videoTexture.needsUpdate = true; }
        }

        renderer.render(scene, camera);
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
                camera.position.copy ( targetPos );
                showTitle();

                setTimeout( function () {
                    changeScene();
                    video.pause();
                }, "5000");
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