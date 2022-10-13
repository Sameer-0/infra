function spError(){
    $(result.data).each(function (key, value) {
        $.each(this, function (key, value) {
            var pageName = key;
            var pageUrl = value;
            alert(pageName + ' ' + pageUrl);
        });
    });

    let errorHtml = `<div class="alert alert-success alert-dismissible fade show" role="alert">
    <h3>Warning</h3>
    <p>${result.description}</p>
    <ul>`
    result.data.map(er => {
        errorHtml +=
            `<li>Campus Id: ${er.campus_id} and Campus Abbr: ${er.campus_abbr} already exit!</li>`
    })
    errorHtml +=
        `</ul> <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> </div>`
    $("#errorHtml").html(errorHtml)
}