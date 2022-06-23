const express = require('express');
const router = express.Router();
const recuperarCredencialesController = require('../controllers/recuperarCredencialesController');

// Enviar correo de recuperación
router.post('/',
  recuperarCredencialesController.enviarCorreo
);

// Actualizar credenciales
router.post('/:opt',
  recuperarCredencialesController.actualizarCredenciales
);

// Validar correo
router.post('/validar/correo',
  recuperarCredencialesController.validarCorreo
);

// Lista de empleados de la bd
router.get('/listar-empleados',
  recuperarCredencialesController.listarEmpleados
);

module.exports = router;
