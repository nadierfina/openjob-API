const { nanoid } =
require('nanoid');

const pool =
require('../database/pool');

const cache =
require(
  '../services/cacheService'
);


// ADD COMPANY
const addCompany =
async (req, res) => {

  try {

    const {
      name,
      description,
      location
    } = req.body;

    const id =
      `company-${nanoid(16)}`;

    await pool.query(
      `
      INSERT INTO companies(
        id,
        name,
        description,
        location
      )
      VALUES($1,$2,$3,$4)
      `,
      [
        id,
        name,
        description,
        location
      ]
    );

    // INVALIDATE CACHE
    await cache.del(
      'companies'
    );

    return res.status(201).json({
      status:
        'success',
      data: {
        id,
      },
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

// GET ALL COMPANIES
const getCompanies =
async (req, res) => {

  try {

    const result =
      await pool.query(
        `
        SELECT
          id,
          name,
          description,
          location,
          created_at,
          updated_at
        FROM companies
        `
      );

    return res.status(200).json({
      status:
        'success',

      data: {
        companies:
          result.rows,
      },
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


// GET COMPANY BY ID
const getCompanyById =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const cacheKey =
      `company:${id}`;

    // GET CACHE
    const cachedCompany =
      await cache.get(
        cacheKey
      );

    // CACHE HIT
    if (
      cachedCompany &&
      cachedCompany !==
      'undefined'
    ) {

      res.setHeader(
        'X-Data-Source',
        'cache'
      );

      return res.status(200).json({
        status:
          'success',
        data:
          JSON.parse(
            cachedCompany
          ),
      });
    }

    // DATABASE
    const result =
      await pool.query(
        `
        SELECT *
        FROM companies
        WHERE id = $1
        `,
        [id]
      );

    // NOT FOUND
    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Company tidak ditemukan',
      });
    }

    const company =
      result.rows[0];

    // SAVE CACHE
    await cache.set(
      cacheKey,
      JSON.stringify(
        company
      ),
      3600
    );

    res.setHeader(
      'X-Data-Source',
      'database'
    );

    return res.status(200).json({
      status:
        'success',
      data:
        company,
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


// UPDATE COMPANY
const updateCompany =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const {
      name,
      description,
      location
    } = req.body;

    const result =
      await pool.query(
        `
        UPDATE companies
        SET
          name = $1,
          description = $2,
          location = $3
        WHERE id = $4
        RETURNING *
        `,
        [
          name,
          description,
          location,
          id
        ]
      );

    // NOT FOUND
    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Company tidak ditemukan',
      });
    }

    // DELETE CACHE
    await cache.del(
      `company:${id}`
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'Company berhasil diperbarui',
      data: {
        id:
          result.rows[0].id,
      },
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


// DELETE COMPANY
const deleteCompany =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const result =
      await pool.query(
        `
        DELETE FROM companies
        WHERE id = $1
        RETURNING id
        `,
        [id]
      );

    // NOT FOUND
    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Company tidak ditemukan',
      });
    }

    // DELETE CACHE
    await cache.del(
      `company:${id}`
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'Company berhasil dihapus',
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
  addCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};