const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarClientes = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select u.id, u.nombreUsuario, u.primerApellido, u.segundoApellido, u.telefono, u.fechaUnion, u.cantonId, t.nombreTipoUsuario, 
    f.nombreFrecuenciaPedido from tbl_usuario as u inner join tbl_tipo_usuario as t on u.tipoUsuarioId = t.id inner join tbl_frecuencia_pedido 
    as f on f.id = u.frecuenciaPedidoId where t.nombreTipoUsuario = "Cliente" order by u.primerApellido, u.segundoApellido, u.nombreUsuario`;
  const rows = await query(sqlQuery);


  res.json({ rows });
}

exports.obtenerCliente = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryCliente = `select u.id, u.nombreUsuario, u.primerApellido, u.segundoApellido, u.telefono, u.fechaUnion, u.telefono, u.cantonId, 
    u.frecuenciaPedidoId, t.nombreTipoUsuario, c.nombreCanton, f.nombreFrecuenciaPedido from tbl_usuario as u inner join tbl_tipo_usuario as t 
    on u.tipoUsuarioId = t.id inner join tbl_canton as c on u.cantonId = c.id inner join tbl_frecuencia_pedido as f on u.frecuenciaPedidoId = f.id 
    where t.nombreTipoUsuario = "Cliente" and u.id = ?`;
  const sqlQueryMascotas = `select * from tbl_mascota where usuarioId = ?`;

  // Obtener el cliente y sus mascotas
  const cliente = await query(sqlQueryCliente, [req.params.id]);
  const mascotas = await query(sqlQueryMascotas, [req.params.id]);

  if (cliente.length > 0) {
    res.json({ cliente, mascotas });
  } else {
    res.status(404).send('No existe ese usuario');
  }
}

exports.agregarCliente = async (req, res) => {
  const { nombre, primerApellido, segundoApellido, fechaUnion, telefono, cantonId, frecuenciaPedidoId, mascotas } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryCliente = `insert into tbl_usuario (nombreUsuario, primerApellido, segundoApellido, fechaUnion, telefono, cantonId, 
    frecuenciaPedidoId, tipoUsuarioId) values (?, ?, ?, STR_TO_DATE(?, "%d-%m-%Y"), ?, ?, ?, ?)`;
  const sqlQueryMascota = `insert into tbl_mascota (nombreMascota, fechaNacimiento, padecimientos, usuarioId) values (?, STR_TO_DATE(?, "%d-%m-%Y"), ?, ?)`;
  const sqlQueryClienteInsertado = `select MAX(id) as id from tbl_usuario`;

  // Agregar el nuevo cliente a la base de datos
  const clienteAgregado = await query(sqlQueryCliente, [nombre, primerApellido, segundoApellido, fechaUnion, telefono, cantonId, frecuenciaPedidoId, 3]);

  // Obtener el id del cliente agregado
  const clienteId = await query(sqlQueryClienteInsertado);

  // Agregar las mascotas del cliente agregado a la base de datos
  for (const mascota of mascotas) {
    const { nombreMascota, fechaNacimiento, padecimientos } = mascota;
    await query(sqlQueryMascota, [nombreMascota, fechaNacimiento, padecimientos, clienteId[0].id]);
  }

  if (clienteAgregado) {
    res.status(204).send('Cliente creado exitosamente');
  } else {
    res.status(400).send('Ocurrió un error al insertar un cliente');
  }
}

exports.actualizarCliente = async (req, res) => {
  const { id, nombre, primerApellido, segundoApellido, fechaUnion, telefono, cantonId, frecuenciaPedidoId, mascotas } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryCliente = `update tbl_usuario set nombreUsuario = ?, primerApellido = ?, segundoApellido = ?, fechaUnion = STR_TO_DATE(?, "%d-%m-%Y"),
    telefono = ?, cantonId = ?, frecuenciaPedidoId = ? where id = ?`;
  const sqlQueryObtenerMascotas = `select * from tbl_mascota where usuarioId = ?`;
  const sqlQueryEliminarEventosMascotas = `delete from tbl_evento where mascotaId = ?`;
  const sqlQueryEliminarMascotas = `delete from tbl_mascota where usuarioId = ?`;
  const sqlQueryAgregarMascota = `insert into tbl_mascota (nombreMascota, fechaNacimiento, padecimientos, usuarioId) values (?, STR_TO_DATE(?, "%d-%m-%Y"), ?, ?)`;

  // Listar mascotas viejas y eliminar sus eventos
  const mascotasViejas = await query(sqlQueryObtenerMascotas, [id]);
  for (const mascota of mascotasViejas) {
    await query(sqlQueryEliminarEventosMascotas, [mascota.id]);
  }

  // Actualizar la información del cliente
  const clienteActualizado = await query(sqlQueryCliente, [nombre, primerApellido, segundoApellido, fechaUnion, telefono, 
    cantonId, frecuenciaPedidoId, id]);

  // Eliminar todas sus mascotas asociadas
  await query(sqlQueryEliminarMascotas, [id]);

  // Volver a insertas sus mascotas con información actualizada
  for (const mascota of mascotas) {
    const { nombreMascota, fechaNacimiento, padecimientos } = mascota;
    await query(sqlQueryAgregarMascota, [nombreMascota, fechaNacimiento, padecimientos, id]);
  }

  if (clienteActualizado.affectedRows > 0) {
    res.json({ clienteActualizado });
  } else {
    res.status(404).send('Ocurrió un error al actualizar un cliente');
  }
}

exports.eliminarCliente = async (req, res) => {
  // Queries Pedidos
  const sqlQueryPedidos = `select p.id from tbl_pedido as p where p.usuarioId = ?`;
  const sqlQueryActualizarPedidos = `update tbl_pedido set usuarioId = ? where id = ?`;

  // Obtener pedidos a nombre del cliente
  const pedidos = await query(sqlQueryPedidos, [req.params.id]);

  // Eliminar al referencia
  if (pedidos.length) {
    for (const pedido of pedidos) {
      await query(sqlQueryActualizarPedidos, [null, pedido.id]);
    }
  }

  // Queries Eventos
  const sqlQueryObtenerMascotas = `select id from tbl_mascota where usuarioId = ?`;
  const sqlEliminarEventosMascotas = `delete from tbl_evento where mascotaId = ?`;
  const sqlEliminarEventosCliente = `delete from tbl_evento where usuarioId = ?`;

  // Listar mascotas viejas y eliminar sus eventos
  const mascotasViejas = await query(sqlQueryObtenerMascotas, [req.params.id]);
  for (const mascota of mascotasViejas) {
    await query(sqlEliminarEventosMascotas, [mascota.id]);
  }
  await query(sqlEliminarEventosCliente, [req.params.id]);

  // Queries clientes
  const sqlQueryEliminarCliente = `delete from tbl_usuario where id = ?`;
  const sqlQueryEliminarMascotas = `delete from tbl_mascota where usuarioId = ?`;

  // Eliminar el cliente seleccionado
  const clienteEliminado = await query(sqlQueryEliminarCliente, [req.params.id]);

  // Eliminar todas sus mascotas asociadas
  await query(sqlQueryEliminarMascotas, [req.params.id]);

  if (clienteEliminado.affectedRows > 0) {
    res.json({ clienteEliminado });
  } else {
    res.status(404).send('No existe ese usuario');
  }
}
