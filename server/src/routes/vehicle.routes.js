const express = require('express');
const router = express.Router();
const {
    getVehicles, getVehicle, getAvailableVehicles,
    createVehicle, updateVehicle, updateVehicleStatus, deleteVehicle,
} = require('../controllers/vehicle.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getVehicles);
router.get('/available', getAvailableVehicles);
router.get('/:id', getVehicle);
router.post('/', authorize('fleet_manager', 'dispatcher'), createVehicle);
router.put('/:id', authorize('fleet_manager'), updateVehicle);
router.patch('/:id/status', authorize('fleet_manager'), updateVehicleStatus);
router.delete('/:id', authorize('fleet_manager'), deleteVehicle);

module.exports = router;
