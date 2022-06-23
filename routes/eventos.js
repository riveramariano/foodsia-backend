const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const auth = require('../middleware/auth');

// Obtener la lista de eventos
router.get('/',
  auth,
  eventoController.listarEventos
);

// Obtener un evento específico
router.get('/:id/:start/:end',
  auth,
  eventoController.obtenerEvento
);

// Agregar un nuevo evento a la base de datos
router.post('/',
  auth,
  eventoController.agregarEvento
);

// Actualizar un evento de la base de datos
router.patch('/',
  auth,
  eventoController.actualizarEvento
);

// Eliminar un evento de la base de datos
router.delete('/:id',
  auth,
  eventoController.eliminarEvento
);

// Obtener la lista de empleados
router.get('/lista/empleados',
  auth,
  eventoController.listarEmpleados
);

// Obtener la lista de eventos filtrados por proximidad
router.get('/lista/notificaciones/filtradas/proximidad',
  auth,
  eventoController.listarEventosFiltrados
);

module.exports = router;
