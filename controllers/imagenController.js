const db = require('../database');
const multer = require('multer');
const util = require('util');
const query = util.promisify(db.query).bind(db);

// Lógica previa para manejo de imágenes en pantalla de recetas
const almacenamientoReceta = multer.diskStorage({
  // Definir ruta de almacenamiento
  destination: function (request, file, callback) {
    callback(null, './images/recetas');
  },

  // Agregar extensión a la imagen
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const uploadReceta = multer({ storage: almacenamientoReceta });
exports.subirImagenReceta = uploadReceta.single('imagenReceta');

// Lógica previa para manejo de imágenes en pantalla de juguetes
const almacenamientoJuguete = multer.diskStorage({
  // Definir ruta de almacenamiento
  destination: function (request, file, callback) {
    callback(null, './images/juguetes');
  },

  // Agregar extensión a la imagen
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const uploadJuguete = multer({ storage: almacenamientoJuguete });
exports.subirImagenJuguete = uploadJuguete.single('imagenJuguete');

// Lógica previa para manejo de imágenes en pantalla de imágenes
const almacenamientoIngrediente = multer.diskStorage({
  // Definir ruta de almacenamiento
  destination: function (request, file, callback) {
    callback(null, './images/ingredientes');
  },

  // Agregar extensión a la imagen
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const uploadIngrediente = multer({ storage: almacenamientoIngrediente });
exports.subirImagenIngrediente = uploadIngrediente.single('imagenIngrediente');

exports.nuevoProductoImagen = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryProducto = `update tbl_producto set imagen = ? where id = ?`;
  const sqlQueryProductoInsertado = `select MAX(id) as id from tbl_producto`;

  // Obtener el id del producto agregado
  const productoId = await query(sqlQueryProductoInsertado);

  // Actualizar la información del producto con su imagen
  const productoActualizado = await query(sqlQueryProducto, [req.file.filename, productoId[0].id]);

  if (productoActualizado.affectedRows > 0) {
    res.json({ productoActualizado });
  } else {
    res.status(404).send('No existe ese producto');
  }
}

exports.viejoProductoImagen = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryProducto = `update tbl_producto set imagen = ? where id = ?`;

  // Actualizar la información del producto con su imagen
  if (req.file !== undefined) {
    await query(sqlQueryProducto, [req.file.filename, req.params.id]);
  } else {
    await query(sqlQueryProducto, [null, req.params.id]);
  }
  res.status(204).send('Producto actualizado');
}

exports.nuevoIngredienteImagen = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryIngrediente = `update tbl_ingrediente set imagen = ? where id = ?`;
  const sqlQueryIngredienteInsertado = `select MAX(id) as id from tbl_ingrediente`;

  // Obtener el id del ingrediente agregado
  const ingredienteId = await query(sqlQueryIngredienteInsertado);

  // Actualizar la información del producto con su imagen
  const ingredienteActualizado = await query(sqlQueryIngrediente, [req.file.filename, ingredienteId[0].id]);

  if (ingredienteActualizado.affectedRows > 0) {
    res.json({ ingredienteActualizado });
  } else {
    res.status(404).send('No existe ese ingrediente');
  }
}

exports.viejoIngredienteImagen = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryIngrediente = `update tbl_ingrediente set imagen = ? where id = ?`;

  // Actualizar la información del ingrediente con su imagen
  if (req.file !== undefined) {
    await query(sqlQueryIngrediente, [req.file.filename, req.params.id]);
  } else {
    await query(sqlQueryIngrediente, [null, req.params.id]);
  }
  res.status(204).send('Ingrediente actualizado');
}
