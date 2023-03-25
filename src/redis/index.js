const redis = require('redis');
// const { promisify } = require('util');
// const config = require('./config');

const redisClient = redis.createClient();
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
setInterval(function () {
  console.log('Keeping alive - Node.js Performance Test with Redis');
  redisClient.set('ping', 'pong');
}, 1000 * 60 * 4);

(async () => {
  await redisClient.connect();
})();

global.cache = redisClient;
module.exports = redisClient;
