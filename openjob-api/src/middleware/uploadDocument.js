const multer =
require('multer');

const path =
require('path');

const storage =
multer.diskStorage({

  destination:
  (req, file, cb) => {

    cb(
      null,
      'uploads/'
    );
  },

  filename:
  (req, file, cb) => {

    const uniqueName =
      Date.now() +
      path.extname(
        file.originalname
      );

    cb(
      null,
      uniqueName
    );
  },
});

const fileFilter =
(
  req,
  file,
  cb
) => {

  if (
    file.mimetype ===
    'application/pdf'
  ) {

    cb(
      null,
      true
    );

  } else {

   cb(
  new Error(
    'File is required'
  ),
  false
);
  }
};

const upload =
multer({

  storage,

  limits: {
    fileSize:
      5 *
      1024 *
      1024,
  },

  fileFilter,
});

module.exports =
upload;