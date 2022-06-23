const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.listarProveedores = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select p.id, p.nombreProveedor, p.cedulaJuridica, p.correoElectronico, p.telefono from tbl_proveedor as p order by p.nombreProveedor;`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}

exports.obtenerProveedor = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryProveedor = `select p.id, p.nombreProveedor, p.cedulaJuridica, p.direccion, p.correoElectronico, p.telefono
    from tbl_proveedor as p where id = ?`;

  // Obtener el proveedor
  const proveedor = await query(sqlQueryProveedor, [req.params.id]);

  if (proveedor.length > 0) {
    res.json({ proveedor });
  } else {
    res.status(404).send('No existe ese proveedor');
  }
}

exports.agregarProveedor = async (req, res) => {
  const { nombreProveedor, cedulaJuridica, direccion, correoElectronico, telefono } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryProveedores = `select p.nombreProveedor, p.cedulaJuridica, p.correoElectronico, p.telefono from tbl_proveedor as p`;
  const proveedores = await query(sqlQueryProveedores);
  const nombreDuplicado = proveedores.filter((u) => u.nombreProveedor === nombreProveedor.trimEnd());
  const cedulaDuplicada = proveedores.filter((u) => u.cedulaJuridica === cedulaJuridica.trimEnd());
  const correoDuplicado = proveedores.filter((u) => u.correoElectronico === correoElectronico.trimEnd());
  const telefonoDuplicado = proveedores.filter((u) => u.telefono === telefono.trimEnd());

  if (nombreDuplicado.length || cedulaDuplicada.length || correoDuplicado.length || telefonoDuplicado.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    const sqlQueryProveedor = `insert into tbl_proveedor (nombreProveedor, cedulaJuridica, direccion, correoElectronico, telefono) 
    values (?, ?, ?, ?, ?)`;

    // Agregar el nuevo proveedor a la base de datos
    const proveedorAgregado = await query(sqlQueryProveedor, [nombreProveedor, cedulaJuridica, direccion, correoElectronico, telefono, 1]);

    if (proveedorAgregado) {
      res.status(204).send('Proveedor agregado exitosamente');
    } else {
      res.status(400).send('Ocurrió un error al agregar el proveedor');
    }
  }
}

exports.actualizarProveedor = async (req, res) => {
  const { id, nombreProveedor, cedulaJuridica, direccion, correoElectronico, telefono } = req.body;

  // Declaración de peticiones a ejecutar
  const sqlQueryProveedores = `select p.id, p.nombreProveedor, p.cedulaJuridica, p.correoElectronico, p.telefono from tbl_proveedor as p`;
  const proveedores = await query(sqlQueryProveedores);
  const nombreDuplicado = proveedores.filter((p) => p.id !== id && p.nombreProveedor === nombreProveedor.trimEnd());
  const cedulaDuplicada = proveedores.filter((p) => p.id !== id && p.cedulaJuridica === cedulaJuridica.trimEnd());
  const correoDuplicado = proveedores.filter((p) => p.id !== id && p.correoElectronico === correoElectronico.trimEnd());
  const telefonoDuplicado = proveedores.filter((p) => p.id !== id && p.telefono === telefono.trimEnd());

  if (nombreDuplicado.length || cedulaDuplicada.length || correoDuplicado.length || telefonoDuplicado.length) {
    res.status(409).send('Información duplicada');
  } else {
    // Declaración de peticiones a ejecutar
    const sqlQueryProveedor = `update tbl_proveedor set nombreProveedor = ?, cedulaJuridica = ?, direccion = ?, correoElectronico = ?, telefono = ? where id = ?`;

    // Actualizar la información del cliente
    const proveedorActualizado = await query(sqlQueryProveedor, [nombreProveedor, cedulaJuridica, direccion, correoElectronico, telefono, id]);

    if (proveedorActualizado.affectedRows > 0) {
      res.json({ proveedorActualizado });
    } else {
      res.status(404).send('No existe esa receta');
    }
  }
}

exports.eliminarProveedor = async (req, res) => {
  // Declaración de petición a ejecutar para eliminar referencia en ingredientes
  const sqlQueryIngredientes = `select id from tbl_ingrediente where proveedorId = ?`;
  const sqlQueryActualizarIngrediente = `update tbl_ingrediente set proveedorId = ? WHERE id = ?`;

  const ingredientes = await query(sqlQueryIngredientes, [req.params.id]);

  // Eliminar al referencia
  if (ingredientes.length) {
    for (const ingrediente of ingredientes) {
      await query(sqlQueryActualizarIngrediente, [null, ingrediente.id]);
    }
  }

  // Declaración de petición a ejecutar para eliminar proveedor
  const sqlQueryEliminarPreveedor = `delete from tbl_proveedor where id = ?`;

  // Eliminar la receta seleccionada
  const preveedorEliminado = await query(sqlQueryEliminarPreveedor, [req.params.id]);

  if (preveedorEliminado.affectedRows > 0) {
    res.json({ preveedorEliminado });
  } else {
    res.status(404).send('No existe ese usuario');
  }
}
