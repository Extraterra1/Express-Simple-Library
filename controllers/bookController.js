const Book = require('../models/bookModel.js');
const Author = require('../models/authorModel.js');
const BookInstance = require('../models/bookInstanceModel.js');
const Genre = require('../models/genreModel.js');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
  const [numBooks, numBookInstances, numAvailableBookInstances, numAuthors, numGenres] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: 'Available' }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec()
  ]);

  res.render('index', {
    title: 'Lil Library',
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres
  });
});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const books = await Book.find({}, 'title author summary').sort({ title: 1 }).populate('author').exec();

  res.render('bookList', { title: 'Books | Lil Library', books });
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const err = new Error('Book not found');
    err.status = 404;
    return next(err);
  }
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate('genre').populate('author').exec(),
    BookInstance.find({ book: req.params.id }).exec()
  ]);
  if (book === null) {
    // No results.
    const err = new Error('Book not found');
    err.status = 404;
    return next(err);
  }
  res.render('bookDetail', { title: `${book.title} | Lil Library`, book, bookInstances });
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  const [authors, genres] = await Promise.all([Author.find().sort({ family_name: 1 }).exec(), Genre.find().sort({ name: 1 }).exec()]);
  res.render('createBook', { title: 'Create Book | Lil Library', authors, genres });
});

// Handle book create on POST.
exports.book_create_post = [
  // Put genres into array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
    }
    next();
  },

  //  Validate fields
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre', 'You must select at least one genre').custom((val) => val.length > 0),

  asyncHandler(async (req, res, next) => {
    // Extract errors
    const errors = validationResult(req);
    console.log(errors);
    // Build new book object
    const newBook = new Book({ title: req.body.title, author: req.body.author, summary: req.body.summary, genre: req.body.genre, isbn: req.body.isbn });

    if (!errors.isEmpty()) {
      // There are errors
      // Fetch all authors and genres to populate form
      const [authors, genres] = await Promise.all([Author.find().sort({ family_name: 1 }).exec(), Genre.find().sort({ name: 1 }).exec()]);
      return res.render('createBook', { title: 'Create Book | Lil Library', authors, genres, errors: errors.array() });
    }
    await newBook.save();
    res.redirect(newBook.url);
  })
];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  const [book, authors, genres] = await Promise.all([
    Book.findById(req.params.id).exec(),
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec()
  ]);

  if (book === null) return next(new Error('Book not found'));

  // Mark selected genres as checked
  for (const genre of genres) {
    for (const bookGenre of book.genre) {
      if (genre._id.toString() === bookGenre._id.toString()) {
        genre.checked = 'true';
      }
    }
  }

  res.render('createBook', {
    title: 'Update Book | Lil Library',
    authors,
    genres,
    book
  });
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book update POST');
});
