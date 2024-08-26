const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    warehouse: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    stockLocation:{
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  });

module.exports = mongoose.model('Warehouse', warehouseSchema);