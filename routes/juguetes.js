const express = require('express');
const router = express.Router();
const jugueteController = require('../controllers/jugueteController');
const auth = require('../middleware/auth');

// Obtener la lista de juguetes ordenados alfabéticamente
router.get('/',
  auth,
  jugueteController.listarJuguetes
);

// Actualizar un juguete de la base de datos
router.patch('/',
  auth,
  jugueteController.actualizarJuguete
);

// Obtener un juguete específico
router.get('/:id',
  auth,
  jugueteController.obtenerJuguete
); 

// Agregar un nuevo juguete a la base de datos
router.post('/',
  auth,
  jugueteController.agregarJuguete
);

// Eliminar una juguete de la base de datos
router.delete('/:id',
  auth,
  jugueteController.eliminarJuguete
);

module.exports = router;
