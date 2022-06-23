const express = require('express');
const router = express.Router();
const imagenController = require('../controllers/imagenController');
const auth = require('../middleware/auth');

// Agrega una imagen a una receta recién creado
router.post('/receta',
  auth,
  imagenController.subirImagenReceta,
  imagenController.nuevoProductoImagen
);

// Agrega una imagen a una receta viejo
router.patch('/receta/:id',
  auth,
  imagenController.subirImagenReceta,
  imagenController.viejoProductoImagen
);

// Agrega una imagen a un juguete recién creado
router.post('/juguete',
  auth,
  imagenController.subirImagenJuguete,
  imagenController.nuevoProductoImagen
);

// Agrega una imagen a un juguete viejo
router.patch('/juguete/:id',
  auth,
  imagenController.subirImagenJuguete,
  imagenController.viejoProductoImagen
);

// Agrega una imagen a un ingrediente recién creado
router.post('/ingrediente',
  auth,
  imagenController.subirImagenIngrediente,
  imagenController.nuevoIngredienteImagen
);

// Agrega una imagen a un juguete viejo
router.patch('/ingrediente/:id',
  auth,
  imagenController.subirImagenIngrediente,
  imagenController.viejoIngredienteImagen
);

module.exports = router;
