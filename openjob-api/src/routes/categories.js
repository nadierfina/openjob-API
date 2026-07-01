const express = require('express');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const CategorySchema = require('../validator/categories');
const CategoryHandler = require('../handlers/categories');

const router = express.Router();

// ADD CATEGORY
router.post(
  '/categories',
  validate(CategorySchema),
  auth,
  CategoryHandler.addCategory
);

// GET ALL CATEGORIES
router.get(
  '/categories',
  CategoryHandler.getCategories
);

// GET CATEGORY BY ID
router.get(
  '/categories/:id',
  CategoryHandler.getCategoryById
);

// UPDATE CATEGORY
router.put(
  '/categories/:id',
  validate(CategorySchema),
  auth,
  CategoryHandler.updateCategory
);

// DELETE CATEGORY
router.delete(
  '/categories/:id',
  auth,
  CategoryHandler.deleteCategory
);

module.exports = router;