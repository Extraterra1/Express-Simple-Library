const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const bookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  imprint: { type: String, required: true },
  status: { type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance' },
  due_back: { type: Date, default: Date.now }
});

// Virtual for bookinstance's URL
bookInstanceSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/bookinstance/${this._id}`;
});
bookInstanceSchema.virtual('formattedDate').get(function () {
  // We don't use an arrow function as we'll need the this object
  return moment(this.due_back).format('MMM DD YYYY');
});

module.exports = mongoose.model('BookInstance', bookInstanceSchema);
