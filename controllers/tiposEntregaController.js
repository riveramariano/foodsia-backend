const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarTiposEntrega = async (req, res) => {
  const sqlQuery = `select * from tbl_tipo_entrega order by nombreTipoEntrega`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}
