const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../database/pool');


// LOGIN
const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        status: 'failed',
        message: 'Email tidak ditemukan',
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        status: 'failed',
        message: 'Password salah',
      });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_KEY
    );

    await pool.query(
      `
      INSERT INTO authentications(token)
      VALUES($1)
      `,
      [refreshToken]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};


// REFRESH TOKEN
const refreshAuthentication = async (req, res) => {

  try {

    const { refreshToken } = req.body;

    const result = await pool.query(
      `
      SELECT token
      FROM authentications
      WHERE token = $1
      `,
      [refreshToken]
    );

    if (!result.rows.length) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refresh token tidak valid',
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_KEY
    );

    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '3h' }
    );

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken,
      },
    });

  } catch {

    return res.status(400).json({
      status: 'failed',
      message: 'Refresh token tidak valid',
    });
  }
};


// DELETE TOKEN
const deleteAuthentication = async (req, res) => {

  try {

    const { refreshToken } = req.body;

    const check = await pool.query(
      `
      SELECT token
      FROM authentications
      WHERE token = $1
      `,
      [refreshToken]
    );

    if (!check.rows.length) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refresh token tidak valid',
      });
    }

    await pool.query(
      `
      DELETE FROM authentications
      WHERE token = $1
      `,
      [refreshToken]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    });

  } catch (error) {

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

module.exports = {
  login,
  refreshAuthentication,
  deleteAuthentication,
};