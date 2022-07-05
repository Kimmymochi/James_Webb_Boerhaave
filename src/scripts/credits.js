import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { addEnvironment } from './stars.js';
import lato from '../fonts/Lato_Regular.json';
import prata from '../fonts/Prata_Regular.json';

import textData from '../data/text.json';


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
    quote.style.display = "none";

    setTimeout( () => {
        quote.style.display ="none";
        animate();
        addEnvironment( renderer, camera, scene);

    }, "2000");


    // WINDOW RESIZE
    window.addEventListener("resize", onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const creditsUI = document.getElementById("js--credits");
    const creditsButton = document.getElementById("js--credits-button");
    const creditsImg = document.getElementById("js--credits-img");
    const creditsImgTitle = document.getElementById("js--credits-img-title");
    const creditsImgDate = document.getElementById("js--credits-img-date");
    const creditsImgExplanation = document.getElementById("js--credits-img-explanation");

    initCreditsUI(textData.text.credits.title, textData.text.credits.text);
    openCreditsUI();

    function initCreditsUI(title, text)
    {
        let titleDOM = document.querySelector('#js--credits-title');
        let textDOM = document.querySelector('#js--credits-text');

        titleDOM.innerHTML = title;
        textDOM.innerHTML = text;

        setCreditsImg();
    }

    function openCreditsUI()
    {
        creditsUI.classList.add("open");
    }

    function closeCreditsUI()
    {
        creditsUI.classList.remove("open");
    }

    function setCreditsImg()
    {
        let request = new XMLHttpRequest();
        request.open("GET", "https://api.nasa.gov/planetary/apod?api_key=f8h8v7DEKnxam5W6O1NejQfImQst6gkP4vQ4Jru1");
        request.send();
        request.onload = () =>
        {
            if (request.status === 200) {
                const apodJSON = JSON.parse(request.response);
                creditsImg.src = apodJSON.url;
                creditsImgTitle.innerHTML = apodJSON.title;
                creditsImgDate.innerHTML = apodJSON.date;
                creditsImgExplanation.innerHTML = apodJSON.explanation;
            }
        }
    }

    let creditsEnabled = false;
    let overlay = document.getElementById('js--overlay');

    creditsButton.addEventListener("click", enableCredits);

    function enableCredits()
    {
        overlay.classList.add('fadeInOut');

        setTimeout(function ()
        {
            closeCreditsUI();

            //also show change button
            document.getElementById( "js--arrowIcon").classList.add("hidden");
            document.getElementById( "js--restartIcon").classList.remove("hidden");
        }, 1000);

        setTimeout(function ()
        {
            overlay.classList.remove('fadeInOut');
            overlay.style.opacity = 0;
            document.getElementById( "js--sceneChanger" ).classList.remove("hidden");
            addContribution("Meer ontdekken?", ["Bezoek de tentoonstelling Grote Vragen in", "Rijksmuseum Boerhaave en neem een kijkje", "bij het schaalmodel van de James Webb", "Ruimtetelescoop"]);
            addContribution("Collaboratie tussen", ["Hogeschool Leiden", "Rijksmuseum Boerhaave"]);
            addContribution("Ontwikkelaars", ["Kim Hoogland", "Tijs Ruigrok", "Lukas Splinter"]);
            addContribution("Ondersteuning", ["Annelore Scholten","Bart Grob", "Maarten Muns", "Maarten Storm", "Nina Paris", "Gerolf Heida"]);
            creditsEnabled = true;
        }, 4000);

    }

    // ANIMATE
    function animate() {
        requestAnimationFrame(animate);

        if (creditsEnabled) rollCredits();

        renderer.render(scene, camera);
    }

    function rollCredits() {
        for (let i = 0; i < textMeshes.length; i++) {
            textMeshes[i].position.y += 0.07;
            textMeshes[i].position.z -= 0.04;
        }
    }

    //remove next scene button since its last scene
    document.getElementById( "js--arrowIcon").classList.add("hidden");
    document.getElementById( "js--restartIcon").classList.remove("hidden");

    return scene;
}
