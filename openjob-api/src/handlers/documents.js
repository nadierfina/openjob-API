const { nanoid } =
require('nanoid');

const path =
require('path');

const fs =
require('fs');

const pool =
require(
  '../database/pool'
);


// ADD DOCUMENT
const addDocument =
async (req, res) => {

  try {

    console.log(
      'FILES:',
      req.files
    );

    console.log(
      'BODY:',
      req.body
    );

    const file =
      req.files
      ?.document?.[0]
      ||
      req.files
      ?.file?.[0];

    // FILE REQUIRED
    if (!file) {

      return res.status(400).json({
        status:
          'failed',
        message:
          'File is required',
      });
    }

    const id =
      `document-${nanoid(16)}`;

    const user_id =
      req.user.id;

    const document_type =
      req.body
      ?.document_type
      || 'CV';

    await pool.query(
      `
      INSERT INTO documents(
        id,
        user_id,
        file_name,
        document_type
      )
      VALUES($1,$2,$3,$4)
      `,
      [
        id,
        user_id,
        file.filename,
        document_type,
      ]
    );

    return res.status(201).json({
      status:
        'success',
      data: {
        documentId:
          id,
        filename:
          file.filename,
        originalName:
          file.originalname,
        size:
          file.size,
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status:
        'error',
      message:
        error.message,
    });
  }
};


// GET ALL DOCUMENTS
const getDocuments =
async (req, res) => {

  try {

    const result =
      await pool.query(
        `
        SELECT *
        FROM documents
        `
      );

    return res.status(200).json({
      status:
        'success',
      data: {
        documents:
          result.rows,
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status:
        'error',
      message:
        error.message,
    });
  }
};


// GET DOCUMENT BY ID
const getDocumentById =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const result =
      await pool.query(
        `
        SELECT *
        FROM documents
        WHERE id = $1
        `,
        [id]
      );

    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Document tidak ditemukan',
      });
    }

    const document =
      result.rows[0];

    const filePath =
      path.resolve(
        'uploads',
        document.file_name
      );

    console.log(
      'FILE PATH:',
      filePath
    );

    if (
      !fs.existsSync(
        filePath
      )
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'File tidak ditemukan',
      });
    }

    return res.sendFile(
      filePath,
      {
        headers: {
          'Content-Type':
            'application/pdf',

          'Content-Disposition':
            `inline; filename="${document.file_name}"`,
        },
      }
    );

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status:
        'error',
      message:
        error.message,
    });
  }
};

// DELETE DOCUMENT
const deleteDocument =
async (req, res) => {

  try {

    const { id } =
      req.params;

    console.log(
      'DELETE ID:',
      id
    );

    // CEK DULU ADA GA
    const check =
      await pool.query(
        `
        SELECT *
        FROM documents
        WHERE id = $1
        `,
        [id]
      );

    console.log(
      'CHECK:',
      check.rows
    );

    // KALO GA ADA
    if (
      !check.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Document tidak ditemukan',
      });
    }

    // DELETE
    await pool.query(
      `
      DELETE FROM documents
      WHERE id = $1
      `,
      [id]
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'Document berhasil dihapus',
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status:
        'error',
      message:
        error.message,
    });
  }
};

module.exports = {
  addDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
};