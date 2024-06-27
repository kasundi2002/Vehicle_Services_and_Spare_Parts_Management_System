const mongoose = require('mongoose');

const supplyRequestSchema = mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
    },
    supply: {
      type: String,
      required: true,
    },
    qty: {
      type: String,
      required: true,
    },
    requestDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'pending', 
    },
  },
  {
    timestamps: true,
  }
);

module.exports = SupplyRequest = mongoose.model('SupplyRequest', supplyRequestSchema);
