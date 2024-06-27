const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    NIC: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    jobCategory: {
      type: String,
      required: true,
    },
    
    basicSalary: {
      type: Number,
      required: true,
    },
    otRate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = Employee = mongoose.model('Employee', employeeSchema);
