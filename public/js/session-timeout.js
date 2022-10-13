document.onreadystatechange = function () {
  if (document.readyState == 'interactive') {
    if (window.location.pathname.toString().trim() !== "/user/login") {
      let timeout = 20 /* default session-timeout duration in milliseconds */
      let flag = false
      $(window).on(`mousemove mouseup mousedown scroll keyup click wheel mousewheel touchend`, () => {
        if (timeout < 6 && !flag) {
          flag = true
          reset()
        }
      })
      function reset() {
        $.ajax({
          type: 'POST',
          url: '/rst',
          data: {},
          success: function (data) {
            if (data.status == "success") {
              timeout = 20
            }
          }
        });
      }
      function countDown() {
        setTimeout(() => {
          timeout = timeout - 1
          countDown()
          if (timeout == 0) {
            timeout = 20
            flag = true
            window.location = "/user/login"
          }
        }, 60000);
      }
      countDown()
    }
  }
}
