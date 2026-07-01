const { nanoid } =
require('nanoid');

const pool =
require('../database/pool');

const cache =
require(
  '../services/cacheService'
);


// ADD BOOKMARK
const addBookmark =
async (req, res) => {

  try {

    const {
      id: job_id
    } = req.params;

    const user_id =
      req.user.id;

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

    const id =
      `bookmark-${nanoid(16)}`;

    await pool.query(
      `
      INSERT INTO bookmarks(
        id,
        user_id,
        job_id
      )
      VALUES($1, $2, $3)
      `,
      [
        id,
        user_id,
        job_id,
      ]
    );

    // DELETE CACHE
    await cache.del(
      `bookmarks:${user_id}`
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


// GET ALL USER BOOKMARKS
const getBookmarks =
async (req, res) => {

  try {

    const user_id =
      req.user.id;

    const cacheKey =
      `bookmarks:${user_id}`;

    // GET CACHE
    const cachedBookmarks =
      await cache.get(
        cacheKey
      );

    // CACHE HIT
    if (
      cachedBookmarks &&
      cachedBookmarks !==
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
          bookmarks:
            JSON.parse(
              cachedBookmarks
            ),
        },
      });
    }

    // DATABASE
    const result =
      await pool.query(
        `
        SELECT
          bookmarks.id,
          bookmarks.user_id,
          bookmarks.job_id,

          users.name
          AS user_name,

          users.email
          AS user_email,

          jobs.company_id,

          companies.name
          AS company_name,

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

        FROM bookmarks

        JOIN users
        ON bookmarks.user_id =
        users.id

        JOIN jobs
        ON bookmarks.job_id =
        jobs.id

        JOIN companies
        ON jobs.company_id =
        companies.id

        WHERE bookmarks.user_id =
        $1
        `,
        [user_id]
      );

    // SAVE CACHE
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
        bookmarks:
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


// GET BOOKMARK BY ID
const getBookmarkById =
async (req, res) => {

  try {

    const {
      bookmarkId
    } = req.params;

    const result =
      await pool.query(
        `
        SELECT *
        FROM bookmarks
        WHERE id = $1
        `,
        [bookmarkId]
      );

    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Bookmark tidak ditemukan',
      });
    }

    return res.status(200).json({
      status:
        'success',
      data:
        result.rows[0],
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


// DELETE BOOKMARK
const deleteBookmark =
async (req, res) => {

  try {

    const {
      id: job_id
    } = req.params;

    const user_id =
      req.user.id;

    const result =
      await pool.query(
        `
        DELETE FROM bookmarks
        WHERE job_id = $1
        AND user_id = $2
        RETURNING *
        `,
        [
          job_id,
          user_id,
        ]
      );

    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'Bookmark tidak ditemukan',
      });
    }

    // DELETE CACHE
    await cache.del(
      `bookmarks:${user_id}`
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'Bookmark berhasil dihapus',
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
  addBookmark,
  getBookmarks,
  getBookmarkById,
  deleteBookmark,
};