const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const auth = require('../middleware/auth');

// Obtener la lista de clientes ordenados alfabéticamente
router.get('/',
  auth,
  clienteController.listarClientes
); 

// Obtener un cliente específico
router.get('/:id',
  auth,
  clienteController.obtenerCliente
); 

// Agregar un nuevo cliente a la base de datos
router.post('/',
  auth,
  clienteController.agregarCliente
);

// Actualizar un cliente de la base de datos
router.patch('/',
  auth,
  clienteController.actualizarCliente
);

// Eliminar un cliente de la base de datos
router.delete('/:id',
  auth,
  clienteController.eliminarCliente
);

module.exports = router;
