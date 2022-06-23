const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarTiposMascota = async (req, res) => {
  const sqlQuery = `select * from tbl_tipo_mascota order by nombreTipoMascota`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}
