const express = require('express');
const router = express.Router();
const tiposUsuarioController = require('../controllers/tiposUsuarioController');
const auth = require('../middleware/auth');

// Obtener la lista de tipos de usuario ordenados alfabéticamente
router.get('/',
  auth,
  tiposUsuarioController.listarTiposUsuario
);

module.exports = router;
