
// $(document).ready(function () {
    // SIDE-BAR OPENING EVENT
    // const mobileHamburger = document.querySelector('.hamburger-smalldevices');
    // const leftBar = document.querySelector('.left-sidebar');

    $('.hamburger-smalldevices').on('click', function() {
        $('.left-sidebar').toggleClass('left-sidebar-open')
    })
    // mobileHamburger.addEventListener('click', () => {
    //     leftBar.classList.toggle('left-sidebar-open');
    // })
// })



function delay(callback, ms) {
    var timer = 0;
    return function () {
        var context = this;
        var    args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

// TOGGLE FULL-SCREEN

function toggle_full_screen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            /* Firefox */
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            /* Chrome, Safari & Opera */
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (document.msRequestFullscreen) {
            /* IE/Edge */
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            /* Chrome, Safari and Opera */
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            /* IE/Edge */
            document.msExitFullscreen();
        }
    }
}


//left bar accordion expander


