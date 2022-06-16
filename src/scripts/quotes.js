const THREE = require('three');
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import textData from '../data/text.json';

export function createQuotes() {
    const quotesData = textData.text.quotes;
    const quote = document.getElementById("js--quote");
    const quoteText = document.getElementById('js--quoteText');
    const quotePerson = document.getElementById('js--quotePerson');
    const quoteImages = document.querySelectorAll('.quote__imagebox__image');

    // Scene
    const scene = new THREE.Scene();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x333333, 1);
    document.body.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
    camera.position.set(0, 0, 5);
    
    // Controls
    const controls = new OrbitControls( camera, renderer.domElement );
       controls.enableZoom = false;

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


    // sets quote field to corresponding id number
    function setQuote(quote) {
        let keys = Object.keys(quotesData);
        let quoteData;

        for( let i = 0; i < keys.length; i++) {
            let item = quotesData[keys[i]];
            
            if(item.id == quote) {
                quoteData = item;
            }
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

    // prevent dragging image, bind function to image
    document.querySelectorAll(".quote__imagebox__image").forEach( item => {
        item.setAttribute('draggable', false);
        item.onclick = function(){quoteOnClick(item)};
    });

    init();

    function init() {
        // Set intro text
        setQuote(0)
        quote.style.display = "flex";
        quote.classList.add('fadeIn');

        animate()
    }



    function animate() {
        requestAnimationFrame(animate);
        // controls.update();
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

    return scene;

}

