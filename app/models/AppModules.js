

module.exports = class AppModules{
    constructor(name){
        this.name = name;
    }

    static fetchAll(rowcount) {
        return poolConnection.then(pool => {
            return pool.request().query(`SELECT TOP ${Number(rowcount)} ac.id as allotContentId, ac.program_id, ac.acad_year, ac.acad_session, ac.division, ac.batch, ac.event_name FROM  [dbo].allotment_contents ac`)
        })
    }
}