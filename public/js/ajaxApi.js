function ajaxApi(obj) {
    return $.ajax({
        type: obj.type,
        url: obj.url,
        data: obj.data,
        beforeSend: function () {
            $(".modal-loader").removeClass('d-none')
            console.log('Show beforeSend::::::::>')
        },
        success: data => {
            console.log('success data::::::::::>',data)
            return data
        },
        complete: function () {
            $(".modal-loader").addClass('d-none')
            console.log('Show complete::::::::>')
        },
        showSuccess(result) {
            console.log('Show Succces::::::::>', result)
        },
        error: err => {
            return err
        },
        dataType: obj.dataType
    });
}