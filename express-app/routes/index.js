var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//****get boards home page
router.get('/swimlanes', function(req, res, next) {
  res.render('swimlanes', { title: 'Express' });
});

module.exports = router;
