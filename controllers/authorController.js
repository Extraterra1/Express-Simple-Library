const Author = require('../models/authorModel');
const Book = require('../models/bookModel');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

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
exports.author_create_post = [
  // Validate Info
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage('First name must be at least 2 characters long')
    .isAlphanumeric()
    .withMessage('First name can only contain letters and numbers'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage('Last name must be at least 2 characters long')
    .isAlphanumeric()
    .withMessage('Last name can only contain letters and numbers'),
  body('dob', 'Invalid date of birth').isISO8601().toDate(),
  body('dod', 'Invalid date of death').isISO8601().toDate(),

  asyncHandler((req, res, next) => {
    const errors = validationResult(req);

    const newAuthor = new Author({ first_name: req.body.firstName, family_name: req.body.lastName, date_of_birth: req.body.dob, date_of_death: req.body.dod });

    if (!errors.isEmpty()) {
      return res.render('createAuthor', { title: 'Create Author | Lil Library', newAuthor, errors: errors.array() });
    }
    newAuthor.save();
    res.redirect(newAuthor.url);
  })
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, booksByAuthor] = await Promise.all([Author.findById(req.params.id).exec(), Book.find({ author: req.params.id }).exec()]);

  if (author === null) return res.redirect('/catalog/authors');
  res.render('authorDelete', { title: 'Delete Author | Lil Library', author, booksByAuthor });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, booksByAuthor] = await Promise.all([Author.findById(req.params.id).exec(), Book.find({ author: req.params.id }).exec()]);

  if (booksByAuthor.length > 0) return res.render('authorDelete', { title: 'Delete Author | Lil Library', author, booksByAuthor });

  // Author has no books. Delete.
  await Author.findByIdAndDelete(req.params.id);
  res.redirect('/catalog/authors');
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next(new Error('Author not found'));
  const author = await Author.findById(req.params.id);
  if (!author) return next(new Error('Author not found'));
  res.render('createAuthor', { title: 'Update Author | Lil Library', author });
});

// Handle Author update on POST.
exports.author_update_post = [
  // Validate Info
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage('First name must be at least 2 characters long')
    .isAlphanumeric()
    .withMessage('First name can only contain letters and numbers'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage('Last name must be at least 2 characters long')
    .isAlphanumeric()
    .withMessage('Last name can only contain letters and numbers'),
  body('dob', 'Invalid date of birth').isISO8601().toDate(),
  body('dod', 'Invalid date of death').isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.firstName,
      family_name: req.body.lastName,
      date_of_birth: req.body.dob,
      date_of_death: req.body.dod,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      return res.render('createAuthor', { title: 'Create Author | Lil Library', author, errors: errors.array() });
    }
    await Author.findByIdAndUpdate(req.params.id, author);
    res.redirect(author.url);
  })
];
