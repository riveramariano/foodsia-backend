const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarTiposUsuario = async (req, res) => {
  const sqlQuery = `select * from tbl_tipo_usuario order by id`;
  const rows = await query(sqlQuery);

  let tiposUsuario = [];
  for (const row of rows) {
    tiposUsuario.push({
      value: row.id,
      label: row.nombreTipoUsuario,
    });
  }

  res.json({ tiposUsuario });
}
