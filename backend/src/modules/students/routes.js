const express = require('express');
const router = express.Router();
const studentRoutes = require('../../routes/student.routes');

router.use('/', studentRoutes);

module.exports = router;
