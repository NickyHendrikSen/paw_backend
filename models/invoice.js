const mongoose = require('mongoose');
const Counter = require('./counter');

const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  invoice_number: {
    type: Number
  },
  _order: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
});

invoiceSchema.pre('save', function(next) {
  var doc = this;
  Counter.findByIdAndUpdate({_id: 'invoice_id'}, {$inc: { sequence_value: 1} })
  .then((counter) => {
    doc.invoice_number = counter.sequence_value;
    next();
  })
  .catch((err) => {
    return next(err);
  })
});

module.exports = mongoose.model('Invoice', invoiceSchema);