const express = require('express');
const router = express.Router();
const cantonController = require('../controllers/cantonController');
const auth = require('../middleware/auth');

// Obtener la lista de cantones ordenados alfabéticamente
router.get('/',
  auth,
  cantonController.listarCantones
);

module.exports = router;
