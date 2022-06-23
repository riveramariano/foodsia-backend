const express = require('express');
const router = express.Router();
const pagoEmpleadosController = require('../controllers/pagoEmpleadosController');
const auth = require('../middleware/auth');

// Obetener la lista de pagoEmpleados ordenados por fecha
router.get('/',
    auth,
    pagoEmpleadosController.listarPagoEmpleados
);

// Obtener el reporte de pagoEmpleados
router.get('/reporte',
    auth,
    pagoEmpleadosController.reportePagoEmpleados
);

// Obtener un pagoEmpleado por id
router.get('/:id',
    auth,
    pagoEmpleadosController.obtenerPagoEmpleado
);

// Agregar un pagoEmpleado
router.post('/',
    auth,
    pagoEmpleadosController.agregarPagoEmpleado
);

// Actualizar un pagoEmpleado
router.patch('/',
    auth,
    pagoEmpleadosController.actualizarPagoEmpleado
);

// Elimina un pago empleado por id
router.delete('/:id',
    auth,
    pagoEmpleadosController.eliminarPagoEmpleado
);

// Lista de los empleados
router.get('/lista/empleados',
    auth,
    pagoEmpleadosController.listarEmpleados
);

module.exports = router;
