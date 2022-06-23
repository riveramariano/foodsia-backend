const express = require('express');
const router = express.Router();
const unidadesController = require('../controllers/unidadesController');
const auth = require('../middleware/auth');

// Obtener la lista de unidades ordenadas alfabéticamente
router.get('/',
  auth,
  unidadesController.listarUnidades
);

module.exports = router;
