const Book = require('../models/bookModel.js');
const Author = require('../models/authorModel.js');
const BookInstance = require('../models/bookInstanceModel.js');
const Genre = require('../models/genreModel.js');
const asyncHandler = require('express-async-handler');

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
  res.send(`NOT IMPLEMENTED: Book detail: ${req.params.id}`);
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book create GET');
});

// Handle book create on POST.
exports.book_create_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book create POST');
});

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
  res.send('NOT IMPLEMENTED: Book update GET');
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book update POST');
});
