const express = require('express');

const auth = require('../middleware/auth');

const BookmarkHandler = require('../handlers/bookmarks');

const router = express.Router();


// ADD BOOKMARK
router.post(
  '/jobs/:id/bookmark',
  auth,
  BookmarkHandler.addBookmark
);


// GET ALL USER BOOKMARKS
router.get(
  '/bookmarks',

  auth,

  BookmarkHandler.getBookmarks
);

// GET BOOKMARK BY ID
router.get(
  '/jobs/:id/bookmark/:bookmarkId',

  BookmarkHandler.getBookmarkById
);


// DELETE BOOKMARK
router.delete(
  '/jobs/:id/bookmark',

  auth,

  BookmarkHandler.deleteBookmark
);
module.exports = router;