const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    _category: {
      type: Schema.Types.ObjectId,
      ref: 'Category', 
      required: true 
    },
    // category: {
    //   type: String,
    //   enum: ['apparel', 'collar', 'treat', 'leash', 'toy', 'food'],
    //   required: true
    // },
    price: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    
  },
  { timestamps: true }  
);

module.exports = mongoose.model('Product', productSchema);