const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarPedidos = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select p.id, p.fechaPedido, p.fechaEntrega, p.totalNeto, p.usuarioId, e.nombreEstado, t.nombreTipoEntrega from tbl_pedido as p inner join 
    tbl_estado as e on e.id = p.estadoId inner join tbl_tipo_entrega as t on t.id = p.tipoEntregaId order by e.nombreEstado, p.fechaEntrega`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}

exports.listarProductos = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select p.id, p.nombreProducto from tbl_producto as p order by p.nombreProducto`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}

exports.obtenerPedido = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryVerificarUsuario = `select p.usuarioId from tbl_pedido as p where id = ?`;
  const sqlQueryPedidoConUsuario = `select p.id, p.fechaPedido, p.fechaEntrega, p.direccion, p.totalNeto, p.estadoId, p.tipoEntregaId, p.usuarioId, i.montoIva,
    i.montoSenasa, e.nombreEstado, t.nombreTipoEntrega, u.nombreUsuario, u.primerApellido, u.segundoApellido from tbl_pedido as p inner join tbl_impuesto
    as i on p.impuestoId = i.id inner join tbl_estado as e on p.estadoId = e.id inner join tbl_tipo_entrega as t on p.tipoEntregaId = t.id inner join 
    tbl_usuario as u on p.usuarioId = u.id where p.id = ?`;
  const sqlQueryPedidoSinUsuario = `select p.id, p.fechaPedido, p.fechaEntrega, p.direccion, p.totalNeto, p.estadoId, p.tipoEntregaId, p.usuarioId, i.montoIva,
    i.montoSenasa, e.nombreEstado, t.nombreTipoEntrega from tbl_pedido as p inner join tbl_impuesto as i on p.impuestoId = i.id inner join tbl_estado as e 
    on p.estadoId = e.id inner join tbl_tipo_entrega as t on p.tipoEntregaId = t.id where p.id = ?`;
  const sqlQueryDetalles = `select d.productoId, d.cantidad, d.monto, p.nombreProducto from tbl_detalle_pedido as d inner join tbl_producto as p 
    on d.productoId = p.id where pedidoId = ?`;

  // Obtener el cliente y sus mascotas
  const verificarUsuario = await query(sqlQueryVerificarUsuario, [req.params.id]);
  const detallesPedido = await query(sqlQueryDetalles, [req.params.id]);
  let pedido = [];

  if (verificarUsuario[0].usuarioId) {
    pedido = await query(sqlQueryPedidoConUsuario, [req.params.id]);
  } else {
    pedido = await query(sqlQueryPedidoSinUsuario, [req.params.id]);
  }

  if (pedido.length > 0) {
    res.json({ pedido, detallesPedido });
  } else {
    res.status(404).send('No existe ese pedido');
  }
}

exports.agregarPedido = async (req, res) => {
  const { fechaPedido, fechaEntrega, direccion, tipoEntregaId, usuarioId, detallesPedido } = req.body;

  // Queries tabla pedidos
  const sqlQueryPedido = `insert into tbl_pedido (fechaPedido, fechaEntrega, direccion, estadoId, tipoEntregaId, 
    usuarioId) values (STR_TO_DATE(?, "%d-%m-%Y"), STR_TO_DATE(?, "%d-%m-%Y"), ?, ?, ?, ?)`;
  const sqlQueryPedidoInsertado = `select MAX(id) as id from tbl_pedido`;
  const sqlQueryActualizarPedido = `update tbl_pedido set totalNeto = ?, impuestoId = ? where id = ?`;
  
  // Queries tabla detalle pedidos
  const sqlQueryDetallePedido = `insert into tbl_detalle_pedido (cantidad, monto, pedidoId, productoId) values (?, ?, ?, ?)`;
  const sqlQueryProductoSeleccionado = `select precio from tbl_producto where id = ?`
  const sqlQueryTotal = `select sum(monto) as total FROM tbl_detalle_pedido where pedidoId = ?`;

  // Queries tabla impuestos
  const sqlQueryImpuesto = `insert into tbl_impuesto (montoIva, montoSenasa) values (?, ?)`;
  const sqlQueryImpuestoInsertadoId = `select MAX(id) as id from tbl_impuesto`;
  const sqlQueryImpuestoInsertadoData = `select i.montoIva, i.montoSenasa from tbl_impuesto as i where id = ?`;

  // Agregar un nuevo pedido a la base de datos y obtener su id
  await query(sqlQueryPedido, [fechaPedido, fechaEntrega, direccion, 1, tipoEntregaId, usuarioId]);
  const pedidoId = await query(sqlQueryPedidoInsertado);

  // Insertar todos los detalles pedido del pedido
  for (const detalle of detallesPedido) {
    const { productoId, cantidad } = detalle;
    const producto = await query(sqlQueryProductoSeleccionado, productoId);
    const precioFinal = producto[0].precio * cantidad;
    await query(sqlQueryDetallePedido, [cantidad, precioFinal, pedidoId[0].id, productoId]);
  }

  // Obtener el total neto del pedido
  const total = await query(sqlQueryTotal, [pedidoId[0].id]);
  const impuestoIva = total[0].total * 0.13;
  const impuestoSenasa = total[0].total * 0.02;

  // Agregar impuesto al pedido, obtener su id y luego sus montos
  await query(sqlQueryImpuesto, [impuestoIva, impuestoSenasa]);
  const impuestoId = await query(sqlQueryImpuestoInsertadoId);
  const montosImpuesto = await query(sqlQueryImpuestoInsertadoData, [impuestoId[0].id]);

  // Del total substraer los impuestos
  const { montoIva, montoSenasa } = montosImpuesto[0];
  const totalNeto = total[0].total - (montoIva + montoSenasa); 

  // Actualizar pedido con la nueva información
  const pedido = await query(sqlQueryActualizarPedido, [totalNeto, impuestoId[0].id, pedidoId[0].id]);

  if (pedido) {
    res.status(204).send('Pedido creado exitosamente');
  } else {
    res.status(400).send('Ocurrió un error al insertar un pedido');
  }
}

