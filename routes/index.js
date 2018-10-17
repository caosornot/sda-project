var express = require('express');
var router = express.Router();
var light = require('./lights')

router.use('/', light);

/* GET home page. */
router.get('/', function (req, res) {
	res.render('../views/index');
});

router.get('/control', function (req, res) {
	res.render('../views/control');
});

// router.post('/control', function (req, res) {
// 	console.log(req.body['VCommand'])
// 	res.render('../views/control');
// });

router.get('/data', function (req, res) {
	res.render('../views/data');
});

module.exports = router;
