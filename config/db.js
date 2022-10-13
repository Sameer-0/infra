const sql = require('mssql')
require('dotenv').config()

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  requestTimeout: 300000,
  pool: {
    max: 40,
    min: 1,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

const pool = new sql.ConnectionPool(sqlConfig);
const poolConnection = pool.connect();



let execPreparedStmt = async (stmt, params, values) => {

  !params ? params = [] : '';
  !values ? values = {} : '';

  let pool = await poolConnection
  const ps = new sql.PreparedStatement(pool)

  for (let param of params) {
    if (param.type === 'input') {
      ps.input(param.name, param.dataType)
    } else if (param.type === 'output') {
      ps.output(param.name, param.dataType)
    }
  }

  return ps.prepare(stmt).then(() => {
    return ps.execute(values)
  })
}



module.exports = {
  sql,
  poolConnection,
  execPreparedStmt
}