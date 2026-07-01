const bcrypt =
require('bcrypt');

const { nanoid } =
require('nanoid');

const pool =
require('../database/pool');

const cache =
require(
  '../services/cacheService'
);


// ADD USER
const addUser =
async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role,
    } = req.body;

    // CEK EMAIL
    const checkUser =
      await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
      );

    // KALAU EMAIL SUDAH ADA
    if (
      checkUser.rows.length
    ) {

      return res.status(201).json({
        status:
          'success',
        data: {
          id:
          checkUser.rows[0]
          .id,
        }
      });
    }

    const id =
      `user-${nanoid(16)}`;

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    await pool.query(
      `
      INSERT INTO users(
        id,
        name,
        email,
        password,
        role
      )
      VALUES($1,$2,$3,$4,$5)
      `,
      [
        id,
        name,
        email,
        hashedPassword,
        role,
      ]
    );

    return res.status(201).json({
      status:
        'success',
      data: {
        id,
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


// GET USER BY ID
const getUserById =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const cacheKey =
      `user:${id}`;

    // GET CACHE
    const cachedUser =
      await cache.get(
        cacheKey
      );

    console.log(
      'CACHE:',
      cachedUser
    );

    // CACHE HIT
    if (
      cachedUser &&
      cachedUser !==
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
            cachedUser
          ),
      });
    }

    // DATABASE
    const result =
      await pool.query(
        `
        SELECT
          id,
          name,
          email,
          role
        FROM users
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
          'User tidak ditemukan',
      });
    }

    const user =
      result.rows[0];

    // SAVE CACHE
    await cache.set(
      cacheKey,
      JSON.stringify(
        user
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
        user,
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

// UPDATE USER
const updateUser =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const {
      name,
      email,
      role,
    } = req.body;

    const result =
      await pool.query(
        `
        UPDATE users
        SET
          name = $1,
          email = $2,
          role = $3
        WHERE id = $4
        RETURNING
          id,
          name,
          email,
          role
        `,
        [
          name,
          email,
          role,
          id,
        ]
      );

    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        status:
          'failed',
        message:
          'User tidak ditemukan',
      });
    }

    // CLEAR CACHE
    await cache.del(
      `user:${id}`
    );

    return res.status(200).json({
      status:
        'success',
      message:
        'User berhasil diperbarui',
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

module.exports = {
  addUser,
  getUserById,
  updateUser,

};