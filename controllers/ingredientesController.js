const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarIngredientes = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select i.id, i.nombreIngrediente, i.precioUnitario, i.proveedorId, u.nombreUnidad from tbl_ingrediente as i inner join tbl_unidad as u
    on i.unidadId = u.id order by i.nombreIngrediente`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}

exports.obtenerIngrediente = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryVerificarIngrediente = `select proveedorId from db_foodsia.tbl_ingrediente where id = ?`;

  const sqlQueryIngrediente = `select i.id, i.nombreIngrediente, i.imagen, i.precioUnitario, i.cantidadReserva, i.unidadId, i.proveedorId,
    u.nombreUnidad, p.nombreProveedor from db_foodsia.tbl_ingrediente as i inner join db_foodsia.tbl_unidad as u on i.unidadId = u.id 
    inner join db_foodsia.tbl_proveedor as p on i.proveedorId = p.id where i.id = ?`;

  const sqlQueryIngredienteSinProveedor = `select i.id, i.nombreIngrediente, i.imagen, i.precioUnitario, i.cantidadReserva, i.unidadId,
    u.nombreUnidad from db_foodsia.tbl_ingrediente as i inner join db_foodsia.tbl_unidad as u on i.unidadId = u.id where i.id = ?`;


  // Obtener el ingrediente
  const verificarIngrediente = await query(sqlQueryVerificarIngrediente, [req.params.id]);
  let data = [];
  let ingrediente = {};

  if (verificarIngrediente[0].proveedorId) {
    data = await query(sqlQueryIngrediente, [req.params.id]);
    ingrediente = {
      id: data[0].id,
      nombreIngrediente: data[0].nombreIngrediente,
      imagen: data[0].imagen,
      precioUnitario: data[0].precioUnitario,
      cantidadReserva: data[0].cantidadReserva,
      proveedor: {
        value: data[0].proveedorId,
        label: data[0].nombreProveedor,
      },
      unidad: {
        value: data[0].unidadId,
        label: data[0].nombreUnidad,
      },
    };
  } else {
    data = await query(sqlQueryIngredienteSinProveedor, [req.params.id]);
    ingrediente = {
      id: data[0].id,
      nombreIngrediente: data[0].nombreIngrediente,
      imagen: data[0].imagen,
      precioUnitario: data[0].precioUnitario,
      cantidadReserva: data[0].cantidadReserva,
      unidad: {
        value: data[0].unidadId,
        label: data[0].nombreUnidad,
      },
    };
  }

  if (Object.keys(ingrediente).length !== 0) {
    res.json({ ingrediente });
  } else {
    res.status(404).send('No existe ese Ingrediente');
  }
}

exports.agregarIngrediente = async (req, res) => {
  const { nombreIngrediente, precioUnitario, cantidadReserva, unidadId, proveedorId } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryIngredientes = `select i.nombreIngrediente from tbl_ingrediente as i`;
  const ingredientes = await query(sqlQueryIngredientes);
  const ingredientesDuplicados = ingredientes.filter((u) => u.nombreIngrediente === nombreIngrediente.trimEnd());
  console.log(ingredientes);

  if (ingredientesDuplicados.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    const sqlQueryIngrediente = `insert into tbl_ingrediente (nombreIngrediente, precioUnitario, cantidadReserva, unidadId, proveedorId) values (?, ?, ?, ?, ?)`;

    // Agregar el nuevo ingrediente a la base de datos
    const ingredienteAgregado = await query(sqlQueryIngrediente, [nombreIngrediente, precioUnitario, cantidadReserva, unidadId, proveedorId, 2]);

    if (ingredienteAgregado) {
      res.status(204).send('Ingrediente creado exitosamente');
    } else {
      res.status(400).send('Ocurrió un error al insertar el ingrediente');
    }
  }
}

exports.actualizarIngrediente = async (req, res) => {
  const { id, nombreIngrediente, precioUnitario, cantidadReserva, unidadId, proveedorId } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryIngredientes = `select i.id, i.nombreIngrediente from tbl_ingrediente as i`;
  const ingredientes = await query(sqlQueryIngredientes);
  const ingredientesDuplicados = ingredientes.filter((i) => i.id !== id && i.nombreIngrediente === nombreIngrediente.trimEnd());

  if (ingredientesDuplicados.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    const sqlQueryIngrediente = `update tbl_ingrediente set nombreIngrediente = ?, precioUnitario = ?, cantidadReserva = ?, unidadId = ?, proveedorId = ? where id = ?`;

    // Actualizar la información del juguete
    const ingredienteActualizado = await query(sqlQueryIngrediente, [nombreIngrediente, precioUnitario, cantidadReserva, unidadId, proveedorId, id]);

    if (ingredienteActualizado.affectedRows > 0) {
      res.json({ ingredienteActualizado });
    } else {
      res.status(404).send('No existe este Ingrediente');
    }
  }
}

exports.eliminarIngrediente = async (req, res) => {
  // Queries ingredientes
  const sqlQueryEliminarIngrediente = `delete from tbl_ingrediente where id = ?`;
  const sqlQueryEliminarAumentos = `delete from tbl_h_aumento where ingredienteId = ?`;

  // Eliminar aumentos del ingrediente
  await query(sqlQueryEliminarAumentos, [req.params.id]);

  // Eliminar la ingrediente seleccionada
  const ingredienteEliminada = await query(sqlQueryEliminarIngrediente, [req.params.id]);

  if (ingredienteEliminada.affectedRows > 0) {
    res.json({ ingredienteEliminada });
  } else {
    res.status(404).send('Hubo un error');
  }
}
