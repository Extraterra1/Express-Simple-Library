const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const authorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date }
});

// Virtual for author's full name
authorSchema.virtual('name').get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  return fullname;
});

// Virtual for author's URL
authorSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});
authorSchema.virtual('formattedDob').get(function () {
  // We don't use an arrow function as we'll need the this object
  return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : 'Unknown';
});
authorSchema.virtual('formattedDod').get(function () {
  // We don't use an arrow function as we'll need the this object
  return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : 'Present';
});

module.exports = mongoose.model('Author', authorSchema);
