const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema(
  {
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio.'],
      min: [0.01, 'El monto debe ser un número mayor a 0.']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria.'],
      trim: true,
      enum: {
        values: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud', 'Educación', 'Otros'],
        message: '{VALUE} no es una categoría válida.'
      }
    },
    fecha: {
      type: Date,
      default: Date.now,
      required: [true, 'La fecha es obligatoria.']
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [250, 'La descripción no puede exceder los 250 caracteres.']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Gasto', gastoSchema);