const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const auth = require('../middleware/auth');

// Obtener la lista de proveedores ordenados alfabéticamente
router.get('/',
  auth,
  proveedorController.listarProveedores
);

// Obtener un proveedor específico
router.get('/:id',
  auth,
  proveedorController.obtenerProveedor
); 

// Agregar un nuevo proveedor a la base de datos
router.post('/',
  auth,
  proveedorController.agregarProveedor
);

// Actualizar un proveedor de la base de datos
router.patch('/',
  auth,
  proveedorController.actualizarProveedor
);

// Eliminar una proveedor de la base de datos
router.delete('/:id',
  auth,
  proveedorController.eliminarProveedor
);

module.exports = router;
