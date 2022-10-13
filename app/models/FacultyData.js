module.exports = class FacultyData {
    constructor(facultyName, facultyId, campusId, orgId, date, slotId, isBooked, aContentUuid, aContentsId) {
        this.facultyName = facultyName;
        this.facultyId = facultyId;
        this.campusId = campusId;
        this.orgId = orgId;
        this.date = date;
        this.slotId = slotId;
        this.isBooked = isBooked;
        this.aContentUuid = a.aContentUuid;
        this.aContentsId = aContentsId;
    }
}