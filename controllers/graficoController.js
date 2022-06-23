const db = require('../database');
const util = require('util');
const _ = require('lodash');
const moment = require('moment');
const query = util.promisify(db.query).bind(db);
moment.locale("es");

exports.cantidadIngredientes = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryGrafico = `select i.id, i.nombreIngrediente, i.cantidadReserva from tbl_ingrediente as i`;

  // Obtener la información del gráfico
  const grafico = await query(sqlQueryGrafico);

  res.json({ grafico });
}

exports.aumentoPrecioIngredientes = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryGrafico = `select i.id, a.montoActual, a.fechaAumento, i.nombreIngrediente from tbl_h_aumento as a inner join tbl_ingrediente as i
    on i.id = a.ingredienteId order by i.nombreIngrediente, a.fechaAumento`;

  const aumentos = await query(sqlQueryGrafico);

  // Función que retorna la información transformada hacia el frontend
  const aumentosIngredientes = [];
  const groupByIngrediente = _.groupBy(aumentos, 'nombreIngrediente');
  for (const prop in groupByIngrediente) {
    // Agregar en un array todos los aumentos de un ingrediente y ordenarlos por fecha
    const aumentos = [];
    let identificador = 0;
    for (const ingrediente of groupByIngrediente[prop]) {
      identificador = ingrediente.id;
      aumentos.push({
        Precio: ingrediente.montoActual,
        Fecha: moment(ingrediente.fechaAumento).format('DD-MM-YYYY'),
      });
    }
    aumentos.sort((a, b) => new Date(a.fechaAumento).valueOf() - new Date(b.fechaAumento).valueOf());

    // Arreglo final de datos a devolver al usuario
    aumentosIngredientes.push({
      id: identificador,
      Nombre: prop,
      mostrar: false,
      aumentos: aumentos,
    });
  }
  aumentosIngredientes.sort((a, b) => a.Nombre.localeCompare(b.Nombre));

  aumentos.map((aumento) => {
    aumento.fechaAumento = moment(aumento.fechaAumento).format('DD-MM-YYYY');
    aumento.montoActual = `₡ ${aumento.montoActual}`;
  });

  res.json({ aumentosIngredientes, aumentos });
}

exports.reporteIVASenasa = async (req, res) => {

  // Declaración de peticiones a ejecutar
  const sqlQueryIVASenasa = `select tbl_impuesto.id, fechaEntrega, montoIva, montoSenasa
  from tbl_impuesto
  inner join tbl_pedido on impuestoId = tbl_impuesto.id
  where month(fechaEntrega) = MONTH(DATE_ADD(CURDATE(),INTERVAL 0 MONTH)) order by fechaEntrega desc`;

  const sqlQueryTotal = `select sum(montoIva) as totalIva, sum(montoSenasa) as totalSenasa
  from tbl_impuesto
  inner join tbl_pedido on impuestoId = tbl_impuesto.id
  where month(fechaEntrega) = MONTH(DATE_ADD(CURDATE(),INTERVAL 0 MONTH))`;

  const impuestos = await query(sqlQueryIVASenasa);

  const totalImpuestos = await query(sqlQueryTotal);

  // Función que retorna la información transformada hacia el frontend
  const reporteImpuestos = [];

  for ( var i = 0; i < impuestos.length; i++ ) {
    // Agregar en un array IVA y Senasa y ordenarlos por fecha 
    if (i === 0) {
      reporteImpuestos.push({
        montoIva: `₡ ${impuestos[i].montoIva}`,
        montoSenasa: `₡ ${impuestos[i].montoSenasa}`,
        totalIva: `₡ ${totalImpuestos[0].totalIva}`,
        totalSenasa: `₡ ${totalImpuestos[0].totalSenasa}`,
        fechaImpuesto: moment(impuestos[i].fechaEntrega).format('DD-MM-YYYY'),
      });
    } else {
      reporteImpuestos.push({
        montoIva: `₡ ${impuestos[i].montoIva}`,
        montoSenasa: `₡ ${impuestos[i].montoSenasa}`,
        fechaImpuesto: moment(impuestos[i].fechaEntrega).format('DD-MM-YYYY'),
      });
    }
  }
  reporteImpuestos.sort((a, b) => new Date(b.fechaImpuesto).valueOf() - new Date(a.fechaImpuesto).valueOf());

  res.json({ reporteImpuestos });
}

