const express =
require('express');

const UserHandler =
require('../handlers/users');

const validate =
require('../middleware/validate');

const UserSchema =
require('../validator/users');

const router =
express.Router();

router.post(
  '/users',
  validate(UserSchema),
  UserHandler.addUser
);

router.get(
  '/users/:id',
  UserHandler.getUserById
);

router.put(
  '/users/:id',
  UserHandler.updateUser
);

module.exports =
router;