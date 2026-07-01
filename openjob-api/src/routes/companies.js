const express = require('express');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const CompanySchema = require('../validator/companies');
const CompanyHandler = require('../handlers/companies');

const router = express.Router();

router.post(
  '/companies',
  auth,
  validate(CompanySchema),
  CompanyHandler.addCompany
);

router.get(
  '/companies',
  CompanyHandler.getCompanies
);

router.get(
  '/companies/:id',
  CompanyHandler.getCompanyById
);

router.put(
  '/companies/:id',
  auth,
  CompanyHandler.updateCompany
);

router.delete(
  '/companies/:id',
  auth,
  CompanyHandler.deleteCompany
);

module.exports = router;