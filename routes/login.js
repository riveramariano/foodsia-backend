const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const auth = require('../middleware/auth');

// Iniciar sesión
router.post('/', 
  loginController.iniciarSesion
);

// Obtiene el usuario autenticado
router.get('/',
  auth,
  loginController.usuarioAutenticado
);

module.exports = router;
