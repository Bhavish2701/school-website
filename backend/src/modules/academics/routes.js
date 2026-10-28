const express = require('express');
const router = express.Router();
const academicRoutes = require('../../routes/academic.routes');

router.use('/', academicRoutes);

module.exports = router;
