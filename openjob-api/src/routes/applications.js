const express = require('express');

const auth = require('../middleware/auth');

const validate = require('../middleware/validate');

const ApplicationSchema = require('../validator/applications');

const ApplicationHandler = require('../handlers/applications');




const router = express.Router();


// ADD APPLICATION
router.post(
  '/applications',
  auth,
  validate(ApplicationSchema),
  ApplicationHandler.addApplication
);


// GET ALL APPLICATIONS
router.get(
  '/applications',

  auth,

  ApplicationHandler.getApplications
);


// GET APPLICATION BY ID
router.get(
  '/applications/:id',
    auth,


  ApplicationHandler.getApplicationById
);

// GET APPLICATIONS BY USER ID
router.get(
  '/applications/user/:userId',

  auth,

  ApplicationHandler.getApplicationsByUserId
);

// GET APPLICATIONS BY JOB ID
router.get(
  '/applications/job/:jobId',

  auth,

  ApplicationHandler.getApplicationsByJobId
);


// UPDATE APPLICATION STATUS
router.put(
  '/applications/:id',

  auth,

  ApplicationHandler.updateApplicationStatus
);

// DELETE APPLICATION
router.delete(
  '/applications/:id',

  auth,

  ApplicationHandler.deleteApplication
);

// GET PROFILE APPLICATIONS
router.get(
  '/profile/applications',

  auth,

  ApplicationHandler
  .getProfileApplications
);

module.exports = router;