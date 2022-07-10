const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const moment = require('moment');

exports.listarEventos = async (req, res) => {
  const sqlQuery = `select e.*, t.nombreTipoEvento from tbl_evento as e inner join tbl_tipo_evento as t on t.id = e.tipoEventoId`;
  const eventos = await query(sqlQuery);

  let eventosCalendario = [];
  for (const evento of eventos) {
    const mesEventoInicio = moment(evento.fechaEventoInicio).format("MM");
    const mesEventoFin = moment(evento.fechaEventoFin).format("MM");
    const diaInicioEvento = moment(evento.fechaEventoInicio).format("DD");
    const diaFinEvento = moment(evento.fechaEventoFin).format("DD");

    // Si es de estos tipos simplemente se muestra la fecha en que ocurre
    if (["Entrega Pedido", "Ausencia Empleado"].includes(evento.nombreTipoEvento)) {
      eventosCalendario.push({
        id: evento.id,
        title: evento.motivo,
        start: evento.fechaEventoInicio,
        end: moment(evento.fechaEventoFin).add(1, 'days'),
        priority: evento.nombreTipoEvento,
      });
    }

    // Si es de estos tipos, se repite a partir del próximo año
    if (["Aniversario Cliente", "Cumpleaños Mascota"].includes(evento.nombreTipoEvento)) {
      const annioInicio = parseInt(moment(evento.fechaEventoInicio).format("YYYY")) + 1;
      for (let i = annioInicio; i <= 2030; i++) {
        const fechaInicio = new Date(i, mesEventoInicio - 1, diaInicioEvento);
        const fechaFin = new Date(i, mesEventoFin - 1, diaFinEvento);
        eventosCalendario.push({
          id: evento.id,
          title: evento.motivo,
          start: fechaInicio,
          end: moment(fechaFin).add(1, 'days'),
          priority: evento.nombreTipoEvento,
        });
      }
    }

    // Si es de estos tipos, se repite a partir del año actual
    if (["Festividad", "Aniversario GPF"].includes(evento.nombreTipoEvento)) {
      const annioInicio = parseInt(moment(evento.fechaEventoInicio).format("YYYY"));
      for (let i = annioInicio; i <= 2030; i++) {
        const fechaInicio = new Date(i, mesEventoInicio - 1, diaInicioEvento);
        const fechaFin = new Date(i, mesEventoFin - 1, diaFinEvento);
        eventosCalendario.push({
          id: evento.id,
          title: evento.motivo,
          start: fechaInicio,
          end: moment(fechaFin).add(1, 'days'),
          priority: evento.nombreTipoEvento,
        });
      }
    }
  }

  res.json({ eventosCalendario });
}

exports.obtenerEvento = async (req, res) => {
  // Declaración de peticiones a ejecutar
  const sqlQueryEvento = `select e.id, e.motivo, e.fechaEventoInicio, e.fechaEventoFin, e.tipoEventoId, t.nombreTipoEvento
    from tbl_evento as e inner join tbl_tipo_evento as t on e.tipoEventoId = t.id where e.id = ?`;
  const sqlQueryEventoEspecial = `select e.id, e.motivo, e.fechaEventoInicio, e.fechaEventoFin, e.tipoEventoId, e.usuarioId, t.nombreTipoEvento, u.nombreUsuario,
    u.primerApellido, u.segundoApellido from tbl_evento as e inner join tbl_tipo_evento as t on e.tipoEventoId = t.id inner join tbl_usuario as u 
    on u.id = e.usuarioId where e.id = ?`;

  // Obtener el empleado
  const data = await query(sqlQueryEventoEspecial, [req.params.id]);

  let evento = {};
  if (!data.length) { 
    const data = await query(sqlQueryEvento, [req.params.id]);
    evento = {
      id: data[0].id,
      motivo: data[0].motivo,
      fechaEventoInicio: req.params.start,
      fechaEventoFin: moment(req.params.end).subtract(1, 'days'),
      tipoEvento: {
        value: data[0].tipoEventoId,
        label: data[0].nombreTipoEvento,
      },
    };
  } else {
    evento = {
      id: data[0].id,
      motivo: data[0].motivo,
      fechaEventoInicio: new Date(data[0].fechaEventoInicio),
      fechaEventoFin: new Date(data[0].fechaEventoFin),
      tipoEvento: {
        value: data[0].tipoEventoId,
        label: data[0].nombreTipoEvento,
      },
      empleado: {
        value: data[0].usuarioId,
        label: `${data[0].nombreUsuario} ${data[0].primerApellido} ${data[0].segundoApellido}`
      },
    };
  }

  if (Object.keys(evento).length !== 0) {
    res.json({ evento });
  } else {
    res.status(404).send('No existe ese evento');
  }
}

