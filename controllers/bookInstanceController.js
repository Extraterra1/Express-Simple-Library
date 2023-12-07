const BookInstance = require('../models/bookInstanceModel.js');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const moment = require('moment');
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
  res.render('bookInstanceCreate', { title: 'Book Instance | Lil Library', books });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate Fields
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('dueBack', 'Invalid Date').isISO8601().toDate(),

  // Process Request
  asyncHandler(async (req, res, next) => {
    // Extract errors
    const errors = validationResult(req);

    //  Create new book instance object
    const newBookInstance = new BookInstance({ book: req.body.book, imprint: req.body.imprint, status: req.body.status, due_back: req.body.dueBack });

    if (!errors.isEmpty()) {
      // Fetch all books to populate form
      const books = await Book.find().sort({ title: 1 }).exec();
      return res.render('bookInstanceCreate', { title: 'Book Instance | Lil Library', books, errors: errors.array() });
    }
    await newBookInstance.save();
    res.redirect(newBookInstance.url);
  })
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id);
  res.render('bookInstanceDelete', { title: 'Delete Copy | Lil Library', bookInstance });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.params.id);
  res.redirect('/catalog/bookinstances');
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return next(new Error('Copy not found'));
  const [bookInstance, books] = await Promise.all([BookInstance.findById(req.params.id).lean().exec(), Book.find().sort({ title: 1 }).exec()]);
  if (!bookInstance) return next(new Error('Copy not found'));

  res.render('bookInstanceCreate', {
    title: 'Update Copy | Lil Library',
    bookInstance: { ...bookInstance, due_back: moment(bookInstance.due_back).format('YYYY-MM-DD') },
    books
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate Fields
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('dueBack', 'Invalid Date').isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    // Extract errors
    const errors = validationResult(req);

    //  Create new book instance object
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.dueBack,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // Fetch all books to populate form
      const books = await Book.find().sort({ title: 1 }).exec();
      return res.render('bookInstanceCreate', { title: 'Update Copy | Lil Library', books, bookInstance, errors: errors.array() });
    }
    await BookInstance.findByIdAndUpdate(req.params.id, bookInstance);
    res.redirect(bookInstance.url);
  })
];
