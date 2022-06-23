const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarTiposEvento= async (req, res) => {
  const sqlQuery = `select * from tbl_tipo_evento order by nombreTipoEvento`;
  const rows = await query(sqlQuery);

  // Eliminar algunos eventos no necesarios para el modal de evento
  const data = rows.filter(
    (row) => !["Cumpleaños Mascota", "Aniversario Cliente", "Aniversario GPF", "Entrega Pedido"].includes(row.nombreTipoEvento)
  );

  let tiposEvento = [];
  for (const row of data) {
    tiposEvento.push({
      value: row.id,
      label: row.nombreTipoEvento,
    });
  }

  res.json({ tiposEvento });
}
