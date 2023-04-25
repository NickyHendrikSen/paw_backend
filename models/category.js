const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
    },
    display_name: {
      type: String,
      required: true,
    },
  }
);

module.exports = mongoose.model('Category', categorySchema);