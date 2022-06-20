const THREE = require('three');

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import backpanel from '../models/backpanel.gltf'
import BUS from '../models/BUS.gltf'
import goldPlating from '../models/gold_plating.gltf'
import ISIS from '../models/ISIS.gltf'
import secondaryMirror from '../models/secondary_mirror.gltf'
import solarPanels from '../models/solar_panels.gltf'
import sunscreens from '../models/sunscreens.gltf'

import DragControls from 'three-dragcontrols'

export function createPuzzle( renderer, camera ) {

    const scene = new THREE.Scene();
    const ui = document.getElementById("js--ui");

    // CAMERA
    // ----------------------------------------------------------------------

    // Ortographic camera
    const frustumSize = 100;
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / - 2, 1, 1000
    );

    camera.position.set( - 200, 200, 200 );

    const orbitControls = new OrbitControls( camera, renderer.domElement );
    orbitControls.enableZoom = false;

    // Regular camera
    // camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    // const orbitControls = new OrbitControls( camera, renderer.domElement );
    // camera.position.set( 0, 20, 100 );
    // orbitControls.enableZoom = false;
    // orbitControls.update();

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

    // TODO: Find correct snapping points positions instead of guessing
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
        let draggablePart = addDraggablePart(meshes[i], partPositions[i]);
        scene.add(draggablePart);
        draggableParts.push(draggablePart);

        // Create a snapping point for each part
        addSnappingPoint(snappingPointRadius, SPPositions[i], i);
    }

    animate();



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

    function addDraggablePart(mesh, pos)
    {
        let group = new THREE.Group();
        const gltfLoader = new GLTFLoader();

        gltfLoader.load( mesh, ( gltf ) =>
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
            correctPart: correctPartId
        });

        return snappingPointMesh;
    }

    let closestPartDistance = 10000000;
    let closestPart = null;
    let closestSP = null;

    const snappingDistance = 20;
    const toleranceDistance = 0.1;

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

            if (snappingPointsData[SPIndex].snappedObject == null )
            {
                findClosestPart(snappingPointsData[SPIndex]);
            } else
            {
                ensureTolerableDistance(snappingPointsData[SPIndex]);
            }

            // If correct part is snapped
            if (snappingPointsData[SPIndex].snappedObject === partsData[SPIndex])
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

    function SPDefaultState(SP)
    {
        SP.mesh.material.transparent = true;

        SP.mesh.scale.set(snappingPointRadius, snappingPointRadius, snappingPointRadius);
    }

    function SPHoverState(SP)
    {
        SP.mesh.material.transparent = false;

        const scale = snappingPointRadius * 1.5;
        SP.mesh.scale.set(scale, scale, scale);
    }

    function resetPartsToDefaultState()
    {
        for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
        {
            partDefaultState(partsData[partsIndex]);
        }
    }

    function partDefaultState(part)
    {
        part.mesh.material.color = new THREE.Color( 0xffffff);
        part.mesh.material.opacity = 0.1;
    }

    function partPlacedCorrectlyState(part)
    {
        part.mesh.material.color = new THREE.Color( 0x32a852);
        part.mesh.material.opacity = 0.5;
    }

    function partPlacedIncorrectlyState(part)
    {
        part.mesh.material.color = new THREE.Color( 0xeb4034);
        part.mesh.material.opacity = 0.5;
    }

    function puzzleCompleted()
    {
        for (let partsIndex = 0; partsIndex < partsData.length; partsIndex++)
        {
            partsData[partsIndex].mesh.material.opacity = 0;
        }

        for (let SPIndex = 0; SPIndex < snappingPointsData.length; SPIndex++)
        {
            snappingPointsData[SPIndex].mesh.material.opacity = 0;
        }

        dragControls.dispose();
    }


    //  ANIMATE
    //  ----------------------------------------------------------------------
    function animate()
    {
        requestAnimationFrame( animate );

        updatePartsBBLocation();
        orbitControls.update();
        // partsFloatAnimation();
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

    // Makes parts float like they would in space
    function partsFloatAnimation()
    {
        for (let i = 0; i < draggableParts.length; i++)
        {
            const position = draggableParts[i].position;
            const speed = 0.002;
            if(position.x < 100) position.set(position.x + speed, position.y + speed, position.z + speed);
        }
    }

    return scene;
}