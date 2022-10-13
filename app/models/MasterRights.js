module.exports = class MasterRights {
    constructor(appModuleId, httpMethodId, urlId, createdAt, modifiedAt, status) {
        this.appModuleId = appModuleId;
        this.httpMethodId = httpMethodId;
        this.urlId = urlId;
        this.createdAt = createdAt;
        this.modifiedAt = modifiedAt;
        this.status = status;
    }
}