exports.topCincoProductosVendidos = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryGraficoTopCincoProductosVendidos  = `SELECT productoId, sum(monto) as ganancias ,nombreProducto
  FROM db_foodsia.tbl_detalle_pedido
  inner join db_foodsia.tbl_producto
  inner join db_foodsia.tbl_pedido
  where month(fechaPedido) = MONTH(DATE_ADD(CURDATE(),INTERVAL -1 MONTH))
  and productoId = tbl_producto.id and  pedidoId = tbl_pedido.id group by productoId order by ganancias desc limit 5;`;

  // Obtener la información del gráfico
  const productosVendidos = await query(sqlQueryGraficoTopCincoProductosVendidos);
  let graficoTopCincoProductosVendidos = [];
  const colores = ["#238484", "#3d89cc", "#d4b32d", "#c5384b", "#8884d8"];
  for( const [index, producto] of productosVendidos.entries()){
    
    // Arreglo final de datos a devolver al usuario
    graficoTopCincoProductosVendidos.push({
      id: producto.productoId,
      name: producto.nombreProducto,
      value: producto.ganancias,
      fill: colores[index],
    });
  }

  res.json({ graficoTopCincoProductosVendidos });
}

exports.pedidosActivosContraEntregados = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryGraficoPedidosActivosContraEntregados = `select count(estadoId) as cantidad, nombreEstado 
  from db_foodsia.tbl_estado 
  inner join db_foodsia.tbl_pedido
  where estadoId = tbl_estado.id 
  and month(fechaEntrega) = MONTH(DATE_ADD(CURDATE(),INTERVAL 0 MONTH))
  group by nombreEstado order by sum(estadoId) desc ;`;

  // Obtener la información del gráfico
  const pedidosActivosContraEntregados = await query(sqlQueryGraficoPedidosActivosContraEntregados);
  let graficoPedidosActivosContraEntregados = [];
  const colores = ["#238484", "#8884d8"];

  for( const [index, estado] of pedidosActivosContraEntregados.entries()){
    // Arreglo final de datos a devolver al usuario
    graficoPedidosActivosContraEntregados.push({
        name: `${estado.nombreEstado}s`,
        value: estado.cantidad,
        fill: colores[index],
    });
  }

  res.json({ graficoPedidosActivosContraEntregados });
}

exports.ventasMensualesTrimestrales = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryGraficoNoAgrupar = `select pr.nombreProducto, min(pe.fechaPedido) as fechaPedido, sum(d.cantidad) as cantidad, sum(d.monto) as monto
    from tbl_detalle_pedido as d inner join tbl_producto as pr on d.productoId = pr.id inner join tbl_pedido as pe on d.pedidoId = pe.id 
    where YEAR(fechaPedido) = YEAR(CURDATE()) GROUP BY pr.nombreProducto, date_format(pe.fechaPedido, '%M') order by pr.nombreProducto`;

  const sqlQueryGraficoAgrupado = `select min(pe.fechaPedido) as fechaPedido, pr.nombreProducto, sum(d.cantidad) as cantidad, sum(d.monto) as monto
    from tbl_detalle_pedido as d inner join tbl_producto as pr on d.productoId = pr.id inner join tbl_pedido as pe on d.pedidoId = pe.id 
    where YEAR(fechaPedido) = YEAR(CURDATE()) group by pr.nombreProducto order by pr.nombreProducto`;

  // Obtener la información del gráfico
  const graficoNoAgrupado = await query(sqlQueryGraficoNoAgrupar);
  const graficoAgrupado = await query(sqlQueryGraficoAgrupado);

  res.json({ graficoAgrupado, graficoNoAgrupado });
}

exports.clientesPorCanton = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryGrafico = `select u.id, c.latitud, c.longitud from tbl_usuario as u inner join tbl_tipo_usuario as t on u.tipoUsuarioId = t.id inner join tbl_canton as c 
  on u.cantonId = c.id where t.nombreTipoUsuario = "Cliente" order by u.primerApellido, u.segundoApellido, u.nombreUsuario`;

  // Obtener la información del gráfico
  const clientes = await query(sqlQueryGrafico);

  let ubicaciones = [];
  for (const cliente of clientes) {
    ubicaciones.push({
      lat: cliente.latitud,
      lng: cliente.longitud,
    });
  }

  res.json({ ubicaciones });
}

exports.productoMasVendido = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryGrafico = `select pr.nombreProducto, min(pe.fechaPedido) as fechaPedido, sum(d.cantidad) as cantidad, sum(d.monto) as monto
	  from tbl_detalle_pedido as d inner join tbl_producto as pr on d.productoId = pr.id inner join tbl_pedido as pe on d.pedidoId = pe.id
    where MONTH(fechaPedido) < MONTH(CURDATE()) group by pr.nombreProducto, date_format(pe.fechaPedido, '%M') order by cantidad desc, monto desc
	  limit 1`;

  // Obtener la información del gráfico
  const productoMasVendido = await query(sqlQueryGrafico);
  
  res.json({ productoMasVendido });
}

