const express = require('express');
const router = express.Router();
const tiposEventoController = require('../controllers/tiposEventoController');
const auth = require('../middleware/auth');

// Obtener la lista de tipos de evento ordenados alfabéticamente
router.get('/',
  auth,
  tiposEventoController.listarTiposEvento
);

module.exports = router;
