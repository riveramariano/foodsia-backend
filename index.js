const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Crear el servidor
const app = express();

dotenv.config();

// Middlewares, don't know much about them, but we need them
app.use(express.json());

// Configurar CORS
const whitelist = [process.env.FRONTEND_URL];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      // Puede consultar la API
      callback(null, true);
    } else {
      // No está permitido
      callback(new Error("Error de Cors"));
    }
  },
};

app.use(cors());

// Habilitar express.json
app.use(express.json({ extended: true }));
app.use(express.urlencoded({extended: false }));
app.set("view engine", "ejs");

// Rutas estáticas para acceder a imágenes desde el frontend
app.use("/static", express.static("images/recetas"));
app.use("/static", express.static("images/juguetes"));
app.use("/static", express.static("images/ingredientes"));

// Puerto del backend
const PORT = process.env.PORT || 4000;

// Importar las rutas del proyecto
app.use("/api/login", require("./routes/login"));
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/empleados", require("./routes/empleados"));
app.use("/api/cantones", require("./routes/cantones"));
app.use("/api/frecuenciaPedidos", require("./routes/frecuenciaPedidos"));
app.use("/api/recetas", require("./routes/recetas"));
app.use("/api/juguetes", require("./routes/juguetes"));
app.use("/api/tiposMascota", require("./routes/tiposMascota"));
app.use("/api/ingredientes", require("./routes/ingredientes"));
app.use("/api/imagenes", require("./routes/imagenes"));
app.use("/api/recuperarCredenciales", require("./routes/recuperarCredenciales"));
app.use("/api/proveedores", require("./routes/proveedores"));
app.use("/api/graficos", require("./routes/graficos"));
app.use("/api/pedidos", require("./routes/pedidos"));
app.use("/api/tiposEntrega", require("./routes/tiposEntrega"));
app.use("/api/tiposUsuario", require("./routes/tiposUsuario"));
app.use("/api/unidades", require("./routes/unidades"));
app.use("/api/eventos", require("./routes/eventos"));
app.use("/api/tiposEvento", require("./routes/tiposEvento"));
app.use("/api/pagoEmpleados", require("./routes/pagoEmpleados"));

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`El servidor está funcionando en el puerto ${PORT}`);
});
