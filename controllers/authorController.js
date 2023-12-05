const Author = require('../models/authorModel');
const Book = require('../models/bookModel');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const authors = await Author.find().sort({ family_name: 1 }).exec();
  res.render('authorsList', { title: 'Authors | Lil Library', authors });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }
  const [author, books] = await Promise.all([Author.findById(req.params.id).exec(), Book.find({ author: req.params.id }).exec()]);
  if (author === null) {
    // No results.
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }
  res.render('authorDetail', { title: `${author.name} | Lil Library`, author, books });
});

// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render('createAuthor', { title: 'Create Author | Lil Library' });
});

// Handle Author create on POST.
exports.author_create_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author create POST');
});

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author delete GET');
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author delete POST');
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author update GET');
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author update POST');
});
