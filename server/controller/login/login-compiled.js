/**
 * Created by wzhan039 on 2016-07-12.
 */
'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (rq, res, next) {
  var a = 1;
  return res.render('login', { title: '登录', year: new Date().getFullYear() });
});

module.exports = router;

//# sourceMappingURL=login-compiled.js.map