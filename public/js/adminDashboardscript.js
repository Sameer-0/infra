

//Add and Remove more rows for holidays
$('#add-more-holidays').on('click', function () {
    console.log("holidays Added::::")
    let lastTr = $('#add-more-holidays-table tbody tr:last-child')
    
    let calendarId = lastTr.find(`input[name='calendarId']`).val();
    let calendarName = lastTr.find(`input[name='calendarName']`).val();
    let holidayType = lastTr.find(`select[name='holidayType']`).val();
    let calendarYear = lastTr.find(`input[name='calendarYear']`).val();
    let holidayDate = lastTr.find(`input[name='holidayDate']`).val();
    let holidayReason = lastTr.find(`input[name='holidayReason']`).val();

    let clonedTr = lastTr.clone();
    clonedTr.find(`input[name='calendarId']`).val('')
    clonedTr.find(`input[name='calendarName']`).val('')
    clonedTr.find(`select[name='holidayType']`).val('')
    clonedTr.find(`input[name='calendarYear']`).val('')
    clonedTr.find(`input[name='holidayDate']`).val('')
    clonedTr.find(`input[name='holidayReason']`).val('')
    
  
    $('#add-more-holidays-table tbody').append(clonedTr)
})

$('#add-more-holidays-table').on('click', '.remove-holidays', function () {
    let trLength = $('#add-more-holidays-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove()
    } else {
        alert('Cannot delete this room.')
    }
})

//Add and Remove more session date
$('#add-more-sessionDate').on('click', function () {
    console.log("Session date Added::::")
    let lastTr = $('#add-more-sessionDate-table tbody tr:last-child')
    let programId= lastTr.find(`select[name='programName']`).val();
    let acadSessionID = lastTr.find(`select[name='acadSession']`).val();
    let startDateID = lastTr.find(`select[name='startDate']`).val();
    let endDateId = lastTr.find(`select[name='endDate']`).val();
    

    let clonedTr = lastTr.clone();
    // clonedTr.find(`select[name='programName']`).val('')
    // clonedTr.find(`input[name='courseName']`).val('')
    // clonedTr.find(`input[name='noOfDivisions']`).val('')
    // clonedTr.find(`input[name='lecturePerDivision']`).val('')
    // clonedTr.find(`input[name='totalSessionPerSemester']`).val('')
    // clonedTr.find(`input[name='sessionPerWeek']`).val('')
    // clonedTr.find(`input[name='programId']`).val('')
    // clonedTr.find(`input[name='acadSession']`).val('')
    // clonedTr.find(`input[name='practicalPerWeekPerSession']`).val('')
   
   
    $('#add-more-sessionDate-table tbody').append(clonedTr)
})

$('#add-more-sessionDate-table').on('click', '.remove-sessionDate', function () {
    console.log('sessiondatedelete')
    let trLength = $('#add-more-sessionDate-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove()
    } else {
        alert('Cannot delete this room.')
    }
})

//Add and Remove School Timing
$('#add-more-schoolTiming').on('click', function () {
    console.log("School Timing Added::::")
    let lastTr = $('#add-more-schoolTiming-table tbody tr:last-child')
    let name= lastTr.find(`input[name='schoolName']`).val();
    let programName = lastTr.find(`select[name='programName']`).val();
    let dayId = lastTr.find(`select[name='day']`).val();
    let acadSessionId = lastTr.find(`select[name='acadSession']`).val();
    let startTimeId = lastTr.find(`select[name='startTime']`).val();
    let endTimeId = lastTr.find(`select[name='endTime']`).val();
    let SchoolTimingTypeId = lastTr.find(`select[name='schoolTimingType']`).val();
    

    let clonedTr = lastTr.clone();
    // clonedTr.find(`select[name='programName']`).val('')
    // clonedTr.find(`input[name='courseName']`).val('')
    // clonedTr.find(`input[name='noOfDivisions']`).val('')
    // clonedTr.find(`input[name='lecturePerDivision']`).val('')
    // clonedTr.find(`input[name='totalSessionPerSemester']`).val('')
    // clonedTr.find(`input[name='sessionPerWeek']`).val('')
    // clonedTr.find(`input[name='programId']`).val('')
    // clonedTr.find(`input[name='acadSession']`).val('')
    // clonedTr.find(`input[name='practicalPerWeekPerSession']`).val('')
   
   
    $('#add-more-schoolTiming-table tbody').append(clonedTr)
})

