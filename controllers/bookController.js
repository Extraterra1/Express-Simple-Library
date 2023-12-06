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
      console.log(req.body.genre);
      req.body.genre = typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
      console.log(req.body.genre);
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
  const [book, bookInstancesByAuthor] = await Promise.all([Book.findById(req.params.id).exec(), BookInstance.find({ book: req.params.id }).exec()]);

  if (book === null) return res.redirect('/catalog/authors');
  res.render('bookDelete', { title: 'Delete Book | Lil Library', book, bookInstancesByAuthor });
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const [book, bookInstancesByAuthor] = await Promise.all([Book.findById(req.params.id).exec(), BookInstance.find({ author: req.params.id }).exec()]);

  if (bookInstancesByAuthor.length > 0) return res.render('bookDelete', { title: 'Delete Book | Lil Library', book, bookInstancesByAuthor });

  // Author has no books. Delete.
  await Book.findByIdAndDelete(req.params.id);
  res.redirect('/catalog/books');
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
exports.book_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
      _id: req.params.id // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      const [authors, genres] = await Promise.all([Author.find().sort({ family_name: 1 }).exec(), Genre.find().sort({ name: 1 }).exec()]);

      // Mark our selected genres as checked.
      for (const genre of genres) {
        if (book.genre.indexOf(genre._id) > -1) {
          genre.checked = 'true';
        }
      }
      return res.render('createBook', {
        title: 'Update Book',
        authors,
        genres,
        book,
        errors: errors.array()
      });
    } else {
      // Data from form is valid. Update the record.
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {});
      // Redirect to book detail page.
      res.redirect(updatedBook.url);
    }
  })
];
