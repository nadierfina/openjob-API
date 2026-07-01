exports.up = (pgm) => {

  pgm.addColumns(
    'categories',
    {

      created_at: {
        type: 'TIMESTAMP',
        default:
        pgm.func(
          'current_timestamp'
        ),
      },

      updated_at: {
        type: 'TIMESTAMP',
        default:
        pgm.func(
          'current_timestamp'
        ),
      },
    }
  );
};

exports.down = (pgm) => {

  pgm.dropColumns(
    'categories',
    [
      'created_at',
      'updated_at'
    ]
  );
};