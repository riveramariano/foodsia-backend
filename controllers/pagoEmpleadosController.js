const db = require('../database');
const util = require('util');
const moment = require('moment');
const query = util.promisify(db.query).bind(db);
moment.locale("es");

exports.listarPagoEmpleados = async (req, res) => {
  const sqlQuery = `select tbl_pago.id, nombreUsuario, primerApellido, segundoApellido, fechaPago ,monto, tbl_usuario.id as usuarioId
    from tbl_usuario inner join tbl_pago on tbl_usuario.id = tbl_pago.usuarioId order by fechaPago desc`;
  const rows = await query(sqlQuery);
    
  res.json({ rows });
}

exports.reportePagoEmpleados = async (req, res) => {
  const actual = new Date();
  actual.setMonth(actual.getMonth());
  const mesActual = actual.toLocaleString("es-MX", { month: "long" });

  const sqlQuery = `select tbl_pago.id, nombreUsuario, primerApellido, segundoApellido, fechaPago ,monto, tbl_usuario.id as usuarioId
    from tbl_usuario inner join tbl_pago on tbl_usuario.id = tbl_pago.usuarioId  where year(fechaPago) = year(DATE_ADD(CURDATE(),INTERVAL 0 year))
    order by fechaPago desc`;
  const rows = await query(sqlQuery);

  const primerSemestre = ["enero", "febrero", "marzo", "abril", "mayo", "junio"];
  const segundoSemestre = ["julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  let semestre = [];

  if (primerSemestre.includes(mesActual)) {
    semestre = rows.filter((v) => primerSemestre.includes(moment(v.fechaPago).format("MMMM")));  
  }
  if (segundoSemestre.includes(mesActual)) {
    semestre = rows.filter((v) => segundoSemestre.includes(moment(v.fechaPago).format("MMMM")));
  }

  let data = [];
  semestre.map((row) => {
    data.push({
      nombreEmpleado: `${row.nombreUsuario} ${row.primerApellido} ${row.segundoApellido}`,
      fechaPago: moment(row.fechaPago).format('DD-MM-YYYY'),
      monto: `₡ ${row.monto}`,
    });
  });

  res.json({ data });
}


exports.obtenerPagoEmpleado = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryEmpleado = `select tbl_pago.id, nombreUsuario, primerApellido, segundoApellido, fechaPago ,monto, tbl_usuario.id as usuarioId
    from tbl_usuario inner join tbl_pago on tbl_usuario.id = tbl_pago.usuarioId where tbl_pago.id = ? `;
  const data = await query(sqlQueryEmpleado, [req.params.id]);

  const pagoEmpleado = {
    id : data[0].id,
    empleado: {
      value : data[0].usuarioId,
      label: `${data[0].nombreUsuario} ${data[0].primerApellido} ${data[0].segundoApellido}`,
    },
    fechaPago : data[0].fechaPago,
    monto : data[0].monto
  }

  if (Object.keys(pagoEmpleado).length  !== 0) {
    res.json({ pagoEmpleado });
  } else { 
    res.status(404).send('No hay pago de empleado');
  }
}

exports.agregarPagoEmpleado = async (req, res) => {
  const { monto, fechaPago, usuarioId } = req.body;

  const sqlQueryAgregarPagoEmpleado = `insert into tbl_pago (monto, fechaPago, usuarioId) values (?, STR_TO_DATE(?, "%d-%m-%Y"), ?)`;
  const pagoEmpleadoAgregado = await query(sqlQueryAgregarPagoEmpleado, [monto, fechaPago, usuarioId]);

  if (pagoEmpleadoAgregado) {
    res.status(204).send('Pago de empleado creado exitosamente');
  } else {
    res.status(400).send('Ocurrió un error al insertar un pago');
  }
}

exports.actualizarPagoEmpleado = async (req, res) => {
  const {id, monto, fechaPago, usuarioId } = req.body;
  const sqlQueryActualizarPagoEmpleado = `update tbl_pago set monto = ?, fechaPago = STR_TO_DATE(?, "%d-%m-%Y"), usuarioId = ? where id = ?`;

  const pagoEmpleadoActualizado = await query(sqlQueryActualizarPagoEmpleado, [monto, fechaPago, usuarioId, id]);

  if (pagoEmpleadoActualizado.affectedRows > 0) {
    res.json({ pagoEmpleadoActualizado });
  } else {
    res.status(400).send('Ocurrió un error al actualizar el pago');
  }
}

exports.eliminarPagoEmpleado = async (req, res) => {
  // Queries pago empleado
  const sqlQueryEliminarPagoEmpleado = `delete from tbl_pago where id = ?`;
  
  // Eliminar el pago de empleado seleccionado seleccionado
  const pagoEmpleadoEliminado = await query(sqlQueryEliminarPagoEmpleado, [req.params.id]);
  
  if (pagoEmpleadoEliminado.affectedRows > 0) {
    res.json({ pagoEmpleadoEliminado });
  } else {
    res.status(404).send('No existe ese empleado');
  }
}
  
exports.listarEmpleados = async (req, res) => {
  const sqlQuery = `select u.id, u.nombreUsuario, u.primerApellido, u.segundoApellido from tbl_usuario as u 
    inner join tbl_tipo_usuario as t on u.tipoUsuarioId = t.id where t.nombreTipoUsuario = "Empleado" or t.nombreTipoUsuario = "Administrador" 
    order by u.primerApellido, u.segundoApellido, u.nombreUsuario`;
  const rows = await query(sqlQuery);
  
  let empleados = [];
  for (const row of rows) {
    empleados.push({
      value: row.id,
      label: `${row.nombreUsuario} ${row.primerApellido} ${row.segundoApellido}`,
    });
  }

  res.json({ empleados });
}
