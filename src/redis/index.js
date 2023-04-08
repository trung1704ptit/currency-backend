const redis = require('redis');
// const { promisify } = require('util');
const config = require('../config/config');

const redisClient = redis.createClient({
  url: config.redisUrl,
});

// console.log('config.redis_password:', config.redis_password)
// const password = config.redis_password || null;
// if (password && password !== 'null') {
//   redisClient.auth(password, (err, res) => {
//     console.log('res', res);
//     console.log('err', err);
//   });
// }

redisClient.on('connected', function () {
  console.log('Redis is connected');
});
redisClient.on('error', function (err) {
  console.log('Redis error.', err);
});

(async () => {
  await redisClient.connect();
})();

global.cache = redisClient;
module.exports = redisClient;
