const THREE = require('three');
import textData from '../data/text.json';

export function createQuotes(renderer, camera) {
    
    const quotesData = textData.text.quotes;

    const quote = document.getElementById("js--quote");
    const quoteText = document.getElementById('js--quoteText');
    const quotePerson = document.getElementById('js--quotePerson');
    const quoteImages = document.querySelectorAll('.quote__imagebox__image');

    const scene = new THREE.Scene();

    // set parameter camera to new position
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
    camera.position.set(10, 0, 0);

    // FOR TESTING PUZZLE FIRST, CAN BE DELETED LATER
    const ui = document.getElementById("js--ui");
    ui.style.display = "none";

    // set intro text
    quote.style.display = "flex";
    quote.classList.add('fadeIn');
    animate();


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

    return scene;
}

