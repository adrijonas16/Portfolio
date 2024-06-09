$(document).ready(function () {
  // Navbar sticky and scroll-up button logic
  $(window).scroll(function () {
    // Sticky navbar on scroll script
    if ($(this).scrollTop() > 20) {
      $(".navbar").addClass("sticky");
    } else {
      $(".navbar").removeClass("sticky");
    }

    // Scroll-up button show/hide script
    if ($(this).scrollTop() > 500) {
      $(".scroll-up-btn").addClass("show");
    } else {
      $(".scroll-up-btn").removeClass("show");
    }
  });

  // Slide-up script
  $(".scroll-up-btn").click(function () {
    $("html").animate({ scrollTop: 0 }, "slow"); // added 'slow' for smooth animation
    // Removing smooth scroll on slide-up button click
    $("html").css("scrollBehavior", "auto");
  });

  $(".navbar .menu li a").click(function () {
    // Smooth scroll on Menu Items click
    $("html").css("scrollBehavior", "smooth");
  });

  // Toggle Navbar
  $(".menu-btn").click(function () {
    $(".navbar .menu").toggleClass("active");
    $(".menu-btn i").toggleClass("active");
  });

  // Typing Text Animation
  var typed1 = new Typed(".typing", {
    strings: ["Front End Developer", "Back End Developer", "Full Stack Developer"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true
  });

  // Owl Carousel
  $(".carousel").owlCarousel({
    margin: 20,
    loop: true,
    autoplay: true,
    autoplayTimeout: 2000, // fixed typo: autoplayTimeout instead of autoplayTimeOut
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 1,
        nav: false
      },
      600: {
        items: 2,
        nav: false
      },
      1000: {
        items: 3,
        nav: false
      }
    }
  });

  // Timeline Animation
  (function () {
    "use strict";
  
    // define variables
    var items = document.querySelectorAll(".timeline li");
  
    // check if an element is in viewport
    function isElementInViewport(el) {
      var rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
  
    function callbackFunc() {
      for (var i = 0; i < items.length; i++) {
        if (isElementInViewport(items[i])) {
          items[i].classList.add("in-view");
        }
      }
    }
  
    // listen for events
    window.addEventListener("load", callbackFunc);
    window.addEventListener("resize", callbackFunc);
    window.addEventListener("scroll", callbackFunc);
  })();

  
});
