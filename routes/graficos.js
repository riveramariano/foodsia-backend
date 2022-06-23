const express = require('express');
const router = express.Router();
const graficoController = require('../controllers/graficoController');
const auth = require('../middleware/auth');

// Gráfico cantidad restante por ingrediente 
router.get('/cantidad-ingredientes',
  auth,
  graficoController.cantidadIngredientes
);

// Gráfico aumento precio ingredientes
router.get('/aumento-precio-ingredientes',
  auth,
  graficoController.aumentoPrecioIngredientes
);

// Grafico top 5 productos vendidos
router.get('/top-cinco-productos-vendidos',
  auth,
  graficoController.topCincoProductosVendidos
);

// Grafico pedidos entregados contra activos
router.get('/pedidos-entregados-activos',
  auth,
  graficoController.pedidosActivosContraEntregados
);

// Gráfico ventas mensuales y trimestrales
router.get('/ventas-mensuales-trimestrales',
  auth,
  graficoController.ventasMensualesTrimestrales
);

// Gráfico cantidad de clientes por cantón
router.get('/clientes-canton',
  auth,
  graficoController.clientesPorCanton
);

// Gráfico pruducto más vendido el mes pasado
router.get('/producto-mas-vendido',
  auth,
  graficoController.productoMasVendido
);

// Gráfico ganancias trimestrales
router.get('/ganancias-trimestrales',
  auth,
  graficoController.gananciasTrimestrales
);

// Gráfico clientes activos
router.get('/clientes-activos',
  auth,
  graficoController.clientesActivos
);

// Reporte IVA y Senasa
router.get('/reporte-iva-senasa',
  auth,
  graficoController.reporteIVASenasa
);

module.exports = router;
