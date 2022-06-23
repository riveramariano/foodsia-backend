const express = require('express');
const router = express.Router();
const frecuenciaPedidoController = require('../controllers/frecuenciaPedidoController');
const auth = require('../middleware/auth');

// Obtener la lista de cantones ordenados alfabéticamente
router.get('/',
  auth,
  frecuenciaPedidoController.listarFrecuenciaPedidos
);

module.exports = router;
