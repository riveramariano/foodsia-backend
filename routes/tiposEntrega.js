const express = require('express');
const router = express.Router();
const tiposEntregaController = require('../controllers/tiposEntregaController');
const auth = require('../middleware/auth');

// Obtener la lista de tipos entrega ordenados alfabéticamente
router.get('/',
  auth,
  tiposEntregaController.listarTiposEntrega
);

module.exports = router;
