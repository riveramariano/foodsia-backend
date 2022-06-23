const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarFrecuenciaPedidos = async (req, res) => {
  const sqlQuery = `select * from tbl_frecuencia_pedido order by id`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}
