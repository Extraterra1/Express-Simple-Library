const Genre = require('../models/genreModel.js');
const Book = require('../models/bookModel.js');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await Genre.find().sort({ name: 1 }).exec();
  res.render('genresList', { title: 'Genres | Lil Library', genres });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }
  const [genre, booksInGenre] = await Promise.all([Genre.findById(req.params.id).exec(), Book.find({ genre: req.params.id }, 'title summary').exec()]);
  if (genre === null) {
    // No results.
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }
  res.render('genreDetail', { title: `${genre.name} | Lil Library`, genre, booksInGenre });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler((req, res, next) => {
  res.render('createGenre', { title: 'Create Genre | Lil Library' });
});

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate Name Field
  body('name', 'Genre name must be at least 3 characters long').trim().isLength({ min: 3 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newGenre = new Genre({ name: req.body.name });
    // If there are errors render create genre form again
    if (!errors.isEmpty()) {
      return res.render('createGenre', { title: 'Create Genre | Lil Library', newGenre, errors: errors.array() });
    }
    // Else check if genre already exists
    const genreExists = await Genre.findOne({ name: req.body.name }).exec();

    if (genreExists) return res.redirect(genreExists.url);

    // if it doesn't insert
    await newGenre.save();
    res.redirect(newGenre.url);
  })
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([Genre.findById(req.params.id).exec(), Book.find({ genre: req.params.id }).exec()]);

  if (genre === null) return res.redirect('/catalog/genres');
  res.render('genreDelete', { title: 'Delete Genre | Lil Library', genre, booksInGenre });
});
// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([Genre.findById(req.params.id).exec(), Book.find({ genre: req.params.id }).exec()]);

  if (booksInGenre.length > 0) return res.render('genreDelete', { title: 'Delete Genre | Lil Library', genre, booksInGenre });

  await Genre.findByIdAndDelete(req.params.id);
  res.redirect('/catalog/genres');
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  res.render('createGenre', { title: 'Update Genre | Lil Library', genre });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validate Name Field
  body('name', 'Genre name must be at least 3 characters long').trim().isLength({ min: 3 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) return res.render('createGenre', { genre, errors });

    await Genre.findByIdAndUpdate(req.params.id, genre);
    res.redirect(genre.url);
  })
];
