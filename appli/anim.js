/*Page to rule animation, button and other navigation tools*/

// Get the button:
let mybutton = document.getElementById("goToTop");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
} 


/* From tooltips*/
// select all desired input fields and attach tooltips to them
$("#myform :input").tooltip({

  // place tooltip on the right edge
  position: "center right",

  // a little tweaking of the position
  offset: [-2, 10],

  // use the built-in fadeIn/fadeOut effect
  effect: "fade",

  // custom opacity setting
  opacity: 0.7

  });
    