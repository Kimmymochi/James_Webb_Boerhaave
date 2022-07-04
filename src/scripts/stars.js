import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import stars from '../images/stars.png';

export function addEnvironment( renderer, camera, scene ) {

    const starsGeometry = new THREE.SphereGeometry(80, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(stars, (texture) =>
    {
        const starsMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
        });

        const starsMesh = new THREE.Mesh(starsGeometry, starsMaterial);
        scene.add(starsMesh);
    });

    function animate()
    {
        renderer.render( scene, camera );
        requestAnimationFrame( animate );
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