const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarCantones = async (req, res) => {
  const sqlQuery = `select * from tbl_canton order by nombreCanton`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}
