import * as THREE from 'three';
import textData from '../data/text.json';
import model from '../models/jwst.gltf'
import { addEnvironment } from './stars.js';
const TWEEN = require('@tweenjs/tween.js')

export function createInfrared(renderer, camera, loader, fireSceneChange) {
    //ui DOM
    const ui = document.getElementById("js--ui");
    const launchTitle = document.getElementById("js--launchTitle");

    //chapters
    const infraredText = textData.text.infrared.chapters;
    let currentChapterIndex = -1;

    // three.js
    // let controls;
    let scene = new THREE.Scene();;
    let telescope;

    // Camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
    camera.position.set(-4, 0, 4);

    //model
	loader.load( model, function ( gltf ) {
        gltf.scene.castShadow = true;
		gltf.scene.receiveShadow = true;

	    scene.add( gltf.scene );
        gltf.scene.position.set(22.5, 3, 0);
        gltf.scene.scale.set(0.1, 0.1, 0.1);
        gltf.scene.rotation.y = -Math.PI / 2.2;

        //assign var for later
        telescope = gltf.scene;

	}, undefined, function ( error ) {
	    console.error( error );
	} );


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


    // Controls
    // controls = new OrbitControls( camera, renderer.domElement );
    //controls.enableZoom = false;


    //setup infrared
    setupInfrared();
    launchTitle.style.display = "none";
    ui.style.display = "block";

    camera.rotation.set(0,0,0);

    // EventListeners
    window.addEventListener("resize", onWindowResize, false);

    animate();
    addEnvironment( renderer, camera, scene);

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
        document.getElementById("js--sceneChanger").onclick = function(event) {
            //if last chapter, run main.js function to change scene
            if (Object.keys(infraredText).length - 1 == currentChapterIndex) {

                closePanel();
                document.getElementById("js--sceneChanger").classList.add('hidden');

                // change camera & telescope position
                let cameraPosition = new THREE.Vector3(22.5, 3, 3);
                tweenCamera(cameraPosition, 2000);
                tweenTelescope( -Math.PI / 10 );

                setTimeout( function() {
                    fireSceneChange();
                }, "2000");

            //otherwise, increment chapter and run setup
            } else {
                currentChapterIndex++;
                chapterControl(infraredText[Object.keys(infraredText)[currentChapterIndex]]);
            }
        };

        // controls.enabled = false;

        let dashedLine = new THREE.LineBasicMaterial( {
            color: 0xffffff,
            linewidth: 1,
            // scale: 1,
            // dashSize: .1,
            // gapSize: .1,
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
        //lines for telescope
       let telescopeSecundaryMirror = new THREE.Vector3(21.735, 3.34, 0);
       let telescopeTertiaryMirror = new THREE.Vector3(22.24, 3.35, 0);
       createLine([{x:20, y:3.5, z:0}, {x: 22.35, y:3.5, z:0}, telescopeSecundaryMirror, telescopeTertiaryMirror]);
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
        panelDOM.classList.remove("collapsed");
    }


    //closes UI panel
    function closePanel() {
        //get DOM element
        let panelDOM = document.querySelector('#js--ui #js--ui-panel');
        //close ui panel
        panelDOM.classList.remove("open");
    }

    //collapses UI panel
    function toggleCollapsePanel() {
        //get DOM element
        let panelDOM = document.querySelector('#js--ui #js--ui-panel');
        let panelLabel = document.querySelector('#js--ui #js--panel-label-collapse');
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

    // animates the Y rotation of telescope to given value
    function tweenTelescope( newTelescopeY ) {
        let currentTelescope = new THREE.Vector3().copy( telescope.rotation );

        new TWEEN.Tween(currentTelescope)
            .to({x: 0, y: newTelescopeY, z: 0}, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(function () {
                telescope.rotation.y = currentTelescope.y
            })
            .onComplete( function () {
                telescope.rotation.y = newTelescopeY;
            })
            .start();
    }

    return scene;
}
