const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarUnidades = async (req, res) => {
  const sqlQuery = `select * from tbl_unidad order by nombreUnidad`;
  const rows = await query(sqlQuery);

  let unidades = [];
  for (const row of rows) {
    unidades.push({
      value: row.id,
      label: row.nombreUnidad,
    });
  }

  res.json({ unidades });
}
