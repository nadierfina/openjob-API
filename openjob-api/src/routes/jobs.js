const express = require('express');

const auth =
require('../middleware/auth');

const validate =
require('../middleware/validate');

const JobSchema =
require('../validator/jobs');

const JobHandler =
require('../handlers/jobs');

const router =
express.Router();


// ADD JOB
router.post(
  '/jobs',
  auth,
  validate(JobSchema),
  JobHandler.addJob
);


// GET ALL JOBS
router.get(
  '/jobs',
  JobHandler.getJobs
);


// GET JOBS BY COMPANY ID
router.get(
  '/jobs/company/:companyId',
  JobHandler.getJobsByCompanyId
);


// GET JOBS BY CATEGORY ID
router.get(
  '/jobs/category/:categoryId',
  JobHandler.getJobsByCategoryId
);


// GET JOB BY ID
router.get(
  '/jobs/:id',
  JobHandler.getJobById
);


// UPDATE JOB
router.put(
  '/jobs/:id',
  auth,
  JobHandler.updateJob
);


// DELETE JOB
router.delete(
  '/jobs/:id',
  auth,
  JobHandler.deleteJob
);

module.exports =
router;