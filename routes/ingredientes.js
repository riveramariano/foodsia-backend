const express = require('express');
const router = express.Router();
const ingredientesController = require('../controllers/ingredientesController');
const auth = require('../middleware/auth');

// Obtener la lista de ingredientes ordenados alfabéticamente
router.get('/',
  auth,
  ingredientesController.listarIngredientes
);

// Obtener un ingrediente específico
router.get('/:id',
  auth,
  ingredientesController.obtenerIngrediente
);

// Agregar un nuevo ingrediente a la base de datos
router.post('/',
  auth,
  ingredientesController.agregarIngrediente
);

// Actualizar un ingrediente de la base de datos
router.patch('/',
  auth,
  ingredientesController.actualizarIngrediente
)

// Eliminar un ingrediende de la base de datos
router.delete('/:id',
  auth,
  ingredientesController.eliminarIngrediente
);

module.exports = router;
