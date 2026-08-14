const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const conectarBD = require('./config/db');
const gastoRoutes = require('./routes/gastoRoutes');

dotenv.config();

conectarBD();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/gastos', gastoRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    mensaje: 'La ruta solicitada no existe en la API.'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});