exports.agregarEvento= async (req, res) => {
  const { motivo, fechaEventoInicio, fechaEventoFin, tipoEventoId, usuarioId } = req.body;

  // Queries tabla evento
  const sqlQueryPedido = `insert into tbl_evento(motivo, fechaEventoInicio, fechaEventoFin, tipoEventoId, usuarioId) 
    values (?, STR_TO_DATE(?, "%d-%m-%Y"), STR_TO_DATE(?, "%d-%m-%Y"), ?, ?)`;

  // Agregar un nuevo evento a la base de datos
  const eventoAgregado = await query(sqlQueryPedido, [motivo, fechaEventoInicio, fechaEventoFin, tipoEventoId, usuarioId]);

  if (eventoAgregado) {
    res.status(204).send('Evento creado exitosamente');
  } else {
    res.status(400).send('Ocurrió un error al insertar un evento');
  }
}

exports.actualizarEvento = async (req, res) => {
  const { id, motivo, fechaEventoInicio, fechaEventoFin, tipoEventoId, usuarioId } = req.body;

  // Queries tabla eventos
  const sqlQueryActualizarEvento = `update tbl_evento set motivo = ?, fechaEventoInicio = STR_TO_DATE(?, "%d-%m-%Y"), 
    fechaEventoFin = STR_TO_DATE(?, "%d-%m-%Y"), tipoEventoId = ?, usuarioId = ? where id = ?`;

  // Actualizar un evento de base de datos
  const eventoActualizado = await query(sqlQueryActualizarEvento, [motivo, fechaEventoInicio, fechaEventoFin, tipoEventoId, usuarioId, id]);

  if (eventoActualizado) {
    res.status(204).send('Evento actualizado exitosamente');
  } else {
    res.status(400).send('Ocurrió un error al actualizar un evento');
  }
}

exports.eliminarEvento = async (req, res) => {
  // Queries evento
  const sqlQueryEliminarEvento = `delete from tbl_evento where id = ?`;

  // Eliminar el evento seleccionado
  const eventoEliminado = await query(sqlQueryEliminarEvento, [req.params.id]);

  if (eventoEliminado.affectedRows > 0) {
    res.json({ eventoEliminado });
  } else {
    res.status(404).send('No existe ese evento');
  }
}

exports.listarEmpleados = async (req, res) => {
  const sqlQuery = `select u.id, u.nombreUsuario, u.primerApellido, u.segundoApellido from tbl_usuario as u 
    inner join tbl_tipo_usuario as t on u.tipoUsuarioId = t.id where t.nombreTipoUsuario = "Empleado" or t.nombreTipoUsuario = "Administrador" 
    order by u.primerApellido, u.segundoApellido, u.nombreUsuario`;
  const rows = await query(sqlQuery);

  let empleados = [];
  for (const row of rows) {
    empleados.push({
      value: row.id,
      label: `${row.nombreUsuario} ${row.primerApellido} ${row.segundoApellido}`,
    });
  }

  res.json({ empleados });
}

