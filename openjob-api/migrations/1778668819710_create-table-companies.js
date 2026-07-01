exports.up = (pgm) => {

  pgm.createTable('companies', {

    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    name: {
      type: 'TEXT',
      notNull: true,
    },

    description: {
      type: 'TEXT',
      notNull: true,
    },

    location: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {

  pgm.dropTable('companies');
};