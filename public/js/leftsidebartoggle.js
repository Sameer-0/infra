//LEFT-SIDEBAR-TOGGLE
$('.left-sidebar-toggle').click(function () {
    console.log('leftsidebar pressed')
    let leftbar = $('.left-sidebar');
    leftbar.toggleClass('left-400');

    let main = $('.main')
    main.toggleClass('left-0');

    let nav = $('.top-navbar');
    nav.toggleClass('left-0');

    let btn = $('.left-sidebar-toggle');
    btn.toggleClass('left-sidebar-toggle-turn')
})

//NOTIFICATION
var notification = $(".notification-content");

var close = $(".notification-close");

function notify() {
    notification.addClass('notification-active');
    $('.notification-content').css('display', 'flex');
}

$(".notification-close").on('click', function () {
    notification.removeClass('notification-active')
    location.reload();
})

// //ALERT-MODAL
// var alertCancel = $('.alert-cancel');

// function alertMsg() {
//     $('#alertModal').css('display', 'block')
// }

// $('.alert-cancel').on('click', function () {
//     $('#alertModal').css('display', 'none');
// })