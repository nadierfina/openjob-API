const express =
require('express');

const auth =
require('../middleware/auth');

const upload =
require('../middleware/uploadDocument');

const DocumentHandler =
require('../handlers/documents');

const router =
express.Router();


// ADD DOCUMENT
router.post(
  '/documents',

  auth,

  (
    req,
    res,
    next
  ) => {

    upload.fields([
      {
        name:
        'document',
        maxCount:
        1,
      }
    ])(
      req,
      res,
      (
        err
      ) => {

        // HANDLE ERROR MULTER
        if (
          err
        ) {

          return res.status(400).json({
            status:
              'failed',
            message:
              err.message,
          });
        }

        next();
      }
    );
  },

  DocumentHandler
  .addDocument
);


// GET ALL DOCUMENTS
router.get(
  '/documents',
  DocumentHandler
  .getDocuments
);


// GET DOCUMENT BY ID
router.get(
  '/documents/:id',
  DocumentHandler
  .getDocumentById
);


// DELETE DOCUMENT
router.delete(
  '/documents/:id',

  auth,

  DocumentHandler
  .deleteDocument
);

module.exports =
router;