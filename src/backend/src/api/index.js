
const dbpool = require('../database.js');
const logger = require('../logger.js');

module.exports = function(app) {
  // 'server_status' is used by the AWS load balancer for verifying that the backend is up and running
  // It's separate from /api/ping in case we need to change it at some point
  app.get('/api/server_status', (req, res) => res.sendStatus(200));

  // 'ping' is solely for verifying that the backend is up and running
  app.get('/api/ping', (req, res) => res.sendStatus(200));


  app.get('/api/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const client = await dbpool.connect();
    try {
      const rset = await client.query('select * from t_user where id=$1', [userId]);
      if (rset.rows.length === 0) {
        logger.error({category: 'USER', status: 'FAILED', msg: 'no such user', userId});
        return res.sendStatus(400);
      }
      const user = rset.rows[0];
      return res.status(200).send(user);
    } catch (err) {
      logger.error({category: 'USER', status: 'ERROR', msg: err.message});
      return res.sendStatus(500);
    } finally {
      client.release();
    }
  });
};
