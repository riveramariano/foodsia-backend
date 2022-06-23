const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarEmpleados = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select u.id, u.nombreUsuario, u.primerApellido, u.segundoApellido, u.telefono, t.nombreTipoUsuario, u.usuario, u.correoElectronico
    from tbl_usuario as u  inner join tbl_tipo_usuario as t on u.tipoUsuarioId = t.id where t.nombreTipoUsuario = "Empleado" or 
    t.nombreTipoUsuario = "Administrador" or t.nombreTipoUsuario = "Superadmin" order by u.primerApellido, u.segundoApellido, u.nombreUsuario`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}

exports.ausenciasEmpleados = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select u.nombreUsuario, u.primerApellido, u.segundoApellido, count(e.usuarioId) as ausencias from tbl_evento as e inner join 
    tbl_tipo_evento as t on e.tipoEventoId = t.id inner join tbl_usuario as u on u.id = e.usuarioId where t.nombreTipoEvento = "Ausencia Empleado" 
    and month(e.fechaEventoInicio) = MONTH(DATE_ADD(CURDATE(),INTERVAL 0 MONTH)) group by e.usuarioId order by u.nombreUsuario, u.primerApellido, u.segundoApellido`;
  const rows = await query(sqlQuery);
  
  let data = [];
  rows.map((row) => {
    data.push({
      nombreEmpleado: `${row.nombreUsuario} ${row.primerApellido} ${row.segundoApellido}`,
      ausencias: row.ausencias
    });
  })

  res.json({ data });
}

exports.obtenerEmpleado = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryEmpleado = `select u.id, u.nombreUsuario, u.primerApellido, u.segundoApellido, u.telefono, u.fechaUnion, u.usuario, u.correoElectronico,
    u.tipoUsuarioId, t.nombreTipoUsuario from tbl_usuario as u inner join tbl_tipo_usuario as t on u.tipoUsuarioId = t.id where u.id = ?`;

  // Obtener el empleado
  const data = await query(sqlQueryEmpleado, [req.params.id]);

  const empleado = {
    id: data[0].id,
    nombreUsuario: data[0].nombreUsuario,
    primerApellido: data[0].primerApellido,
    segundoApellido: data[0].segundoApellido,
    telefono: data[0].telefono,
    fechaUnion: data[0].fechaUnion,
    usuario: data[0].usuario,
    correoElectronico: data[0].correoElectronico,
    tipoUsuario: {
      value: data[0].tipoUsuarioId,
      label: data[0].nombreTipoUsuario,
    }
  };

  if (Object.keys(empleado).length !== 0) {
    res.json({ empleado });
  } else {
    res.status(404).send('No existe ese empleado');
  }
}

exports.agregarEmpleado = async (req, res) => {
  const { nombre, primerApellido, segundoApellido, telefono, fechaUnion, usuario, correoElectronico, contrasenna, tipoUsuarioId } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryNombreUsuario = `select u.usuario, u.correoElectronico from tbl_usuario as u`;
  const usuarios = await query(sqlQueryNombreUsuario);
  const usuarioDuplicado = usuarios.filter((u) => u.usuario === usuario.trimEnd());
  const correoDuplicado = usuarios.filter((u) => u.correoElectronico === correoElectronico.trimEnd());

  if (usuarioDuplicado.length || correoDuplicado.length) {
    res.status(409).send('Información duplicada');
  } else {
    const sqlQueryEmpleado = `insert into tbl_usuario (nombreUsuario, primerApellido, segundoApellido, telefono, fechaUnion, usuario, correoElectronico, 
    contrasenna, tipoUsuarioId) values (?, ?, ?, ?, STR_TO_DATE(?, "%d-%m-%Y"), ?, ?, md5(?), ?)`;

    // Agregar el nuevo empleado a la base de datos
    const empleadoAgregado = await query(sqlQueryEmpleado, [nombre, primerApellido, segundoApellido, telefono, fechaUnion, usuario, correoElectronico,
      contrasenna, tipoUsuarioId]);

    if (empleadoAgregado) {
      res.status(204).send('Empleado creado exitosamente');
    } else {
      res.status(400).send('Ocurrió un error al insertar un empleado');
    }
  }
}

exports.actualizarEmpleado = async (req, res) => {
  const { id, nombre, primerApellido, segundoApellido, telefono, fechaUnion, usuario, correoElectronico, contrasenna, tipoUsuarioId } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryNombreUsuario = `select u.id, u.usuario, u.correoElectronico from tbl_usuario as u`;
  const usuarios = await query(sqlQueryNombreUsuario);
  const usuarioDuplicado = usuarios.filter((u) => u.id !== id && u.usuario === usuario.trimEnd());
  const correoDuplicado = usuarios.filter((u) => u.id !== id && u.correoElectronico === correoElectronico.trimEnd());

  if (usuarioDuplicado.length || correoDuplicado.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    let sqlQueryEmpleadoContrasenna = '';
    let sqlQueryEmpleadoSinContrasenna = '';
    let empleadoActualizado = [];

    if (contrasenna) {
      sqlQueryEmpleadoContrasenna = `update tbl_usuario set nombreUsuario = ?, primerApellido = ?, segundoApellido = ?, telefono = ?, 
      fechaUnion = STR_TO_DATE(?, "%d-%m-%Y"), usuario = ?, correoElectronico = ?, contrasenna = md5(?), tipoUsuarioId = ? where id = ?`;

      // Actualizar la información del empleado
      empleadoActualizado = await query(sqlQueryEmpleadoContrasenna, [nombre, primerApellido, segundoApellido, telefono, fechaUnion, usuario, correoElectronico,
        contrasenna, tipoUsuarioId, id]);
    } else {
      sqlQueryEmpleadoSinContrasenna = `update tbl_usuario set nombreUsuario = ?, primerApellido = ?, segundoApellido = ?, telefono = ?, 
      fechaUnion = STR_TO_DATE(?, "%d-%m-%Y"), usuario = ?, correoElectronico = ?, tipoUsuarioId = ? where id = ?`;

      // Actualizar la información del empleado
      empleadoActualizado = await query(sqlQueryEmpleadoSinContrasenna, [nombre, primerApellido, segundoApellido, telefono, fechaUnion, usuario, correoElectronico,
        tipoUsuarioId, id]);
    }

    if (empleadoActualizado.affectedRows > 0) {
      res.json({ empleadoActualizado });
    } else {
      res.status(404).send('Hubo un error');
    }
  }
}

exports.eliminarEmpleado = async (req, res) => {
  // Queries empleado
  const sqlQueryEliminarEmpleado = `delete from tbl_usuario where id = ?`;
  const sqlQueryEliminarPagos = `delete from tbl_pago where usuarioId = ?`;
  const sqlEliminarEventosEmpleado= `delete from tbl_evento where usuarioId = ?`;

  // Eliminar el cliente seleccionado
  await query(sqlQueryEliminarPagos, [req.params.id]);
  await query(sqlEliminarEventosEmpleado, [req.params.id]);
  const empleadoEliminado = await query(sqlQueryEliminarEmpleado, [req.params.id]);

  if (empleadoEliminado.affectedRows > 0) {
    res.json({ empleadoEliminado });
  } else {
    res.status(404).send('Hubo un error');
  }
}
