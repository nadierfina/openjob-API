exports.up = (pgm) => {

  pgm.createTable('documents', {

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

    file_name: {
      type: 'TEXT',
      notNull: true,
    },

    document_type: {
      type: 'TEXT',
      notNull: true,
    },

    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },

  });

};

exports.down = (pgm) => {
  pgm.dropTable('documents');
};