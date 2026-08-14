const Gasto = require('../models/Gasto');
const mongoose = require('mongoose');

exports.obtenerGastos = async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = {};

    if (categoria) {
      filtro.categoria = categoria;
    }

    const gastos = await Gasto.find(filtro).sort({ fecha: -1 });

    res.status(200).json({
      success: true,
      conteo: gastos.length,
      data: gastos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor al obtener los gastos.',
      error: error.message
    });
  }
};

exports.obtenerGastoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        mensaje: 'El formato del ID proporcionado no es válido.'
      });
    }

    const gasto = await Gasto.findById(id);

    if (!gasto) {
      return res.status(404).json({
        success: false,
        mensaje: 'Gasto no encontrado.'
      });
    }

    res.status(200).json({
      success: true,
      data: gasto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor al obtener el gasto.',
      error: error.message
    });
  }
};

exports.crearGasto = async (req, res) => {
  try {
    const { monto, categoria, fecha, descripcion } = req.body;

    const nuevoGasto = await Gasto.create({
      monto,
      categoria,
      fecha,
      descripcion
    });

    res.status(201).json({
      success: true,
      mensaje: 'Gasto registrado exitosamente.',
      data: nuevoGasto
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación en los datos ingresados.',
        errores: mensajes
      });
    }

    res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor al crear el gasto.',
      error: error.message
    });
  }
};

exports.actualizarGasto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        mensaje: 'El formato del ID proporcionado no es válido.'
      });
    }

    const gastoActualizado = await Gasto.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!gastoActualizado) {
      return res.status(404).json({
        success: false,
        mensaje: 'No se encontró el gasto que deseas actualizar.'
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Gasto actualizado correctamente.',
      data: gastoActualizado
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación al actualizar.',
        errores: mensajes
      });
    }

    res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor al actualizar el gasto.',
      error: error.message
    });
  }
};

exports.eliminarGasto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        mensaje: 'El formato del ID proporcionado no es válido.'
      });
    }

    const gastoEliminado = await Gasto.findByIdAndDelete(id);

    if (!gastoEliminado) {
      return res.status(404).json({
        success: false,
        mensaje: 'No se encontró el gasto que deseas eliminar.'
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Gasto eliminado exitosamente.',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor al eliminar el gasto.',
      error: error.message
    });
  }
};

exports.obtenerResumen = async (req, res) => {
  try {

    const porCategoria = await Gasto.aggregate([
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const porMes = await Gasto.aggregate([
      {
        $group: {
          _id: {
            anio: { $year: '$fecha' },
            mes: { $month: '$fecha' }
          },
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { '_id.anio': -1, '_id.mes': -1 } }
    ]);

    const totalGeneral = await Gasto.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalGeneral: totalGeneral[0] ? totalGeneral[0].total : 0,
      porCategoria,
      porMes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor al obtener el resumen de gastos.',
      error: error.message
    });
  }
};