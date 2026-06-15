const expess = require('express');
const router = expess.Router();

const { login, getProfile } = require('../controlls/authControl');

router.post('/', login);

module.exports = router;
