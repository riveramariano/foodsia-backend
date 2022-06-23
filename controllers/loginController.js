const db = require('../database');
const jwt = require('jsonwebtoken');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.iniciarSesion = async (req, res) => {
  const { usuario, contrasenna } = req.body;
  const sqlQuery = `select u.id, u.nombreUsuario, u.primerApellido, t.nombreTipoUsuario from tbl_usuario as u inner join tbl_tipo_usuario as t 
    on u.tipoUsuarioId = t.id where u.usuario = ? and u.contrasenna = md5(?)`;
  const rows = await query(sqlQuery, [usuario, contrasenna]);

  if (rows.length > 0) {
    // Información que tendrá el token cifrada
    const payload = {
      usuario: {
        id: rows[0].id
      }
    }

    // Firmar el token de autenticación
    jwt.sign(payload, process.env.SECRETA, {
      expiresIn: 10800 // 3H
    }, (error, token) => {
      if (error) { throw error; }
      res.json({ token });
    });

  } else {
    res.json({});
  }
}

exports.usuarioAutenticado = async (req, res) => {
  try {
    const sqlQuery = `select u.id, u.nombreUsuario, u.primerApellido, t.nombreTipoUsuario from tbl_usuario as u inner join tbl_tipo_usuario as t 
    on u.tipoUsuarioId = t.id where u.id = ?`;
    const usuario = await query(sqlQuery, [req.usuario.id]);
    res.json({ usuario });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Hubo un error' });
  }
}

