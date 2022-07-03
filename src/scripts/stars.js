import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


export function addEnvironment( renderer, camera, scene ) {

    function getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    createStarEnvironment();

    function createStarEnvironment()
    {
        for (let i = 0; i < 25; i++)
        {
            // top
            createStar(
                getRandomNumber(-300, 300), // x
                getRandomNumber(200, 300), // y
                getRandomNumber(-300, 300)  // z
            );
    
            // bottom
            createStar(
                getRandomNumber(-300, 300), // x
                getRandomNumber(-200, -300), // y
                getRandomNumber(-300, 300)  // z
            );
    
            // right
            createStar(
                getRandomNumber(200, 300), // x
                getRandomNumber(-200, 300), // y
                getRandomNumber(-300, 300)  // z
            );
    
            // left
            createStar(
                getRandomNumber(-200, -300), // x
                getRandomNumber(-200, 300), // y
                getRandomNumber(-300, 300)  // z
            );
        }
    }

    function createStar(x, y, z)
    {
        const starColors = [
            new THREE.Color(0x6487C7),
            new THREE.Color(0xD1C0A4),
            new THREE.Color(0xB5754F),
            new THREE.Color(0xFCFBF9)
        ];
    
        let starColor = starColors[Math.round(getRandomNumber(0, starColors.length - 1), 1)];
    
        const star = new THREE.Mesh(
            new THREE.SphereGeometry(getRandomNumber(0.3, 0.6)),
            new THREE.MeshPhongMaterial({color: starColor})
        );
        
        star.position.set(x, y, z);
    
        scene.add(star);
    }

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 5; //intensity of glow
    bloomPass.radius = 0;
    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);


    function animate()
    {
        renderer.render( scene, camera );
        requestAnimationFrame( animate );
        bloomComposer.render();
    }

    animate();

    // WINDOW RESIZE
    window.addEventListener("resize", onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize(window.innerWidth, window.innerHeight);
        bloomComposer.setSize(window.innerWidth, window.innerHeight);
    }

};