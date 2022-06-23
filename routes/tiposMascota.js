const express = require('express');
const router = express.Router();
const tiposMascotaController = require('../controllers/tiposMascotaController');
const auth = require('../middleware/auth');

// Obtener la lista de cantones ordenados alfabéticamente
router.get('/',
  auth,
  tiposMascotaController.listarTiposMascota
);

module.exports = router;
