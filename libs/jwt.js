

const jwt = require('jsonwebtoken');

async function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

module.exports = { createAccessToken };