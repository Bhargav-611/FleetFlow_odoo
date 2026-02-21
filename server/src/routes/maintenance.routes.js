const express = require('express');
const router = express.Router();
const {
    getMaintenanceLogs, createMaintenanceLog, completeMaintenanceLog,
    updateMaintenanceLog, deleteMaintenanceLog,
} = require('../controllers/maintenance.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getMaintenanceLogs);
router.post('/', authorize('fleet_manager'), createMaintenanceLog);
router.patch('/:id/complete', authorize('fleet_manager'), completeMaintenanceLog);
router.put('/:id', authorize('fleet_manager'), updateMaintenanceLog);
router.delete('/:id', authorize('fleet_manager'), deleteMaintenanceLog);

module.exports = router;
