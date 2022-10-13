module.exports = class FacultyAllotmentContents {
    constructor(programId, acadYear, acadSession, division, batch, eventName) {
        this.programId = programId;
        this.acadYear = acadYear;
        this.acadSession = acadSession;
        this.division = division;
        this.batch = batch;
        this.eventName = eventName;
    }
}