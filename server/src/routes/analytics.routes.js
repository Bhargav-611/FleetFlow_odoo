const express = require('express');
const router = express.Router();
const {
    getDashboardKPIs, getVehicleCosts, getFuelEfficiency, getMonthlyTrends,
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboardKPIs);
router.get('/vehicle-costs', getVehicleCosts);
router.get('/fuel-efficiency', getFuelEfficiency);
router.get('/monthly-trends', getMonthlyTrends);

module.exports = router;
