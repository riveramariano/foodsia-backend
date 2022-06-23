const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const auth = require('../middleware/auth');

// Obtener la lista de pedidos ordenados por fecha de entrega
router.get('/',
  auth,
  pedidoController.listarPedidos
); 

// Obtener lista de productos ordenados por su nombre
router.get('/productos',
  auth,
  pedidoController.listarProductos
); 

// Obtener un pedido específico
router.get('/:id',
  auth,
  pedidoController.obtenerPedido
); 

// Agregar un nuevo pedido a la base de datos
router.post('/',
  auth,
  pedidoController.agregarPedido
);

// Actualizar un pedido de la base de datos
router.patch('/',
  auth,
  pedidoController.actualizarPedido
);

// Eliminar un pedido de la base de datos
router.delete('/:id',
  auth,
  pedidoController.eliminarPedido
);

module.exports = router;
