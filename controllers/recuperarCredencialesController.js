const db = require('../database');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (to, from, subject, text) => {
  const msg = {
    to,
    from,
    subject,
    html: text,
  }
  sgMail.send(msg, function(err, result){
    if (err) {
      console.log('Correo no enviado, ocurrio un error.');
    } else {
      console.log('Correo enviado con exito.');
    }
  });
};

exports.enviarCorreo = async (req, res) => {
  const { correo } = req.body;
  const sqlQueryCredencial = `select correoElectronico from tbl_usuario where correoElectronico = ?`;
  const credenciales = await query(sqlQueryCredencial, [correo]);
  
  if (credenciales.length > 0) {
    // Si el correo es válido, enviar correo de recuperación
    const from = "foodsiaproyecto@gmail.com";
    const to = correo;
    const subject = "Nueva solicitud de credenciales.";
    const output = `
      <h1>Actualización de Credenciales</h1>
      <h4>¿Qué desea actualizar?:</h4>
      <ul>
        <li>Contraseña: <a href="https://foodsia.netlify.app/recuperar-credenciales?opt=contrasenna">Actualizar Contraseña</a></li>
        <li>Usuario: <a href="https://foodsia.netlify.app/recuperar-credenciales?opt=usuario">Actualizar Usuario</a></li>
      </ul>
    `;
    sendEmail(to, from, subject, output);
    res.status(204).send('Operación exitosa');
  } else {
    res.status(400).send('Ocurrió un error');
  }
};

exports.validarCorreo = async (req, res) => {
  const { correo } = req.body;
  const sqlQueryCredencial = `select correoElectronico from tbl_usuario where correoElectronico = ?`;
  const credenciales = await query(sqlQueryCredencial, [correo]);

  res.json({ credenciales });
}

exports.listarEmpleados = async (req, res) => {
  // Petición a ejecutar
  const sqlQuery = `select u.id, t.nombreTipoUsuario, u.usuario from tbl_usuario as u inner join tbl_tipo_usuario as t on 
    u.tipoUsuarioId = t.id where t.nombreTipoUsuario = "Empleado" or 
    t.nombreTipoUsuario = "Administrador" or t.nombreTipoUsuario = "Superadmin"`;
  const rows = await query(sqlQuery);

  res.json({ rows });
}

exports.actualizarCredenciales = async (req, res) => {
  if (req.body.contrasenna) {
    const { correo, contrasenna, repetirContrasenna } = req.body;

    // Validar si contraseña y repetir contraseña coincide
    if (contrasenna === repetirContrasenna) {
      const sqlQueryUsuario = `update tbl_usuario set contrasenna = md5(?) where correoElectronico = ?`;
      await query(sqlQueryUsuario, [contrasenna, correo]);
      res.status(204).send('Operación exitosa');
    } else {
      res.status(400).send('Ocurrió un error');
    }

  } else {
    const { correo, usuario, repetirUsuario } = req.body;

    // Validar si usuario y repetir usuario coincide
    if (usuario === repetirUsuario) {
      const sqlQueryUsuario = `update tbl_usuario set usuario = ? where correoElectronico = ?`;
      await query(sqlQueryUsuario, [usuario, correo]);
      res.status(204).send('Operación exitosa');
    } else {
      res.status(400).send('Ocurrió un error');
    }

  }
};