exports.actualizarPedido = async (req, res) => {
  const { id, fechaPedido, fechaEntrega, direccion, tipoEntregaId, usuarioId, detallesPedido } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQuerySeleccionarImpuesto = `select impuestoId from tbl_pedido where id = ?`;
  const sqlQueryActualizarPedido1 = `update tbl_pedido set fechaPedido = STR_TO_DATE(?, "%d-%m-%Y"), fechaEntrega = STR_TO_DATE(?, "%d-%m-%Y"), direccion = ?, 
    tipoEntregaId = ?, usuarioId = ?, impuestoId = ? where id = ?`;
  const sqlQueryActualizarPedido2 = `update tbl_pedido set totalNeto = ?, impuestoId = ? where id = ?`;
  
  // Queries detalle pedido
  const sqlQueryEliminarDetalles = `delete from tbl_detalle_pedido where pedidoId = ?`;
  const sqlQueryInsertarDetallesPedido = `insert into tbl_detalle_pedido (cantidad, monto, pedidoId, productoId) values (?, ?, ?, ?)`;
  const sqlQueryProductoSeleccionado = `select precio from tbl_producto where id = ?`
  const sqlQueryTotal = `select sum(monto) as total FROM tbl_detalle_pedido where pedidoId = ?`;

  // Queries tabla impuestos
  const sqlQueryEliminarImpuesto = `delete from tbl_impuesto where id = ?`;
  const sqlQueryImpuesto = `insert into tbl_impuesto (montoIva, montoSenasa) values (?, ?)`;
  const sqlQueryImpuestoInsertadoId = `select MAX(id) as id from tbl_impuesto`;
  const sqlQueryImpuestoInsertadoData = `select i.montoIva, i.montoSenasa from tbl_impuesto as i where id = ?`;

  // Seleccionar id del impuesto
  const impuestoViejo = await query(sqlQuerySeleccionarImpuesto, [id]);

  // Actualizar la información del cliente
  await query(sqlQueryActualizarPedido1, [fechaPedido, fechaEntrega, direccion, tipoEntregaId, usuarioId, null, id]);

  // Eliminar todas sus detalles pedido asociados
  await query(sqlQueryEliminarDetalles, [id]);

  // Volver a insertas sus detalles pedido con la información actualizada
  for (const detalle of detallesPedido) {
    const { productoId, cantidad } = detalle;
    const producto = await query(sqlQueryProductoSeleccionado, productoId);
    const precioFinal = producto[0].precio * cantidad;
    await query(sqlQueryInsertarDetallesPedido, [cantidad, precioFinal, id, productoId]);
  }

  // Obtener el total neto del pedido
  const total = await query(sqlQueryTotal, [id]);
  const impuestoIva = total[0].total * 0.13;
  const impuestoSenasa = total[0].total * 0.02;

  // Eliminar impuesto viejo
  await query(sqlQueryEliminarImpuesto, [impuestoViejo[0].id]);

  // Agregar impuesto al pedido, obtener su id y luego sus montos
  await query(sqlQueryImpuesto, [impuestoIva, impuestoSenasa]); // VER COMO CALCULAR ESTO
  const impuestoId = await query(sqlQueryImpuestoInsertadoId);
  const montosImpuesto = await query(sqlQueryImpuestoInsertadoData, [impuestoId[0].id]);

  // Del total substraer los impuestos
  const { montoIva, montoSenasa } = montosImpuesto[0];
  const totalNeto = total[0].total - (montoIva + montoSenasa);

  // Actualizar pedido con la nueva información
  const pedido = await query(sqlQueryActualizarPedido2, [totalNeto, impuestoId[0].id, id]);

  if (pedido.affectedRows > 0) {
    res.json({ pedido });
  } else {
    res.status(404).send('Hubo un error');
  }
}

exports.eliminarPedido = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryImpuestoAEliminar = `select p.impuestoId from tbl_pedido as p where id = ?`
  const sqlQueryEliminarImpuesto = `delete from tbl_impuesto where id = ?`;
  const sqlQueryEliminarPedido = `delete from tbl_pedido where id = ?`;
  const sqlQueryEliminarDetalles = `delete from tbl_detalle_pedido where pedidoId = ?`;
  const sqlEliminarEventosPedido = `delete from tbl_evento where pedidoId = ?`;

  // Eliminar todas sus eventos asociados
  await query(sqlEliminarEventosPedido, [req.params.id]);

  // Eliminar todas sus detalles pedido asociados
  await query(sqlQueryEliminarDetalles, [req.params.id]);

  // Seleccionar el id del impuesto a eliminar
  const impuestoId = await query(sqlQueryImpuestoAEliminar, [req.params.id]);
  
  // Eliminar el pedido seleccionado
  const pedidoEliminado = await query(sqlQueryEliminarPedido, [req.params.id]);

  // Eliminar los impuestos del pedido
  await query(sqlQueryEliminarImpuesto, [impuestoId[0].impuestoId]);

  if (pedidoEliminado.affectedRows > 0) {
    res.json({ pedidoEliminado });
  } else {
    res.status(404).send('Hubo un error');
  }
}
