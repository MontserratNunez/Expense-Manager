const express = require('express');
const router = express.Router();
const {
  obtenerGastos,
  obtenerGastoPorId,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
  obtenerResumen
} = require('../controllers/gastoController');

router.get('/resumen', obtenerResumen);

router.route('/')
  .get(obtenerGastos)
  .post(crearGasto);

router.route('/:id')
  .get(obtenerGastoPorId)
  .put(actualizarGasto)
  .delete(eliminarGasto);

module.exports = router;