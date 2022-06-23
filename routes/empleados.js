const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');
const auth = require('../middleware/auth');

// Obtener la lista de empleados ordenados alfabéticamente
router.get('/',
  auth,
  empleadoController.listarEmpleados
); 

// Obtener la cantidad de ausencias de cada empleado
router.get('/cantidad/ausencias',
  auth,
  empleadoController.ausenciasEmpleados
); 

// Obtener un empleado específico
router.get('/:id',
  auth,
  empleadoController.obtenerEmpleado
);

// Agregar un nuevo empleado a la base de datos
router.post('/',
  auth,
  empleadoController.agregarEmpleado
);

// Actualizar un empleado de la base de datos
router.patch('/',
  auth,
  empleadoController.actualizarEmpleado
);

// Eliminar un empleado de la base de datos
router.delete('/:id',
  auth,
  empleadoController.eliminarEmpleado
);

module.exports = router;