$('#add-more-schoolTiming-table').on('click', '.remove-schoolTiming', function () {
    console.log('divison Delete')
    let trLength = $('#add-more-schoolTiming-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove();
    } else {
        alert('Cannot delete this room.')
    }
})


//Add and Remove Weekly constraint
$('#add-more-weeklyConstraint').on('click', function () {
    console.log("weekly constraint::::")
    let lastTr = $('#add-more-weeklyConstraint-table tbody tr:last-child')
    let tagId= lastTr.find(`input[name='tagId']`).val();
    let constraintName = lastTr.find(`input[name='constraintName']`).val();
    let eventType = lastTr.find(`input[name='eventType']`).val();
    let ruleOn = lastTr.find(`input[name='ruleOn']`).val();
    let ruleOnWhere = lastTr.find(`input[name='ruleOnWhere']`).val();
    let repeatable = lastTr.find(`select[name='repeatable']`).val();
    let endTimeId = lastTr.find(`select[name='endTime']`).val();
    let schoolTimingTypeId = lastTr.find(`select[name='schoolTimingType']`).val();
    

    let clonedTr = lastTr.clone();
    // clonedTr.find(`select[name='programName']`).val('')
    // clonedTr.find(`input[name='courseName']`).val('')
    // clonedTr.find(`input[name='noOfDivisions']`).val('')
    // clonedTr.find(`input[name='lecturePerDivision']`).val('')
    // clonedTr.find(`input[name='totalSessionPerSemester']`).val('')
    // clonedTr.find(`input[name='sessionPerWeek']`).val('')
    // clonedTr.find(`input[name='programId']`).val('')
    // clonedTr.find(`input[name='acadSession']`).val('')
    // clonedTr.find(`input[name='practicalPerWeekPerSession']`).val('')
   
   
    $('#add-more-weeklyConstraint-table tbody').append(clonedTr)
})

$('#add-more-weeklyConstraint-table').on('click', '.remove-weeklyConstraint', function () {
    console.log('divison Delete')
    let trLength = $('#add-more-weeklyConstraint-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove();
    } else {
        alert('Cannot delete this room.')
    }
})

//Add and Remove Faculty Preference
$('#add-more-facultyPreference').on('click', function () {
    console.log("Faculty Preference::::")
    let lastTr = $('#add-more-facultyPreference-table tbody tr:last-child');
    let faculty_work_lid= lastTr.find(`select[name='faculty_work_lid']`).val();
    let p_day_lid = lastTr.find(`select[name='p_day_lid']`).val();
    let start_time_id = lastTr.find(`select[name='start_time_id']`).val();
    let end_time_id = lastTr.find(`select[name='end_time_id']`).val();
    
    

    let clonedTr = lastTr.clone();
    // clonedTr.find(`select[name='programName']`).val('')
    // clonedTr.find(`input[name='courseName']`).val('')
    // clonedTr.find(`input[name='noOfDivisions']`).val('')
    // clonedTr.find(`input[name='lecturePerDivision']`).val('')
    // clonedTr.find(`input[name='totalSessionPerSemester']`).val('')
    // clonedTr.find(`input[name='sessionPerWeek']`).val('')
    // clonedTr.find(`input[name='programId']`).val('')
    // clonedTr.find(`input[name='acadSession']`).val('')
    // clonedTr.find(`input[name='practicalPerWeekPerSession']`).val('')
   
   
    $('#add-more-facultyPreference-table tbody').append(clonedTr)
})

$('#add-more-facultyPreference-table').on('click', '.remove-facultypreference', function () {
    console.log('divison Delete')
    let trLength = $('#add-more-facultyPreference-table tbody tr').length;
    if (trLength > 1) {
        $(this).closest('tr').remove();
    } else {
        alert('Cannot delete this room.')
    }
})