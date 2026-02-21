const express = require('express');
const router = express.Router();
const { exportCSV, exportPDF } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);

module.exports = router;
