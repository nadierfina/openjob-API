const pool = require('../database/pool');


// GET PROFILE
const getProfile = async (req, res) => {

  try {

    const user_id = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'User tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};


// GET PROFILE APPLICATIONS
const getProfileApplications = async (req, res) => {

  try {

    console.log(
      'PROFILE USER:',
      req.user.id
    );

    const user_id =
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

        WHERE applications.user_id =
        $1
        `,
        [user_id]
      );

    console.log(
      'RESULT:',
      result.rows
    );

    return res.status(200).json({
      status: 'success',
      data: {
        applications:
          result.rows
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status: 'error',
      message:
        error.message,
    });
  }
};
// GET PROFILE BOOKMARKS
const getProfileBookmarks = async (req, res) => {

  try {

    const user_id = req.user.id;

    const result = await pool.query(
      `
      SELECT *
      FROM bookmarks
      WHERE user_id = $1
      `,
      [user_id]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        bookmarks: result.rows
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};


module.exports = {
  getProfile,
  getProfileApplications,
  getProfileBookmarks,
};