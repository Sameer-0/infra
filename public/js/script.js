$(document).ready(function () {
    // SIDE-BAR OPENING EVENT
    const mobileHamburger = document.querySelector('.mobile-hamburger');
    const leftBar = document.querySelector('.left-sidebar');

    mobileHamburger.addEventListener('click', () => {
        leftBar.classList.toggle('left-sidebar-open');
    })


})