var express = require('express');
var router = express.Router();
var light = require('./lights')

router.use('/', light);

/* Renderizar pagina inicial cuando se realice GET. */
router.get('/', function (req, res) {
	res.render('../views/index');
});

// router.get('/control', function (req, res) {
// 	res.render('../views/control');
// });

module.exports = router;
