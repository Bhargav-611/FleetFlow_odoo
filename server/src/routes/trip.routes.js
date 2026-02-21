const express = require('express');
const router = express.Router();
const {
    getTrips, getTrip, createTrip, dispatchTrip,
    completeTrip, cancelTrip, deleteTrip,
} = require('../controllers/trip.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.post('/', authorize('fleet_manager', 'dispatcher'), createTrip);
router.patch('/:id/dispatch', authorize('fleet_manager', 'dispatcher'), dispatchTrip);
router.patch('/:id/complete', authorize('fleet_manager', 'dispatcher'), completeTrip);
router.patch('/:id/cancel', authorize('fleet_manager', 'dispatcher'), cancelTrip);
router.delete('/:id', authorize('fleet_manager'), deleteTrip);

module.exports = router;
