const express = require('express');

const AuthenticationHandler = require('../handlers/authentications');

const validate = require('../middleware/validate');

const auth = require('../middleware/auth');

const {
  LoginSchema,
  RefreshTokenSchema,
} = require('../validator/authentications');

const router = express.Router();


// LOGIN
router.post(
  '/authentications',

  validate(LoginSchema),

  AuthenticationHandler.login
);


// REFRESH TOKEN
router.put(
  '/authentications',

  validate(RefreshTokenSchema),

  AuthenticationHandler.refreshAuthentication
);


// DELETE TOKEN
router.delete(
  '/authentications',

  auth,

  validate(RefreshTokenSchema),

  AuthenticationHandler.deleteAuthentication
);

module.exports = router;