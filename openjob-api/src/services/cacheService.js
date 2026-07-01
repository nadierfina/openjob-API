const redis =
require('redis');

const client =
redis.createClient({
  url:
  process.env.REDIS_URL
});

client.on(
  'error',
  (err) => {

    console.log(
      'Redis Error:',
      err
    );
  }
);

(async () => {
  await client.connect();

  console.log(
    'Redis Connected'
  );
})();

module.exports = {

  async get(
    key
  ) {

    return await client.get(
      key
    );
  },

  async set(
    key,
    value,
    ttl = 3600
  ) {

    return await client.set(
      key,
      value,
      {
        EX:
        ttl
      }
    );
  },

  async del(
    key
  ) {

    return await client.del(
      key
    );
  },

  async flushAll() {

    return await client.flushAll();
  }
};