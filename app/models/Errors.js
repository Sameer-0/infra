module.exports = class Errors {
    constructor(errorId, username, errorNumber, errorState, errorSeverity, errorLine, errorProcedure, errorMsg, errorTime) {
        this.errorId = errorId;
        this.username = username;
        this.errorNumber = errorNumber;
        this.errorState = errorState;
        this.errorSeverity = errorSeverity;
        this.errorLine = errorLine;
        this.errorProcedure = errorProcedure;
        this.errorMsg = errorMsg;
        this.errorTime = errorTime;
    }
}