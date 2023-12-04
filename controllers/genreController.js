const Genre = require('../models/genreModel.js');
const Book = require('../models/bookModel.js');
const asyncHandler = require('express-async-handler');

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await Genre.find().sort({ name: 1 }).exec();
  res.render('genresList', { title: 'Genres | Lil Library', genres });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([Genre.findById(req.params.id).exec(), Book.find({ genre: req.params.id }, 'title summary').exec()]);
  res.render('genreDetail', { title: `${genre.name} | Lil Library`, genre, booksInGenre });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre create GET');
});

// Handle Genre create on POST.
exports.genre_create_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre create POST');
});

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre delete GET');
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre delete POST');
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre update GET');
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Genre update POST');
});
