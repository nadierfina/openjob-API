exports.up = (pgm) => {

  pgm.createTable('applications', {

    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },

    job_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'jobs',
      onDelete: 'CASCADE',
    },

    cover_letter: {
      type: 'TEXT',
    },

    status: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {

  pgm.dropTable('applications');
};