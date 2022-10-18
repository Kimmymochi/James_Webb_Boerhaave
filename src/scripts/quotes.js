import * as THREE from 'three';
import { addEnvironment } from './stars';
import textData from '../data/text.json';
import quoteImage1 from '../images/dishoeck.jpg';
import quoteImage2 from '../images/teplate.jpg';
import quoteImage3 from '../images/hooijer.jpg';
import quoteImage4 from '../images/robinson.jpg';
import quoteImage5 from '../images/desert.jpg';

export function createQuotes(renderer, camera) {
    const quotesData = textData.text.quotes;
    const imageList = [quoteImage1, quoteImage2, quoteImage3, quoteImage4, quoteImage5]

    const quote = document.getElementById("js--quote");
    const quoteText = document.getElementById('js--quoteText');
    const quotePerson = document.getElementById('js--quotePerson');
    const quoteImages = document.querySelectorAll('.quote__imagebox__image');

    const scene = new THREE.Scene();;

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

    // set intro text
    quote.style.display = "flex";

    // dynamically set imported images
    quoteImages.forEach( function ( item ) {
        let imageId = item.getAttribute('data-quote-id');
        item.src = imageList[imageId - 1];
    })

    animate();
    addEnvironment( renderer, camera, scene);

    // window resizer
    window.addEventListener("resize", onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // sets quote field to corresponding id number
    function setQuote(quote) {
        let keys = Object.keys(quotesData);
        let quoteData;

        for( let i = 0; i < keys.length; i++) {
            let item = quotesData[keys[i]];
            if( item.id == quote ) { quoteData = item; }
        }
        changeQuote(quoteData.text, quoteData.name, quoteData.background)
    }

    // changes the text of the quote with a fade animation
    function changeQuote(text, name, background) {
        let textQuote = document.querySelector(".quote__box__text");
        let nameQuote = document.querySelector(".quote__box__person--name");
        let backgroundQuote = document.querySelector(".quote__box__person--background")

        quoteText.style.opacity = 0;
        quotePerson.style.opacity = 0;

        setTimeout( function() {
            textQuote.innerHTML = text;
            nameQuote.innerHTML = name;
            backgroundQuote.innerHTML = background;
            quoteText.style.opacity = 1;
            quotePerson.style.opacity = 1;
        }, 500);
    }

    // will fire when images are clicked
    function quoteOnClick (event) {
        // reset all previous active classes
        for (let i = 0; i < quoteImages.length; i++) {
            quoteImages[i].classList.remove("active");
        }

        // add active class to clicked image
        event.classList.add("active");

        // send the id of the clicked image to setQuote()
        let clickedQuote = event.dataset.quoteId
        setQuote(clickedQuote);
    }

    // prevent dragging & bind click function to all images
    document.querySelectorAll(".quote__imagebox__image").forEach( item => {
        item.setAttribute('draggable', false);
        item.onclick = function(){quoteOnClick(item)};
    });

    //remove next scene button since its last scene
    document.getElementById( "js--arrowIcon").classList.add("hidden");
    document.getElementById( "js--restartIcon").classList.remove("hidden");


    return scene;
}
