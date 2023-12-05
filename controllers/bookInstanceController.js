const BookInstance = require('../models/bookInstanceModel.js');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Book = require('../models/bookModel.js');

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const bookInstances = await BookInstance.find().populate('book').exec();
  res.render('bookInstanceList', { title: 'Book Instances | Lil Library', bookInstances });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  const bookInstance = await BookInstance.findById(req.params.id).populate('book');
  res.render('bookInstanceDetail', { title: 'Book Instance | Lil Library', bookInstance });

  if (bookInstance === null) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const books = await Book.find().sort({ title: 1 }).exec();
  res.render('bookInstanceDetail', { title: 'Book Instance | Lil Library', books });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance create POST');
});

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance delete GET');
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance delete POST');
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance update GET');
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
});
