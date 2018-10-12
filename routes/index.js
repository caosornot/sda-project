var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
	res.render('../views/index');
});

router.get('/control', function (req, res) {
	res.render('../views/control');
});

router.post('/control', function (req, res) {
	console.log(req.body)
});

router.get('/data', function (req, res) {
	res.render('../views/data');
});

module.exports = router;
