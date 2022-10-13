module.exports = class FacultySlots {
    constructor(facultyId, date, dayName, slotId, campusId, orgId, aContentId) {
        this.facultyId = facultyId;
        this.date = date;
        this.dayName = dayName;
        this.slotId = slotId;
        this.campusId = campusId;
        this.orgId = orgId;
        this.aContentId = aContentId;
    }
}