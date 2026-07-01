const { nanoid } = require('nanoid');

const pool = require('../database/pool');


// ADD CATEGORY
const addCategory = async (req, res) => {

  try {

    const { name } = req.body;

    const id = `category-${nanoid(16)}`;

    await pool.query(
      `
      INSERT INTO categories(id, name)
      VALUES($1, $2)
      `,
      [id, name]
    );

    return res.status(201).json({
      status: 'success',
      data: {
        id,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};


// GET ALL CATEGORIES
const getCategories = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM categories
      `
    );

    return res.status(200).json({
      status: 'success',
      data: {
        categories: result.rows,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};


// GET CATEGORY BY ID
const getCategoryById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Category tidak ditemukan',
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


// UPDATE CATEGORY
const updateCategory = async (req, res) => {

  try {

    const { id } = req.params;
    const { name } = req.body;

    const result = await pool.query(
      `
      UPDATE categories
      SET name = $1
      WHERE id = $2
      RETURNING *
      `,
      [name, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Category tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Category berhasil diperbarui',
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
// DELETE CATEGORY
const deleteCategory = async (req, res) => {

  try {

    const { id } =
      req.params;

    const result =
      await pool.query(
        `
        DELETE FROM categories
        WHERE id = $1
        RETURNING id
        `,
        [id]
      );

    if (!result.rows.length) {

      return res.status(404).json({
        status: 'failed',
        message:
          'Category tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message:
        'Category berhasil dihapus',
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


module.exports = {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};