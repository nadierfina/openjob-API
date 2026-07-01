require('dotenv').config();

const express =
require('express');

const cache =
require(
  './services/cacheService'
);

const userRoutes =
require('./routes/users');

const authenticationRoutes =
require('./routes/authentications');

const companyRoutes =
require('./routes/companies');

const categoryRoutes =
require('./routes/categories');

const jobRoutes =
require('./routes/jobs');

const applicationRoutes =
require('./routes/applications');

const bookmarkRoutes =
require('./routes/bookmarks');

const profileRoutes =
require('./routes/profiles');

const DocumentRoutes =
require('./routes/documents');

const rabbitMQ =
require(
  './services/rabbitmq'
);

const app =
express();

app.use(
  express.json()
);

app.use(userRoutes);
app.use(authenticationRoutes);
app.use(companyRoutes);
app.use(categoryRoutes);
app.use(jobRoutes);
app.use(applicationRoutes);
app.use(bookmarkRoutes);
app.use(profileRoutes);
app.use(DocumentRoutes);

const PORT =
process.env.PORT ||
5000;


// CLEAR REDIS CACHE
(async () => {

  try {

    await cache.flushAll();

    console.log(
      'Redis cache cleared'
    );

  } catch (error) {

    console.log(
      'Redis clear error:',
      error.message
    );
  }

})();


app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );
  }
);