exports.listarEventosFiltrados = async (req, res) => {
  const sqlQuery = `select e.*, t.nombreTipoEvento from tbl_evento as e inner join tbl_tipo_evento as t on t.id = e.tipoEventoId order by fechaEventoInicio`;
  const eventos = await query(sqlQuery);

  let eventosCalendario = [];
  for (const evento of eventos) {
    const mesEvento = moment(evento.fechaEventoInicio).format("MM");
    const diaInicioEvento = moment(evento.fechaEventoInicio).format("DD");
    const diaFinEvento = moment(evento.fechaEventoFin).format("DD");

    // Si es de estos tipos simplemente se muestra la fecha en que ocurre
    if (["Entrega Pedido", "Ausencia Empleado"].includes(evento.nombreTipoEvento)) {
      eventosCalendario.push({
        id: evento.id,
        title: evento.motivo,
        start: evento.fechaEventoInicio,
        end: moment(evento.fechaEventoFin).add(1, 'days'),
        priority: evento.nombreTipoEvento,
      });
    }

    // Si es de estos tipos, se repite a partir del próximo año
    if (["Aniversario Cliente", "Cumpleaños Mascota"].includes(evento.nombreTipoEvento)) {
      const annioInicio = parseInt(moment(evento.fechaEventoInicio).format("YYYY")) + 1;
      for (let i = annioInicio; i <= 2030; i++) {
        const fechaInicio = new Date(i, mesEvento - 1, diaInicioEvento);
        const fechaFin = new Date(i, mesEvento - 1, diaFinEvento);
        eventosCalendario.push({
          id: evento.id,
          title: evento.motivo,
          start: fechaInicio,
          end: moment(fechaFin).add(1, 'days'),
          priority: evento.nombreTipoEvento,
        });
      }
    }

    // Si es de estos tipos, se repite a partir del año actual
    if (["Festividad", "Aniversario GPF"].includes(evento.nombreTipoEvento)) {
      const annioInicio = parseInt(moment(evento.fechaEventoInicio).format("YYYY"));
      for (let i = annioInicio; i <= 2030; i++) {
        const fechaInicio = new Date(i, mesEvento - 1, diaInicioEvento);
        const fechaFin = new Date(i, mesEvento - 1, diaFinEvento);
        eventosCalendario.push({
          id: evento.id,
          title: evento.motivo,
          start: fechaInicio,
          end: moment(fechaFin).add(1, 'days'),
          priority: evento.nombreTipoEvento,
        });
      }
    }
  }

  const fechaActual = new Date();
  const fechaActualFormateada = Date.UTC(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  let notificaciones = [];
  for (const evento of eventosCalendario) {
    const fechaEventoInucio = new Date(evento.start);
    const fechaEventoFormateada = Date.UTC(fechaEventoInucio.getFullYear(), fechaEventoInucio.getMonth(), fechaEventoInucio.getDate());

    // Verificar si el evento va a suceder o está sucediendo
    if (fechaEventoFormateada >= fechaActualFormateada) {
      const diferenciaDias = Math.floor((fechaEventoFormateada - fechaActualFormateada) / _MS_PER_DAY);
      
      // Verificar si el evento ocurren dentro hoy o dentro de los próximos 5 días
      if (diferenciaDias >= 1 && diferenciaDias <= 5) {
        notificaciones.push({
          id: evento.id,
          tipoEvento: evento.priority.split(' ').join(''),
          mensaje: ` en ${diferenciaDias} día(s) ${evento.title}`,
          fecha: moment(evento.start).format("DD-MM-YYYY"),
          diferenciaDias: diferenciaDias,
        });
      }
      if (diferenciaDias === 0) {
        notificaciones.push({
          id: evento.id,
          tipoEvento: evento.priority.split(' ').join(''),
          mensaje: ` hoy ${evento.title}`,
          fecha: moment(evento.start).format("DD-MM-YYYY"),
          diferenciaDias: diferenciaDias,
        });
      }
    }
  }

  // Ordenar las notificaciones por proximidad
  notificaciones.sort((a, b) => a.diferenciaDias - b.diferenciaDias);

  res.json({ notificaciones });
}
