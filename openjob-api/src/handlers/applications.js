const { nanoid } =
require('nanoid');

const pool =
require('../database/pool');

const cache =
require(
  '../services/cacheService'
);

const rabbitMQ =
require(
  '../services/rabbitmq'
);


// ADD APPLICATION
const addApplication =
async (req, res) => {

  try {

    const {
      job_id,
      cover_letter,
    } = req.body;

    const user_id =
      req.user.id;

    // CHECK JOB
    const checkJob =
      await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1
        `,
        [job_id]
      );

    if (
      !checkJob.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',

        message:
          'Job tidak ditemukan',
      });
    }

    // CHECK DUPLICATE APPLICATION
    const checkApplication =
      await pool.query(
        `
        SELECT *
        FROM applications
        WHERE user_id = $1
        AND job_id = $2
        `,
        [
          user_id,
          job_id,
        ]
      );

    if (
      checkApplication
      .rows.length
    ) {

      return res.status(400).json({
        status:
          'failed',

        message:
          'Application already exists',
      });
    }

    const id =
      `application-${nanoid(16)}`;

    const status =
      'pending';

    // INSERT APPLICATION
    await pool.query(
      `
      INSERT INTO applications(
        id,
        user_id,
        job_id,
        cover_letter,
        status
      )
      VALUES(
        $1,$2,$3,$4,$5
      )
      `,
      [
        id,
        user_id,
        job_id,
        cover_letter
        || '',
        status,
      ]
    );

    // SEND TO RABBITMQ
    await rabbitMQ
    .sendToQueue({
      application_id:
      id
    });

    // CLEAR CACHE
    await cache.del(
      `applications:user:${user_id}`
    );

    await cache.del(
      `applications:job:${job_id}`
    );

    return res.status(201).json({
  status:
    'success',

  data: {
    id:
      id,

    user_id:
      user_id,

    job_id:
      job_id,

    status:
      status,
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

// GET ALL APPLICATIONS
const getApplications =
async (req, res) => {

  try {

    const result =
      await pool.query(
        `
        SELECT
          applications.id,
          applications.user_id,
          applications.job_id,
          applications.status,

          jobs.company_id,
          jobs.category_id,
          jobs.title,
          jobs.description,
          jobs.job_type,
          jobs.experience_level,
          jobs.location_type,
          jobs.salary_min,
          jobs.salary_max

        FROM applications

        JOIN jobs
        ON applications.job_id =
        jobs.id
        `
      );

    return res.status(200).json({
      status:
        'success',
      data: {
        applications:
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
// GET APPLICATION BY ID
const getApplicationById =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const cacheKey =
      `application:${id}`;

    // CHECK CACHE
    const cachedApplication =
      await cache.get(
        cacheKey
      );

    // CACHE HIT
    if (
      cachedApplication
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
            cachedApplication
          ),
      });
    }

    // DATABASE
    const result =
      await pool.query(
        `
        SELECT
          id,
          user_id,
          job_id,
          cover_letter,
          status
        FROM applications
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
          'Application tidak ditemukan',
      });
    }

    const application =
      result.rows[0];

    // SAVE CACHE
    await cache.set(
      cacheKey,
      JSON.stringify(
        application
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
        application,
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


// GET APPLICATIONS BY USER ID
const getApplicationsByUserId =
async (req, res) => {

  try {

    const { userId } =
      req.params;

    const cacheKey =
      `applications:user:${userId}`;

    const cachedApplications =
      await cache.get(
        cacheKey
      );

    if (
      cachedApplications &&
      cachedApplications !==
      'undefined'
    ) {

      res.setHeader(
        'X-Data-Source',
        'cache'
      );

      return res.status(200).json({
        status:
          'success',
        data: {
          applications:
            JSON.parse(
              cachedApplications
            ),
        },
      });
    }

    const result =
      await pool.query(
        `
        SELECT *
        FROM applications
        WHERE user_id = $1
        `,
        [userId]
      );

    await cache.set(
      cacheKey,
      JSON.stringify(
        result.rows
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
      data: {
        applications:
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


// GET APPLICATIONS BY JOB ID
const getApplicationsByJobId =
async (req, res) => {

  try {

    const { jobId } =
      req.params;

    const cacheKey =
      `applications:job:${jobId}`;

    const cachedApplications =
      await cache.get(
        cacheKey
      );

    if (
      cachedApplications &&
      cachedApplications !==
      'undefined'
    ) {

      res.set(
        'X-Data-Source',
        'cache'
      );

      return res.status(200).json({
        status:
          'success',
        data: {
          applications:
            JSON.parse(
              cachedApplications
            ),
        },
      });
    }

    const result =
      await pool.query(
        `
        SELECT *
        FROM applications
        WHERE job_id = $1
        `,
        [jobId]
      );

    await cache.set(
      cacheKey,
      JSON.stringify(
        result.rows
      ),
      3600
    );

    res.set(
      'X-Data-Source',
      'database'
    );

    return res.status(200).json({
      status:
        'success',
      data: {
        applications:
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


// UPDATE APPLICATION STATUS
const updateApplicationStatus =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const status =
      'accepted';

    const result =
      await pool.query(
        `
        UPDATE applications
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, id]
      );

    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Application tidak ditemukan',
      });
    }

    await cache.del(
      `application:${id}`
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'Status application berhasil diperbarui',
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


// DELETE APPLICATION
const deleteApplication =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const result =
      await pool.query(
        `
        DELETE FROM applications
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
          'Application tidak ditemukan',
      });
    }

    await cache.del(
      `application:${id}`
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'Application berhasil dihapus',
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


// PROFILE APPLICATIONS
const getProfileApplications =
async (req, res) => {

  try {

    const userId =
      req.user.id;

    const result =
      await pool.query(
        `
        SELECT
          applications.id,
          applications.user_id,
          applications.job_id,
          applications.cover_letter,
          applications.status,

          jobs.company_id,
          jobs.category_id,
          jobs.title,
          jobs.description,
          jobs.job_type,
          jobs.experience_level,
          jobs.location_type,
          jobs.location_city,
          jobs.salary_min,
          jobs.salary_max

        FROM applications

        JOIN jobs
        ON applications.job_id =
        jobs.id

        WHERE applications.user_id
        = $1
        `,
        [userId]
      );

    return res.status(200).json({
      status:
        'success',
      data: {
        applications:
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


module.exports = {
  addApplication,
  getApplications,
  getApplicationById,
  getApplicationsByUserId,
  getApplicationsByJobId,
  updateApplicationStatus,
  deleteApplication,
  getProfileApplications,
};