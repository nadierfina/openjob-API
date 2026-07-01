exports.up = (pgm) => {

  pgm.createTable('jobs', {

    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'companies',
      onDelete: 'CASCADE',
    },

    category_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'categories',
      onDelete: 'CASCADE',
    },

    title: {
      type: 'TEXT',
      notNull: true,
    },

    description: {
      type: 'TEXT',
      notNull: true,
    },

    job_type: {
      type: 'TEXT',
      notNull: true,
    },

    experience_level: {
      type: 'TEXT',
      notNull: true,
    },

    location_type: {
      type: 'TEXT',
      notNull: true,
    },

    location_city: {
      type: 'TEXT',
    },

    salary_min: {
      type: 'INTEGER',
    },

    salary_max: {
      type: 'INTEGER',
    },

    is_salary_visible: {
      type: 'BOOLEAN',
    },

    status: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {

  pgm.dropTable('jobs');
};