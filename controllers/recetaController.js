const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarRecetas = async (req, res) => {
  // Petición a ejecutar
	const sqlQuery = `select r.id, r.nombreProducto, r.precio, tm.nombreTipoMascota from tbl_producto as r inner join tbl_tipo_mascota as tm 
		on r.tipoMascotaId = tm.id inner join tbl_tipo_producto as tp on r.tipoProductoId = tp.id where tp.nombreTipoProducto = "Receta" order by r.nombreProducto`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}

exports.obtenerReceta = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryReceta = `select r.id, r.nombreProducto, r.imagen, r.precio, r.material, r.humedad, r.proteina, r.grasaCruda, r.fibraCruda, r.tipoMascotaId, 
    tm.nombreTipoMascota from tbl_producto as r inner join tbl_tipo_mascota as tm on r.tipoMascotaId = tm.id inner join tbl_tipo_producto as tp on 
    r.tipoProductoId = tp.id where tp.nombreTipoProducto = "Receta" and r.id = ?`;

  // Obtener el cliente y sus mascotas
  const receta = await query(sqlQueryReceta, [req.params.id]);

  if (receta.length > 0) {
    res.json({ receta });
  } else {
    res.status(404).send('No existe esa receta');
  }
}

exports.agregarReceta = async (req, res) => {
  const { nombreReceta, precio, ingredientes, humedad, proteina, grasaCruda, fibraCruda, tipoMascotaId } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryRecetas = `select p.nombreProducto from tbl_producto as p`;
  const recetas = await query(sqlQueryRecetas);
  const recetasDuplicadas = recetas.filter((u) => u.nombreProducto === nombreReceta.trimEnd());

  if (recetasDuplicadas.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    const sqlQueryReceta = `insert into tbl_producto (nombreProducto, precio, material, humedad, proteina, grasaCruda, fibraCruda,
      tipoMascotaId, tipoProductoId) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Agregar el nuevo cliente a la base de datos
    const recetaAgregada = await query(sqlQueryReceta, [nombreReceta, precio, ingredientes, humedad, proteina, grasaCruda, fibraCruda, tipoMascotaId,  1]);

    if (recetaAgregada) {
      res.status(204).send('Receta creada exitosamente');
    } else {
      res.status(400).send('Ocurrió un error al insertar una receta');
    }
  }
}

exports.actualizarReceta = async (req, res) => {
  const { id, nombreReceta, precio, ingredientes, humedad, proteina, grasaCruda, fibraCruda, tipoMascotaId } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryRecetas = `select p.id, p.nombreProducto from tbl_producto as p`;
  const recetas = await query(sqlQueryRecetas);
  const recetasDuplicadas = recetas.filter((r) => r.id !== id && r.nombreProducto === nombreReceta.trimEnd());

  if (recetasDuplicadas.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    const sqlQueryReceta = `update tbl_producto set nombreProducto = ?, precio = ?, material = ?, humedad = ?, proteina = ?, grasaCruda = ?, 
      fibraCruda = ?, tipoMascotaId = ? where id = ?`;

    // Actualizar la información del cliente
    const recetaActualizada = await query(sqlQueryReceta, [nombreReceta, precio, ingredientes, humedad, proteina, grasaCruda, fibraCruda,
      tipoMascotaId, id]);

    if (recetaActualizada.affectedRows > 0) {
      res.json({ recetaActualizada });
    } else {
      res.status(404).send('No existe esa receta');
    }
  }
}

exports.eliminarReceta = async (req, res) => {
  // Queries pedidos
  const sqlQueryActualizarDetalles = `update tbl_detalle_pedido set productoId = ? where productoId = ?`;

  // Eliminar referencia
  await query(sqlQueryActualizarDetalles, [null, req.params.id])

  // Queries recetas
  const sqlQueryEliminarReceta = `delete from tbl_producto where id = ?`;

  // Eliminar la receta seleccionada
  const recetaEliminada = await query(sqlQueryEliminarReceta, [req.params.id]);

  if (recetaEliminada.affectedRows > 0) {
    res.json({ recetaEliminada });
  } else {
    res.status(404).send('Hubo un error');
  }
}

exports.listarProductos = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select r.id, r.nombreProducto from tbl_producto as r order by r.nombreProducto`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}
