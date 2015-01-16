module.exports = function (express) {

  var router = express.Router();
  router.use(function(req, res, next) {
    console.log('%s %s %s', req.method, req.url, req.path);
    next();
  });

  var schemas = require('./controllers/schemas.js');

  router.get('/', schemas.index);

  router.get('/schemas', schemas.index);
  router.get('/schemas/:name', schemas.show);
  router.get('/schemas/:name/:version', schemas.show);

  router.post('/schemas/:name', schemas.put);
  

  return router;
};