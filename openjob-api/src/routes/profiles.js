const express = require('express');

const auth = require('../middleware/auth');

const ProfileHandler = require('../handlers/profiles');

const router = express.Router();


// GET PROFILE
router.get(
  '/profile',
  auth,
  ProfileHandler.getProfile
);


// GET PROFILE APPLICATIONS
router.get(
  '/profile/applications',
  auth,
  ProfileHandler.getProfileApplications
);


// GET PROFILE BOOKMARKS
router.get(
  '/profile/bookmarks',
  auth,
  ProfileHandler.getProfileBookmarks
);

module.exports = router;