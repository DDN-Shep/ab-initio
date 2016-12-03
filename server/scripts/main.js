$(function() {
  'use strict';

  $('.ui.dropdown').dropdown({
    on: 'hover'
  });

  $('.ui.menu a.item').on('click', function() {
    $(this)
      .addClass('active')
      .siblings()
      .removeClass('active');
  });

  $('section.banner .owl-carousel').owlCarousel({
    autoplay: true,
    autoplayHoverPause: true,
    autoplayTimeout: 5000,
    loop: true,
    nav: false,
    items: 1
  });

  $([
    'section.featured .owl-carousel',
    'section.trending .owl-carousel',
    'section.coming-soon .owl-carousel'
  ].join(',')).owlCarousel({
    autoplay: true,
    autoplayHoverPause: true,
    autoplayTimeout: 5000,
    loop: true,
    nav: false,
    items: 5,
    margin: 20,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
        margin: 0
      },
      600: {
        items: 3
      },
      1000: {
        items: 4
      }
    }
  });

  $('section.recently-viewed .owl-carousel').owlCarousel({
    loop: true,
    nav: false,
    margin: 20,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 4
      },
      1000: {
        items: 6
      }
    }
  });
});