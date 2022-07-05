import * as THREE from 'three';
import DragControls from 'three-dragcontrols'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { addEnvironment } from './stars';

import textData from '../data/text.json';

import backpanel from '../models/backpanel.gltf'
import BUS from '../models/BUS.gltf'
import goldPlating from '../models/gold_plating.gltf'
import ISIS from '../models/ISIS.gltf'
import secondaryMirror from '../models/secondary_mirror.gltf'
import solarPanels from '../models/solar_panels.gltf'
import sunscreens from '../models/sunscreens.gltf'

export function createPuzzle( renderer, camera, loader ) {

    const scene = new THREE.Scene();
    const ui = document.getElementById("js--ui");
    const nextScene = document.getElementById('js--sceneChanger');

    // CAMERA
    // ----------------------------------------------------------------------
    
    // Regular Camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 20, 100 );

    // Ortographic Camera
    // const frustumSize = 100;
    // const aspect = window.innerWidth / window.innerHeight;
    // camera = new THREE.OrthographicCamera(
    //     frustumSize * aspect / - 2,
    //     frustumSize * aspect / 2,
    //     frustumSize / 2,
    //     frustumSize / - 2, 1, 1000
    // );

    // camera.position.set( - 200, 200, 200 );

    // ORBIT CONTROLS
    // ----------------------------------------------------------------------
    const orbitControls = new OrbitControls( camera, renderer.domElement );
    orbitControls.enableZoom = false;
    orbitControls.enablePan = false;
    orbitControls.update();


    // LIGHTING
    // ----------------------------------------------------------------------
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

    const sceneLight = new THREE.AmbientLight(0xffffb8, 0.2);
    scene.add(sceneLight);


    // INITIATION
    // ----------------------------------------------------------------------
    let draggableParts = [];
    const meshes = [backpanel, BUS, goldPlating, secondaryMirror, solarPanels, sunscreens];

    const snappingPointRadius = 1;

    let collisionsEnabled = false;

    let snappingPointsData = [];
    let partsData = [];

    const partPositions = [
        new THREE.Vector3(23, -4, 20),
        new THREE.Vector3(-22, -13, 15),
        new THREE.Vector3(20, 27, -14),
        new THREE.Vector3(23, 27, 21),
        new THREE.Vector3(-16, 24, -27),
        new THREE.Vector3(-40, 0, -37),
    ];

    const SPPositions = [
        new THREE.Vector3(0.60, 19.15, -0.75), // backpanel
        new THREE.Vector3(0.60, -0.23, -1.24), // BUS
        new THREE.Vector3(0.60, 18.81, 2.03), // gold plating
        new THREE.Vector3(0.60, 20.56, 12.77), // secondary mirror
        new THREE.Vector3(0.60, 5.79, -17.47), // solar panels
        new THREE.Vector3(0.60, 5.22, 1.15) // sunscreens
    ];

    ui.style.display = "none";
    for (let i = 0; i < meshes.length; i++) {

        // Create a draggable part for all 3D models
        let draggablePart = addDraggablePart(meshes[i], partPositions[i], i);
        scene.add(draggablePart);
        draggableParts.push(draggablePart);

        // Create a snapping point for each part
        addSnappingPoint(snappingPointRadius, SPPositions[i], i);

    }

    addEnvironment(renderer, camera, scene);

    animate();


    // UI
    // ----------------------------------------------------------------------
    const puzzleUI = document.getElementById("js--puzzle");
    const puzzleHintButton = document.getElementById("js--puzzle-hint-button");

    initPuzzleUI(textData.text.puzzle.title, textData.text.puzzle.text);
    openPuzzleUI();

    // Initiates all UI related to the puzzle
    function initPuzzleUI(title, text)
    {
        let titleDOM = document.querySelector('#js--puzzle-title');
        let textDOM = document.querySelector('#js--puzzle-text');

        titleDOM.innerHTML = title;
        textDOM.innerHTML = text;
    }

    function openPuzzleUI()
    {
        puzzleUI.classList.add("open");
    }

    function closePuzzleUI()
    {
        puzzleUI.classList.remove("open");
    }

    puzzleHintButton.addEventListener("click", useHint);

    // Places a part on the correct snapping point
    function useHint()
    {
        collisionsEnabled = true;

        for (let SPIndex = 0; SPIndex < snappingPointsData.length; SPIndex++)
        {
            let SPMesh = snappingPointsData[SPIndex].mesh;
            let partMesh = partsData[SPIndex].mesh;

            let SPSnappedObject = snappingPointsData[SPIndex].snappedObject;

            let isNotCorrectlyPlaced = SPSnappedObject != partsData[SPIndex];
            let SPIsEmpty = SPSnappedObject === null;

            if (isNotCorrectlyPlaced)
            {
                if (!SPIsEmpty)
                {
                    SPSnappedObject.mesh.position.set(
                        SPSnappedObject.mesh.position.x + 30,
                        SPSnappedObject.mesh.position.y + 30,
                        SPSnappedObject.mesh.position.z + 30
                    );
                }

                partMesh.position.set(SPMesh.position.x, SPMesh.position.y, SPMesh.position.z);
                break;
            }
        }
    }


    // WINDOW RESIZE
    window.addEventListener("resize", onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    

    // DRAG & DROP
    // ----------------------------------------------------------------------
    let dragControls = new DragControls( draggableParts, camera, renderer.domElement );
    let currentlyDragging = false;

    dragControls.addEventListener( 'dragstart', function ( event )
    {
        orbitControls.enabled = false;
        collisionsEnabled = true;

        currentlyDragging = true;
    });

    dragControls.addEventListener( 'dragend', function ( event )
    {
        orbitControls.enabled = true;

        currentlyDragging = false;
    });

    function drawBox(objectWidth, objectHeight, objectDepth, material)
    {
        let geometry, box;

        geometry = new THREE.BoxGeometry(objectWidth,objectHeight,objectDepth);

        box = new THREE.Mesh(geometry, material);
        draggableParts.push(box);
        box.position.set(0, 0, 0);

        return box;
    }

    // Adds a 3D model to the scene that can be dragged by the player
    function addDraggablePart(mesh, pos, id)
    {
        let group = new THREE.Group();
        loader.load( mesh, ( gltf ) =>
        {
            let model = gltf.scene;
            model.scale.set(3, 3, 3);

            model.traverse( function ( model) {
                if ( model.isMesh ) {
                    model.castShadow = true;
                    model.receiveShadow = true;
                }
            });

            const boundingBox = new THREE.Box3().setFromObject( model );
            let meshSize = new THREE.Vector3();
            let meshPosition = new THREE.Vector3();
            boundingBox.getSize(meshSize);
            boundingBox.getCenter(meshPosition)

            const hitBoxMaterial = new THREE.MeshBasicMaterial(
                {
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.1,
                    wireframe: true
                });

            const hitBox = drawBox(
                meshSize.x + 2,
                meshSize.y + 2,
                meshSize.z + 2,
                hitBoxMaterial
            );
            hitBox.geometry.computeBoundingBox();

            partsData.push({
                mesh: hitBox,
                boundingBox: boundingBox,
                snappingPoint: null,
                id: id
            },);

            model.position.set(-meshPosition.x, -meshPosition.y, -meshPosition.z);

            group.add(hitBox);
            hitBox.add(model);

            hitBox.position.set(pos.x, pos.y, pos.z);
        });
        return group;
    }


    // SNAPPING POINTS & COLLISION DETECTION
    // ----------------------------------------------------------------------

    // Adds a point that parts can be snapped to
    function addSnappingPoint(radius, pos, correctPartId)
    {
        const snappingPointMesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius),
            new THREE.MeshPhongMaterial({color: 0xffffff})
        );

        snappingPointMesh.material.transparent = true;
        snappingPointMesh.material.opacity = 0.5;

        let snappingPointBB = new THREE.Sphere(snappingPointMesh.position, radius);
        snappingPointMesh.geometry.computeBoundingBox();

        scene.add(snappingPointMesh);
        snappingPointMesh.position.set(pos.x, pos.y, pos.z);

        snappingPointsData.push({
            mesh: snappingPointMesh,
            boundingBox: snappingPointBB,
            snappedObject: null,
            correctPartId: correctPartId
        });

        return snappingPointMesh;
    }

    let closestPartDistance = 10000000;
    let closestPart = null;
    let closestSP = null;

    const snappingDistance = 20;
    const toleranceDistance = 0.1;

    // Handles everything related to collisions between parts and snapping points
    function checkCollisions()
    {
        closestPartDistance = 10000000;
        closestPart = null;
        closestSP = null;

        let isPuzzleCompleted = true;

        resetPartsToDefaultState();

        for (let SPIndex = 0; SPIndex < snappingPointsData.length; SPIndex++)
        {
            SPDefaultState(snappingPointsData[SPIndex]);

            let snappedObjectIsPresent = snappingPointsData[SPIndex].snappedObject;
            let snappedObjectIsCorrect = snappedObjectIsPresent &&
                snappingPointsData[SPIndex].snappedObject.id === snappingPointsData[SPIndex].correctPartId;

            if (!snappedObjectIsPresent)
            {
                findClosestPart(snappingPointsData[SPIndex]);
            } else
            {
                ensureTolerableDistance(snappingPointsData[SPIndex]);
            }

            if (snappedObjectIsPresent && snappedObjectIsCorrect)
            {
                partPlacedCorrectlyState(snappingPointsData[SPIndex].snappedObject);
            }
            else
            {
                isPuzzleCompleted = false;
                if (snappingPointsData[SPIndex].snappedObject != null)
                {
                    partPlacedIncorrectlyState(snappingPointsData[SPIndex].snappedObject);
                }
            }
        }
        if(closestPartDistance <= snappingDistance)
        {
            SPHoverState(closestSP);
            snapPartToSP();
        }

        if (isPuzzleCompleted) puzzleCompleted();
    }

    // Updates values necessary for finding closest part to snapping point
    function findClosestPart(snappingPointData)
    {
        for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
        {
            if(partsData[partsIndex].snappingPoint == null)
            {
                const partPos = partsData[partsIndex].mesh.position;
                const SPPos = snappingPointData.mesh.position;
                const distance = partPos.distanceTo(SPPos);

                if(distance < closestPartDistance)
                {
                    closestPartDistance = distance;
                    closestPart = partsData[partsIndex];
                    closestSP = snappingPointData;
                }
            }
        }
    }

    // Makes sure that snappedObjects are still located within tolerable distance of snapping point
    // otherwise it will remove the link
    function ensureTolerableDistance(snappingPointData)
    {
        const partPos = snappingPointData.snappedObject.mesh.position;
        const SPPos = snappingPointData.mesh.position;
        const distance = partPos.distanceTo(SPPos);

        if (distance >= toleranceDistance)
        {
            snappingPointData.snappedObject.snappingPoint = null;
            snappingPointData.snappedObject = null;
        }
    }

    // Locks closest part to closest snapping point
    function snapPartToSP()
    {
        if (!currentlyDragging)
        {
            closestSP.snappedObject = closestPart;
            closestPart.snappingPoint = closestSP;

            const snappingPointPos = closestSP.mesh.position;
            closestPart.mesh.position.set(snappingPointPos.x, snappingPointPos.y, snappingPointPos.z);
        }
    }

    // Sets snapping point to transparent default state
    function SPDefaultState(SP)
    {
        SP.mesh.material.transparent = true;

        SP.mesh.scale.set(snappingPointRadius, snappingPointRadius, snappingPointRadius);
    }

    // Removes transparency of snapping point and enlarges it
    function SPHoverState(SP)
    {
        SP.mesh.material.transparent = false;

        const scale = snappingPointRadius * 1.5;
        SP.mesh.scale.set(scale, scale, scale);
    }

    // Makes all existing parts default colors
    function resetPartsToDefaultState()
    {
        for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
        {
            partDefaultState(partsData[partsIndex]);
        }
    }

    // Makes part default colors
    function partDefaultState(part)
    {
        setPartEmission(part, new THREE.Color( 0x000000));
    }

    // Makes part green
    function partPlacedCorrectlyState(part)
    {
        setPartEmission(part, new THREE.Color( 0x32a852));
    }

    // Makes part red
    function partPlacedIncorrectlyState(part)
    {
        setPartEmission(part, new THREE.Color(0xeb4034));
    }

    // Makes part desired color
    function setPartEmission(part, color)
    {
        part.mesh.traverse(function (child)
        {
            if (child.material && child.material.emissive)
            {
                child.material.emissive = color;
                child.material.opacity = 0.5;
            }
        });
    }

    // Disables UI and player drag input
    function puzzleCompleted()
    {
        resetPartsToDefaultState();

        for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
        {
            partsData[partsIndex].mesh.material.opacity = 0;
        }

        for (let SPIndex = 0; SPIndex < snappingPointsData.length; SPIndex++)
        {
            snappingPointsData[SPIndex].mesh.material.opacity = 0;
        }

        dragControls.deactivate();
        dragControls.dispose();


        nextScene.classList.remove("hidden");

      
        collisionsEnabled = false;

        closePuzzleUI();
    }


    //  ANIMATE
    //  ----------------------------------------------------------------------
    function animate()
    {
        requestAnimationFrame( animate );

        updatePartsBBLocation();
        orbitControls.update();

        if (collisionsEnabled) checkCollisions();

        renderer.render( scene, camera );
    }

    // Updates the location of parts bounding box so it will
    // stay in the right position when it is dragged
    function updatePartsBBLocation()
    {
        for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
        {
            partsData[partsIndex].boundingBox.copy(partsData[partsIndex].mesh.geometry.boundingBox)
                .applyMatrix4(partsData[partsIndex].mesh.matrixWorld);
        }
    }

    return scene;
}