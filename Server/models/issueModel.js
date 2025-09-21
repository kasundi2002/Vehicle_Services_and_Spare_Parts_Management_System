const mongoose = require('mongoose');

const issueSchema = mongoose.Schema(
    {
      cid: {
        type: String,
        required: true,
      },
      Cname: {
        type: String,
        required: true,
      },
      Cnic: {
        type: Number,
        required: true,
      },
      Ccontact: {
        type: Number,
        required: true,
      },
      Clocation: {
        type: String,
        required: true,
      },
      Cstatus: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;