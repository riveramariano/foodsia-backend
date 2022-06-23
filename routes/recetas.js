const express = require('express');
const router = express.Router();
const recetaController = require('../controllers/recetaController');
const auth = require('../middleware/auth');

// Obtener la lista de recetas ordenadas alfabéticamente
router.get('/',
  auth,
  recetaController.listarRecetas
); 

// Obtener una receta específica
router.get('/:id',
  auth,
  recetaController.obtenerReceta
); 

// Agregar una nueva receta a la base de datos
router.post('/',
  auth,
  recetaController.agregarReceta
);

// Actualizar una receta de la base de datos
router.patch('/',
  auth,
  recetaController.actualizarReceta
);

// Eliminar una receta de la base de datos
router.delete('/:id',
  auth,
  recetaController.eliminarReceta
);

module.exports = router;
