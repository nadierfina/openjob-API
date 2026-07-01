const { nanoid } =
require('nanoid');

const pool =
require('../database/pool');

const cache =
require(
  '../services/cacheService'
);


// ADD JOB
const addJob =
async (req, res) => {

  try {

    const {
      company_id,
      category_id,
      title,
      description,
      job_type,
      experience_level,
      location_type,
      location_city,
      salary_min,
      salary_max,
      is_salary_visible,
      status,
    } = req.body;

    const id =
      `job-${nanoid(16)}`;

    await pool.query(
      `
      INSERT INTO jobs(
        id,
        company_id,
        category_id,
        title,
        description,
        job_type,
        experience_level,
        location_type,
        location_city,
        salary_min,
        salary_max,
        is_salary_visible,
        status
      )
      VALUES(
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,
        $10,$11,$12,$13
      )
      `,
      [
        id,
        company_id,
        category_id,
        title,
        description,
        job_type,
        experience_level,
        location_type,
        location_city,
        salary_min,
        salary_max,
        is_salary_visible,
        status,
      ]
    );

    // DELETE CACHE
    await cache.del(
      `job:${id}`
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


// GET ALL JOBS
const getJobs =
async (req, res) => {

  try {

    const {
      title,
      'company-name':
      companyName,
    } = req.query;

    let query =
    `
    SELECT
      jobs.id,
      jobs.company_id,
      jobs.category_id,
      jobs.title,
      jobs.description,
      jobs.job_type,
      jobs.experience_level,
      jobs.location_type,
      jobs.location_city,
      jobs.salary_min,
      jobs.salary_max,
      jobs.is_salary_visible,
      jobs.status

    FROM jobs

    JOIN companies
    ON jobs.company_id =
    companies.id

    JOIN categories
    ON jobs.category_id =
    categories.id

    WHERE 1=1
    `;

    const values = [];

    if (title) {

      values.push(
        `%${title}%`
      );

      query +=
      `
      AND jobs.title
      ILIKE
      $${values.length}
      `;
    }

    if (companyName) {

      values.push(
        `%${companyName}%`
      );

      query +=
      `
      AND companies.name
      ILIKE
      $${values.length}
      `;
    }

    const result =
      await pool.query(
        query,
        values
      );

    return res.status(200).json({
      status:
        'success',
      data: {
        jobs:
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


// GET JOB BY ID
const getJobById =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const cacheKey =
      `job:${id}`;

    // GET CACHE
    const cachedJob =
      await cache.get(
        cacheKey
      );

    // CACHE HIT
    if (
      cachedJob &&
      cachedJob !==
      'undefined'
    ) {

      res.header(
        'X-Data-Source',
        'cache'
      );

      return res.status(200).json({
        status:
          'success',
        data:
          JSON.parse(
            cachedJob
          ),
      });
    }

    // DATABASE
    const result =
      await pool.query(
        `
        SELECT *
        FROM jobs
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
          'Job tidak ditemukan',
      });
    }

    const job =
      result.rows[0];

    // SAVE CACHE
    await cache.set(
      cacheKey,
      JSON.stringify(
        job
      ),
      3600
    );

    res.header(
      'X-Data-Source',
      'database'
    );

    return res.status(200).json({
      status:
        'success',
      data:
        job,
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


// GET JOBS BY COMPANY ID
const getJobsByCompanyId =
async (req, res) => {

  try {

    const {
      companyId
    } = req.params;

    const result =
      await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE company_id = $1
        `,
        [companyId]
      );

    return res.status(200).json({
      status:
        'success',
      data: {
        jobs:
          result.rows,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status:
        'error',
      message:
        error.message,
    });
  }
};


// GET JOBS BY CATEGORY ID
const getJobsByCategoryId =
async (req, res) => {

  try {

    const {
      categoryId
    } = req.params;

    const result =
      await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE category_id = $1
        `,
        [categoryId]
      );

    return res.status(200).json({
      status:
        'success',
      data: {
        jobs:
          result.rows,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status:
        'error',
      message:
        error.message,
    });
  }
};


// UPDATE JOB
const updateJob =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const oldJob =
      await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1
        `,
        [id]
      );

    if (
      !oldJob.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Job tidak ditemukan',
      });
    }

    const current =
      oldJob.rows[0];

    const {
      company_id,
      category_id,
      title,
      description,
      job_type,
      experience_level,
      location_type,
      location_city,
      salary_min,
      salary_max,
      is_salary_visible,
      status,
    } = req.body;

    await pool.query(
      `
      UPDATE jobs
      SET
        company_id = $1,
        category_id = $2,
        title = $3,
        description = $4,
        job_type = $5,
        experience_level = $6,
        location_type = $7,
        location_city = $8,
        salary_min = $9,
        salary_max = $10,
        is_salary_visible = $11,
        status = $12
      WHERE id = $13
      `,
      [
        company_id ?? current.company_id,
        category_id ?? current.category_id,
        title ?? current.title,
        description ?? current.description,
        job_type ?? current.job_type,
        experience_level ?? current.experience_level,
        location_type ?? current.location_type,
        location_city ?? current.location_city,
        salary_min ?? current.salary_min,
        salary_max ?? current.salary_max,
        is_salary_visible ?? current.is_salary_visible,
        status ?? current.status,
        id,
      ]
    );

    // DELETE CACHE
    await cache.del(
      `job:${id}`
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'Job berhasil diperbarui',
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


// DELETE JOB
const deleteJob =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const result =
      await pool.query(
        `
        DELETE FROM jobs
        WHERE id = $1
        RETURNING id
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
          'Job tidak ditemukan',
      });
    }

    // DELETE CACHE
    await cache.del(
      `job:${id}`
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'Job berhasil dihapus',
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
  addJob,
  getJobs,
  getJobById,
  getJobsByCompanyId,
  getJobsByCategoryId,
  updateJob,
  deleteJob,
};