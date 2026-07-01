const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith('Bearer ')
  ) {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }

  try {

    const token =
      authorization.split(' ')[1];

    const decoded =
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_KEY
      );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
};

module.exports = auth;