const express = require('express');
const router = express.Router();
const {
    getDrivers, getDriver, getAvailableDrivers,
    createDriver, updateDriver, updateDriverStatus, deleteDriver,
} = require('../controllers/driver.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getDrivers);
router.get('/available', getAvailableDrivers);
router.get('/:id', getDriver);
router.post('/', authorize('fleet_manager', 'safety_officer'), createDriver);
router.put('/:id', authorize('fleet_manager', 'safety_officer'), updateDriver);
router.patch('/:id/status', authorize('fleet_manager', 'safety_officer'), updateDriverStatus);
router.delete('/:id', authorize('fleet_manager'), deleteDriver);

module.exports = router;
