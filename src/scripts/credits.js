const THREE = require('three');

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import lato from '../fonts/Lato_Regular.json';
import prata from '../fonts/Prata_Regular.json';

export function createCredits(renderer, camera) {

    const scene = new THREE.Scene();
    const quote = document.getElementById("js--quote");

    // set parameter camera to new position
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 20, 100 );

    // LIGHTS
    // ----------------------------------------------------------------------
    const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3, 50);
    dirLight.position.set(1, 2, -1);
    scene.add(dirLight);
    dirLight.castShadow = true;

    // TEXT
    // ----------------------------------------------------------------------
    let textMeshes = [];

    const headerMaterials = [
        new THREE.MeshPhongMaterial({ color: 0xF29D1D }), // front
        new THREE.MeshPhongMaterial({ color: 0xE56528 }) // side
    ];

    const paragraphMaterials = [
        new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
        new THREE.MeshPhongMaterial({ color: 0xC6C6C6 }) // side
    ];

    const latoFont = new FontLoader().parse(lato);
    const prataFont = new FontLoader().parse(prata);

    let headerGeometryParameters = {
        font: prataFont,
        size: 6,
        height: 2,
        curveSegments: 10,
        bevelEnabled: false,
        bevelOffset: 0,
        bevelSegments: 1,
        bevelSize: 0.3,
        bevelThickness: 1
    }

    let paragraphGeometryParameters = {
        font: latoFont,
        size: 4,
        height: 1,
        curveSegments: 10,
        bevelEnabled: false,
        bevelOffset: 0,
        bevelSegments: 1,
        bevelSize: 0.3,
        bevelThickness: 1
    }

    function createTextMesh(text, materials, geometryParameters, position, rotation)
    {
        const geometry = new TextGeometry(text, geometryParameters);

        let textMesh = new THREE.Mesh(geometry, materials);
        textMesh.castShadow = true;

        textMesh.position.set(position.x, position.y, position.z);
        textMesh.rotation.set(rotation.x, rotation.y, rotation.z);

        return textMesh;
    }

    let previousContributionPos = null;


    function addContribution(headerText, contributors)
    {
        // HEADER TEXT
        let headerTextMesh = createTextMesh(
            headerText,
            headerMaterials,
            headerGeometryParameters,
            new THREE.Vector3(-35, 0, -80),
            new THREE.Vector3(-Math.PI / 3, 0, 0)
        );

        if (previousContributionPos === null) headerTextMesh.position.y = -60;
        else headerTextMesh.position.y = previousContributionPos.y - 30;

        previousContributionPos = headerTextMesh.position;

        scene.add(headerTextMesh);
        textMeshes.push(headerTextMesh);

        // PARAGRAPH TEXT
        for (let contributorIndex = 0; contributorIndex < contributors.length; contributorIndex++)
        {
            let paragraphTextMesh = createTextMesh(
                contributors[contributorIndex],
                paragraphMaterials,
                paragraphGeometryParameters,
                new THREE.Vector3(-35, 0, -80),
                new THREE.Vector3(-Math.PI / 3, 0, 0)
            );

            if (contributorIndex === 0) paragraphTextMesh.position.y = previousContributionPos.y - 15;

            else if(previousContributionPos != null) paragraphTextMesh.position.y = previousContributionPos.y - 10;
            previousContributionPos = paragraphTextMesh.position;

            scene.add(paragraphTextMesh);
            textMeshes.push(paragraphTextMesh);
        }
    }

    // REMOVE THE QUOTE HTML
    quote.classList.remove('fadeIn');
    quote.classList.add('fadeOut');

    setTimeout( () => {
        quote.style.display ="none";
        addContribution("Grote vragen", ["Bezoek de tentoonstelling Grote Vragen in", "Rijksmuseum Boerhaave voor meer informatie", "over de James Webb Ruimtetelescoop"]);
        addContribution("Collaboratie tussen", ["Hogeschool Leiden", "Museum Boerhaave"]);
        addContribution("Ontwikkelaars", ["Kim Hoogland", "Tijs Ruigrok", "Lukas Splinter"]);
        addContribution("Ondersteuning", ["Annelore Scholten", "Maarten Storm", "Nina Paris", "Gerolf Heida"]);        
        animate();
    }, "2000");

    
    // WINDOW RESIZE
    window.addEventListener("resize", onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ANIMATE
    function animate() {
        requestAnimationFrame(animate);

        rollCredits();

        renderer.render(scene, camera);
    }

    function rollCredits() {
        for (let i = 0; i < textMeshes.length; i++) {
            textMeshes[i].position.y += 0.07;
            textMeshes[i].position.z -= 0.04;
        }
    }

    return scene;
}