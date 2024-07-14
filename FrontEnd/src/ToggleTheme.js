var toggleBtn;
var landingPageContent;
var hamburgerMenu;

function declare() {
  toggleBtn = document.querySelector(".toggleBtn");
  landingPageContent = document.querySelector(".landingPageContent");
  hamburgerMenu = document.querySelector(".hamburgerMenu");
}

const main = document.querySelector("main");
declare();
let dark = false;

function toggleAnimation() {
    dark = !dark;
    let clone = landingPageContent.cloneNode(true);
    if(dark === true){
        clone.classList.remove("light");
        clone.classList.add("dark");
    } else{
        clone.classList.remove("dark");
        clone.classList.add("light");
    }
    clone.classList.add("copy");
    main.appendChild(clone);

    // document.body.classList.add("stopScrolling");

    clone.addEventListener("animationend", () => {
        document.body.classList.remove("stopScrolling");
        landingPageContent.remove();
        clone.classList.remove("copy");
        // Reset Variables
        declare();
        events();
    });
}

function events() {
    toggleBtn.addEventListener("click", toggleAnimation);
    hamburgerMenu.addEventListener("click", () => {
        landingPageContent.classList.toggle("active");
    });
}

events();

export {events, declare, toggleAnimation}
