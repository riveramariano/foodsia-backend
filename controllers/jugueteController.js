const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarJuguetes = async (req, res) => {
  // Petición a ejecutar
	const sqlQuery = `select j.id, j.nombreProducto, j.precio, j.material, tm.nombreTipoMascota from tbl_producto as j inner join tbl_tipo_mascota as tm 
		on j.tipoMascotaId = tm.id inner join tbl_tipo_producto as tp on j.tipoProductoId = tp.id where tp.nombreTipoProducto = "Juguete" order by j.nombreProducto`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}

exports.obtenerJuguete = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryJuguete = `select j.id, j.nombreProducto, j.imagen, j.precio, j.material, j.tipoMascotaId, tm.nombreTipoMascota 
    from tbl_producto as j inner join tbl_tipo_mascota as tm on j.tipoMascotaId = tm.id inner join tbl_tipo_producto as tp on 
    j.tipoProductoId = tp.id where tp.nombreTipoProducto = "Juguete" and j.id = ?`;

  // Obtener el Juguete
  const juguete = await query(sqlQueryJuguete, [req.params.id]);

  if (juguete.length > 0) {
    res.json({ juguete });
  } else {
    res.status(404).send('No existe ese Juguete');
  }
}

exports.agregarJuguete = async (req, res) => {
  const { nombreJuguete, precio, material, tipoMascotaId } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryJuguetes = `select p.nombreProducto from tbl_producto as p`;
  const juguetes = await query(sqlQueryJuguetes);
  const juguetesDuplicados = juguetes.filter((u) => u.nombreProducto === nombreJuguete.trimEnd());

  if (juguetesDuplicados.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    const sqlQueryJuguete = `insert into tbl_producto (nombreProducto, precio, material, tipoMascotaId, tipoProductoId) values (?, ?, ?, ?, ?)`;

    // Agregar el nuevo juguete a la base de datos
    const jugueteAgregado = await query(sqlQueryJuguete, [nombreJuguete, precio, material, tipoMascotaId, 2]);

    if (jugueteAgregado) {
      res.status(204).send('Juguete creado exitosamente');
    } else {
      res.status(400).send('Ocurrió un error al insertar un juguete');
    }
  }
}

exports.actualizarJuguete = async (req, res) => {
  const { id, nombreJuguete, precio, material, tipoMascotaId } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryJuguetes = `select p.id, p.nombreProducto from tbl_producto as p`;
  const juguetes = await query(sqlQueryJuguetes);
  const juguetesDuplicados = juguetes.filter((j) => j.id !== id && j.nombreProducto === nombreJuguete.trimEnd());

  if (juguetesDuplicados.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    const sqlQueryJuguete = `update tbl_producto set nombreProducto = ?, precio = ?, material = ?, tipoMascotaId = ? where id = ?`;

    // Actualizar la información del juguete
    const jugueteActualizado = await query(sqlQueryJuguete, [nombreJuguete, precio, material, tipoMascotaId, id]);

    if (jugueteActualizado.affectedRows > 0) {
      res.json({ jugueteActualizado });
    } else {
      res.status(404).send('No existe este Producto');
    }
  }
}

exports.eliminarJuguete = async (req, res) => {
  // Queries pedidos
  const sqlQueryActualizarDetalles = `update tbl_detalle_pedido set productoId = ? where productoId = ?`;

  // Eliminar referencia
  await query(sqlQueryActualizarDetalles, [null, req.params.id]);

  // Queries juguete
  const sqlQueryEliminarJuguete = `delete from tbl_producto where id = ?`;

  // Eliminar el juguete seleccionado
  const jugueteEliminado = await query(sqlQueryEliminarJuguete, [req.params.id]);

  if (jugueteEliminado.affectedRows > 0) {
    res.json({ jugueteEliminado });
  } else {
    res.status(404).send('Hubo un error');
  }
}
