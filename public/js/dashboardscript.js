            // Add more rows for orgnization
            $('#add-more-orgnization').on('click', function () {


                console.log("Organization Added::::")
                let lastTr = $('#add-more-org-table tbody tr:last-child')

                let orgId = lastTr.find(`input[name='orgId']`).val();
                let orgAbbr = lastTr.find(`input[name='orgAbbr']`).val();
                let orgName = lastTr.find(`input[name='orgName']`).val();
                let orgCompleteName = lastTr.find(`input[name='orgCompleteName']`).val();
                let orgType = lastTr.find(`select[name="orgType"]`).val();
                let campus = lastTr.find(`select[name="campus"]`).val();
                console.log('yelo', orgType)

                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='orgId']`).val('')

                clonedTr.find(`input[name='orgAbbr']`).val('') 
                clonedTr.find(`input[name='orgName']`).val('')
                clonedTr.find(`input[name='orgCompleteName']`).val('')
                clonedTr.find(`select[name='orgType']`).val('');
                clonedTr.find(`select[name='campus']`).val(''); 

                $('#add-more-org-table tbody').append(clonedTr) 
                // $('#add-more-org-table tbody tr:last-child .select2').select2();
                lastTr.find('.modalSelect2').select2({
                    dropdownParent: $('#add-org-modal')
                });

                // clonedTr.find('.modalSelect2').select2({
                //     dropdownParent: $('#add-org-modal')
                // });
            })

            $('#add-more-org-table').on('click', '.remove-organization', function () {
                let trLength = $('#add-more-org-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.')
                }
            })

            //Add more rows for campus
            $('#add-more-campus').on('click', function () {
                console.log("Organization Added::::")

                let lastTr = $('#add-more-campus-table tbody tr:last-child')
               
                let campusId = lastTr.find(`input[name='campusId']`).val();
                let campusAbbr = lastTr.find(`input[name='campusAbbr']`).val();
                let campusName = lastTr.find(`select[name='campusName']`).val();
                let campusDesc = lastTr.find(`select[name='campusDesc']`).val();

                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='campusId']`).val('')
                clonedTr.find(`input[name='campusAbbr']`).val('')
                clonedTr.find(`select[name='campusName']`).val('')
                clonedTr.find(`select[name='campusDesc']`).val('')
                $('#add-more-campus-table tbody').append(clonedTr)

            })

            $('#add-more-campus-table').on('click', '.remove-campus', function () {
                let trLength = $('#add-more-campus-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.')
                }
            })

            //Add more rows for building    
            $('#add-more-building').on('click', function () {
                console.log("Organization Added::::")
                let lastTr = $('#add-more-building-table tbody tr:last-child')
                lastTr.find('.modalSelect2').select2('destroy');
                let buildingName = lastTr.find(`input[name='building_name']`).val();
                let buildingNumber = lastTr.find(`input[name='building_number']`).val();
                let floors = lastTr.find(`input[name='floors']`).val();
                let ownerId = lastTr.find(`select[name='owner_id']`).val();
                let startTimeId = lastTr.find(`select[name='start_time_id']`).val();
                let endTimeId = lastTr.find(`select[name='end_time_id']`).val();
                let handledById = lastTr.find(`select[name='handled_by']`).val();
                let campusId = lastTr.find(`select[name='campus_lid']`).val();


                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='building_name']`).val('')
                clonedTr.find(`input[name='building_number']`).val('')
                clonedTr.find(`input[name='floors']`).val('')
                clonedTr.find(`select[name='owner_id']`).val('')
                clonedTr.find(`select[name='start_time_id']`).val('')
                clonedTr.find(`select[name='end_time_id']`).val('')
                clonedTr.find(`select[name='handled_by']`).val('')
                clonedTr.find(`select[name='campus_lid']`).val('')

                $('#add-more-building-table tbody').append(clonedTr)

                lastTr.find('.modalSelect2').select2({
                    dropdownParent: $('#add-building-modal')
                });

                clonedTr.find('.modalSelect2').select2({
                    dropdownParent: $('#add-building-modal')
                });
            })

            $('#add-more-building-table').on('click', '.remove-building', function () {
                let trLength = $('#add-more-building-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.')
                }
            })

            //Add more rows in room
            $('#add-more-room').on('click', function () {
                console.log("Room Added::::1")

                let lastTr = $('#add-more-room-table tbody tr:last-child')
                // lastTr.find('.modalSelect2').select2('destroy');

                console.log('lastTr', lastTr)
                let roomNumber = lastTr.find(`input[name='room_number']`).val();
                let roomTypeId = lastTr.find(`select[name='room_type_id']`).val();
                let floorNumber = lastTr.find(`input[name='floor_number']`).val();
                let capacity = lastTr.find(`input[name='capacity']`).val();
                let startTimeId = lastTr.find(`select[name='start_time_id']`).val();
                let endTimeId = lastTr.find(`select[name='end_time_id']`).val();
                let isBasement = lastTr.find(`select[name='is_basement']`).val();
                // let isProcessed = lastTr.find(`input[name='is_processed']`).val();

                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='room_number']`).val('')
                clonedTr.find(`select[name='room_type_id']`).val('')
                clonedTr.find(`input[name='floor_number']`).val('')
                clonedTr.find(`input[name='capacity']`).val('')
                clonedTr.find(`select[name='start_time_id']`).val('')
                clonedTr.find(`select[name='end_time_id']`).val('')
                clonedTr.find(`select[name='is_basement']`).val('')
                // clonedTr.find(`select[name='is_processed']`).val('')

                $('#add-more-room-table tbody').append(clonedTr)

                // lastTr.find('.modalSelect2').select2({
                //     dropdownParent: $('#add-room-modal')
                // });

                // clonedTr.find('.modalSelect2').select2({
                //     dropdownParent: $('#add-room-modal')
                // });
            })

            $('#add-more-room-table').on('click', '.remove-room', function () {
                let trLength = $('#add-more-room-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.')
                }
            })

            //Add more rows in faculty
            $('#add-more-faculty').on('click', function () {
                console.log("Room Added::::")

                let lastTr = $('#add-more-faculty-table tbody tr:last-child')

                let facultyId = lastTr.find(`input[name='faculty_id']`).val();
                let facultyName = lastTr.find(`select[name='faculty_name']`).val();
                let startTimeId = lastTr.find(`input[name='start_time_id']`).val();
                let endTimeId = lastTr.find(`input[name='end_time_id']`).val();
                let orgLid = lastTr.find(`input[name='org_lid']`).val();
                let campusLid = lastTr.find(`input[name='campus_lid']`).val();

                let clonedTr = lastTr.clone();
                clonedTr.find(`input[name='faculty_id']`).val('')
                clonedTr.find(`select[name='faculty_name']`).val('')
                clonedTr.find(`select[name='start_time_id']`).val('')
                clonedTr.find(`select[name='end_time_id']`).val('')
                clonedTr.find(`select[name='org_lid']`).val('')
                clonedTr.find(`select[name='campus_lid']`).val('')


                $('#add-more-faculty-table tbody').append(clonedTr)

                lastTr.find('.modalSelect2').select({
                    dropdownParent: $('#add-more-faculty-modal')
                });

                clonedTr.find('.modalSelect2').select({
                    dropdownParent: $('#add-more-faculty-modal')
                });
            })

            $('#add-more-faculty-table').on('click', '.remove-faculty', function () {
                let trLength = $('#add-more-faculty-table tbody tr').length;
                if (trLength > 1) {
                    $(this).closest('tr').remove()
                } else {
                    alert('Cannot delete this room.') 
                }
            })