exports.gananciasTrimestrales = async (req, res) => {
  const actual = new Date();
  actual.setMonth(actual.getMonth());
  const mesActual = actual.toLocaleString("es-MX", { month: "long" });

  // Declaración de peticiones a ejecutar
  const sqlQueryGrafico = `select pr.nombreProducto, min(pe.fechaPedido) as fechaPedido, sum(d.cantidad) as cantidad, sum(d.monto) as monto from tbl_detalle_pedido as d 
	  inner join tbl_producto as pr on d.productoId = pr.id inner join tbl_pedido as pe on d.pedidoId = pe.id where YEAR(fechaPedido) = YEAR(CURDATE())	GROUP BY pr.nombreProducto, date_format(pe.fechaPedido, '%M') 
    order by pr.nombreProducto`;

  // Obtener la información del gráfico
  const ventasSinAgrupar = await query(sqlQueryGrafico);
  let ventasFiltradas = [];
  let ganancias = 0;
  let trimeste = "";

  const primerTrimestre = ["enero", "febrero", "marzo"];
  const segundoTrimestre = ["abril", "mayo", "junio"];
  const tercerTrimestre = ["julio", "agosto", "septiembre"];
  const cuartoTrimestre = ["octubre", "noviembre", "diciembre"];

  if (primerTrimestre.includes(mesActual)) {
    ventasFiltradas = ventasSinAgrupar.filter((v) => primerTrimestre.includes(moment(v.fechaPedido).format("MMMM")));
    trimeste = "Primer Trimestre";
  }
  if (segundoTrimestre.includes(mesActual)) {
    ventasFiltradas = ventasSinAgrupar.filter((v) => segundoTrimestre.includes(moment(v.fechaPedido).format("MMMM")));
    trimeste = "Segundo Trimestre";
  }
  if (tercerTrimestre.includes(mesActual)) {
    ventasFiltradas = ventasSinAgrupar.filter((v) => tercerTrimestre.includes(moment(v.fechaPedido).format("MMMM")));
    trimeste = "Tercer Trimestre";
  }
  if (cuartoTrimestre.includes(mesActual)) {
    ventasFiltradas = ventasSinAgrupar.filter((v) => cuartoTrimestre.includes(moment(v.fechaPedido).format("MMMM")));
    trimeste = "Cuarto Trimestre";
  }

  for (const pedido of ventasFiltradas) {
    ganancias = ganancias + pedido.monto;
  }

  const data = {
    ganancias: ganancias,
    trimeste: trimeste
  }

  res.json({ data });
}

exports.clientesActivos = async (req, res) => {
  const actual = new Date();
  actual.setMonth(actual.getMonth());
  const mesActual = actual.toLocaleString("es-MX", { month: "long" });

  // Declaración de peticiones a ejecutar
  const sqlQueryGraficoClientesActivos = `select pe.usuarioId as usuarioId, pe.fechaPedido from tbl_pedido as pe inner join tbl_usuario as u on pe.usuarioId = u.id inner join tbl_tipo_usuario as tu on u.tipoUsuarioId
    where tu.nombreTipoUsuario = "Cliente"`;

  const sqlQueryGraficoClientesTotales = `select count(u.id) as numeroClientes from tbl_usuario as u inner join tbl_tipo_usuario as tu on u.tipoUsuarioId = tu.id where tu.nombreTipoUsuario = "Cliente"`;

  // Obtener la información del gráfico
  const clientesActivos = await query(sqlQueryGraficoClientesActivos);
  const clientesTotales = await query(sqlQueryGraficoClientesTotales);

  const primerSemestre = ["enero", "febrero", "marzo", "abril", "mayo", "junio"];
  const segundoSemestre = ["julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  let clientesFiltrados = [];
  let numeroClientes = 0;
  const sumaClientesTotales = clientesTotales[0].numeroClientes;
  let porcentageClientes = 0;
  let titulo = "";

  if (primerSemestre.includes(mesActual)) {
    clientesFiltrados = clientesActivos.filter((v) => primerSemestre.includes(moment(v.fechaPedido).format("MMMM")));
    titulo = "Primer Semestre";
  }
  if (segundoSemestre.includes(mesActual)) {
    clientesFiltrados = clientesActivos.filter((v) => segundoSemestre.includes(moment(v.fechaPedido).format("MMMM")));
    titulo = "Segundo Semestre";
  }

  var hash = {};
  clientesSinDuplicados = clientesFiltrados.filter(function(current) {
    var clientesSinDuplicados = !hash[current.usuarioId];
    hash[current.usuarioId] = true;
    return clientesSinDuplicados;
  });

  for (let i = 0; i < clientesSinDuplicados.length; i++) {
    numeroClientes = numeroClientes + 1;
  }

  if (numeroClientes <= 0) {
    porcentageClientes = 0;
    titulo = "No hay datos"
  } else {
    porcentageClientes = Math.round((numeroClientes * 100) / sumaClientesTotales);
  }
  
  const data = {
    numeroClientes: numeroClientes,
    porcentageClientes: porcentageClientes,
    clientesTotales: sumaClientesTotales,
    titulo: titulo
  }

  res.json({ data });
}
